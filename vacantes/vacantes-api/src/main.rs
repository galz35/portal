mod app_state;
mod candidate_sql_repository;
mod config;
mod db;
mod db_pool;
mod sql_read_repository;
mod sql_write_repository;
mod modules {
    pub mod cv {
        pub mod http;
    }
    pub mod observabilidad {
        pub mod http {
            pub mod handlers;
            pub mod routes;
        }
    }
}
mod shared {
    pub mod middleware {
        pub mod client_ip_middleware;
        pub mod correlation_id_middleware;
        pub mod security_headers_middleware;
    }
    pub mod observabilidad {}
    pub mod seguridad {
        pub mod audit_logger;
        pub mod candidate_auth;
        pub mod file_validation;
        pub mod input_validation;
        pub mod mailer;
        pub mod portal_auth;
        pub mod rate_limit;
        pub mod request_metadata;
        pub mod security_headers;
    }
}

use argon2::{
    password_hash::{PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use axum::{
    extract::{DefaultBodyLimit, Path, Query, State},
    http::{HeaderMap, StatusCode},
    middleware::{from_fn, from_fn_with_state},
    response::IntoResponse,
    routing::{get, patch, post},
    Json, Router,
};
use rand::distributions::Alphanumeric;
use rand::rngs::OsRng;
use rand::Rng;
use serde::Deserialize;
use serde_json::{json, Value};
use std::net::SocketAddr;
use tower_http::trace::TraceLayer;

use crate::app_state::AppState;
use crate::candidate_sql_repository as candidate_sql;
use crate::config::AppConfig;
use crate::modules::cv::http::routes::cv_routes;
use crate::modules::observabilidad::http::routes::observabilidad_routes;
use crate::shared::seguridad::audit_logger::registrar_evento_vacantes;
use crate::shared::seguridad::candidate_auth::{
    access_cookie_policy as candidate_access_cookie_policy,
    append_clear_session_cookies as append_clear_candidate_cookies,
    append_clear_site_data as append_clear_candidate_site_data,
    append_session_cookies as append_candidate_session_cookies,
    generate_csrf as generate_candidate_csrf, generate_sid as generate_candidate_sid,
    hash_token as hash_candidate_token, read_cookie as read_candidate_cookie,
    validate_csrf_request as validate_candidate_csrf_request,
};
use crate::shared::seguridad::input_validation::{
    normalize_compact_text, normalize_multiline_text, normalize_optional_compact_text,
    normalize_optional_multiline_text, normalize_optional_upper_ascii, normalize_upper_ascii,
    parse_iso_date, validate_code, validate_country_code, validate_email_address,
    validate_long_text, validate_money_amount, validate_money_range, validate_optional_date,
    validate_optional_long_text, validate_optional_positive_i32, validate_optional_positive_i64,
    validate_optional_short_text, validate_password_strength, validate_person_name, validate_phone,
    validate_positive_i32, validate_positive_i64, validate_short_text,
};
use crate::shared::seguridad::mailer::Mailer;
use crate::shared::seguridad::portal_auth::{
    introspect_portal, resolver_detalle_empleado_por_persona, resolver_identidad_portal,
    resolver_nombres_empleados, tiene_alguno, tiene_app, PortalIdentity,
};
use crate::shared::seguridad::rate_limit::check_sliding_window;
use crate::shared::seguridad::request_metadata::{extract_client_ip, extract_user_agent};
use crate::sql_read_repository as sql_read;
use crate::sql_write_repository as sql_write;

#[derive(Debug, Deserialize)]
struct CandidateRegisterRequest {
    correo: String,
    nombres: String,
    apellidos: String,
    telefono: Option<String>,
    clave: String,
}

#[derive(Debug, Deserialize)]
struct CandidateLoginRequest {
    correo: String,
    clave: String,
}

#[derive(Debug, Deserialize)]
struct CandidateProfileUpdateRequest {
    nombres: String,
    apellidos: String,
    telefono: Option<String>,
    departamento_residencia: Option<String>,
    municipio_residencia: Option<String>,
    categoria_interes: Option<String>,
    modalidad_preferida: Option<String>,
    nivel_academico: Option<String>,
    linkedin_url: Option<String>,
    resumen_profesional: Option<String>,
    disponibilidad_viajar: Option<bool>,
    disponibilidad_horario_rotativo: Option<bool>,
    tiene_licencia_conducir: Option<bool>,
    tipo_licencia: Option<String>,
    tiene_vehiculo_propio: Option<bool>,
}

#[derive(Debug, Deserialize)]
struct CandidateApplyRequest {
    id_vacante: i32,
    fuente_postulacion: Option<String>,
}

#[derive(Debug, Deserialize)]
struct RhPostulationDetailQuery {
    origen: Option<String>,
}

#[derive(Debug, Deserialize)]
struct CandidatePasswordResetRequest {
    correo: String,
}

#[derive(Debug, Deserialize)]
struct CandidatePasswordResetCompleteRequest {
    token: String,
    nueva_clave: String,
}

#[tokio::main]
async fn main() {
    let _ = dotenvy::dotenv();
    let config = AppConfig::from_env();
    let state = match AppState::new(config.clone()).await {
        Ok(state) => state,
        Err(err) => {
            eprintln!("vacantes-api no pudo inicializar el pool SQL: {err}");
            return;
        }
    };
    for warning in config.security_warnings() {
        eprintln!("vacantes-api security warning: {warning}");
    }

    let app = Router::<AppState>::new()
        .route("/api/vacantes/publicas", get(listar_publicas))
        .route("/api/vacantes/publicas/{slug}", get(detalle_publica))
        .route("/api/vacantes/postular", post(postular))
        .route("/api/vacantes/mis-postulaciones", get(mis_postulaciones))
        .route("/api/candidatos/register", post(candidate_register))
        .route("/api/candidatos/login", post(candidate_login))
        .route("/api/candidatos/logout", post(candidate_logout))
        .route(
            "/api/candidatos/me",
            get(candidate_me).put(candidate_update_profile),
        )
        .route(
            "/api/candidatos/password-reset/request",
            post(candidate_password_reset_request),
        )
        .route(
            "/api/candidatos/password-reset/verify/{token}",
            get(candidate_password_reset_verify),
        )
        .route(
            "/api/candidatos/password-reset/complete",
            post(candidate_password_reset_complete),
        )
        .route(
            "/api/candidatos/mis-postulaciones",
            get(candidate_postulations),
        )
        .route("/api/candidatos/postular", post(candidate_apply))
        .route("/api/vacantes/rh/dashboard", get(rh_dashboard))
        .route(
            "/api/vacantes/rh/vacantes",
            get(listar_rh).post(crear_vacante),
        )
        .route(
            "/api/vacantes/rh/vacantes/{id}/estado",
            patch(cambiar_estado_vacante),
        )
        .route(
            "/api/vacantes/rh/requisiciones",
            get(listar_requisiciones).post(crear_requisicion),
        )
        .route(
            "/api/vacantes/rh/requisiciones/pendientes",
            get(listar_pendientes_aprobacion),
        )
        .route(
            "/api/vacantes/rh/requisiciones/{id}/aprobar",
            post(aprobar_requisicion),
        )
        .route(
            "/api/vacantes/rh/requisiciones/{id}/rechazar",
            post(rechazar_requisicion),
        )
        .route(
            "/api/vacantes/rh/descriptores",
            get(listar_descriptores).post(crear_descriptor),
        )
        .route(
            "/api/vacantes/rh/descriptores/{id_puesto}/vigente",
            get(obtener_descriptor_vigente),
        )
        .route(
            "/api/vacantes/rh/postulaciones",
            get(listar_postulaciones_rh),
        )
        .route(
            "/api/vacantes/rh/postulaciones/{id}/detalle",
            get(obtener_detalle_postulacion_rh),
        )
        .route(
            "/api/vacantes/rh/postulaciones/{id}/estado",
            patch(cambiar_estado_postulacion),
        )
        .route("/api/vacantes/rh/reportes", get(obtener_reportes_rh))
        .route("/api/vacantes/rh/terna", post(crear_terna))
        .route("/api/vacantes/rh/lista-negra", post(registrar_lista_negra))
        .merge(observabilidad_routes())
        .merge(cv_routes())
        .with_state(state.clone())
        .layer(DefaultBodyLimit::max(256 * 1024))
        .layer(from_fn_with_state(
            state.clone(),
            crate::shared::middleware::client_ip_middleware::client_ip_middleware,
        ))
        .layer(from_fn(
            crate::shared::middleware::correlation_id_middleware::correlation_id_middleware,
        ))
        .layer(from_fn(
            crate::shared::middleware::security_headers_middleware::security_headers_middleware,
        ))
        .layer(TraceLayer::new_for_http());

    let addr: SocketAddr = config.server_addr().parse().unwrap_or_else(|_| {
        eprintln!("vacantes-api direccion invalida: {}", config.server_addr());
        SocketAddr::from(([127, 0, 0, 1], 8081))
    });

    let listener = match tokio::net::TcpListener::bind(addr).await {
        Ok(listener) => listener,
        Err(err) => {
            eprintln!("vacantes-api no pudo abrir {addr}: {err}");
            return;
        }
    };

    if let Err(err) = axum::serve(
        listener,
        app.into_make_service_with_connect_info::<SocketAddr>(),
    )
    .await
    {
        eprintln!("vacantes-api finalizo con error: {err}");
    }
}

async fn candidate_register(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(body): Json<CandidateRegisterRequest>,
) -> impl IntoResponse {
    let correo = body.correo.trim().to_ascii_lowercase();
    let nombres = normalize_compact_text(&body.nombres);
    let apellidos = normalize_compact_text(&body.apellidos);
    let telefono = normalize_optional_compact_text(body.telefono.clone());
    let clave = body.clave.trim();
    let ip_origen = extract_client_ip(&headers);
    let user_agent = extract_user_agent(&headers);

    let register_ip_limit = check_sliding_window(
        &format!(
            "cand-register-ip:{}",
            ip_origen.as_deref().unwrap_or("desconocido")
        ),
        state.config.candidate_register_rate_limit_max_attempts,
        state.config.candidate_register_rate_limit_window_seconds,
    );
    if !register_ip_limit.allowed {
        record_candidate_security_attempt_best_effort(
            &state,
            None,
            Some(&correo),
            ip_origen.as_deref(),
            user_agent.as_deref(),
            "REGISTER",
            "RECHAZADO_RATE_LIMIT_LOCAL_IP",
            Some("Limite local por IP excedido"),
        )
        .await;
        let response_headers = HeaderMap::new();
        return (
            StatusCode::TOO_MANY_REQUESTS,
            response_headers,
            Json(json!({
                "ok": false,
                "message": "Demasiados intentos de registro",
                "retryAfterSeconds": register_ip_limit.retry_after_seconds
            })),
        );
    }

    let register_correo_limit = check_sliding_window(
        &format!("cand-register-mail:{correo}"),
        state.config.candidate_register_rate_limit_max_attempts,
        state.config.candidate_register_rate_limit_window_seconds,
    );
    if !register_correo_limit.allowed {
        record_candidate_security_attempt_best_effort(
            &state,
            None,
            Some(&correo),
            ip_origen.as_deref(),
            user_agent.as_deref(),
            "REGISTER",
            "RECHAZADO_RATE_LIMIT_LOCAL_CORREO",
            Some("Limite local por correo excedido"),
        )
        .await;
        let response_headers = HeaderMap::new();
        return (
            StatusCode::TOO_MANY_REQUESTS,
            response_headers,
            Json(json!({
                "ok": false,
                "message": "Demasiados intentos de registro",
                "retryAfterSeconds": register_correo_limit.retry_after_seconds
            })),
        );
    }

    let recent_registers_by_correo = candidate_sql::count_candidate_security_attempts(
        &state.pool,
        "REGISTER",
        state.config.candidate_register_rate_limit_window_seconds,
        None,
        Some(&correo),
        None,
        false,
    )
    .await
    .unwrap_or_default();
    if recent_registers_by_correo
        >= i64::from(state.config.candidate_register_rate_limit_max_attempts)
    {
        record_candidate_security_attempt_best_effort(
            &state,
            None,
            Some(&correo),
            ip_origen.as_deref(),
            user_agent.as_deref(),
            "REGISTER",
            "RECHAZADO_RATE_LIMIT_SQL_CORREO",
            Some("Ventana SQL de registro excedida"),
        )
        .await;
        let response_headers = HeaderMap::new();
        return (
            StatusCode::TOO_MANY_REQUESTS,
            response_headers,
            Json(json!({
                "ok": false,
                "message": "Demasiados intentos de registro recientes"
            })),
        );
    }

    if let Some(ip) = ip_origen.as_deref() {
        let recent_registers_by_ip = candidate_sql::count_candidate_security_attempts(
            &state.pool,
            "REGISTER",
            state.config.candidate_register_rate_limit_window_seconds,
            None,
            None,
            Some(ip),
            false,
        )
        .await
        .unwrap_or_default();
        if recent_registers_by_ip
            >= i64::from(state.config.candidate_register_rate_limit_max_attempts)
        {
            record_candidate_security_attempt_best_effort(
                &state,
                None,
                Some(&correo),
                Some(ip),
                user_agent.as_deref(),
                "REGISTER",
                "RECHAZADO_RATE_LIMIT_SQL_IP",
                Some("Ventana SQL por IP excedida"),
            )
            .await;
            let response_headers = HeaderMap::new();
            return (
                StatusCode::TOO_MANY_REQUESTS,
                response_headers,
                Json(json!({
                    "ok": false,
                    "message": "Demasiados intentos de registro recientes"
                })),
            );
        }
    }

    let validation_error = validate_email_address(&correo)
        .and_then(|_| validate_person_name("Nombres", &nombres, 2, 80))
        .and_then(|_| validate_person_name("Apellidos", &apellidos, 2, 80))
        .and_then(|_| {
            if let Some(telefono) = telefono.as_deref() {
                validate_phone("Telefono", telefono)
            } else {
                Ok(())
            }
        })
        .and_then(|_| validate_password_strength(clave));
    if let Err(message) = validation_error {
        record_candidate_security_attempt_best_effort(
            &state,
            None,
            Some(&correo),
            ip_origen.as_deref(),
            user_agent.as_deref(),
            "REGISTER",
            "RECHAZADO_VALIDACION",
            Some(message.as_str()),
        )
        .await;
        let response_headers = HeaderMap::new();
        return (
            StatusCode::BAD_REQUEST,
            response_headers,
            Json(json!({
                "ok": false,
                "message": message
            })),
        );
    }

    let password_hash = match hash_candidate_password(clave) {
        Ok(hash) => hash,
        Err(message) => {
            let _ = message;
            record_candidate_security_attempt_best_effort(
                &state,
                None,
                Some(&correo),
                ip_origen.as_deref(),
                user_agent.as_deref(),
                "REGISTER",
                "ERROR_HASH",
                Some("Fallo al generar el hash de la contrasena"),
            )
            .await;
            let response_headers = HeaderMap::new();
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                response_headers,
                Json(json!({
                    "ok": false,
                    "message": "No fue posible completar el registro"
                })),
            );
        }
    };

    let id_candidato = match candidate_sql::register_candidate(
        &state.pool,
        &correo,
        &nombres,
        &apellidos,
        telefono.as_deref(),
        &password_hash,
    )
    .await
    {
        Ok(id) => id,
        Err(message) => {
            record_candidate_security_attempt_best_effort(
                &state,
                None,
                Some(&correo),
                ip_origen.as_deref(),
                user_agent.as_deref(),
                "REGISTER",
                "RECHAZADO_NEGOCIO",
                Some(message.as_str()),
            )
            .await;
            let response_headers = HeaderMap::new();
            return (
                StatusCode::BAD_REQUEST,
                response_headers,
                Json(json!({
                    "ok": false,
                    "message": "No fue posible completar el registro"
                })),
            );
        }
    };

    let (status, response_headers, body) =
        complete_candidate_login(&state, &headers, id_candidato).await;
    let resultado = if status.is_success() {
        "EXITOSO"
    } else {
        "ERROR_SESION"
    };
    record_candidate_security_attempt_best_effort(
        &state,
        Some(id_candidato),
        Some(&correo),
        ip_origen.as_deref(),
        user_agent.as_deref(),
        "REGISTER",
        resultado,
        None,
    )
    .await;
    (status, response_headers, body)
}

async fn candidate_login(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(body): Json<CandidateLoginRequest>,
) -> impl IntoResponse {
    let correo = body.correo.trim().to_ascii_lowercase();
    let clave = body.clave.trim();
    let ip_origen = extract_client_ip(&headers);
    let user_agent = extract_user_agent(&headers);

    let login_ip_limit = check_sliding_window(
        &format!(
            "cand-login-ip:{}",
            ip_origen.as_deref().unwrap_or("desconocido")
        ),
        state.config.candidate_login_rate_limit_max_attempts,
        state.config.candidate_login_rate_limit_window_seconds,
    );
    if !login_ip_limit.allowed {
        record_candidate_security_attempt_best_effort(
            &state,
            None,
            Some(&correo),
            ip_origen.as_deref(),
            user_agent.as_deref(),
            "LOGIN",
            "RECHAZADO_RATE_LIMIT_LOCAL_IP",
            Some("Limite local por IP excedido"),
        )
        .await;
        let response_headers = HeaderMap::new();
        return (
            StatusCode::TOO_MANY_REQUESTS,
            response_headers,
            Json(json!({
                "ok": false,
                "message": "Demasiados intentos de inicio de sesion",
                "retryAfterSeconds": login_ip_limit.retry_after_seconds
            })),
        );
    }

    let login_correo_limit = check_sliding_window(
        &format!("cand-login-mail:{correo}"),
        state.config.candidate_login_rate_limit_max_attempts,
        state.config.candidate_login_rate_limit_window_seconds,
    );
    if !login_correo_limit.allowed {
        record_candidate_security_attempt_best_effort(
            &state,
            None,
            Some(&correo),
            ip_origen.as_deref(),
            user_agent.as_deref(),
            "LOGIN",
            "RECHAZADO_RATE_LIMIT_LOCAL_CORREO",
            Some("Limite local por correo excedido"),
        )
        .await;
        let response_headers = HeaderMap::new();
        return (
            StatusCode::TOO_MANY_REQUESTS,
            response_headers,
            Json(json!({
                "ok": false,
                "message": "Demasiados intentos de inicio de sesion",
                "retryAfterSeconds": login_correo_limit.retry_after_seconds
            })),
        );
    }

    let failed_logins_by_correo = candidate_sql::count_candidate_security_attempts(
        &state.pool,
        "LOGIN",
        state.config.candidate_login_rate_limit_window_seconds,
        None,
        Some(&correo),
        None,
        true,
    )
    .await
    .unwrap_or_default();
    if failed_logins_by_correo >= i64::from(state.config.candidate_login_rate_limit_max_attempts) {
        record_candidate_security_attempt_best_effort(
            &state,
            None,
            Some(&correo),
            ip_origen.as_deref(),
            user_agent.as_deref(),
            "LOGIN",
            "RECHAZADO_RATE_LIMIT_SQL_CORREO",
            Some("Ventana SQL de login excedida"),
        )
        .await;
        let response_headers = HeaderMap::new();
        return (
            StatusCode::TOO_MANY_REQUESTS,
            response_headers,
            Json(json!({
                "ok": false,
                "message": "Demasiados intentos de inicio de sesion recientes"
            })),
        );
    }

    if let Some(ip) = ip_origen.as_deref() {
        let failed_logins_by_ip = candidate_sql::count_candidate_security_attempts(
            &state.pool,
            "LOGIN",
            state.config.candidate_login_rate_limit_window_seconds,
            None,
            None,
            Some(ip),
            true,
        )
        .await
        .unwrap_or_default();
        if failed_logins_by_ip >= i64::from(state.config.candidate_login_rate_limit_max_attempts) {
            record_candidate_security_attempt_best_effort(
                &state,
                None,
                Some(&correo),
                Some(ip),
                user_agent.as_deref(),
                "LOGIN",
                "RECHAZADO_RATE_LIMIT_SQL_IP",
                Some("Ventana SQL por IP excedida"),
            )
            .await;
            let response_headers = HeaderMap::new();
            return (
                StatusCode::TOO_MANY_REQUESTS,
                response_headers,
                Json(json!({
                    "ok": false,
                    "message": "Demasiados intentos de inicio de sesion recientes"
                })),
            );
        }
    }

    if validate_email_address(&correo).is_err() || clave.len() < 6 || clave.len() > 128 {
        record_candidate_security_attempt_best_effort(
            &state,
            None,
            Some(&correo),
            ip_origen.as_deref(),
            user_agent.as_deref(),
            "LOGIN",
            "RECHAZADO_VALIDACION",
            Some("Payload de login invalido"),
        )
        .await;
        let response_headers = HeaderMap::new();
        return (
            StatusCode::BAD_REQUEST,
            response_headers,
            Json(json!({
                "ok": false,
                "message": "Credenciales invalidas"
            })),
        );
    }

    let credential = match candidate_sql::verify_candidate_credentials(&state.pool, &correo).await {
        Ok(Some(credential)) => credential,
        Ok(None) => {
            record_candidate_security_attempt_best_effort(
                &state,
                None,
                Some(&correo),
                ip_origen.as_deref(),
                user_agent.as_deref(),
                "LOGIN",
                "RECHAZADO_CREDENCIALES",
                Some("Correo no encontrado o inactivo"),
            )
            .await;
            let response_headers = HeaderMap::new();
            return (
                StatusCode::UNAUTHORIZED,
                response_headers,
                Json(json!({
                    "ok": false,
                    "message": "Credenciales invalidas"
                })),
            );
        }
        Err(message) => {
            let _ = message;
            record_candidate_security_attempt_best_effort(
                &state,
                None,
                Some(&correo),
                ip_origen.as_deref(),
                user_agent.as_deref(),
                "LOGIN",
                "ERROR_SQL",
                Some("Error consultando credencial"),
            )
            .await;
            let response_headers = HeaderMap::new();
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                response_headers,
                Json(json!({
                    "ok": false,
                    "message": "No fue posible iniciar sesion"
                })),
            );
        }
    };

    if !credential.activo || !verify_candidate_password(&credential.password_hash, clave) {
        record_candidate_security_attempt_best_effort(
            &state,
            Some(credential.id_candidato),
            Some(&correo),
            ip_origen.as_deref(),
            user_agent.as_deref(),
            "LOGIN",
            "RECHAZADO_CREDENCIALES",
            Some("Contrasena invalida"),
        )
        .await;
        let response_headers = HeaderMap::new();
        return (
            StatusCode::UNAUTHORIZED,
            response_headers,
            Json(json!({
                "ok": false,
                "message": "Credenciales invalidas"
            })),
        );
    }

    let (status, response_headers, body) =
        complete_candidate_login(&state, &headers, credential.id_candidato).await;
    let resultado = if status.is_success() {
        "EXITOSO"
    } else {
        "ERROR_SESION"
    };
    record_candidate_security_attempt_best_effort(
        &state,
        Some(credential.id_candidato),
        Some(&correo),
        ip_origen.as_deref(),
        user_agent.as_deref(),
        "LOGIN",
        resultado,
        None,
    )
    .await;
    (status, response_headers, body)
}

