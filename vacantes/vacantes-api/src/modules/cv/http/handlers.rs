use axum::{
    extract::{Multipart, State},
    http::{HeaderMap, StatusCode},
    response::IntoResponse,
    Json,
};
use serde_json::{json, Value};
use tokio::fs;
use uuid::Uuid;

use crate::{
    app_state::AppState,
    candidate_sql_repository::{self as candidate_sql, CandidateSessionState},
    shared::seguridad::{
        candidate_auth::{
            access_cookie_policy as candidate_access_cookie_policy,
            hash_token as hash_candidate_token, read_cookie as read_candidate_cookie,
            validate_csrf_request as validate_candidate_csrf_request,
        },
        file_validation::validate_candidate_cv_upload,
        rate_limit::check_sliding_window,
        request_metadata::{extract_client_ip, extract_user_agent},
    },
};

pub async fn subir_cv(
    State(state): State<AppState>,
    headers: HeaderMap,
    multipart: Multipart,
) -> impl IntoResponse {
    let Some(session) = resolve_candidate_session(&state, &headers).await else {
        return json_error(
            StatusCode::UNAUTHORIZED,
            "Sesion de candidato no encontrada",
        );
    };

    if !validate_candidate_csrf(&state, &headers, session.id_sesion_candidato).await {
        return json_error(StatusCode::FORBIDDEN, "CSRF invalido");
    }

    let ip_origen = extract_client_ip(&headers);
    let user_agent = extract_user_agent(&headers);
    let rate_limit_key = format!(
        "cand-cv:{}:{}",
        session.id_candidato,
        ip_origen.as_deref().unwrap_or("desconocido")
    );

    let local_limit = check_sliding_window(
        &rate_limit_key,
        state.config.candidate_cv_rate_limit_max_attempts,
        state.config.candidate_cv_rate_limit_window_seconds,
    );
    if !local_limit.allowed {
        let detalle = format!("Reintenta en {} segundos", local_limit.retry_after_seconds);
        record_attempt_best_effort(
            &state,
            &session,
            ip_origen.as_deref(),
            user_agent.as_deref(),
            AttemptMetadata::empty("RECHAZADO_RATE_LIMIT_LOCAL", Some(detalle.as_str())),
        )
        .await;

        return (
            StatusCode::TOO_MANY_REQUESTS,
            Json(json!({
                "ok": false,
                "message": "Demasiados intentos de carga de CV",
                "retryAfterSeconds": local_limit.retry_after_seconds
            })),
        );
    }

    let recent_attempts = match candidate_sql::count_candidate_cv_recent_attempts(
        &state.pool,
        session.id_candidato,
        state.config.candidate_cv_rate_limit_window_seconds,
        ip_origen.as_deref(),
    )
    .await
    {
        Ok(total) => total,
        Err(message) => {
            let _ = message;
            return json_error(
                StatusCode::SERVICE_UNAVAILABLE,
                "No fue posible validar el limite de carga de CV",
            );
        }
    };

    if recent_attempts >= i64::from(state.config.candidate_cv_rate_limit_max_attempts) {
        record_attempt_best_effort(
            &state,
            &session,
            ip_origen.as_deref(),
            user_agent.as_deref(),
            AttemptMetadata::empty(
                "RECHAZADO_RATE_LIMIT_SQL",
                Some("Ventana de intentos excedida"),
            ),
        )
        .await;

        return (
            StatusCode::TOO_MANY_REQUESTS,
            Json(json!({
                "ok": false,
                "message": "Se excedio la cantidad permitida de cargas recientes de CV"
            })),
        );
    }

    let raw_file = match extract_single_file(multipart).await {
        Ok(file) => file,
        Err(message) => {
            record_attempt_best_effort(
                &state,
                &session,
                ip_origen.as_deref(),
                user_agent.as_deref(),
                AttemptMetadata::empty("RECHAZADO_MULTIPART", Some(message.as_str())),
            )
            .await;
            return json_error(StatusCode::BAD_REQUEST, &message);
        }
    };

    let validated = match validate_candidate_cv_upload(
        raw_file.file_name.as_deref(),
        raw_file.content_type.as_deref(),
        raw_file.bytes,
        state.config.candidate_cv_max_bytes,
    ) {
        Ok(file) => file,
        Err(message) => {
            record_attempt_best_effort(
                &state,
                &session,
                ip_origen.as_deref(),
                user_agent.as_deref(),
                AttemptMetadata {
                    nombre_original: raw_file.file_name.as_deref(),
                    extension: raw_file.extension.as_deref(),
                    tamano_bytes: raw_file.size_bytes,
                    hash_sha256: None,
                    resultado: "RECHAZADO_VALIDACION",
                    detalle: Some(message.as_str()),
                },
            )
            .await;
            return json_error(StatusCode::BAD_REQUEST, &message);
        }
    };

    let duplicate_hash = match candidate_sql::has_active_candidate_cv_hash(
        &state.pool,
        session.id_candidato,
        &validated.sha256_hex,
    )
    .await
    {
        Ok(found) => found,
        Err(message) => {
            let _ = message;
            return json_error(
                StatusCode::SERVICE_UNAVAILABLE,
                "No fue posible validar duplicados de CV",
            );
        }
    };

    if duplicate_hash {
        record_attempt_best_effort(
            &state,
            &session,
            ip_origen.as_deref(),
            user_agent.as_deref(),
            AttemptMetadata {
                nombre_original: Some(validated.original_name.as_str()),
                extension: Some(validated.extension.as_str()),
                tamano_bytes: Some(validated.size_bytes),
                hash_sha256: Some(validated.sha256_hex.as_str()),
                resultado: "RECHAZADO_DUPLICADO",
                detalle: Some("El mismo CV ya esta activo para este candidato"),
            },
        )
        .await;

        return (
            StatusCode::CONFLICT,
            Json(json!({
                "ok": false,
                "message": "Este mismo CV ya fue cargado y sigue activo"
            })),
        );
    }

    let (relative_path, absolute_path) =
        build_storage_path(&state, session.id_candidato, &validated.extension);

    if let Some(parent) = absolute_path.parent() {
        if let Err(message) = create_storage_dir(parent).await {
            record_attempt_best_effort(
                &state,
                &session,
                ip_origen.as_deref(),
                user_agent.as_deref(),
                AttemptMetadata {
                    nombre_original: Some(validated.original_name.as_str()),
                    extension: Some(validated.extension.as_str()),
                    tamano_bytes: Some(validated.size_bytes),
                    hash_sha256: Some(validated.sha256_hex.as_str()),
                    resultado: "ERROR_STORAGE",
                    detalle: Some(message.as_str()),
                },
            )
            .await;
            return json_error(StatusCode::INTERNAL_SERVER_ERROR, &message);
        }
    }

    if let Err(message) = fs::write(&absolute_path, &validated.bytes)
        .await
        .map_err(|err| err.to_string())
    {
        record_attempt_best_effort(
            &state,
            &session,
            ip_origen.as_deref(),
            user_agent.as_deref(),
            AttemptMetadata {
                nombre_original: Some(validated.original_name.as_str()),
                extension: Some(validated.extension.as_str()),
                tamano_bytes: Some(validated.size_bytes),
                hash_sha256: Some(validated.sha256_hex.as_str()),
                resultado: "ERROR_STORAGE",
                detalle: Some(message.as_str()),
            },
        )
        .await;
        return json_error(
            StatusCode::INTERNAL_SERVER_ERROR,
            "No fue posible guardar el CV en almacenamiento privado",
        );
    }

    let id_archivo_candidato_cv = match candidate_sql::register_candidate_cv_file(
        &state.pool,
        session.id_candidato,
        &validated.original_name,
        &validated.extension,
        validated.declared_mime.as_deref(),
        &validated.detected_mime,
        validated.size_bytes,
        &validated.sha256_hex,
        &relative_path,
        "PORTAL_CANDIDATO_WEB",
    )
    .await
    {
        Ok(id) => id,
        Err(message) => {
            let _ = fs::remove_file(&absolute_path).await;
            record_attempt_best_effort(
                &state,
                &session,
                ip_origen.as_deref(),
                user_agent.as_deref(),
                AttemptMetadata {
                    nombre_original: Some(validated.original_name.as_str()),
                    extension: Some(validated.extension.as_str()),
                    tamano_bytes: Some(validated.size_bytes),
                    hash_sha256: Some(validated.sha256_hex.as_str()),
                    resultado: "ERROR_SQL",
                    detalle: Some(message.as_str()),
                },
            )
            .await;
            return json_error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "No fue posible registrar el CV en SQL Server",
            );
        }
    };

    record_attempt_best_effort(
        &state,
        &session,
        ip_origen.as_deref(),
        user_agent.as_deref(),
        AttemptMetadata {
            nombre_original: Some(validated.original_name.as_str()),
            extension: Some(validated.extension.as_str()),
            tamano_bytes: Some(validated.size_bytes),
            hash_sha256: Some(validated.sha256_hex.as_str()),
            resultado: "EXITOSO",
            detalle: Some("CV almacenado y registrado"),
        },
    )
    .await;

    let archivo = candidate_sql::get_candidate_cv_current(&state.pool, session.id_candidato)
        .await
        .ok()
        .flatten();

    (
        StatusCode::CREATED,
        Json(json!({
            "ok": true,
            "idArchivoCandidatoCv": id_archivo_candidato_cv,
            "archivo": archivo,
            "message": "CV cargado correctamente"
        })),
    )
}

