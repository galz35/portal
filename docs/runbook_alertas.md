# Runbook de Alertas

## Alta

- `core-api caido`: validar proceso, `/health/live`, logs y conectividad SQL.
- `vacantes-api caido`: validar proceso, upload y dependencias ATS.
- `login failure rate anormal`: revisar `IntentoLogin`, rate limits y posibles ataques.
- `refresh failure rate anormal`: revisar `SesionPortal`, `RefreshToken` y `AccessTokenRevocado`.
- `500 sostenidos`: buscar correlation ids repetidos y abrir incidente.
- `Gemini falla sostenidamente`: pasar a flujo manual y revisar integracion externa.

## Media

- `p95 vacantes publicas alto`: revisar SQL y cache.
- `p95 /postular alto`: revisar DB, colas y validaciones.
- `demasiados 403 RH`: revisar permisos o intentos indebidos.

## Baja

- `dashboards sin datos`: revisar exporter y scrape de Prometheus.
- `metricas faltantes`: validar registro en middlewares y rutas criticas.