async fn candidate_logout(State(state): State<AppState>, headers: HeaderMap) -> impl IntoResponse {
    let Some(session) = resolve_candidate_session(&state, &headers).await else {
        let mut response_headers = HeaderMap::new();
        append_clear_candidate_cookies(&mut response_headers);
        append_clear_candidate_site_data(&mut response_headers);
        return (
            StatusCode::UNAUTHORIZED,
            response_headers,
            Json(json!({
                "ok": false,
                "message": "Sesion de candidato no encontrada"
            })),
        );
    };

    let csrf_token = validate_candidate_csrf_request(&headers);
    let csrf_valid = if let Some(token) = csrf_token {
        candidate_sql::validate_candidate_csrf(
            &state.pool,
            session.id_sesion_candidato,
            &hash_candidate_token(&token),
        )
        .await
        .unwrap_or(false)
    } else {
        false
    };

    let mut response_headers = HeaderMap::new();
    append_clear_candidate_cookies(&mut response_headers);
    append_clear_candidate_site_data(&mut response_headers);

    if !csrf_valid {
        return (
            StatusCode::FORBIDDEN,
            response_headers,
            Json(json!({
                "ok": false,
                "message": "CSRF invalido"
            })),
        );
    }

    let _ = candidate_sql::revoke_candidate_csrf(&state.pool, session.id_sesion_candidato).await;
    let _ = candidate_sql::revoke_candidate_session(&state.pool, session.id_sesion_candidato).await;

    (
        StatusCode::OK,
        response_headers,
        Json(json!({
            "ok": true,
            "message": "Sesion de candidato cerrada"
        })),
    )
}

