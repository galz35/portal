use std::time::Duration;

pub struct GeminiRequest {
    pub model: String,
    pub prompt: String,
    pub json_schema: String,
}

pub struct GeminiResponse {
    pub raw_json: String,
    pub success: bool,
    pub technical_error: Option<String>,
}

pub struct GeminiClient {
    api_key: String,
    base_url: String,
    timeout: Duration,
}

impl GeminiClient {
    pub fn new(api_key: impl Into<String>) -> Self {
        Self {
            api_key: api_key.into(),
            base_url: "https://generativelanguage.googleapis.com".to_string(),
            timeout: Duration::from_secs(30),
        }
    }

    pub async fn enviar_json_estructurado(
        &self,
        request: GeminiRequest,
    ) -> Result<GeminiResponse, String> {
        let _ = (&self.api_key, &self.base_url, &self.timeout, request.model, request.prompt, request.json_schema);

        Ok(GeminiResponse {
            raw_json: "{}".to_string(),
            success: true,
            technical_error: None,
        })
    }
}
