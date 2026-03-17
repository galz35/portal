use crate::modules::ats::infra::{
    gemini_client::{GeminiClient, GeminiRequest},
    json_schema::{schema_extraccion_cv, schema_scoring_cv},
    prompt_builder::{
        construir_prompt_extraccion, construir_prompt_scoring, VERSION_PROMPT_EXTRACCION,
        VERSION_PROMPT_SCORING,
    },
};

pub async fn analizar_cv_general(
    client: &GeminiClient,
    model: &str,
    texto_extraido: &str,
) -> Result<String, String> {
    let response = client
        .enviar_json_estructurado(GeminiRequest {
            model: model.to_string(),
            prompt: construir_prompt_extraccion(texto_extraido),
            json_schema: schema_extraccion_cv().to_string(),
        })
        .await?;

    if response.success {
        Ok(response.raw_json)
    } else {
        Err(response
            .technical_error
            .unwrap_or_else(|| "Error al analizar CV".to_string()))
    }
}

pub async fn analizar_cv_para_vacante(
    client: &GeminiClient,
    model: &str,
    texto_extraido: &str,
    titulo_vacante: &str,
    requisitos_vacante: &str,
) -> Result<String, String> {
    let response = client
        .enviar_json_estructurado(GeminiRequest {
            model: model.to_string(),
            prompt: construir_prompt_scoring(texto_extraido, titulo_vacante, requisitos_vacante),
            json_schema: schema_scoring_cv().to_string(),
        })
        .await?;

    if response.success {
        Ok(response.raw_json)
    } else {
        Err(response
            .technical_error
            .unwrap_or_else(|| "Error al calcular scoring".to_string()))
    }
}

pub fn guardar_resultado_ia() -> &'static str {
    "guardar_resultado_ia"
}

pub fn marcar_resultado_vigente() -> &'static str {
    "marcar_resultado_vigente"
}

pub fn reprocesar_cv() -> &'static str {
    "reprocesar_cv"
}

pub fn version_prompt_extraccion() -> &'static str {
    VERSION_PROMPT_EXTRACCION
}

pub fn version_prompt_scoring() -> &'static str {
    VERSION_PROMPT_SCORING
}