async fn candidate_password_reset_request(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(body): Json<CandidatePasswordResetRequest>,
) -> impl IntoResponse {
    let correo = body.correo.trim().to_ascii_lowercase();
    let ip_origen = extract_client_ip(&headers);

    if validate_email_address(&correo).is_err() {
        return (
            StatusCode::BAD_REQUEST,
            Json(json!({ "ok": false, "message": "Correo invalido" })),
        );
    }

    // Rate limit para solicitudes de reset
    let reset_limit = check_sliding_window(
        &format!("cand-reset-req:{}", correo),
        3,    // max 3 solicitudes
        3600, // por hora
    );
    if !reset_limit.allowed {
        return (
            StatusCode::TOO_MANY_REQUESTS,
            Json(json!({ "ok": false, "message": "Demasiadas solicitudes. Intente mas tarde." })),
        );
    }

    // Generar token seguro de 32 caracteres (Alphanumeric)
    let raw_token: String = rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(32)
        .map(char::from)
        .collect();
    let token_hash = hash_candidate_token(&raw_token);

    let result = candidate_sql::request_password_reset(
        &state.pool,
        &correo,
        &token_hash,
        ip_origen.as_deref(),
    )
    .await;

    match result {
        Ok(Some((_id, nombres, apellidos))) => {
            // Enviar correo
            let mailer = match Mailer::new(&state.config) {
                Ok(mailer) => mailer,
                Err(e) => {
                    eprintln!("Error inicializando mailer para reset de candidato: {}", e);
                    return (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        Json(
                            json!({ "ok": false, "message": "No se pudo preparar el correo de recuperacion." }),
                        ),
                    );
                }
            };
            let reset_link = format!(
                "{}/reset-password?token={}",
                state.config.candidate_password_reset_base_url, raw_token
            );
            let body = format!(
                "<h1>Hola {} {}</h1><p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p><p><a href='{}'>Restablecer Contraseña</a></p><p>Si no solicitaste esto, ignora este correo.</p>",
                nombres, apellidos, reset_link
            );

            match mailer
                .send_email(
                    &correo,
                    "Restablecer Contraseña - Portal de Vacantes",
                    &body,
                )
                .await
            {
                Ok(_) => (
                    StatusCode::OK,
                    Json(
                        json!({ "ok": true, "message": "Se ha enviado un correo con instrucciones." }),
                    ),
                ),
                Err(e) => {
                    eprintln!("Error enviando correo: {}", e);
                    (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        Json(
                            json!({ "ok": false, "message": "No se pudo enviar el correo de recuperacion." }),
                        ),
                    )
                }
            }
        }
        Ok(None) => {
            // No revelamos si el correo existe
            (
                StatusCode::OK,
                Json(
                    json!({ "ok": true, "message": "Si el correo esta registrado, recibiras instrucciones." }),
                ),
            )
        }
        Err(e) => {
            eprintln!("Error SQL en reset request: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "ok": false, "message": "Error interno al procesar la solicitud" })),
            )
        }
    }
}

async fn candidate_password_reset_verify(
    State(state): State<AppState>,
    Path(token): Path<String>,
) -> impl IntoResponse {
    let token_hash = hash_candidate_token(&token);
    let result = candidate_sql::validate_password_reset_token(&state.pool, &token_hash).await;

    match result {
        Ok(Some(_)) => (
            StatusCode::OK,
            Json(json!({ "ok": true, "message": "Token valido" })),
        ),
        _ => (
            StatusCode::BAD_REQUEST,
            Json(json!({ "ok": false, "message": "Link invalido o expirado" })),
        ),
    }
}

async fn candidate_password_reset_complete(
    State(state): State<AppState>,
    Json(body): Json<CandidatePasswordResetCompleteRequest>,
) -> impl IntoResponse {
    let token_hash = hash_candidate_token(&body.token);
    let new_password = body.nueva_clave.trim();

    if let Err(msg) = validate_password_strength(new_password) {
        return (
            StatusCode::BAD_REQUEST,
            Json(json!({ "ok": false, "message": msg })),
        );
    }

    let password_hash = match hash_candidate_password(new_password) {
        Ok(h) => h,
        Err(_) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "ok": false, "message": "Error al procesar la nueva clave" })),
            )
        }
    };

    let result =
        candidate_sql::complete_password_reset(&state.pool, &token_hash, &password_hash).await;

    match result {
        Ok(_) => (
            StatusCode::OK,
            Json(json!({ "ok": true, "message": "Contraseña actualizada exitosamente" })),
        ),
        Err(e) => {
            eprintln!("Error al completar reset: {}", e);
            (
                StatusCode::BAD_REQUEST,
                Json(
                    json!({ "ok": false, "message": "No se pudo restablecer la contraseña. El link podria haber expirado." }),
                ),
            )
        }
    }
}

async fn candidate_me(State(state): State<AppState>, headers: HeaderMap) -> impl IntoResponse {
    let Some(session) = resolve_candidate_session(&state, &headers).await else {
        return (
            StatusCode::UNAUTHORIZED,
            Json(json!({
                "ok": false,
                "message": "Sesion de candidato no encontrada"
            })),
        );
    };

    match candidate_sql::get_candidate_profile(&state.pool, session.id_candidato).await {
        Ok(Some(profile)) => (
            StatusCode::OK,
            Json(json!({
                "ok": true,
                "perfil": profile
            })),
        ),
        Ok(None) => (
            StatusCode::NOT_FOUND,
            Json(json!({
                "ok": false,
                "message": "Candidato no encontrado"
            })),
        ),
        Err(message) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({
                "ok": false,
                "message": message
            })),
        ),
    }
}

async fn candidate_update_profile(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(body): Json<CandidateProfileUpdateRequest>,
) -> impl IntoResponse {
    let Some(session) = resolve_candidate_session(&state, &headers).await else {
        return (
            StatusCode::UNAUTHORIZED,
            Json(json!({
                "ok": false,
                "message": "Sesion de candidato no encontrada"
            })),
        );
    };
    let csrf_token = validate_candidate_csrf_request(&headers);
    let csrf_valid = if let Some(token) = csrf_token {
        candidate_sql::validate_candidate_csrf(
            &state.pool,
            session.id_sesion_candidato,
            &hash_candidate_token(&token),
        )
        .await
        .unwrap_or(false)
    } else {
        false
    };
    if !csrf_valid {
        return (
            StatusCode::FORBIDDEN,
            Json(json!({
                "ok": false,
                "message": "CSRF invalido"
            })),
        );
    }

    let nombres = normalize_compact_text(&body.nombres);
    let apellidos = normalize_compact_text(&body.apellidos);
    let telefono = normalize_optional_compact_text(body.telefono.clone());
    let departamento_residencia =
        normalize_optional_compact_text(body.departamento_residencia.clone());
    let municipio_residencia = normalize_optional_compact_text(body.municipio_residencia.clone());
    let categoria_interes = normalize_optional_compact_text(body.categoria_interes.clone());
    let modalidad_preferida = normalize_optional_upper_ascii(body.modalidad_preferida.clone());
    let nivel_academico = normalize_optional_compact_text(body.nivel_academico.clone());
    let linkedin_url = normalize_optional_compact_text(body.linkedin_url.clone());
    let resumen_profesional = normalize_optional_multiline_text(body.resumen_profesional.clone());
    let disponibilidad_viajar = body.disponibilidad_viajar.unwrap_or(false);
    let disponibilidad_horario_rotativo = body.disponibilidad_horario_rotativo.unwrap_or(false);
    let tiene_licencia_conducir = body.tiene_licencia_conducir.unwrap_or(false);
    let tipo_licencia = normalize_optional_compact_text(body.tipo_licencia.clone());
    let tiene_vehiculo_propio = body.tiene_vehiculo_propio.unwrap_or(false);
    let validation_error = validate_person_name("Nombres", &nombres, 2, 80)
        .and_then(|_| validate_person_name("Apellidos", &apellidos, 2, 80))
        .and_then(|_| {
            if let Some(telefono) = telefono.as_deref() {
                validate_phone("Telefono", telefono)
            } else {
                Ok(())
            }
        })
        .and_then(|_| {
            validate_optional_short_text(
                "DepartamentoResidencia",
                departamento_residencia.as_deref(),
                100,
            )
        })
        .and_then(|_| {
            validate_optional_short_text(
                "MunicipioResidencia",
                municipio_residencia.as_deref(),
                100,
            )
        })
        .and_then(|_| {
            validate_optional_short_text("CategoriaInteres", categoria_interes.as_deref(), 80)
        })
        .and_then(|_| {
            validate_optional_short_text("NivelAcademico", nivel_academico.as_deref(), 80)
        })
        .and_then(|_| validate_optional_short_text("LinkedinUrl", linkedin_url.as_deref(), 255))
        .and_then(|_| {
            validate_optional_long_text("ResumenProfesional", resumen_profesional.as_deref(), 1200)
        })
        .and_then(|_| validate_optional_short_text("TipoLicencia", tipo_licencia.as_deref(), 40))
        .and_then(|_| {
            if let Some(modalidad) = modalidad_preferida.as_deref() {
                if matches!(modalidad, "PRESENCIAL" | "REMOTA" | "HIBRIDA") {
                    Ok(())
                } else {
                    Err("ModalidadPreferida debe ser PRESENCIAL, REMOTA o HIBRIDA".to_string())
                }
            } else {
                Ok(())
            }
        })
        .and_then(|_| {
            if tipo_licencia.is_some() && !tiene_licencia_conducir {
                Err(
                    "No puedes indicar tipo de licencia si no marcas licencia de conducir"
                        .to_string(),
                )
            } else {
                Ok(())
            }
        });
    if let Err(message) = validation_error {
        return (
            StatusCode::BAD_REQUEST,
            Json(json!({
                "ok": false,
                "message": message
            })),
        );
    }

    match candidate_sql::update_candidate_profile(
        &state.pool,
        session.id_candidato,
        &nombres,
        &apellidos,
        telefono.as_deref(),
        departamento_residencia.as_deref(),
        municipio_residencia.as_deref(),
        categoria_interes.as_deref(),
        modalidad_preferida.as_deref(),
        nivel_academico.as_deref(),
        linkedin_url.as_deref(),
        resumen_profesional.as_deref(),
        disponibilidad_viajar,
        disponibilidad_horario_rotativo,
        tiene_licencia_conducir,
        tipo_licencia.as_deref(),
        tiene_vehiculo_propio,
    )
    .await
    {
        Ok(true) => (
            StatusCode::OK,
            Json(json!({
                "ok": true,
                "message": "Perfil actualizado"
            })),
        ),
        Ok(false) => (
            StatusCode::NOT_FOUND,
            Json(json!({
                "ok": false,
                "message": "No fue posible actualizar el perfil"
            })),
        ),
        Err(message) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({
                "ok": false,
                "message": message
            })),
        ),
    }
}

