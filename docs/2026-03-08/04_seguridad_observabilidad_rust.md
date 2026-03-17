# Seguridad y Observabilidad Rust

## Objetivo

Definir una base tecnica comun para:

- `D:\portal\core\core-api`
- `D:\portal\vacantes\vacantes-api`

enfocada en:

- manejo central de errores
- logs estructurados
- eventos de seguridad
- endurecimiento basico anti ataque

## Linea base recomendada

- `tracing`
- `tracing-subscriber`
- `tracing-appender`
- `tower-http`
- `tower`
- `serde`
- `uuid`
- `cargo-audit`
- `cargo-deny`

## Politica de errores

### Regla principal

El cliente no debe recibir:

- errores SQL crudos
- stack traces
- nombres internos de tabla
- secretos
- tokens
- connection strings

### Contrato JSON recomendado

```json
{
  "ok": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "No tienes permisos para este recurso",
    "requestId": "0d7f6a60-bf7d-4c9e-a8e5-f4c24c2b6b11"
  }
}
```

### Codigos sugeridos

- `400 BAD_REQUEST`
- `401 UNAUTHORIZED`
- `403 FORBIDDEN`
- `404 NOT_FOUND`
- `409 CONFLICT`
- `422 UNPROCESSABLE_ENTITY`
- `429 TOO_MANY_REQUESTS`
- `500 INTERNAL_SERVER_ERROR`

## AppError recomendado

```rust
use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::Serialize;
use serde_json::json;

#[derive(Debug)]
pub enum AppError {
    BadRequest(&'static str),
    Unauthorized(&'static str),
    Forbidden(&'static str),
    NotFound(&'static str),
    Conflict(&'static str),
    Validation(String),
    Database,
    Internal,
}

#[derive(Serialize)]
struct ErrorBody<'a> {
    ok: bool,
    error: ErrorDetail<'a>,
}

#[derive(Serialize)]
struct ErrorDetail<'a> {
    code: &'a str,
    message: String,
    requestId: Option<String>,
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, code, message) = match self {
            Self::BadRequest(msg) => (StatusCode::BAD_REQUEST, "BAD_REQUEST", msg.to_string()),
            Self::Unauthorized(msg) => (StatusCode::UNAUTHORIZED, "UNAUTHORIZED", msg.to_string()),
            Self::Forbidden(msg) => (StatusCode::FORBIDDEN, "FORBIDDEN", msg.to_string()),
            Self::NotFound(msg) => (StatusCode::NOT_FOUND, "NOT_FOUND", msg.to_string()),
            Self::Conflict(msg) => (StatusCode::CONFLICT, "CONFLICT", msg.to_string()),
            Self::Validation(msg) => (StatusCode::UNPROCESSABLE_ENTITY, "VALIDATION_ERROR", msg),
            Self::Database => (StatusCode::INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "No fue posible completar la operacion".to_string()),
            Self::Internal => (StatusCode::INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "Error interno del servidor".to_string()),
        };

        (
            status,
            Json(json!(ErrorBody {
                ok: false,
                error: ErrorDetail {
                    code,
                    message,
                    requestId: None,
                }
            })),
        )
            .into_response()
    }
}
```

## Logging recomendado

### Desarrollo

- formato legible
- nivel `debug`
- request id visible
- eventos de seguridad visibles

### Produccion

- formato JSON
- nivel `info`
- `warn` para abuso, acceso denegado y validaciones sospechosas
- `error` para fallos internos y DB

### Campos minimos por request

- `request_id`
- `user_id`
- `session_id`
- `ip`
- `method`
- `path`
- `status_code`
- `latency_ms`
- `event`

### Eventos de seguridad obligatorios

- login exitoso
- login fallido
- refresh fallido
- logout
- logout-all
- sesion no encontrada
- acceso denegado
- cambio de estado de vacante
- cambio de estado de postulacion
- requisicion aprobada
- requisicion rechazada
- alta de lista negra
- terna creada

## Inicializacion recomendada de tracing

```rust
use tracing_subscriber::{fmt, EnvFilter, layer::SubscriberExt, util::SubscriberInitExt};

pub fn init_observability() {
    let filter = EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new("info,tower_http=info"));

    tracing_subscriber::registry()
        .with(filter)
        .with(fmt::layer().json())
        .init();
}
```

## Middleware recomendado

### Para ambas APIs

- `TraceLayer::new_for_http()`
- timeout por request
- body limit
- propagacion o generacion de `request_id`
- manejo central de errores de middleware

### Ejemplo conceptual

```rust
use std::time::Duration;
use tower::{BoxError, ServiceBuilder};
use tower_http::{
    limit::RequestBodyLimitLayer,
    timeout::TimeoutLayer,
    trace::TraceLayer,
};

let middleware = ServiceBuilder::new()
    .layer(TraceLayer::new_for_http())
    .layer(RequestBodyLimitLayer::new(2 * 1024 * 1024))
    .layer(TimeoutLayer::new(Duration::from_secs(20)));
```

## Recomendaciones anti ataque

### Login y sesion

- rate limit en login y refresh
- registrar intentos fallidos
- no revelar si el usuario existe o no
- no loguear password
- no loguear cookies completas

### Input

- validar longitudes
- validar enums
- validar fechas
- limitar payloads
- rechazar cadenas excesivas

### Respuestas

- mensajes genericos para `500`
- `401` si no hay sesion
- `403` si hay sesion sin permiso
- `422` para validacion

### SQL

- siempre parametrizado
- nunca concatenar strings SQL de usuario
- no devolver mensajes del motor al cliente

### Logs

- no guardar:
  - password
  - refresh token
  - access token
  - csrf completo
  - connection string

## Diferencia por API

### `core-api`

prioridades:

- login
- refresh
- logout
- sesion
- permisos
- eventos de seguridad

eventos mas sensibles:

- login fallido repetido
- sesion revocada
- cookie de sesion invalida
- acceso a app no autorizada

### `vacantes-api`

prioridades:

- permisos RH
- cambios de estado
- postulaciones
- requisiciones
- lista negra
- terna

eventos mas sensibles:

- postulacion rechazada por estado invalido
- requisicion aprobada o rechazada
- publicacion por excepcion
- alta en lista negra
- cambios de estado no permitidos

## Checklist minimo antes de publicar

- `cargo fmt --check`
- `cargo clippy --all-targets --all-features -- -D warnings`
- `cargo test`
- `cargo audit`
- `cargo deny check`
- revisar logs de login y acceso denegado
- revisar que no se expongan errores SQL
- revisar que ninguna respuesta incluya secretos
