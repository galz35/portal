use chrono::NaiveDate;

pub fn normalize_compact_text(value: &str) -> String {
    value.split_whitespace().collect::<Vec<_>>().join(" ")
}

pub fn normalize_optional_compact_text(value: Option<String>) -> Option<String> {
    value
        .map(|item| normalize_compact_text(&item))
        .filter(|item| !item.is_empty())
}

pub fn normalize_multiline_text(value: &str) -> String {
    value.replace("\r\n", "\n").trim().to_string()
}

pub fn normalize_optional_multiline_text(value: Option<String>) -> Option<String> {
    value
        .map(|item| normalize_multiline_text(&item))
        .filter(|item| !item.is_empty())
}

pub fn normalize_upper_ascii(value: &str) -> String {
    normalize_compact_text(value).to_ascii_uppercase()
}

pub fn normalize_optional_upper_ascii(value: Option<String>) -> Option<String> {
    value
        .map(|item| normalize_upper_ascii(&item))
        .filter(|item| !item.is_empty())
}

pub fn validate_email_address(value: &str) -> Result<(), String> {
    if value.len() < 5
        || value.len() > 254
        || value
            .chars()
            .any(|ch| ch.is_control() || ch.is_whitespace())
    {
        return Err("Correo invalido".to_string());
    }

    let mut parts = value.split('@');
    let Some(local) = parts.next() else {
        return Err("Correo invalido".to_string());
    };
    let Some(domain) = parts.next() else {
        return Err("Correo invalido".to_string());
    };
    if parts.next().is_some() || local.is_empty() || domain.is_empty() || !domain.contains('.') {
        return Err("Correo invalido".to_string());
    }

    if !domain
        .chars()
        .all(|ch| ch.is_ascii_alphanumeric() || matches!(ch, '.' | '-'))
    {
        return Err("Correo invalido".to_string());
    }

    Ok(())
}

pub fn validate_person_name(
    field: &str,
    value: &str,
    min: usize,
    max: usize,
) -> Result<(), String> {
    validate_length(field, value, min, max)?;
    if !value.chars().any(|ch| ch.is_alphabetic()) {
        return Err(format!("{field} debe contener letras"));
    }
    if !value
        .chars()
        .all(|ch| ch.is_alphabetic() || matches!(ch, ' ' | '-' | '\'' | '.'))
    {
        return Err(format!("{field} contiene caracteres no permitidos"));
    }
    Ok(())
}

pub fn validate_phone(field: &str, value: &str) -> Result<(), String> {
    validate_length(field, value, 7, 20)?;
    if !value
        .chars()
        .all(|ch| ch.is_ascii_digit() || matches!(ch, ' ' | '+' | '-' | '(' | ')'))
    {
        return Err(format!("{field} contiene caracteres no permitidos"));
    }
    let digits = value.chars().filter(|ch| ch.is_ascii_digit()).count();
    if !(7..=15).contains(&digits) {
        return Err(format!("{field} debe contener entre 7 y 15 digitos"));
    }
    Ok(())
}

pub fn validate_password_strength(value: &str) -> Result<(), String> {
    if value.len() < 10 || value.len() > 128 || value.chars().any(|ch| ch.is_control()) {
        return Err("La clave debe tener entre 10 y 128 caracteres".to_string());
    }

    let has_lower = value.chars().any(|ch| ch.is_ascii_lowercase());
    let has_upper = value.chars().any(|ch| ch.is_ascii_uppercase());
    let has_digit = value.chars().any(|ch| ch.is_ascii_digit());
    let has_symbol = value.chars().any(|ch| !ch.is_ascii_alphanumeric());
    let classes = [has_lower, has_upper, has_digit, has_symbol]
        .into_iter()
        .filter(|flag| *flag)
        .count();

    if classes < 3 {
        return Err(
            "La clave debe combinar mayusculas, minusculas, numeros o simbolos".to_string(),
        );
    }

    Ok(())
}

