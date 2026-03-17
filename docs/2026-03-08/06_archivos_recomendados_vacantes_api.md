# Archivos Recomendados Vacantes API

## Crear o ajustar

- `D:\portal\vacantes\vacantes-api\src\shared\errors\app_error.rs`
- `D:\portal\vacantes\vacantes-api\src\shared\observability\mod.rs`
- `D:\portal\vacantes\vacantes-api\src\shared\observability\request_id.rs`
- `D:\portal\vacantes\vacantes-api\src\shared\observability\security_events.rs`
- `D:\portal\vacantes\vacantes-api\src\shared\http\error_response.rs`

## Integrar en

- `D:\portal\vacantes\vacantes-api\src\main.rs`
- `D:\portal\vacantes\vacantes-api\src\sql_write_repository.rs`
- `D:\portal\vacantes\vacantes-api\src\sql_read_repository.rs`

## Objetivo

- centralizar errores
- registrar cambios de estado y eventos RH
- detectar accesos denegados y abuso funcional
- dejar base lista para rate limiting y trazabilidad
