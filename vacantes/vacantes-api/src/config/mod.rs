use std::{collections::HashMap, env, fs, path::PathBuf};

#[derive(Clone, Debug)]
pub struct AppConfig {
    pub host: String,
    pub port: u16,
    pub trust_proxy_headers: bool,
    pub database_host: String,
    pub database_port: u16,
    pub database_name: String,
    pub core_api_base_url: String,
    pub database_user: String,
    pub database_password: String,
    pub trust_server_certificate: bool,
    pub candidate_cv_storage_root: PathBuf,
    pub candidate_cv_max_bytes: u64,
    pub candidate_cv_rate_limit_max_attempts: u32,
    pub candidate_cv_rate_limit_window_seconds: u64,
    pub candidate_login_rate_limit_max_attempts: u32,
    pub candidate_login_rate_limit_window_seconds: u64,
    pub candidate_register_rate_limit_max_attempts: u32,
    pub candidate_register_rate_limit_window_seconds: u64,
    pub candidate_apply_rate_limit_max_attempts: u32,
    pub candidate_apply_rate_limit_window_seconds: u64,
    pub portal_apply_rate_limit_max_attempts: u32,
    pub portal_apply_rate_limit_window_seconds: u64,
    pub candidate_cv_ai_enabled: bool,
    pub smtp_host: String,
    pub smtp_port: u16,
    pub smtp_user: String,
    pub smtp_password: String,
    pub smtp_from: String,
    pub candidate_password_reset_base_url: String,
}