pub async fn procesar_cv(State(state): State<AppState>, headers: HeaderMap) -> impl IntoResponse {
    let Some(session) = resolve_candidate_session(&state, &headers).await else {
        return json_error(
            StatusCode::UNAUTHORIZED,
            "Sesion de candidato no encontrada",
        );
    };

    if !validate_candidate_csrf(&state, &headers, session.id_sesion_candidato).await {
        return json_error(StatusCode::FORBIDDEN, "CSRF invalido");
    }

    match candidate_sql::get_candidate_cv_current(&state.pool, session.id_candidato).await {
        Ok(Some(archivo)) if state.config.candidate_cv_ai_enabled => (
            StatusCode::ACCEPTED,
            Json(json!({
                "ok": true,
                "idArchivoCandidatoCv": archivo.id_archivo_candidato_cv,
                "message": "Procesamiento IA aceptado para el CV actual",
                "estado": "PENDIENTE_EJECUCION"
            })),
        ),
        Ok(Some(archivo)) => (
            StatusCode::CONFLICT,
            Json(json!({
                "ok": false,
                "idArchivoCandidatoCv": archivo.id_archivo_candidato_cv,
                "message": "El procesamiento IA de CV no esta habilitado en este ambiente",
                "configured": false
            })),
        ),
        Ok(None) => json_error(StatusCode::NOT_FOUND, "No hay CV activo para procesar"),
        Err(message) => {
            let _ = message;
            json_error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "No fue posible consultar el CV actual",
            )
        }
    }
}

