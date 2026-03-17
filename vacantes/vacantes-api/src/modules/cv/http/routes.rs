use axum::{
    extract::DefaultBodyLimit,
    routing::{get, post, put},
    Router,
};

use crate::app_state::AppState;

use super::handlers::{
    autocompletar_confirmar_perfil, obtener_cv_actual, procesar_cv, subir_cv, ver_historial_cv,
};

pub fn cv_routes() -> Router<AppState> {
    Router::new()
        .route(
            "/api/vacantes/cv/subir",
            post(subir_cv).layer(DefaultBodyLimit::max(12 * 1024 * 1024)),
        )
        .route("/api/vacantes/cv/procesar", post(procesar_cv))
        .route("/api/vacantes/cv", get(obtener_cv_actual))
        .route("/api/vacantes/cv/historial", get(ver_historial_cv))
        .route(
            "/api/vacantes/perfil/autocompletar-confirmar",
            put(autocompletar_confirmar_perfil),
        )
}
