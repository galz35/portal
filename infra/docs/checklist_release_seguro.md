# Checklist de Release Seguro

- Migraciones SQL aplicadas en orden.
- Variables secretas y credenciales correctas por ambiente.
- Cookies revisadas: `Secure`, `HttpOnly`, `SameSite`, `Path=/`.
- CSP revisada contra dependencias reales del frontend.
- Rate limit activo en endpoints criticos.
- Auditoria activa para login, logout, cambios sensibles y reprocesos IA.
- Denylist de access tokens verificada.
- Validacion de archivos activa para CV y adjuntos.
- Logs estructurados con `correlation_id`.
- Backups verificados y cifrados.
- Configuracion de proxy/Nginx aplicada.
- `TRUST_PROXY_HEADERS=true` solo si el backend queda detras del proxy y no expuesto directo.
- Rate limit del proxy aplicado para login central, login candidato, registro candidato y carga de CV.
- Health y metrics restringidos a red interna o loopback.
