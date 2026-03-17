pub const VERSION_PROMPT_EXTRACCION: &str = "cv_extract_v1";
pub const VERSION_PROMPT_SCORING: &str = "cv_score_v1";

pub fn construir_prompt_extraccion(texto_extraido: &str) -> String {
    format!(
        "Analiza el texto de este CV y devuelve unicamente JSON valido siguiendo exactamente el esquema indicado.\n\
No inventes datos faltantes.\n\
Si un dato no esta claro, usa null o cadena vacia segun corresponda.\n\
No agregues texto fuera del JSON.\n\n\
Objetivo:\n\
extraer datos profesionales de un candidato para un sistema empresarial de reclutamiento.\n\n\
Campos requeridos:\n\
- nombre_completo\n\
- correo\n\
- telefono\n\
- codigo_pais_residencia\n\
- linkedin_url\n\
- portafolio_url\n\
- resumen_profesional\n\
- experiencia_anios\n\
- nivel_academico\n\
- habilidades[]\n\
- idiomas[]\n\
- experiencias[]\n\
- educacion[]\n\
- certificaciones[]\n\
- alertas[]\n\n\
Texto CV:\n{}",
        texto_extraido
    )
}

pub fn construir_prompt_scoring(
    texto_extraido: &str,
    titulo_vacante: &str,
    requisitos_vacante: &str,
) -> String {
    format!(
        "Analiza este CV contra la vacante y devuelve unicamente JSON valido siguiendo exactamente el esquema indicado.\n\
No tomes decisiones finales de contratacion.\n\
Solo devuelve un analisis preliminar util para RH.\n\n\
Evalua:\n\
- ajuste de habilidades\n\
- ajuste de experiencia\n\
- ajuste de educacion\n\
- ajuste de contexto\n\n\
Vacante:\n\
Titulo: {}\n\
Requisitos: {}\n\n\
Texto CV:\n{}",
        titulo_vacante, requisitos_vacante, texto_extraido
    )
}