pub async fn obtener_cv_actual(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> impl IntoResponse {
    let Some(session) = resolve_candidate_session(&state, &headers).await else {
        return json_error(
            StatusCode::UNAUTHORIZED,
            "Sesion de candidato no encontrada",
        );
    };

    match candidate_sql::get_candidate_cv_current(&state.pool, session.id_candidato).await {
        Ok(archivo) => (
            StatusCode::OK,
            Json(json!({
                "ok": true,
                "archivo": archivo
            })),
        ),
        Err(message) => {
            let _ = message;
            json_error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "No fue posible consultar el CV actual",
            )
        }
    }
}

pub async fn ver_historial_cv(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> impl IntoResponse {
    let Some(session) = resolve_candidate_session(&state, &headers).await else {
        return json_error(
            StatusCode::UNAUTHORIZED,
            "Sesion de candidato no encontrada",
        );
    };

    match candidate_sql::list_candidate_cv_history(&state.pool, session.id_candidato).await {
        Ok(items) => (
            StatusCode::OK,
            Json(json!({
                "ok": true,
                "items": items
            })),
        ),
        Err(message) => {
            let _ = message;
            json_error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "No fue posible consultar el historial de CV",
            )
        }
    }
}

pub async fn autocompletar_confirmar_perfil(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> impl IntoResponse {
    let Some(session) = resolve_candidate_session(&state, &headers).await else {
        return json_error(
            StatusCode::UNAUTHORIZED,
            "Sesion de candidato no encontrada",
        );
    };

    if !validate_candidate_csrf(&state, &headers, session.id_sesion_candidato).await {
        return json_error(StatusCode::FORBIDDEN, "CSRF invalido");
    }

    (
        StatusCode::NOT_IMPLEMENTED,
        Json(json!({
            "ok": false,
            "message": "El autocompletado confirmado por IA aun no esta implementado para candidatos externos",
            "configured": false
        })),
    )
}

struct UploadedMultipartFile {
    file_name: Option<String>,
    content_type: Option<String>,
    extension: Option<String>,
    size_bytes: Option<u64>,
    bytes: Vec<u8>,
}

struct AttemptMetadata<'a> {
    nombre_original: Option<&'a str>,
    extension: Option<&'a str>,
    tamano_bytes: Option<u64>,
    hash_sha256: Option<&'a str>,
    resultado: &'a str,
    detalle: Option<&'a str>,
}

