# Runbook de Observabilidad

- Ver metricas en Prometheus y dashboards en Grafana.
- Buscar por `X-Correlation-Id` en logs estructurados y eventos de seguridad.
- Si `/health/ready` falla, validar SQL Server, variables de entorno y dependencias externas.
- Para fallos de Gemini, revisar metricas de integracion externa y logs del modulo ATS.
- Primer dashboard a revisar:
  - core: `core_api_dashboard`
  - vacantes: `vacantes_api_dashboard`
  - negocio: `vacantes_negocio_dashboard`
  - planer: `planer_api_dashboard`