async fn candidate_postulations(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> impl IntoResponse {
    let Some(session) = resolve_candidate_session(&state, &headers).await else {
        return (
            StatusCode::UNAUTHORIZED,
            Json(json!({
                "ok": false,
                "message": "Sesion de candidato no encontrada",
                "items": []
            })),
        );
    };

    match candidate_sql::list_candidate_postulations(&state.pool, session.id_candidato).await {
        Ok(items) => (
            StatusCode::OK,
            Json(json!({
                "ok": true,
                "items": items
            })),
        ),
        Err(message) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({
                "ok": false,
                "message": message,
                "items": []
            })),
        ),
    }
}

async fn candidate_apply(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(body): Json<CandidateApplyRequest>,
) -> impl IntoResponse {
    let Some(session) = resolve_candidate_session(&state, &headers).await else {
        return (
            StatusCode::UNAUTHORIZED,
            Json(json!({
                "ok": false,
                "message": "Debes iniciar sesion como candidato para postularte"
            })),
        );
    };
    let ip_origen = extract_client_ip(&headers);
    let user_agent = extract_user_agent(&headers);
    let csrf_token = validate_candidate_csrf_request(&headers);
    let csrf_valid = if let Some(token) = csrf_token {
        candidate_sql::validate_candidate_csrf(
            &state.pool,
            session.id_sesion_candidato,
            &hash_candidate_token(&token),
        )
        .await
        .unwrap_or(false)
    } else {
        false
    };
    if !csrf_valid {
        return (
            StatusCode::FORBIDDEN,
            Json(json!({
                "ok": false,
                "message": "CSRF invalido"
            })),
        );
    }

    let fuente_postulacion = normalize_optional_upper_ascii(body.fuente_postulacion.clone());
    if let Err(message) = validate_positive_i32("IdVacante", body.id_vacante).and_then(|_| {
        if let Some(fuente) = fuente_postulacion.as_deref() {
            validate_code("FuentePostulacion", fuente, 3, 50)
        } else {
            Ok(())
        }
    }) {
        return (
            StatusCode::BAD_REQUEST,
            Json(json!({
                "ok": false,
                "message": message
            })),
        );
    }

    let apply_limit = check_sliding_window(
        &format!(
            "cand-apply:{}:{}",
            session.id_candidato,
            ip_origen.as_deref().unwrap_or("desconocido")
        ),
        state.config.candidate_apply_rate_limit_max_attempts,
        state.config.candidate_apply_rate_limit_window_seconds,
    );
    if !apply_limit.allowed {
        record_candidate_security_attempt_best_effort(
            &state,
            Some(session.id_candidato),
            None,
            ip_origen.as_deref(),
            user_agent.as_deref(),
            "POSTULAR",
            "RECHAZADO_RATE_LIMIT_LOCAL",
            Some("Limite local de postulacion excedido"),
        )
        .await;
        return (
            StatusCode::TOO_MANY_REQUESTS,
            Json(json!({
                "ok": false,
                "message": "Demasiadas postulaciones en poco tiempo",
                "retryAfterSeconds": apply_limit.retry_after_seconds
            })),
        );
    }

    let recent_apply_attempts = candidate_sql::count_candidate_security_attempts(
        &state.pool,
        "POSTULAR",
        state.config.candidate_apply_rate_limit_window_seconds,
        Some(session.id_candidato),
        None,
        None,
        false,
    )
    .await
    .unwrap_or_default();
    if recent_apply_attempts >= i64::from(state.config.candidate_apply_rate_limit_max_attempts) {
        record_candidate_security_attempt_best_effort(
            &state,
            Some(session.id_candidato),
            None,
            ip_origen.as_deref(),
            user_agent.as_deref(),
            "POSTULAR",
            "RECHAZADO_RATE_LIMIT_SQL",
            Some("Ventana SQL de postulacion excedida"),
        )
        .await;
        return (
            StatusCode::TOO_MANY_REQUESTS,
            Json(json!({
                "ok": false,
                "message": "Demasiadas postulaciones recientes"
            })),
        );
    }

    match candidate_sql::apply_candidate_to_vacancy(
        &state.pool,
        session.id_candidato,
        body.id_vacante,
        fuente_postulacion.as_deref(),
    )
    .await
    {
        Ok(id_postulacion) => {
            record_candidate_security_attempt_best_effort(
                &state,
                Some(session.id_candidato),
                None,
                ip_origen.as_deref(),
                user_agent.as_deref(),
                "POSTULAR",
                "EXITOSO",
                Some("Postulacion registrada"),
            )
            .await;
            (
                StatusCode::OK,
                Json(json!({
                    "ok": true,
                    "idPostulacionCandidato": id_postulacion,
                    "message": "Postulacion registrada"
                })),
            )
        }
        Err(message) => {
            let resultado = if message.to_ascii_lowercase().contains("ya se postulo") {
                "RECHAZADO_DUPLICADO"
            } else {
                "RECHAZADO_NEGOCIO"
            };
            record_candidate_security_attempt_best_effort(
                &state,
                Some(session.id_candidato),
                None,
                ip_origen.as_deref(),
                user_agent.as_deref(),
                "POSTULAR",
                resultado,
                Some(message.as_str()),
            )
            .await;
            let user_message = if resultado == "RECHAZADO_DUPLICADO" {
                "Ya tienes una postulacion registrada para esta vacante"
            } else {
                "No fue posible registrar la postulacion"
            };
            (
                StatusCode::BAD_REQUEST,
                Json(json!({
                    "ok": false,
                    "message": user_message
                })),
            )
        }
    }
}

async fn listar_publicas(State(state): State<AppState>) -> Json<Value> {
    if let Ok(items) = sql_read::list_public_vacancies(&state.pool).await {
        return Json(json!({ "items": items }));
    }
    service_unavailable_items("No fue posible listar vacantes publicas desde SQL Server")
}

async fn detalle_publica(Path(slug): Path<String>, State(state): State<AppState>) -> Json<Value> {
    match sql_read::get_public_vacancy_detail(&state.pool, &slug).await {
        Ok(Some(item)) => Json(item),
        Ok(None) => Json(json!({
            "ok": false,
            "message": "Vacante no encontrada"
        })),
        Err(_) => Json(json!({
            "ok": false,
            "message": "No fue posible obtener el detalle de la vacante desde SQL Server"
        })),
    }
}

async fn postular(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(request): Json<sql_write::ApplyRequest>,
) -> Json<Value> {
    let identity = match introspect_portal(
        &state.http,
        &state.config.core_api_base_url,
        &headers,
        true,
    )
    .await
    {
        Ok(identity) => identity,
        Err(StatusCode::UNAUTHORIZED) => {
            return Json(json!({
                "ok": false,
                "message": "Se requiere sesion portal para postular en la base actual"
            }));
        }
        Err(StatusCode::FORBIDDEN) => {
            return Json(json!({
                "ok": false,
                "message": "CSRF invalido"
            }));
        }
        Err(_) => {
            return Json(json!({
                "ok": false,
                "message": "No fue posible validar la sesion portal desde core-api"
            }));
        }
    };
    if !tiene_app(&identity, "vacantes") {
        return Json(json!({
            "ok": false,
            "message": "La sesion portal no tiene acceso a Vacantes"
        }));
    }
    let Some(id_persona) = identity.id_persona else {
        return Json(json!({
            "ok": false,
            "message": "La sesion portal no esta asociada a una persona valida"
        }));
    };
    let mut request = request;
    request.id_persona = id_persona;
    request.es_interna = true;
    request.fuente_postulacion = normalize_optional_upper_ascii(request.fuente_postulacion)
        .or(Some("PORTAL_INTERNO".to_string()));

    if let Err(message) = validate_positive_i32("IdVacante", request.id_vacante).and_then(|_| {
        if let Some(fuente) = request.fuente_postulacion.as_deref() {
            validate_code("FuentePostulacion", fuente, 3, 50)
        } else {
            Ok(())
        }
    }) {
        return Json(json!({
            "ok": false,
            "message": message
        }));
    }

    let apply_limit = check_sliding_window(
        &format!(
            "portal-apply:{}:{}",
            id_persona,
            extract_client_ip(&headers)
                .as_deref()
                .unwrap_or("desconocido")
        ),
        state.config.portal_apply_rate_limit_max_attempts,
        state.config.portal_apply_rate_limit_window_seconds,
    );
    if !apply_limit.allowed {
        return Json(json!({
            "ok": false,
            "message": "Demasiadas postulaciones internas en poco tiempo",
            "retryAfterSeconds": apply_limit.retry_after_seconds
        }));
    }

    if let Ok(recent_postulations) = sql_write::count_recent_internal_postulations(
        &state.pool,
        id_persona,
        state.config.portal_apply_rate_limit_window_seconds,
    )
    .await
    {
        if recent_postulations >= i64::from(state.config.portal_apply_rate_limit_max_attempts) {
            return Json(json!({
                "ok": false,
                "message": "Demasiadas postulaciones internas recientes"
            }));
        }
    }

    match sql_write::apply_to_vacancy(&state.pool, &request).await {
        Ok(id_postulacion) => {
            record_operational_audit_best_effort(
                &state,
                Some(&identity),
                &headers,
                "POSTULACION_INTERNA_CREAR",
                "vacantes.portal",
                true,
                Some(format!(
                    "IdVacante={}; IdPostulacion={id_postulacion}",
                    request.id_vacante
                )),
            )
            .await;
            Json(json!({
                "ok": true,
                "idPostulacion": id_postulacion,
                "message": "Postulacion registrada en estado APLICADA"
            }))
        }
        Err(message) => {
            let lowered = message.to_ascii_lowercase();
            let user_message = if lowered.contains("ya se postulo") {
                "Ya tienes una postulacion interna registrada para esta vacante"
            } else if lowered.contains("no esta disponible") {
                "La vacante no esta disponible para postulacion"
            } else {
                "No fue posible registrar la postulacion"
            };
            record_operational_audit_best_effort(
                &state,
                Some(&identity),
                &headers,
                "POSTULACION_INTERNA_CREAR",
                "vacantes.portal",
                false,
                Some(format!("IdVacante={}; Error={message}", request.id_vacante)),
            )
            .await;

            Json(json!({
                "ok": false,
                "message": user_message
            }))
        }
    }
}

async fn mis_postulaciones(State(state): State<AppState>, headers: HeaderMap) -> Json<Value> {
    let identity = match resolver_identidad_portal(
        &state.http,
        &state.config.core_api_base_url,
        &headers,
    )
    .await
    {
        Ok(identity) => identity,
        Err(StatusCode::UNAUTHORIZED) => {
            return Json(json!({
                "ok": false,
                "message": "Se requiere sesion portal para consultar postulaciones",
                "items": []
            }));
        }
        Err(_) => {
            return Json(json!({
                "ok": false,
                "message": "No fue posible validar la sesion portal desde core-api",
                "items": []
            }));
        }
    };
    let Some(id_persona) = identity.id_persona else {
        return Json(json!({
            "ok": false,
            "message": "La sesion portal no esta asociada a una persona valida",
            "items": []
        }));
    };

    if let Ok(items) = sql_read::list_postulations_by_person(&state.pool, id_persona).await {
        return Json(json!({ "items": items }));
    }
    service_unavailable_items(
        "No fue posible listar postulaciones del colaborador desde SQL Server",
    )
}

async fn listar_rh(State(state): State<AppState>, headers: HeaderMap) -> Json<Value> {
    let Ok(_) = require_rh_read(&state, &headers).await else {
        return Json(json!({
            "ok": false,
            "message": "Sin acceso",
            "items": []
        }));
    };

    if let Ok(items) = sql_read::list_rh_vacancies(&state.pool).await {
        return Json(json!({ "items": items }));
    }
    service_unavailable_items("No fue posible listar vacantes RH desde SQL Server")
}

