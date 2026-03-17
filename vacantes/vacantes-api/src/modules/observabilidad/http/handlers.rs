use axum::{
    extract::State,
    http::{header, HeaderMap},
    response::IntoResponse,
    Json,
};
use serde_json::{json, Value};

use crate::app_state::AppState;
use crate::sql_read_repository as sql_read;

pub async fn health(State(state): State<AppState>) -> Json<Value> {
    Json(json!({
        "status": "ok",
        "service": "vacantes-api",
        "database": state.config.database_name,
        "connection": state.sql.masked_summary()
    }))
}

pub async fn health_live() -> Json<Value> {
    Json(json!({
        "status": "live",
        "service": "vacantes-api"
    }))
}

pub async fn health_ready(State(state): State<AppState>) -> Json<Value> {
    Json(json!({
        "status": "ready",
        "service": "vacantes-api",
        "database": state.config.database_name,
        "auth_model": "portal-central"
    }))
}

pub async fn metrics(State(state): State<AppState>) -> impl IntoResponse {
    let body = if let Ok(snapshot) = sql_read::get_observability_snapshot(&state.pool).await {
        format!(
            "# HELP vacantes_observability_sql_up Whether the SQL observability snapshot is available\n\
# TYPE vacantes_observability_sql_up gauge\n\
vacantes_observability_sql_up 1\n\
# HELP vacantes_publicas_total Published public vacancies\n\
# TYPE vacantes_publicas_total gauge\n\
vacantes_publicas_total {}\n\
# HELP vacantes_activas_total Active vacancies registered in the system\n\
# TYPE vacantes_activas_total gauge\n\
vacantes_activas_total {}\n\
# HELP vacantes_postulaciones_total Active postulations by origin\n\
# TYPE vacantes_postulaciones_total gauge\n\
vacantes_postulaciones_total{{origen=\"interna\"}} {}\n\
vacantes_postulaciones_total{{origen=\"externa\"}} {}\n\
# HELP vacantes_cvs_activos_total Active external candidate CV files\n\
# TYPE vacantes_cvs_activos_total gauge\n\
vacantes_cvs_activos_total {}\n\
# HELP vacantes_cv_rechazos_24h Rejected CV upload attempts in the last 24 hours\n\
# TYPE vacantes_cv_rechazos_24h gauge\n\
vacantes_cv_rechazos_24h {}\n\
# HELP vacantes_candidato_operacion_fallida_24h Failed candidate operations in the last 24 hours\n\
# TYPE vacantes_candidato_operacion_fallida_24h gauge\n\
vacantes_candidato_operacion_fallida_24h {}\n\
# HELP vacantes_analisis_ia_fallidos_24h Failed IA analyses in the last 24 hours\n\
# TYPE vacantes_analisis_ia_fallidos_24h gauge\n\
vacantes_analisis_ia_fallidos_24h {}\n",
            snapshot["vacantesPublicas"].as_i64().unwrap_or_default(),
            snapshot["vacantesActivas"].as_i64().unwrap_or_default(),
            snapshot["postulacionesInternas"].as_i64().unwrap_or_default(),
            snapshot["postulacionesExternas"].as_i64().unwrap_or_default(),
            snapshot["cvsActivos"].as_i64().unwrap_or_default(),
            snapshot["cvIntentosRechazados24h"].as_i64().unwrap_or_default(),
            snapshot["operacionCandidatoFallida24h"].as_i64().unwrap_or_default(),
            snapshot["analisisIaFallidos24h"].as_i64().unwrap_or_default(),
        )
    } else {
        "# HELP vacantes_observability_sql_up Whether the SQL observability snapshot is available\n\
# TYPE vacantes_observability_sql_up gauge\n\
vacantes_observability_sql_up 0\n\
# observability snapshot unavailable: SQL query failed\n"
            .to_string()
    };

    let mut headers = HeaderMap::new();
    headers.insert(
        header::CONTENT_TYPE,
        header::HeaderValue::from_static("text/plain; version=0.0.4; charset=utf-8"),
    );
    (headers, body)
}

pub async fn resumen(State(state): State<AppState>) -> Json<Value> {
    let snapshot = sql_read::get_observability_snapshot(&state.pool).await.ok();

    Json(json!({
        "service": "vacantes-api",
        "sql": {
            "database": state.sql.database,
            "summary": state.sql.masked_summary()
        },
        "security": {
            "cookieSecure": std::env::var("COOKIE_SECURE").unwrap_or_else(|_| "false".to_string()),
            "trustServerCertificate": state.config.trust_server_certificate
        },
        "negocio": {
            "source": if snapshot.is_some() { "sql" } else { "unavailable" },
            "vacantes_publicadas_total": snapshot.as_ref().and_then(|item| item["vacantesPublicas"].as_i64()),
            "vacantes_activas_total": snapshot.as_ref().and_then(|item| item["vacantesActivas"].as_i64()),
            "postulaciones_internas_total": snapshot.as_ref().and_then(|item| item["postulacionesInternas"].as_i64()),
            "postulaciones_externas_total": snapshot.as_ref().and_then(|item| item["postulacionesExternas"].as_i64()),
            "cvs_activos_total": snapshot.as_ref().and_then(|item| item["cvsActivos"].as_i64()),
            "cv_rechazos_24h": snapshot.as_ref().and_then(|item| item["cvIntentosRechazados24h"].as_i64()),
            "operacion_candidato_fallida_24h": snapshot.as_ref().and_then(|item| item["operacionCandidatoFallida24h"].as_i64()),
            "analisis_ia_fallidos_total": snapshot.as_ref().and_then(|item| item["analisisIaFallidos24h"].as_i64())
        }
    }))
}

