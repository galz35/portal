use axum::http::{HeaderMap, StatusCode};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize)]
pub struct PortalIdentity {
    pub id_sesion_portal: i64,
    pub id_cuenta_portal: i32,
    pub id_persona: Option<i32>,
    pub usuario: String,
    pub nombre: String,
    pub apps: Vec<String>,
    pub permisos: Vec<String>,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct CoreIntrospectRequest {
    require_csrf: bool,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct CoreIntrospectResponse {
    authenticated: bool,
    session: CoreIntrospectSession,
    identity: CoreIntrospectIdentity,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct CoreIntrospectSession {
    id_sesion_portal: i64,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct CoreIntrospectIdentity {
    id_sesion_portal: i64,
    id_cuenta_portal: i32,
    id_persona: i32,
    usuario: String,
    nombre: String,
    #[serde(default)]
    apps: Vec<String>,
    #[serde(default)]
    permisos: Vec<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EmployeePortalProfile {
    pub id_persona: i32,
    pub nombre: String,
    pub correo: Option<String>,
    pub cargo: Option<String>,
    pub empresa: Option<String>,
    pub departamento: Option<String>,
    pub pais: Option<String>,
    pub jefe: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct EmployeeNamesResponse {
    #[serde(default)]
    items: Vec<EmployeeNameRecord>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct EmployeeNameRecord {
    id_persona: i32,
    nombre: String,
}

pub async fn introspect_portal(
    client: &reqwest::Client,
    core_api_base_url: &str,
    headers: &HeaderMap,
    require_csrf: bool,
) -> Result<PortalIdentity, StatusCode> {
    let Some(cookie_header) = build_portal_cookie_header(headers) else {
        return Err(StatusCode::UNAUTHORIZED);
    };

    let url = format!(
        "{}/api/auth/introspect",
        core_api_base_url.trim_end_matches('/')
    );
    let mut request = client
        .post(url)
        .header("cookie", cookie_header)
        .json(&CoreIntrospectRequest { require_csrf });

    if let Some(csrf_header) = headers
        .get("x-csrf-token")
        .and_then(|value| value.to_str().ok())
        .map(str::trim)
        .filter(|value| !value.is_empty())
    {
        request = request.header("x-csrf-token", csrf_header);
    }
    if let Some(correlation_id) = headers
        .get("x-correlation-id")
        .and_then(|value| value.to_str().ok())
        .map(str::trim)
        .filter(|value| !value.is_empty())
    {
        request = request.header("x-correlation-id", correlation_id);
    }

    let response = request
        .send()
        .await
        .map_err(|_| StatusCode::SERVICE_UNAVAILABLE)?;
    let response_status = response.status();
    if response_status == reqwest::StatusCode::UNAUTHORIZED {
        return Err(StatusCode::UNAUTHORIZED);
    }
    if response_status == reqwest::StatusCode::FORBIDDEN {
        return Err(StatusCode::FORBIDDEN);
    }
    if !response_status.is_success() {
        return Err(StatusCode::BAD_GATEWAY);
    }

    let payload = response
        .json::<CoreIntrospectResponse>()
        .await
        .map_err(|_| StatusCode::BAD_GATEWAY)?;
    if !payload.authenticated {
        return Err(StatusCode::UNAUTHORIZED);
    }
    if payload.identity.id_sesion_portal != payload.session.id_sesion_portal {
        return Err(StatusCode::BAD_GATEWAY);
    }

    Ok(PortalIdentity {
        id_sesion_portal: payload.session.id_sesion_portal,
        id_cuenta_portal: payload.identity.id_cuenta_portal,
        id_persona: Some(payload.identity.id_persona).filter(|value| *value > 0),
        usuario: payload.identity.usuario,
        nombre: payload.identity.nombre,
        apps: payload.identity.apps,
        permisos: payload.identity.permisos,
    })
}

pub async fn resolver_identidad_portal(
    client: &reqwest::Client,
    core_api_base_url: &str,
    headers: &HeaderMap,
) -> Result<PortalIdentity, StatusCode> {
    introspect_portal(client, core_api_base_url, headers, false).await
}

pub fn tiene_alguno(identity: &PortalIdentity, requeridos: &[&str]) -> bool {
    requeridos
        .iter()
        .any(|permiso| identity.permisos.iter().any(|current| current == permiso))
}

pub fn tiene_app(identity: &PortalIdentity, app: &str) -> bool {
    identity.apps.iter().any(|current| current == app)
        || identity
            .permisos
            .iter()
            .any(|current| current == &format!("app.{app}"))
}

pub async fn resolver_nombres_empleados(
    client: &reqwest::Client,
    core_api_base_url: &str,
    headers: &HeaderMap,
    ids_persona: &[i32],
) -> HashMap<i32, String> {
    let Some(cookie_header) = build_portal_cookie_header(headers) else {
        return HashMap::new();
    };

    let mut ids = ids_persona
        .iter()
        .copied()
        .filter(|value| *value > 0)
        .collect::<Vec<i32>>();
    ids.sort_unstable();
    ids.dedup();
    if ids.is_empty() {
        return HashMap::new();
    }

    let url = format!(
        "{}/api/auth/employees/names",
        core_api_base_url.trim_end_matches('/')
    );
    let response = match client
        .post(url)
        .header("cookie", cookie_header)
        .json(&serde_json::json!({ "idsPersona": ids }))
        .send()
        .await
    {
        Ok(response) => response,
        Err(_) => return HashMap::new(),
    };
    if !response.status().is_success() {
        return HashMap::new();
    }

    match response.json::<EmployeeNamesResponse>().await {
        Ok(payload) => payload
            .items
            .into_iter()
            .filter(|item| !item.nombre.trim().is_empty())
            .map(|item| (item.id_persona, item.nombre))
            .collect(),
        Err(_) => HashMap::new(),
    }
}

pub async fn resolver_detalle_empleado_por_persona(
    client: &reqwest::Client,
    core_api_base_url: &str,
    headers: &HeaderMap,
    id_persona: i32,
) -> Option<EmployeePortalProfile> {
    if id_persona <= 0 {
        return None;
    }

    let cookie_header = build_portal_cookie_header(headers)?;
    let url = format!(
        "{}/api/auth/employees/{id_persona}/profile",
        core_api_base_url.trim_end_matches('/')
    );
    let response = client
        .get(url)
        .header("cookie", cookie_header)
        .send()
        .await
        .ok()?;
    if !response.status().is_success() {
        return None;
    }

    response.json::<EmployeePortalProfile>().await.ok()
}

fn build_portal_cookie_header(headers: &HeaderMap) -> Option<String> {
    let portal_sid = read_cookie(headers, "portal_sid")?;
    Some(format!("portal_sid={portal_sid}"))
}

fn read_cookie(headers: &HeaderMap, name: &str) -> Option<String> {
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