impl<'a> AttemptMetadata<'a> {
    fn empty(resultado: &'a str, detalle: Option<&'a str>) -> Self {
        Self {
            nombre_original: None,
            extension: None,
            tamano_bytes: None,
            hash_sha256: None,
            resultado,
            detalle,
        }
    }
}

async fn extract_single_file(mut multipart: Multipart) -> Result<UploadedMultipartFile, String> {
    let mut uploaded: Option<UploadedMultipartFile> = None;

    while let Some(field) = multipart
        .next_field()
        .await
        .map_err(|err| err.to_string())?
    {
        let file_name = field.file_name().map(ToString::to_string);
        if file_name.is_none() {
            continue;
        }

        if uploaded.is_some() {
            return Err("Solo se permite un archivo CV por solicitud".to_string());
        }

        let content_type = field.content_type().map(ToString::to_string);
        let bytes = field.bytes().await.map_err(|err| err.to_string())?.to_vec();
        let extension = file_name
            .as_deref()
            .and_then(|value| value.rsplit('.').next())
            .map(|value| value.trim().to_ascii_lowercase())
            .filter(|value| !value.is_empty());
        let size_bytes = Some(bytes.len() as u64);

        uploaded = Some(UploadedMultipartFile {
            file_name,
            content_type,
            extension,
            size_bytes,
            bytes,
        });
    }

    uploaded.ok_or_else(|| "Debes adjuntar un archivo CV".to_string())
}

async fn resolve_candidate_session(
    state: &AppState,
    headers: &HeaderMap,
) -> Option<CandidateSessionState> {
    let sid = read_candidate_cookie(headers, candidate_access_cookie_policy().name)?;
    let sid_hash = hash_candidate_token(&sid);
    candidate_sql::validate_candidate_session(&state.pool, &sid_hash)
        .await
        .ok()
        .flatten()
}

async fn validate_candidate_csrf(
    state: &AppState,
    headers: &HeaderMap,
    id_sesion_candidato: i64,
) -> bool {
    let Some(token) = validate_candidate_csrf_request(headers) else {
        return false;
    };

    candidate_sql::validate_candidate_csrf(
        &state.pool,
        id_sesion_candidato,
        &hash_candidate_token(&token),
    )
    .await
    .unwrap_or(false)
}

async fn record_attempt_best_effort(
    state: &AppState,
    session: &CandidateSessionState,
    ip_origen: Option<&str>,
    user_agent: Option<&str>,
    metadata: AttemptMetadata<'_>,
) {
    let _ = candidate_sql::record_candidate_cv_attempt(
        &state.pool,
        session.id_candidato,
        Some(session.id_sesion_candidato),
        ip_origen,
        user_agent,
        metadata.nombre_original,
        metadata.extension,
        metadata.tamano_bytes,
        metadata.hash_sha256,
        metadata.resultado,
        metadata.detalle,
    )
    .await;
}

async fn create_storage_dir(parent: &std::path::Path) -> Result<(), String> {
    fs::create_dir_all(parent)
        .await
        .map_err(|err| err.to_string())
}

fn build_storage_path(
    state: &AppState,
    id_candidato: i64,
    extension: &str,
) -> (String, std::path::PathBuf) {
    let relative_path = format!(
        "candidate_{id_candidato}/cv_{}.{}",
        Uuid::new_v4(),
        extension
    );
    let absolute_path = state.config.candidate_cv_storage_root.join(&relative_path);
    (relative_path, absolute_path)
}

fn json_error(status: StatusCode, message: &str) -> (StatusCode, Json<Value>) {
    (
        status,
        Json(json!({
            "ok": false,
            "message": message
        })),
    )
}