async fn rh_dashboard(State(state): State<AppState>, headers: HeaderMap) -> Json<Value> {
    let Ok(_) = require_rh_read(&state, &headers).await else {
        return Json(json!({
            "ok": false,
            "message": "Sin acceso"
        }));
    };

    if let Ok(report) = sql_read::get_rh_dashboard(&state.pool).await {
        return Json(report);
    }
    service_unavailable("No fue posible construir el dashboard RH desde SQL Server")
}

async fn crear_vacante(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(request): Json<sql_write::CreateVacancyRequest>,
) -> Json<Value> {
    let Ok(identity) = require_rh_write(&state, &headers, &["vacantes.rh.crear"]).await else {
        return Json(json!({
            "ok": false,
            "message": "Sin acceso"
        }));
    };
    let mut request = request;
    request.id_responsable_rh = request
        .id_responsable_rh
        .or(Some(identity.id_cuenta_portal));
    request.id_solicitante = request.id_solicitante.or(Some(identity.id_cuenta_portal));
    if let Err(message) = validate_create_vacancy_request(&mut request) {
        return Json(json!({
            "ok": false,
            "message": message
        }));
    }

    if let Ok(id_vacante) = sql_write::create_vacancy(&state.pool, &request).await {
        record_operational_audit_best_effort(
            &state,
            Some(&identity),
            &headers,
            "VACANTE_CREAR",
            "vacantes.rh",
            true,
            Some(format!(
                "IdVacante={id_vacante}; CodigoVacante={}",
                request.codigo_vacante
            )),
        )
        .await;
        return Json(json!({
            "ok": true,
            "idVacante": id_vacante,
            "estadoActual": "BORRADOR"
        }));
    }

    record_operational_audit_best_effort(
        &state,
        Some(&identity),
        &headers,
        "VACANTE_CREAR",
        "vacantes.rh",
        false,
        Some(format!("CodigoVacante={}", request.codigo_vacante)),
    )
    .await;

    Json(json!({
        "ok": false,
        "message": "No fue posible crear la vacante"
    }))
}

async fn cambiar_estado_vacante(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(id): Path<i32>,
    Json(request): Json<sql_write::ChangeStateRequest>,
) -> Json<Value> {
    let Ok(identity) = require_rh_write(&state, &headers, &["vacantes.rh.estado"]).await else {
        return Json(json!({
            "ok": false,
            "idVacante": id,
            "message": "Sin acceso"
        }));
    };
    let mut request = request;
    request.id_cuenta_portal = identity.id_cuenta_portal;
    if let Err(message) = validate_change_state_request(&mut request) {
        return Json(json!({
            "ok": false,
            "idVacante": id,
            "message": message
        }));
    }

    if sql_write::change_vacancy_state(&state.pool, id, &request)
        .await
        .is_ok()
    {
        record_operational_audit_best_effort(
            &state,
            Some(&identity),
            &headers,
            "VACANTE_CAMBIAR_ESTADO",
            "vacantes.rh",
            true,
            Some(format!(
                "IdVacante={id}; EstadoNuevo={}",
                request.estado_nuevo
            )),
        )
        .await;
        return Json(json!({
            "ok": true,
            "idVacante": id,
            "message": "Estado de vacante actualizado"
        }));
    }

    record_operational_audit_best_effort(
        &state,
        Some(&identity),
        &headers,
        "VACANTE_CAMBIAR_ESTADO",
        "vacantes.rh",
        false,
        Some(format!(
            "IdVacante={id}; EstadoNuevo={}",
            request.estado_nuevo
        )),
    )
    .await;

    Json(json!({
        "ok": false,
        "idVacante": id,
        "message": "No fue posible actualizar el estado de vacante"
    }))
}

async fn cambiar_estado_postulacion(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(id): Path<i64>,
    Json(request): Json<sql_write::ChangePostulationStateRequest>,
) -> Json<Value> {
    let Ok(identity) = require_rh_write(&state, &headers, &["vacantes.rh.estado"]).await else {
        return Json(json!({
            "ok": false,
            "idPostulacion": id,
            "message": "Sin acceso"
        }));
    };
    let mut request = request;
    request.id_cuenta_portal = identity.id_cuenta_portal;
    if let Err(message) = validate_change_postulation_state_request(&mut request) {
        return Json(json!({
            "ok": false,
            "idPostulacion": id,
            "message": message
        }));
    }

    let origen_postulacion = request
        .origen_postulacion
        .clone()
        .unwrap_or_else(|| "EMPLEADO_INTERNO".to_string());

    let update_result = if origen_postulacion == "CANDIDATO_EXTERNO" {
        sql_write::change_external_candidate_postulation_state(&state.pool, id, &request).await
    } else {
        match i32::try_from(id) {
            Ok(id_interno) => {
                sql_write::change_postulation_state(&state.pool, id_interno, &request).await
            }
            Err(_) => Err("IdPostulacion interna fuera de rango".to_string()),
        }
    };

    if update_result.is_ok() {
        record_operational_audit_best_effort(
            &state,
            Some(&identity),
            &headers,
            "POSTULACION_CAMBIAR_ESTADO",
            "vacantes.rh",
            true,
            Some(format!(
                "IdPostulacion={id}; Origen={origen_postulacion}; EstadoNuevo={}",
                request.estado_nuevo
            )),
        )
        .await;
        return Json(json!({
            "ok": true,
            "idPostulacion": id,
            "origenPostulacion": origen_postulacion,
            "message": "Estado de postulacion actualizado"
        }));
    }

    record_operational_audit_best_effort(
        &state,
        Some(&identity),
        &headers,
        "POSTULACION_CAMBIAR_ESTADO",
        "vacantes.rh",
        false,
        Some(format!(
            "IdPostulacion={id}; Origen={origen_postulacion}; EstadoNuevo={}",
            request.estado_nuevo
        )),
    )
    .await;

    Json(json!({
        "ok": false,
        "idPostulacion": id,
        "origenPostulacion": origen_postulacion,
        "message": "No fue posible actualizar el estado de postulacion"
    }))
}

async fn listar_postulaciones_rh(State(state): State<AppState>, headers: HeaderMap) -> Json<Value> {
    let Ok(_) = require_rh_read(&state, &headers).await else {
        return Json(json!({
            "ok": false,
            "message": "Sin acceso",
            "items": []
        }));
    };

    if let Ok(items) = sql_read::list_rh_postulations(&state.pool).await {
        let items = enriquecer_postulaciones_rh_con_empleado(&state, &headers, items).await;
        return Json(json!({ "items": items }));
    }
    service_unavailable_items("No fue posible listar postulaciones RH desde SQL Server")
}

async fn obtener_detalle_postulacion_rh(
    State(state): State<AppState>,
    Path(id_postulacion): Path<i64>,
    Query(query): Query<RhPostulationDetailQuery>,
    headers: HeaderMap,
) -> impl IntoResponse {
    if require_rh_read(&state, &headers).await.is_err() {
        return (
            StatusCode::FORBIDDEN,
            Json(json!({
                "ok": false,
                "message": "Acceso denegado"
            })),
        );
    }

    let Some(origen) = normalize_postulation_origin(query.origen.as_deref()) else {
        return (
            StatusCode::BAD_REQUEST,
            Json(json!({
                "ok": false,
                "message": "OrigenPostulacion invalido"
            })),
        );
    };

    if origen == "EMPLEADO_INTERNO" {
        let detail = match sql_read::get_internal_rh_postulation_detail(&state.pool, id_postulacion)
            .await
        {
            Ok(Some(item)) => item,
            Ok(None) => {
                return (
                    StatusCode::NOT_FOUND,
                    Json(json!({
                        "ok": false,
                        "message": "Postulacion interna no encontrada"
                    })),
                )
            }
            Err(_) => {
                return (
                    StatusCode::SERVICE_UNAVAILABLE,
                    Json(json!({
                        "ok": false,
                        "message": "No fue posible consultar el detalle de la postulacion interna"
                    })),
                )
            }
        };

        let id_persona = detail["idPersona"]
            .as_i64()
            .and_then(|value| i32::try_from(value).ok());
        let empleado = if let Some(id_persona) = id_persona {
            resolver_detalle_empleado_por_persona(
                &state.http,
                &state.config.core_api_base_url,
                &headers,
                id_persona,
            )
            .await
        } else {
            None
        };
        let cv_actual = if let Some(id_persona) = id_persona {
            sql_read::get_person_current_cv(&state.pool, id_persona)
                .await
                .ok()
                .flatten()
        } else {
            None
        };
        let cv_historial = if let Some(id_persona) = id_persona {
            sql_read::list_person_cv_history(&state.pool, id_persona)
                .await
                .unwrap_or_default()
        } else {
            Vec::new()
        };
        let analisis_actual = if let Some(id_persona) = id_persona {
            sql_read::get_person_current_analysis(&state.pool, id_persona)
                .await
                .ok()
                .flatten()
        } else {
            None
        };
        let analisis_historial = if let Some(id_persona) = id_persona {
            sql_read::list_person_analysis_history(&state.pool, id_persona)
                .await
                .unwrap_or_default()
        } else {
            Vec::new()
        };

        return (
            StatusCode::OK,
            Json(json!({
                "ok": true,
                "origenPostulacion": origen,
                "postulacion": detail,
                "candidato": empleado,
                "cv": {
                    "actual": cv_actual,
                    "historial": cv_historial
                },
                "analisisIa": {
                    "disponible": analisis_actual.is_some() || !analisis_historial.is_empty(),
                    "actual": analisis_actual,
                    "historial": analisis_historial
                }
            })),
        );
    }

    let detail =
        match sql_read::get_external_rh_postulation_detail(&state.pool, id_postulacion).await {
            Ok(Some(item)) => item,
            Ok(None) => {
                return (
                    StatusCode::NOT_FOUND,
                    Json(json!({
                        "ok": false,
                        "message": "Postulacion externa no encontrada"
                    })),
                )
            }
            Err(_) => {
                return (
                    StatusCode::SERVICE_UNAVAILABLE,
                    Json(json!({
                        "ok": false,
                        "message": "No fue posible consultar el detalle de la postulacion externa"
                    })),
                )
            }
        };

    let id_candidato = detail["idCandidato"].as_i64();
    let cv_actual = if let Some(id_candidato) = id_candidato {
        candidate_sql::get_candidate_cv_current(&state.pool, id_candidato)
            .await
            .ok()
            .flatten()
    } else {
        None
    };
    let cv_historial = if let Some(id_candidato) = id_candidato {
        candidate_sql::list_candidate_cv_history(&state.pool, id_candidato)
            .await
            .unwrap_or_default()
    } else {
        Vec::new()
    };
    let current_external_cv = cv_actual.as_ref().map(candidate_cv_file_to_value);
    let external_cv_history = cv_historial
        .iter()
        .map(candidate_cv_file_to_value)
        .collect::<Vec<Value>>();
    let nombre_candidato = format!(
        "{} {}",
        detail["nombres"].as_str().unwrap_or_default(),
        detail["apellidos"].as_str().unwrap_or_default()
    )
    .trim()
    .to_string();

    (
        StatusCode::OK,
        Json(json!({
            "ok": true,
            "origenPostulacion": origen,
            "postulacion": {
                "idPostulacion": detail["idPostulacion"],
                "idVacante": detail["idVacante"],
                "idCandidato": detail["idCandidato"],
                "titulo": detail["titulo"],
                "codigoVacante": detail["codigoVacante"],
                "codigoPais": detail["codigoPais"],
                "modalidad": detail["modalidad"],
                "tipoVacante": detail["tipoVacante"],
                "estadoActual": detail["estadoActual"],
                "scoreIa": detail["scoreIa"],
                "scoreRh": detail["scoreRh"],
                "scoreJefe": detail["scoreJefe"],
                "fechaPostulacion": detail["fechaPostulacion"],
                "origenPostulacion": detail["origenPostulacion"]
            },
            "candidato": {
                "idCandidato": detail["idCandidato"],
                "nombre": nombre_candidato,
                "correo": detail["correo"],
                "telefono": detail["telefono"],
                "departamentoResidencia": detail["departamentoResidencia"],
                "municipioResidencia": detail["municipioResidencia"],
                "categoriaInteres": detail["categoriaInteres"],
                "modalidadPreferida": detail["modalidadPreferida"],
                "nivelAcademico": detail["nivelAcademico"],
                "linkedinUrl": detail["linkedinUrl"],
                "resumenProfesional": detail["resumenProfesional"],
                "disponibilidadViajar": detail["disponibilidadViajar"],
                "disponibilidadHorarioRotativo": detail["disponibilidadHorarioRotativo"],
                "tieneLicenciaConducir": detail["tieneLicenciaConducir"],
                "tipoLicencia": detail["tipoLicencia"],
                "tieneVehiculoPropio": detail["tieneVehiculoPropio"],
                "fechaRegistro": detail["fechaRegistro"]
            },
            "cv": {
                "actual": current_external_cv,
                "historial": external_cv_history
            },
            "analisisIa": {
                "disponible": false,
                "actual": Value::Null,
                "historial": Vec::<Value>::new(),
                "nota": "El analisis IA vigente para candidato externo aun no esta vinculado al modelo actual de CV seguro por IdCandidato."
            }
        })),
    )
}