pub fn validate_code(field: &str, value: &str, min: usize, max: usize) -> Result<(), String> {
    validate_length(field, value, min, max)?;
    if !value
        .chars()
        .all(|ch| ch.is_ascii_alphanumeric() || matches!(ch, '_' | '-' | '.'))
    {
        return Err(format!("{field} contiene caracteres no permitidos"));
    }
    Ok(())
}

pub fn validate_short_text(field: &str, value: &str, min: usize, max: usize) -> Result<(), String> {
    validate_length(field, value, min, max)?;
    if value.chars().any(|ch| ch.is_control()) {
        return Err(format!("{field} contiene caracteres no permitidos"));
    }
    Ok(())
}

pub fn validate_optional_short_text(
    field: &str,
    value: Option<&str>,
    max: usize,
) -> Result<(), String> {
    if let Some(value) = value {
        validate_short_text(field, value, 1, max)?;
    }
    Ok(())
}

pub fn validate_long_text(field: &str, value: &str, min: usize, max: usize) -> Result<(), String> {
    validate_length(field, value, min, max)?;
    if value
        .chars()
        .any(|ch| ch.is_control() && !matches!(ch, '\n' | '\r' | '\t'))
    {
        return Err(format!("{field} contiene caracteres no permitidos"));
    }
    Ok(())
}

pub fn validate_optional_long_text(
    field: &str,
    value: Option<&str>,
    max: usize,
) -> Result<(), String> {
    if let Some(value) = value {
        validate_long_text(field, value, 1, max)?;
    }
    Ok(())
}

pub fn validate_country_code(value: &str) -> Result<(), String> {
    if !(2..=3).contains(&value.len()) || !value.chars().all(|ch| ch.is_ascii_alphabetic()) {
        return Err("CodigoPais invalido".to_string());
    }
    Ok(())
}

pub fn validate_positive_i32(field: &str, value: i32) -> Result<(), String> {
    if value <= 0 {
        return Err(format!("{field} debe ser mayor que cero"));
    }
    Ok(())
}

pub fn validate_positive_i64(field: &str, value: i64) -> Result<(), String> {
    if value <= 0 {
        return Err(format!("{field} debe ser mayor que cero"));
    }
    Ok(())
}

pub fn validate_optional_positive_i32(field: &str, value: Option<i32>) -> Result<(), String> {
    if let Some(value) = value {
        validate_positive_i32(field, value)?;
    }
    Ok(())
}

pub fn validate_optional_positive_i64(field: &str, value: Option<i64>) -> Result<(), String> {
    if let Some(value) = value {
        validate_positive_i64(field, value)?;
    }
    Ok(())
}

pub fn validate_money_amount(field: &str, value: Option<f64>) -> Result<(), String> {
    if let Some(value) = value {
        if !value.is_finite() || value < 0.0 {
            return Err(format!("{field} debe ser un numero valido"));
        }
    }
    Ok(())
}

pub fn validate_money_range(min: Option<f64>, max: Option<f64>) -> Result<(), String> {
    if let (Some(min), Some(max)) = (min, max) {
        if min > max {
            return Err("SalarioMin no puede ser mayor que SalarioMax".to_string());
        }
    }
    Ok(())
}

pub fn parse_iso_date(field: &str, value: &str) -> Result<NaiveDate, String> {
    NaiveDate::parse_from_str(value, "%Y-%m-%d")
        .map_err(|_| format!("{field} debe tener formato YYYY-MM-DD"))
}

pub fn validate_optional_date(
    field: &str,
    value: Option<&str>,
) -> Result<Option<NaiveDate>, String> {
    value.map(|item| parse_iso_date(field, item)).transpose()
}

fn validate_length(field: &str, value: &str, min: usize, max: usize) -> Result<(), String> {
    let len = value.chars().count();
    if len < min || len > max {
        return Err(format!("{field} debe tener entre {min} y {max} caracteres"));
    }
    Ok(())
}