impl AppConfig {
    pub fn from_env() -> Self {
        let file_values =
            load_key_values_from_connection_file(env_flag("ALLOW_CONNECTION_FILE", false));

        Self {
            host: env::var("VACANTES_API_HOST").unwrap_or_else(|_| "127.0.0.1".to_string()),
            port: env::var("VACANTES_API_PORT")
                .ok()
                .and_then(|value| value.parse::<u16>().ok())
                .unwrap_or(8081),
            trust_proxy_headers: env_flag("TRUST_PROXY_HEADERS", false),
            database_host: env::var("MSSQL_HOST")
                .ok()
                .or_else(|| file_values.get("MSSQL_HOST").cloned())
                .unwrap_or_else(|| "127.0.0.1".to_string()),
            database_port: env::var("MSSQL_PORT")
                .ok()
                .or_else(|| file_values.get("MSSQL_PORT").cloned())
                .and_then(|value| value.parse::<u16>().ok())
                .unwrap_or(1433),
            database_name: env::var("VACANTES_MSSQL_DATABASE")
                .ok()
                .or_else(|| env::var("MSSQL_DATABASE").ok())
                .or_else(|| file_values.get("VACANTES_MSSQL_DATABASE").cloned())
                .or_else(|| file_values.get("MSSQL_DATABASE").cloned())
                .unwrap_or_else(|| "PortalVacantes".to_string()),
            core_api_base_url: normalize_url_base(resolve_core_api_base_url(&file_values)),
            database_user: env::var("MSSQL_USER")
                .ok()
                .or_else(|| file_values.get("MSSQL_USER").cloned())
                .unwrap_or_else(|| "sa".to_string()),
            database_password: env::var("MSSQL_PASSWORD")
                .ok()
                .or_else(|| file_values.get("MSSQL_PASSWORD").cloned())
                .unwrap_or_default(),
            trust_server_certificate: env::var("MSSQL_TRUST_CERT")
                .ok()
                .or_else(|| file_values.get("MSSQL_TRUST_CERT").cloned())
                .map(|value| {
                    matches!(
                        value.trim().to_ascii_lowercase().as_str(),
                        "1" | "true" | "yes" | "on"
                    )
                })
                .unwrap_or(false),
            candidate_cv_storage_root: env::var("CANDIDATE_CV_STORAGE_ROOT")
                .map(PathBuf::from)
                .unwrap_or_else(|_| default_candidate_cv_storage_root()),
            candidate_cv_max_bytes: env::var("CANDIDATE_CV_MAX_BYTES")
                .ok()
                .and_then(|value| value.parse::<u64>().ok())
                .unwrap_or(10 * 1024 * 1024),
            candidate_cv_rate_limit_max_attempts: env::var("CANDIDATE_CV_RATE_LIMIT_MAX_ATTEMPTS")
                .ok()
                .and_then(|value| value.parse::<u32>().ok())
                .unwrap_or(5),
            candidate_cv_rate_limit_window_seconds: env::var(
                "CANDIDATE_CV_RATE_LIMIT_WINDOW_SECONDS",
            )
            .ok()
            .and_then(|value| value.parse::<u64>().ok())
            .unwrap_or(10 * 60),
            candidate_login_rate_limit_max_attempts: env::var(
                "CANDIDATE_LOGIN_RATE_LIMIT_MAX_ATTEMPTS",
            )
            .ok()
            .and_then(|value| value.parse::<u32>().ok())
            .unwrap_or(8),
            candidate_login_rate_limit_window_seconds: env::var(
                "CANDIDATE_LOGIN_RATE_LIMIT_WINDOW_SECONDS",
            )
            .ok()
            .and_then(|value| value.parse::<u64>().ok())
            .unwrap_or(15 * 60),
            candidate_register_rate_limit_max_attempts: env::var(
                "CANDIDATE_REGISTER_RATE_LIMIT_MAX_ATTEMPTS",
            )
            .ok()
            .and_then(|value| value.parse::<u32>().ok())
            .unwrap_or(4),
            candidate_register_rate_limit_window_seconds: env::var(
                "CANDIDATE_REGISTER_RATE_LIMIT_WINDOW_SECONDS",
            )
            .ok()
            .and_then(|value| value.parse::<u64>().ok())
            .unwrap_or(30 * 60),
            candidate_apply_rate_limit_max_attempts: env::var(
                "CANDIDATE_APPLY_RATE_LIMIT_MAX_ATTEMPTS",
            )
            .ok()
            .and_then(|value| value.parse::<u32>().ok())
            .unwrap_or(6),
            candidate_apply_rate_limit_window_seconds: env::var(
                "CANDIDATE_APPLY_RATE_LIMIT_WINDOW_SECONDS",
            )
            .ok()
            .and_then(|value| value.parse::<u64>().ok())
            .unwrap_or(10 * 60),
            portal_apply_rate_limit_max_attempts: env::var("PORTAL_APPLY_RATE_LIMIT_MAX_ATTEMPTS")
                .ok()
                .and_then(|value| value.parse::<u32>().ok())
                .unwrap_or(6),
            portal_apply_rate_limit_window_seconds: env::var(
                "PORTAL_APPLY_RATE_LIMIT_WINDOW_SECONDS",
            )
            .ok()
            .and_then(|value| value.parse::<u64>().ok())
            .unwrap_or(10 * 60),
            candidate_cv_ai_enabled: env_flag("CANDIDATE_CV_AI_ENABLED", false),
            smtp_host: env::var("SMTP_HOST").unwrap_or_else(|_| "smtp.gmail.com".to_string()),
            smtp_port: env::var("SMTP_PORT")
                .ok()
                .and_then(|v| v.parse::<u16>().ok())
                .unwrap_or(587),
            smtp_user: env::var("SMTP_USER").unwrap_or_default(),
            smtp_password: env::var("SMTP_PASSWORD").unwrap_or_default(),
            smtp_from: env::var("SMTP_FROM").unwrap_or_default(),
            candidate_password_reset_base_url: normalize_url_base(
                env::var("CANDIDATE_PASSWORD_RESET_BASE_URL")
                    .unwrap_or_else(|_| "http://localhost:5173".to_string()),
            ),
        }
    }

    pub fn server_addr(&self) -> String {
        format!("{}:{}", self.host, self.port)
    }

    pub fn security_warnings(&self) -> Vec<String> {
        let mut warnings = Vec::new();

        if self.database_password.trim().is_empty() {
            warnings.push("MSSQL_PASSWORD esta vacio".to_string());
        }
        if self.database_user.eq_ignore_ascii_case("sa") {
            warnings.push("MSSQL_USER sigue usando sa".to_string());
        }
        if self.trust_server_certificate && !is_local_host(&self.database_host) {
            warnings.push("MSSQL_TRUST_CERT=true en un host no local".to_string());
        }
        if env_flag("ALLOW_CONNECTION_FILE", false) {
            warnings.push(
                "ALLOW_CONNECTION_FILE=true mantiene lectura de secretos desde conexion.txt"
                    .to_string(),
            );
        }
        if !cookie_secure_enabled() && !is_local_host(&self.host) {
            warnings.push("COOKIE_SECURE=false en un host no local".to_string());
        }
        if self.trust_proxy_headers && !is_loopback_bind_host(&self.host) {
            warnings.push("TRUST_PROXY_HEADERS=true con backend expuesto fuera de loopback; restringe red o cambia VACANTES_API_HOST".to_string());
        }
        if !is_local_host(&self.host) && is_local_url(&self.core_api_base_url) {
            warnings.push(
                "CORE_API_BASE_URL sigue apuntando a localhost en un host no local".to_string(),
            );
        }
        if self.smtp_from.trim().is_empty() {
            warnings.push("SMTP_FROM esta vacio".to_string());
        }
        if !is_local_host(&self.host) && is_local_url(&self.candidate_password_reset_base_url) {
            warnings.push(
                "CANDIDATE_PASSWORD_RESET_BASE_URL sigue apuntando a localhost en un host no local"
                    .to_string(),
            );
        }

        warnings
    }
}