async fn obtener_reportes_rh(State(state): State<AppState>, headers: HeaderMap) -> Json<Value> {
    let Ok(_) = require_rh_read(&state, &headers).await else {
        return Json(json!({
            "ok": false,
            "message": "Sin acceso"
        }));
    };

    if let Ok(report) = sql_read::get_rh_reports(&state.pool).await {
        return Json(report);
    }
    service_unavailable("No fue posible obtener reportes RH desde SQL Server")
}

async fn listar_requisiciones(State(state): State<AppState>, headers: HeaderMap) -> Json<Value> {
    let Ok(_) = require_rh_read(&state, &headers).await else {
        return Json(json!({
            "ok": false,
            "message": "Sin acceso",
            "items": []
        }));
    };

    if let Ok(items) = sql_read::list_requisitions(&state.pool).await {
        return Json(json!({ "items": items }));
    }
    service_unavailable_items("No fue posible listar requisiciones desde SQL Server")
}

async fn listar_pendientes_aprobacion(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Json<Value> {
    let Ok(identity) = require_rh_read(&state, &headers).await else {
        return Json(json!({
            "ok": false,
            "message": "Sin acceso",
            "items": []
        }));
    };

    if let Ok(items) =
        sql_read::list_pending_requisition_approvals(&state.pool, identity.id_cuenta_portal).await
    {
        return Json(json!({ "items": items }));
    }
    service_unavailable_items("No fue posible listar pendientes de aprobacion desde SQL Server")
}

async fn crear_requisicion(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(request): Json<sql_write::CreateRequisitionRequest>,
) -> Json<Value> {
    let Ok(identity) = require_rh_write(&state, &headers, &["vacantes.rh.crear"]).await else {
        return Json(json!({
            "ok": false,
            "message": "Sin acceso"
        }));
    };
    let mut request = request;
    request.id_cuenta_portal_solicitante = identity.id_cuenta_portal;
    if let Err(message) = validate_create_requisition_request(&mut request) {
        return Json(json!({
            "ok": false,
            "message": message
        }));
    }

    if let Ok(id_requisicion) = sql_write::create_requisition(&state.pool, &request).await {
        record_operational_audit_best_effort(
            &state,
            Some(&identity),
            &headers,
            "REQUISICION_CREAR",
            "vacantes.rh",
            true,
            Some(format!(
                "IdRequisicion={id_requisicion}; CodigoRequisicion={}",
                request.codigo_requisicion
            )),
        )
        .await;
        return Json(json!({
            "ok": true,
            "idRequisicion": id_requisicion,
            "codigoRequisicion": request.codigo_requisicion,
            "estadoActual": "BORRADOR"
        }));
    }

    record_operational_audit_best_effort(
        &state,
        Some(&identity),
        &headers,
        "REQUISICION_CREAR",
        "vacantes.rh",
        false,
        Some(format!("CodigoRequisicion={}", request.codigo_requisicion)),
    )
    .await;

    Json(json!({
        "ok": false,
        "message": "No fue posible crear la requisicion"
    }))
}

async fn aprobar_requisicion(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(id): Path<i32>,
    Json(request): Json<sql_write::RequisitionDecisionRequest>,
) -> Json<Value> {
    let Ok(identity) = require_rh_write(&state, &headers, &["vacantes.rh.estado"]).await else {
        return Json(json!({
            "ok": false,
            "idRequisicion": id,
            "message": "Sin acceso"
        }));
    };
    let mut request = request;
    request.id_cuenta_portal = identity.id_cuenta_portal;
    if let Err(message) = validate_requisition_decision_request(&mut request, false) {
        return Json(json!({
            "ok": false,
            "idRequisicion": id,
            "message": message
        }));
    }

    if sql_write::approve_requisition(&state.pool, i64::from(id), &request)
        .await
        .is_ok()
    {
        record_operational_audit_best_effort(
            &state,
            Some(&identity),
            &headers,
            "REQUISICION_APROBAR",
            "vacantes.rh",
            true,
            Some(format!(
                "IdRequisicion={id}; Etapa={}",
                request.etapa.clone().unwrap_or_default()
            )),
        )
        .await;
        return Json(json!({
            "ok": true,
            "idRequisicion": id,
            "message": "Requisicion aprobada y enviada a la siguiente etapa"
        }));
    }

    record_operational_audit_best_effort(
        &state,
        Some(&identity),
        &headers,
        "REQUISICION_APROBAR",
        "vacantes.rh",
        false,
        Some(format!(
            "IdRequisicion={id}; Etapa={}",
            request.etapa.clone().unwrap_or_default()
        )),
    )
    .await;

    Json(json!({
        "ok": false,
        "idRequisicion": id,
        "message": "No fue posible aprobar la requisicion"
    }))
}

async fn rechazar_requisicion(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(id): Path<i32>,
    Json(request): Json<sql_write::RequisitionDecisionRequest>,
) -> Json<Value> {
    let Ok(identity) = require_rh_write(&state, &headers, &["vacantes.rh.estado"]).await else {
        return Json(json!({
            "ok": false,
            "idRequisicion": id,
            "message": "Sin acceso"
        }));
    };
    let mut request = request;
    request.id_cuenta_portal = identity.id_cuenta_portal;
    if let Err(message) = validate_requisition_decision_request(&mut request, true) {
        return Json(json!({
            "ok": false,
            "idRequisicion": id,
            "message": message
        }));
    }

    if sql_write::reject_requisition(&state.pool, i64::from(id), &request)
        .await
        .is_ok()
    {
        record_operational_audit_best_effort(
            &state,
            Some(&identity),
            &headers,
            "REQUISICION_RECHAZAR",
            "vacantes.rh",
            true,
            Some(format!("IdRequisicion={id}")),
        )
        .await;
        return Json(json!({
            "ok": true,
            "idRequisicion": id,
            "message": "Requisicion rechazada con comentario de auditoria"
        }));
    }

    record_operational_audit_best_effort(
        &state,
        Some(&identity),
        &headers,
        "REQUISICION_RECHAZAR",
        "vacantes.rh",
        false,
        Some(format!("IdRequisicion={id}")),
    )
    .await;

    Json(json!({
        "ok": false,
        "idRequisicion": id,
        "message": "No fue posible rechazar la requisicion"
    }))
}

async fn listar_descriptores(State(state): State<AppState>, headers: HeaderMap) -> Json<Value> {
    let Ok(_) = require_rh_read(&state, &headers).await else {
        return Json(json!({
            "ok": false,
            "message": "Sin acceso",
            "items": []
        }));
    };

    if let Ok(items) = sql_read::list_descriptors(&state.pool).await {
        return Json(json!({ "items": items }));
    }
    service_unavailable_items("No fue posible listar descriptores desde SQL Server")
}

async fn obtener_descriptor_vigente(
    Path(id_puesto): Path<i64>,
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Json<Value> {
    let Ok(_) = require_rh_read(&state, &headers).await else {
        return Json(json!({
            "ok": false,
            "message": "Sin acceso"
        }));
    };
    if let Err(message) = validate_positive_i64("IdPuesto", id_puesto) {
        return Json(json!({
            "ok": false,
            "message": message
        }));
    }

    match sql_read::get_current_descriptor(&state.pool, id_puesto).await {
        Ok(Some(item)) => return Json(item),
        Ok(None) => {
            return Json(json!({
                "ok": false,
                "message": "No existe descriptor vigente para el puesto solicitado"
            }))
        }
        Err(_) => {
            return service_unavailable(
                "No fue posible obtener el descriptor vigente desde SQL Server",
            )
        }
    }
}

async fn crear_descriptor(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(request): Json<sql_write::CreateDescriptorRequest>,
) -> Json<Value> {
    let Ok(identity) = require_rh_write(&state, &headers, &["vacantes.rh.crear"]).await else {
        return Json(json!({
            "ok": false,
            "message": "Sin acceso"
        }));
    };
    let mut request = request;
    if let Err(message) = validate_create_descriptor_request(&mut request) {
        return Json(json!({
            "ok": false,
            "message": message
        }));
    }

    if let Ok(id_descriptor) = sql_write::create_descriptor(&state.pool, &request).await {
        record_operational_audit_best_effort(
            &state,
            Some(&identity),
            &headers,
            "DESCRIPTOR_CREAR",
            "vacantes.rh",
            true,
            Some(format!(
                "IdDescriptorPuesto={id_descriptor}; IdPuesto={}",
                request.id_puesto
            )),
        )
        .await;
        return Json(json!({
            "ok": true,
            "idDescriptorPuesto": id_descriptor,
            "versionDescriptor": request.version_descriptor,
            "estadoActual": "VIGENTE"
        }));
    }

    record_operational_audit_best_effort(
        &state,
        Some(&identity),
        &headers,
        "DESCRIPTOR_CREAR",
        "vacantes.rh",
        false,
        Some(format!("IdPuesto={}", request.id_puesto)),
    )
    .await;

    Json(json!({
        "ok": false,
        "message": "No fue posible crear el descriptor"
    }))
}

async fn crear_terna(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(request): Json<sql_write::CreateTernaRequest>,
) -> Json<Value> {
    let Ok(identity) = require_rh_write(&state, &headers, &["vacantes.rh.estado"]).await else {
        return Json(json!({
            "ok": false,
            "message": "Sin acceso"
        }));
    };
    let mut request = request;
    request.id_cuenta_portal_creador = identity.id_cuenta_portal;
    if let Err(message) = validate_create_terna_request(&request) {
        return Json(json!({
            "ok": false,
            "message": message
        }));
    }

    if let Ok(id_terna) = sql_write::create_terna(&state.pool, &request).await {
        record_operational_audit_best_effort(
            &state,
            Some(&identity),
            &headers,
            "TERNA_CREAR",
            "vacantes.rh",
            true,
            Some(format!(
                "IdTerna={id_terna}; IdVacante={}",
                request.id_vacante
            )),
        )
        .await;
        return Json(json!({
            "ok": true,
            "idTerna": id_terna,
            "message": "Terna creada"
        }));
    }

    record_operational_audit_best_effort(
        &state,
        Some(&identity),
        &headers,
        "TERNA_CREAR",
        "vacantes.rh",
        false,
        Some(format!("IdVacante={}", request.id_vacante)),
    )
    .await;

    Json(json!({
        "ok": false,
        "message": "No fue posible crear la terna"
    }))
}

async fn registrar_lista_negra(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(request): Json<sql_write::CreateBlacklistRequest>,
) -> Json<Value> {
    let Ok(identity) = require_rh_write(&state, &headers, &["vacantes.rh.estado"]).await else {
        return Json(json!({
            "ok": false,
            "message": "Sin acceso"
        }));
    };
    let mut request = request;
    request.id_cuenta_portal_registro = identity.id_cuenta_portal;
    if let Err(message) = validate_create_blacklist_request(&mut request) {
        return Json(json!({
            "ok": false,
            "message": message
        }));
    }

    if let Ok(id_lista_negra) = sql_write::create_blacklist(&state.pool, &request).await {
        record_operational_audit_best_effort(
            &state,
            Some(&identity),
            &headers,
            "LISTA_NEGRA_CREAR",
            "vacantes.rh",
            true,
            Some(format!(
                "IdListaNegra={id_lista_negra}; IdPersona={}",
                request.id_persona
            )),
        )
        .await;
        return Json(json!({
            "ok": true,
            "idListaNegra": id_lista_negra,
            "message": "Registro de lista negra creado"
        }));
    }

    record_operational_audit_best_effort(
        &state,
        Some(&identity),
        &headers,
        "LISTA_NEGRA_CREAR",
        "vacantes.rh",
        false,
        Some(format!("IdPersona={}", request.id_persona)),
    )
    .await;

    Json(json!({
        "ok": false,
        "message": "No fue posible crear el registro de lista negra"
    }))
}

fn validate_create_vacancy_request(
    request: &mut sql_write::CreateVacancyRequest,
) -> Result<(), String> {
    request.codigo_vacante = normalize_upper_ascii(&request.codigo_vacante);
    request.titulo = normalize_compact_text(&request.titulo);
    request.descripcion = normalize_multiline_text(&request.descripcion);
    request.requisitos = normalize_optional_multiline_text(request.requisitos.take());
    request.area = normalize_optional_compact_text(request.area.take());
    request.gerencia = normalize_optional_compact_text(request.gerencia.take());
    request.departamento = normalize_optional_compact_text(request.departamento.take());
    request.tipo_vacante = normalize_upper_ascii(&request.tipo_vacante);
    request.modalidad = normalize_optional_upper_ascii(request.modalidad.take());
    request.ubicacion = normalize_optional_compact_text(request.ubicacion.take());
    request.codigo_pais = normalize_upper_ascii(&request.codigo_pais);
    request.nivel_experiencia = normalize_optional_upper_ascii(request.nivel_experiencia.take());
    request.prioridad = normalize_optional_upper_ascii(request.prioridad.take());
    request.motivo_excepcion = normalize_optional_multiline_text(request.motivo_excepcion.take());
    request.fecha_limite_regularizacion =
        normalize_optional_compact_text(request.fecha_limite_regularizacion.take());

    validate_code("CodigoVacante", &request.codigo_vacante, 3, 40)?;
    validate_short_text("Titulo", &request.titulo, 3, 140)?;
    validate_long_text("Descripcion", &request.descripcion, 10, 4000)?;
    validate_optional_long_text("Requisitos", request.requisitos.as_deref(), 4000)?;
    validate_optional_short_text("Area", request.area.as_deref(), 120)?;
    validate_optional_short_text("Gerencia", request.gerencia.as_deref(), 120)?;
    validate_optional_short_text("Departamento", request.departamento.as_deref(), 120)?;
    validate_code("TipoVacante", &request.tipo_vacante, 2, 40)?;
    validate_optional_short_text("Modalidad", request.modalidad.as_deref(), 40)?;
    validate_optional_short_text("Ubicacion", request.ubicacion.as_deref(), 120)?;
    validate_country_code(&request.codigo_pais)?;
    validate_optional_short_text("NivelExperiencia", request.nivel_experiencia.as_deref(), 60)?;
    validate_money_amount("SalarioMin", request.salario_min)?;
    validate_money_amount("SalarioMax", request.salario_max)?;
    validate_money_range(request.salario_min, request.salario_max)?;
    validate_positive_i32("CantidadPlazas", request.cantidad_plazas)?;
    if request.cantidad_plazas > 100 {
        return Err("CantidadPlazas no puede ser mayor que 100".to_string());
    }
    validate_optional_short_text("Prioridad", request.prioridad.as_deref(), 40)?;
    validate_optional_positive_i32("IdSolicitante", request.id_solicitante)?;
    validate_optional_positive_i32("IdResponsableRH", request.id_responsable_rh)?;
    validate_optional_positive_i64("IdRequisicionPersonal", request.id_requisicion_personal)?;
    validate_optional_positive_i32("IdDescriptorPuesto", request.id_descriptor_puesto)?;
    let _ = validate_optional_date(
        "FechaLimiteRegularizacion",
        request.fecha_limite_regularizacion.as_deref(),
    )?;
    validate_optional_long_text("MotivoExcepcion", request.motivo_excepcion.as_deref(), 1000)?;
    if request.es_excepcion_sin_requisicion && request.motivo_excepcion.is_none() {
        return Err("MotivoExcepcion es obligatorio cuando la vacante es excepcion".to_string());
    }

    Ok(())
}

fn validate_change_state_request(
    request: &mut sql_write::ChangeStateRequest,
) -> Result<(), String> {
    request.estado_nuevo = normalize_upper_ascii(&request.estado_nuevo);
    request.observacion = normalize_optional_multiline_text(request.observacion.take());
    validate_code("EstadoNuevo", &request.estado_nuevo, 3, 50)?;
    validate_optional_long_text("Observacion", request.observacion.as_deref(), 1000)?;
    Ok(())
}

fn validate_change_postulation_state_request(
    request: &mut sql_write::ChangePostulationStateRequest,
) -> Result<(), String> {
    request.estado_nuevo = normalize_upper_ascii(&request.estado_nuevo);
    request.observacion = normalize_optional_multiline_text(request.observacion.take());
    request.origen_postulacion = normalize_optional_upper_ascii(request.origen_postulacion.take());
    validate_code("EstadoNuevo", &request.estado_nuevo, 3, 50)?;
    validate_optional_long_text("Observacion", request.observacion.as_deref(), 1000)?;
    if let Some(origen) = request.origen_postulacion.as_deref() {
        if origen != "EMPLEADO_INTERNO" && origen != "CANDIDATO_EXTERNO" {
            return Err("OrigenPostulacion invalido".to_string());
        }
    }
    Ok(())
}

fn validate_create_requisition_request(
    request: &mut sql_write::CreateRequisitionRequest,
) -> Result<(), String> {
    request.codigo_requisicion = normalize_upper_ascii(&request.codigo_requisicion);
    request.tipo_necesidad = normalize_upper_ascii(&request.tipo_necesidad);
    request.justificacion = normalize_multiline_text(&request.justificacion);
    request.codigo_pais = normalize_upper_ascii(&request.codigo_pais);
    request.gerencia = normalize_optional_compact_text(request.gerencia.take());
    request.departamento = normalize_optional_compact_text(request.departamento.take());
    request.area = normalize_optional_compact_text(request.area.take());
    request.centro_costo = normalize_optional_upper_ascii(request.centro_costo.take());
    request.prioridad = normalize_optional_upper_ascii(request.prioridad.take());
    request.fecha_necesaria_cobertura =
        normalize_optional_compact_text(request.fecha_necesaria_cobertura.take());
    request.fecha_limite_regularizacion =
        normalize_optional_compact_text(request.fecha_limite_regularizacion.take());

    validate_code("CodigoRequisicion", &request.codigo_requisicion, 3, 40)?;
    validate_positive_i64("IdPuesto", request.id_puesto)?;
    validate_optional_positive_i32("IdDescriptorPuesto", request.id_descriptor_puesto)?;
    validate_code("TipoNecesidad", &request.tipo_necesidad, 3, 50)?;
    validate_long_text("Justificacion", &request.justificacion, 10, 4000)?;
    validate_positive_i32("CantidadPlazas", request.cantidad_plazas)?;
    if request.cantidad_plazas > 100 {
        return Err("CantidadPlazas no puede ser mayor que 100".to_string());
    }
    validate_country_code(&request.codigo_pais)?;
    validate_optional_short_text("Gerencia", request.gerencia.as_deref(), 120)?;
    validate_optional_short_text("Departamento", request.departamento.as_deref(), 120)?;
    validate_optional_short_text("Area", request.area.as_deref(), 120)?;
    validate_optional_short_text("CentroCosto", request.centro_costo.as_deref(), 60)?;
    validate_positive_i32(
        "IdCuentaPortalSolicitante",
        request.id_cuenta_portal_solicitante,
    )?;
    validate_optional_positive_i32(
        "IdCuentaPortalJefeAprobador",
        request.id_cuenta_portal_jefe_aprobador,
    )?;
    validate_optional_positive_i32(
        "IdCuentaPortalReclutamiento",
        request.id_cuenta_portal_reclutamiento,
    )?;
    validate_optional_positive_i32(
        "IdCuentaPortalCompensacion",
        request.id_cuenta_portal_compensacion,
    )?;
    let _ = validate_optional_date(
        "FechaNecesariaCobertura",
        request.fecha_necesaria_cobertura.as_deref(),
    )?;
    let _ = validate_optional_date(
        "FechaLimiteRegularizacion",
        request.fecha_limite_regularizacion.as_deref(),
    )?;
    validate_optional_short_text("Prioridad", request.prioridad.as_deref(), 40)?;
    if request.permite_publicacion_sin_completar && request.fecha_limite_regularizacion.is_none() {
        return Err(
            "FechaLimiteRegularizacion es obligatoria cuando se permite publicacion sin completar"
                .to_string(),
        );
    }

    Ok(())
}

fn validate_requisition_decision_request(
    request: &mut sql_write::RequisitionDecisionRequest,
    require_comment: bool,
) -> Result<(), String> {
    request.etapa = normalize_optional_upper_ascii(request.etapa.take());
    request.comentario = normalize_optional_multiline_text(request.comentario.take());
    validate_positive_i32("IdCuentaPortal", request.id_cuenta_portal)?;
    validate_optional_short_text("Etapa", request.etapa.as_deref(), 50)?;
    validate_optional_long_text("Comentario", request.comentario.as_deref(), 1000)?;
    if require_comment
        && request
            .comentario
            .as_deref()
            .unwrap_or_default()
            .chars()
            .count()
            < 10
    {
        return Err("Comentario debe tener al menos 10 caracteres".to_string());
    }
    Ok(())
}

fn validate_create_descriptor_request(
    request: &mut sql_write::CreateDescriptorRequest,
) -> Result<(), String> {
    request.titulo_puesto = normalize_compact_text(&request.titulo_puesto);
    request.version_descriptor = normalize_upper_ascii(&request.version_descriptor);
    request.objetivo_puesto = normalize_optional_multiline_text(request.objetivo_puesto.take());
    request.funciones_principales =
        normalize_optional_multiline_text(request.funciones_principales.take());
    request.funciones_secundarias =
        normalize_optional_multiline_text(request.funciones_secundarias.take());
    request.competencias_tecnicas =
        normalize_optional_multiline_text(request.competencias_tecnicas.take());
    request.competencias_blandas =
        normalize_optional_multiline_text(request.competencias_blandas.take());
    request.escolaridad = normalize_optional_compact_text(request.escolaridad.take());
    request.experiencia_minima = normalize_optional_compact_text(request.experiencia_minima.take());
    request.idiomas = normalize_optional_multiline_text(request.idiomas.take());
    request.certificaciones = normalize_optional_multiline_text(request.certificaciones.take());
    request.jornada = normalize_optional_compact_text(request.jornada.take());
    request.modalidad = normalize_optional_compact_text(request.modalidad.take());
    request.rango_salarial_referencial =
        normalize_optional_compact_text(request.rango_salarial_referencial.take());
    request.reporta_a = normalize_optional_compact_text(request.reporta_a.take());
    request.indicadores_exito = normalize_optional_multiline_text(request.indicadores_exito.take());
    request.fecha_vigencia_desde = normalize_compact_text(&request.fecha_vigencia_desde);
    request.fecha_vigencia_hasta =
        normalize_optional_compact_text(request.fecha_vigencia_hasta.take());

    validate_positive_i64("IdPuesto", request.id_puesto)?;
    validate_short_text("TituloPuesto", &request.titulo_puesto, 3, 140)?;
    validate_code("VersionDescriptor", &request.version_descriptor, 1, 30)?;
    validate_optional_long_text("ObjetivoPuesto", request.objetivo_puesto.as_deref(), 2000)?;
    validate_optional_long_text(
        "FuncionesPrincipales",
        request.funciones_principales.as_deref(),
        4000,
    )?;
    validate_optional_long_text(
        "FuncionesSecundarias",
        request.funciones_secundarias.as_deref(),
        4000,
    )?;
    validate_optional_long_text(
        "CompetenciasTecnicas",
        request.competencias_tecnicas.as_deref(),
        4000,
    )?;
    validate_optional_long_text(
        "CompetenciasBlandas",
        request.competencias_blandas.as_deref(),
        4000,
    )?;
    validate_optional_short_text("Escolaridad", request.escolaridad.as_deref(), 120)?;
    validate_optional_short_text(
        "ExperienciaMinima",
        request.experiencia_minima.as_deref(),
        120,
    )?;
    validate_optional_long_text("Idiomas", request.idiomas.as_deref(), 2000)?;
    validate_optional_long_text("Certificaciones", request.certificaciones.as_deref(), 2000)?;
    validate_optional_short_text("Jornada", request.jornada.as_deref(), 120)?;
    validate_optional_short_text("Modalidad", request.modalidad.as_deref(), 120)?;
    validate_optional_short_text(
        "RangoSalarialReferencial",
        request.rango_salarial_referencial.as_deref(),
        120,
    )?;
    validate_optional_short_text("ReportaA", request.reporta_a.as_deref(), 120)?;
    validate_optional_long_text(
        "IndicadoresExito",
        request.indicadores_exito.as_deref(),
        2000,
    )?;
    let vigencia_desde = parse_iso_date("FechaVigenciaDesde", &request.fecha_vigencia_desde)?;
    let vigencia_hasta = validate_optional_date(
        "FechaVigenciaHasta",
        request.fecha_vigencia_hasta.as_deref(),
    )?;
    if let Some(vigencia_hasta) = vigencia_hasta {
        if vigencia_hasta < vigencia_desde {
            return Err("FechaVigenciaHasta no puede ser menor que FechaVigenciaDesde".to_string());
        }
    }

    Ok(())
}

fn validate_create_terna_request(request: &sql_write::CreateTernaRequest) -> Result<(), String> {
    validate_positive_i32("IdVacante", request.id_vacante)?;
    validate_positive_i32("IdCuentaPortalCreador", request.id_cuenta_portal_creador)?;
    Ok(())
}

fn validate_create_blacklist_request(
    request: &mut sql_write::CreateBlacklistRequest,
) -> Result<(), String> {
    request.motivo = normalize_multiline_text(&request.motivo);
    request.categoria = normalize_optional_upper_ascii(request.categoria.take());
    request.fecha_inicio = normalize_compact_text(&request.fecha_inicio);
    request.fecha_fin = normalize_optional_compact_text(request.fecha_fin.take());

    validate_positive_i32("IdPersona", request.id_persona)?;
    validate_long_text("Motivo", &request.motivo, 10, 1000)?;
    validate_optional_short_text("Categoria", request.categoria.as_deref(), 50)?;
    let fecha_inicio = parse_iso_date("FechaInicio", &request.fecha_inicio)?;
    let fecha_fin = validate_optional_date("FechaFin", request.fecha_fin.as_deref())?;
    if let Some(fecha_fin) = fecha_fin {
        if fecha_fin < fecha_inicio {
            return Err("FechaFin no puede ser menor que FechaInicio".to_string());
        }
    }
    validate_positive_i32("IdCuentaPortalRegistro", request.id_cuenta_portal_registro)?;
    Ok(())
}

fn normalize_postulation_origin(value: Option<&str>) -> Option<&'static str> {
    match value
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(|value| value.to_ascii_uppercase())
        .as_deref()
    {
        Some("EMPLEADO_INTERNO") => Some("EMPLEADO_INTERNO"),
        Some("CANDIDATO_EXTERNO") => Some("CANDIDATO_EXTERNO"),
        _ => None,
    }
}

async fn require_rh_read(
    state: &AppState,
    headers: &HeaderMap,
) -> Result<PortalIdentity, StatusCode> {
    let identity =
        resolver_identidad_portal(&state.http, &state.config.core_api_base_url, headers).await?;
    if !has_rh_read_access(&identity) {
        return Err(StatusCode::FORBIDDEN);
    }
    Ok(identity)
}

async fn require_rh_write(
    state: &AppState,
    headers: &HeaderMap,
    permisos: &[&str],
) -> Result<PortalIdentity, StatusCode> {
    let identity =
        introspect_portal(&state.http, &state.config.core_api_base_url, headers, true).await?;
    if !has_rh_read_access(&identity) {
        return Err(StatusCode::FORBIDDEN);
    }
    if !permisos.is_empty() && !tiene_alguno(&identity, permisos) {
        return Err(StatusCode::FORBIDDEN);
    }
    Ok(identity)
}

fn has_rh_read_access(identity: &PortalIdentity) -> bool {
    tiene_app(identity, "vacantes")
        && tiene_alguno(
            identity,
            &["vacantes.rh.ver", "vacantes.rh.crear", "vacantes.rh.estado"],
        )
}

async fn complete_candidate_login(
    state: &AppState,
    headers: &HeaderMap,
    id_candidato: i64,
) -> (StatusCode, HeaderMap, Json<Value>) {
    let sid = generate_candidate_sid();
    let sid_hash = hash_candidate_token(&sid);
    let ip_creacion = extract_client_ip(headers);
    let user_agent = extract_user_agent(headers);

    let id_sesion_candidato = match candidate_sql::create_candidate_session(
        &state.pool,
        id_candidato,
        &sid_hash,
        ip_creacion.as_deref(),
        user_agent.as_deref(),
    )
    .await
    {
        Ok(id) => id,
        Err(message) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                HeaderMap::new(),
                Json(json!({
                    "ok": false,
                    "message": message
                })),
            )
        }
    };

    let csrf = generate_candidate_csrf();
    let csrf_hash = hash_candidate_token(&csrf);
    let mut response_headers = HeaderMap::new();
    match candidate_sql::create_candidate_csrf(&state.pool, id_sesion_candidato, &csrf_hash).await {
        Ok(()) => append_candidate_session_cookies(&mut response_headers, &sid, &csrf),
        Err(message) => {
            append_clear_candidate_cookies(&mut response_headers);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                response_headers,
                Json(json!({
                    "ok": false,
                    "message": message
                })),
            );
        }
    }

    let perfil = match candidate_sql::get_candidate_profile(&state.pool, id_candidato).await {
        Ok(Some(profile)) => profile,
        Ok(None) => {
            append_clear_candidate_cookies(&mut response_headers);
            return (
                StatusCode::NOT_FOUND,
                response_headers,
                Json(json!({
                    "ok": false,
                    "message": "Candidato no encontrado despues de autenticacion"
                })),
            );
        }
        Err(message) => {
            append_clear_candidate_cookies(&mut response_headers);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                response_headers,
                Json(json!({
                    "ok": false,
                    "message": message
                })),
            );
        }
    };

    (
        StatusCode::OK,
        response_headers,
        Json(json!({
            "ok": true,
            "perfil": perfil
        })),
    )
}

