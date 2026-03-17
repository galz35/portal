use std::env;

use axum::http::{HeaderMap, HeaderValue};
use sha2::{Digest, Sha256};
use uuid::Uuid;

pub struct CookiePolicy {
    pub name: &'static str,
    pub secure: bool,
    pub http_only: bool,
    pub same_site: &'static str,
    pub domain: Option<String>,
    pub path: &'static str,
    pub max_age_seconds: i64,
}

pub fn access_cookie_policy() -> CookiePolicy {
    CookiePolicy {
        name: "cand_sid",
        secure: env_flag("COOKIE_SECURE", !is_local_host_env("VACANTES_API_HOST")),
        http_only: true,
        same_site: "Lax",
        domain: cookie_domain("CANDIDATE_COOKIE_DOMAIN"),
        path: "/",
        max_age_seconds: 15 * 60,
    }
}

pub fn refresh_cookie_policy() -> CookiePolicy {
    CookiePolicy {
        name: "cand_refresh",
        secure: env_flag("COOKIE_SECURE", !is_local_host_env("VACANTES_API_HOST")),
        http_only: true,
        same_site: "Lax",
        domain: cookie_domain("CANDIDATE_COOKIE_DOMAIN"),
        path: "/",
        max_age_seconds: 7 * 24 * 60 * 60,
    }
}

pub fn csrf_cookie_policy() -> CookiePolicy {
    CookiePolicy {
        name: "cand_csrf",
        secure: env_flag("COOKIE_SECURE", !is_local_host_env("VACANTES_API_HOST")),
        http_only: false,
        same_site: "Lax",
        domain: cookie_domain("CANDIDATE_COOKIE_DOMAIN"),
        path: "/",
        max_age_seconds: 2 * 60 * 60,
    }
}

pub fn build_set_cookie(policy: &CookiePolicy, value: &str) -> String {
    format!(
        "{}={}; Path={}; Max-Age={}; SameSite={}; {}{}{}",
        policy.name,
        value,
        policy.path,
        policy.max_age_seconds,
        policy.same_site,
        policy
            .domain
            .as_deref()
            .map(|domain| format!("Domain={domain}; "))
            .unwrap_or_default(),
        if policy.http_only { "HttpOnly; " } else { "" },
        if policy.secure { "Secure" } else { "" }
    )
    .trim_end_matches("; ")
    .to_string()
}

pub fn build_clear_cookie(policy: &CookiePolicy) -> String {
    format!(
        "{}=; Path={}; Max-Age=0; SameSite={}; {}{}{}",
        policy.name,
        policy.path,
        policy.same_site,
        policy
            .domain
            .as_deref()
            .map(|domain| format!("Domain={domain}; "))
            .unwrap_or_default(),
        if policy.http_only { "HttpOnly; " } else { "" },
        if policy.secure { "Secure" } else { "" }
    )
    .trim_end_matches("; ")
    .to_string()
}

pub fn append_set_cookie(headers: &mut HeaderMap, value: &str) {
    if let Ok(header_value) = HeaderValue::from_str(value) {
        headers.append("set-cookie", header_value);
    }
}

pub fn read_cookie(headers: &HeaderMap, name: &str) -> Option<String> {
    let cookie_header = headers.get("cookie")?.to_str().ok()?;

    cookie_header.split(';').find_map(|part| {
        let mut pieces = part.trim().splitn(2, '=');
        let key = pieces.next()?.trim();
        let value = pieces.next()?.trim();
        if key == name {
            Some(value.to_string())
        } else {
            None
        }
    })
}

pub fn generate_sid() -> String {
    format!("cand_{}", Uuid::new_v4())
}

pub fn generate_csrf() -> String {
    format!("cand_csrf_{}", Uuid::new_v4())
}

pub fn hash_token(value: &str) -> String {
    let digest = Sha256::digest(value.as_bytes());
    format!("{digest:x}")
}

pub fn validate_csrf_request(headers: &HeaderMap) -> Option<String> {
    let header_token = headers
        .get("x-csrf-token")
        .and_then(|value| value.to_str().ok())
        .map(str::trim)
        .filter(|value| !value.is_empty())?
        .to_string();
    let cookie_token = read_cookie(headers, csrf_cookie_policy().name)?;

    if header_token == cookie_token {
        Some(header_token)
    } else {
        None
    }
}

pub fn append_session_cookies(headers: &mut HeaderMap, sid: &str, csrf: &str) {
    append_set_cookie(headers, &build_set_cookie(&access_cookie_policy(), sid));
    append_set_cookie(headers, &build_set_cookie(&refresh_cookie_policy(), sid));
    append_set_cookie(headers, &build_set_cookie(&csrf_cookie_policy(), csrf));
}

pub fn append_clear_session_cookies(headers: &mut HeaderMap) {
    append_set_cookie(headers, &build_clear_cookie(&access_cookie_policy()));
    append_set_cookie(headers, &build_clear_cookie(&refresh_cookie_policy()));
    append_set_cookie(headers, &build_clear_cookie(&csrf_cookie_policy()));
}

pub fn append_clear_site_data(headers: &mut HeaderMap) {
    headers.insert(
        "clear-site-data",
        HeaderValue::from_static("\"cache\", \"cookies\", \"storage\""),
    );
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

fn cookie_domain(name: &str) -> Option<String> {
    env::var(name)
        .ok()
        .map(|value| value.trim().trim_start_matches('.').to_string())
        .filter(|value| !value.is_empty())
        .map(|value| format!(".{value}"))
}

fn is_local_host_env(name: &str) -> bool {
    env::var(name)
        .ok()
        .map(|value| {
            matches!(
                value.trim().to_ascii_lowercase().as_str(),
                "127.0.0.1" | "localhost" | "::1"
            )
        })
        .unwrap_or(true)
}
