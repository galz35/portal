use std::path::Path;

use sha2::{Digest, Sha256};

#[derive(Debug, Clone)]
pub struct ValidatedCvFile {
    pub original_name: String,
    pub extension: String,
    pub declared_mime: Option<String>,
    pub detected_mime: String,
    pub size_bytes: u64,
    pub sha256_hex: String,
    pub bytes: Vec<u8>,
}

pub fn validate_candidate_cv_upload(
    file_name: Option<&str>,
    content_type: Option<&str>,
    bytes: Vec<u8>,
    max_bytes: u64,
) -> Result<ValidatedCvFile, String> {
    if bytes.is_empty() {
        return Err("El archivo CV esta vacio".to_string());
    }

    let size_bytes = bytes.len() as u64;
    if size_bytes > max_bytes {
        return Err(format!(
            "El archivo CV supera el limite permitido de {max_bytes} bytes"
        ));
    }

    let original_name = sanitize_original_name(file_name.unwrap_or("cv"));
    let extension = file_extension(&original_name)
        .ok_or_else(|| "El archivo debe tener extension pdf o docx".to_string())?;
    let detected_mime = detect_mime(&extension, &bytes)
        .ok_or_else(|| "El archivo no coincide con un PDF o DOCX valido".to_string())?;

    if !is_declared_mime_allowed(content_type, &detected_mime) {
        return Err(
            "El tipo de contenido declarado no coincide con el archivo enviado".to_string(),
        );
    }

    let sha256_hex = hash_sha256(&bytes);

    Ok(ValidatedCvFile {
        original_name,
        extension,
        declared_mime: normalized_content_type(content_type),
        detected_mime,
        size_bytes,
        sha256_hex,
        bytes,
    })
}

fn sanitize_original_name(raw_name: &str) -> String {
    let base_name = Path::new(raw_name)
        .file_name()
        .and_then(|value| value.to_str())
        .unwrap_or("cv");

    let cleaned = base_name
        .chars()
        .filter(|character| {
            character.is_ascii_alphanumeric() || matches!(*character, '.' | '_' | '-' | ' ')
        })
        .collect::<String>();

    let trimmed = cleaned.trim();
    if trimmed.is_empty() {
        return "cv".to_string();
    }

    trimmed.chars().take(180).collect()
}

fn file_extension(file_name: &str) -> Option<String> {
    Path::new(file_name)
        .extension()
        .and_then(|value| value.to_str())
        .map(|value| value.trim().to_ascii_lowercase())
        .filter(|value| matches!(value.as_str(), "pdf" | "docx"))
}

fn detect_mime(extension: &str, bytes: &[u8]) -> Option<String> {
    if extension == "pdf" && bytes.starts_with(b"%PDF-") {
        return Some("application/pdf".to_string());
    }

    if extension == "docx" && bytes.starts_with(&[0x50, 0x4B, 0x03, 0x04]) {
        return Some(
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document".to_string(),
        );
    }

    None
}

fn is_declared_mime_allowed(content_type: Option<&str>, detected_mime: &str) -> bool {
    let Some(content_type) = normalized_content_type(content_type) else {
        return true;
    };

    if content_type == detected_mime {
        return true;
    }

    matches!(
        content_type.as_str(),
        "application/octet-stream" | "binary/octet-stream"
    )
}

fn normalized_content_type(content_type: Option<&str>) -> Option<String> {
    content_type
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(|value| {
            value
                .split(';')
                .next()
                .unwrap_or_default()
                .trim()
                .to_ascii_lowercase()
        })
        .filter(|value| !value.is_empty())
}

fn hash_sha256(bytes: &[u8]) -> String {
    let digest = Sha256::digest(bytes);
    format!("{digest:x}")
}