async fn resolve_candidate_session(
    state: &AppState,
    headers: &HeaderMap,
) -> Option<candidate_sql::CandidateSessionState> {
    let sid = read_candidate_cookie(headers, candidate_access_cookie_policy().name)?;
    let sid_hash = hash_candidate_token(&sid);
    candidate_sql::validate_candidate_session(&state.pool, &sid_hash)
        .await
        .ok()
        .flatten()
}

fn hash_candidate_password(clave: &str) -> Result<String, String> {
    let salt = SaltString::generate(&mut OsRng);
    Argon2::default()
        .hash_password(clave.as_bytes(), &salt)
        .map(|value| value.to_string())
        .map_err(|err| err.to_string())
}

fn verify_candidate_password(password_hash: &str, clave: &str) -> bool {
    let Ok(parsed_hash) = PasswordHash::new(password_hash) else {
        return false;
    };

    Argon2::default()
        .verify_password(clave.as_bytes(), &parsed_hash)
        .is_ok()
}

async fn record_candidate_security_attempt_best_effort(
    state: &AppState,
    id_candidato: Option<i64>,
    correo_normalizado: Option<&str>,
    ip_origen: Option<&str>,
    user_agent: Option<&str>,
    tipo_operacion: &str,
    resultado: &str,
    detalle: Option<&str>,
) {
    let _ = candidate_sql::record_candidate_security_attempt(
        &state.pool,
        id_candidato,
        correo_normalizado,
        ip_origen,
        user_agent,
        tipo_operacion,
        resultado,
        detalle,
    )
    .await;
}

