# Matriz de Controles de Seguridad

| Control | Donde vive | Responsable | Evidencia |
| --- | --- | --- | --- |
| Cookies seguras | core-api shared seguridad | Backend | atributos `Secure`, `HttpOnly`, `SameSite` |
| CSRF | core-api + portal-web | Backend / Frontend | `TokenCsrf`, header `X-CSRF-Token` |
| Rate limiting | middlewares + proxy | Backend / Infra | reglas por endpoint |
| Bloqueo de cuentas | SQL Server | Backend | `BloqueoCuenta` |
| MFA | SQL Server + backend | Backend | `MfaCuenta`, `MfaDesafio` |
| Denylist access token | SQL Server + backend | Backend | `AccessTokenRevocado` |
| Auditoria | SQL Server + shared audit logger | Backend | `EventoSeguridad`, `AuditoriaAcceso` |
| Validacion de archivos | core-api / vacantes-api | Backend | helpers `file_validation` |
| Correlation id | observabilidad + proxy | Backend / Infra | request id en logs |
| Headers HTTP | middleware + nginx | Backend / Infra | CSP, HSTS, nosniff |