fn load_key_values_from_connection_file(allow_connection_file: bool) -> HashMap<String, String> {
    if !allow_connection_file {
        return HashMap::new();
    }

    let path = find_connection_file();
    let Some(path) = path else {
        return HashMap::new();
    };

    let Ok(contents) = fs::read_to_string(path) else {
        return HashMap::new();
    };

    contents
        .lines()
        .filter_map(|line| {
            let trimmed = line.trim();
            if trimmed.is_empty() || trimmed.starts_with('#') {
                return None;
            }

            let (key, value) = trimmed.split_once('=')?;
            Some((key.trim().to_string(), value.trim().to_string()))
        })
        .collect()
}

fn find_connection_file() -> Option<PathBuf> {
    let cwd = env::current_dir().ok()?;
    let direct = cwd.join("conexion.txt");
    if direct.exists() {
        return Some(direct);
    }

    let parent = cwd.parent()?.parent()?.join("conexion.txt");
    if parent.exists() {
        return Some(parent);
    }

    None
}

fn env_flag(name: &str, default: bool) -> bool {
    env::var(name)
        .ok()
        .map(|value| {
            matches!(
                value.trim().to_ascii_lowercase().as_str(),
                "1" | "true" | "yes" | "on"
            )
        })
        .unwrap_or(default)
}

fn cookie_secure_enabled() -> bool {
    env::var("COOKIE_SECURE")
        .ok()
        .map(|value| {
            matches!(
                value.trim().to_ascii_lowercase().as_str(),
                "1" | "true" | "yes" | "on"
            )
        })
        .unwrap_or(false)
}

fn is_local_host(host: &str) -> bool {
    matches!(
        host.trim().to_ascii_lowercase().as_str(),
        "127.0.0.1" | "localhost" | "::1"
    )
}

fn is_loopback_bind_host(host: &str) -> bool {
    matches!(
        host.trim().to_ascii_lowercase().as_str(),
        "127.0.0.1" | "localhost" | "::1"
    )
}

fn is_local_url(value: &str) -> bool {
    let lower = value.trim().to_ascii_lowercase();
    lower.starts_with("http://127.0.0.1")
        || lower.starts_with("https://127.0.0.1")
        || lower.starts_with("http://localhost")
        || lower.starts_with("https://localhost")
        || lower.starts_with("http://[::1]")
        || lower.starts_with("https://[::1]")
}

fn normalize_url_base(value: String) -> String {
    let trimmed = value.trim().trim_end_matches('/');
    if trimmed.is_empty() {
        "http://localhost:5173".to_string()
    } else {
        trimmed.to_string()
    }
}

fn resolve_core_api_base_url(file_values: &HashMap<String, String>) -> String {
    if let Ok(value) = env::var("CORE_API_BASE_URL") {
        if !value.trim().is_empty() {
            return value;
        }
    }
    if let Some(value) = file_values.get("CORE_API_BASE_URL") {
        if !value.trim().is_empty() {
            return value.clone();
        }
    }

    let host = env::var("CORE_API_HOST")
        .ok()
        .or_else(|| file_values.get("CORE_API_HOST").cloned())
        .unwrap_or_else(|| "127.0.0.1".to_string());
    let port = env::var("CORE_API_PORT")
        .ok()
        .or_else(|| file_values.get("CORE_API_PORT").cloned())
        .and_then(|value| value.parse::<u16>().ok())
        .unwrap_or(8080);

    format!("http://{host}:{port}")
}

fn default_candidate_cv_storage_root() -> PathBuf {
    env::current_dir()
        .unwrap_or_else(|_| PathBuf::from("."))
        .join("storage")
        .join("candidatos")
        .join("cv")
}
