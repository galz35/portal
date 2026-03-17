pub fn schema_extraccion_cv() -> &'static str {
    r#"{
  "type": "object",
  "properties": {
    "nombre_completo": { "type": ["string", "null"] },
    "correo": { "type": ["string", "null"] },
    "telefono": { "type": ["string", "null"] },
    "codigo_pais_residencia": { "type": ["string", "null"] },
    "linkedin_url": { "type": ["string", "null"] },
    "portafolio_url": { "type": ["string", "null"] },
    "resumen_profesional": { "type": ["string", "null"] },
    "experiencia_anios": { "type": ["number", "null"] },
    "nivel_academico": { "type": ["string", "null"] },
    "habilidades": { "type": "array" },
    "idiomas": { "type": "array" },
    "experiencias": { "type": "array" },
    "educacion": { "type": "array" },
    "certificaciones": { "type": "array" },
    "alertas": { "type": "array" }
  },
  "required": ["nombre_completo","correo","telefono","codigo_pais_residencia","linkedin_url","portafolio_url","resumen_profesional","experiencia_anios","nivel_academico","habilidades","idiomas","experiencias","educacion","certificaciones","alertas"]
}"#
}

pub fn schema_scoring_cv() -> &'static str {
    r#"{
  "type": "object",
  "properties": {
    "score_total": { "type": ["number", "null"] },
    "score_habilidades": { "type": ["number", "null"] },
    "score_experiencia": { "type": ["number", "null"] },
    "score_educacion": { "type": ["number", "null"] },
    "score_contexto": { "type": ["number", "null"] },
    "fortalezas": { "type": "array" },
    "debilidades": { "type": "array" },
    "alertas": { "type": "array" },
    "resumen_candidato": { "type": ["string", "null"] }
  },
  "required": ["score_total","score_habilidades","score_experiencia","score_educacion","score_contexto","fortalezas","debilidades","alertas","resumen_candidato"]
}"#
}