async fn record_operational_audit_best_effort(
    state: &AppState,
    identity: Option<&PortalIdentity>,
    headers: &HeaderMap,
    evento: &str,
    modulo: &str,
    exitoso: bool,
    detalle: Option<String>,
) {
    let _ = registrar_evento_vacantes(
        &state.pool,
        identity.map(|item| item.id_cuenta_portal),
        identity.map(|item| item.usuario.as_str()),
        evento,
        Some(modulo),
        exitoso,
        detalle.as_deref(),
        extract_client_ip(headers).as_deref(),
        extract_user_agent(headers).as_deref(),
    )
    .await;
}

fn service_unavailable(message: &str) -> Json<Value> {
    Json(json!({
        "ok": false,
        "message": message
    }))
}

fn service_unavailable_items(message: &str) -> Json<Value> {
    Json(json!({
        "ok": false,
        "message": message,
        "items": []
    }))
}

async fn enriquecer_postulaciones_rh_con_empleado(
    state: &AppState,
    headers: &HeaderMap,
    mut items: Vec<Value>,
) -> Vec<Value> {
    let ids_persona = items
        .iter()
        .filter(|item| item["origenPostulacion"].as_str().unwrap_or_default() == "EMPLEADO_INTERNO")
        .filter_map(|item| item["idPersona"].as_i64())
        .filter_map(|id| i32::try_from(id).ok())
        .collect::<Vec<i32>>();

    if ids_persona.is_empty() {
        return items;
    }

    let nombres = resolver_nombres_empleados(
        &state.http,
        &state.config.core_api_base_url,
        headers,
        &ids_persona,
    )
    .await;
    if nombres.is_empty() {
        return items;
    }

    for item in &mut items {
        if item["origenPostulacion"].as_str().unwrap_or_default() != "EMPLEADO_INTERNO" {
            continue;
        }

        let Some(id_persona) = item["idPersona"]
            .as_i64()
            .and_then(|id| i32::try_from(id).ok())
        else {
            continue;
        };
        let Some(nombre) = nombres.get(&id_persona) else {
            continue;
        };

        if let Some(obj) = item.as_object_mut() {
            obj.insert("nombreCandidato".to_string(), json!(nombre));
        }
    }

    items
}

fn candidate_cv_file_to_value(file: &candidate_sql::CandidateCvFile) -> Value {
    json!({
        "idArchivoCandidatoCv": file.id_archivo_candidato_cv,
        "nombreOriginal": file.nombre_original,
        "extension": file.extension,
        "mimeType": file.mime_type,
        "tamanoBytes": file.tamano_bytes,
        "estadoArchivo": file.estado_archivo,
        "esCvPrincipal": file.es_cv_principal,
        "fechaCreacion": file.fecha_creacion,
        "fechaDesactivacion": file.fecha_desactivacion
    })
}

