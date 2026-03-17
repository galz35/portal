# Runbook de Seguridad

## Escenarios

- `brute force`: activar bloqueo temporal, revisar `IntentoLogin`, bloquear IP en proxy si aplica y auditar incidente.
- `token robado`: revocar sesion en `SesionPortal`, revocar access token por JTI y forzar relogin.
- `sesion sospechosa`: revisar `EventoSeguridad`, cerrar sesiones activas y rotar credenciales si es necesario.
- `CV malicioso`: marcar archivo como no confiable, retirar acceso al recurso y conservar evidencia para analisis.
- `abuso de rate limit`: endurecer limites del endpoint afectado y revisar IP/usuario involucrado.
- `fallo del proveedor IA`: permitir flujo manual, registrar error tecnico y reintentar de forma controlada.

## Pasos base

1. Identificar `correlation_id`, `idSesionPortal` e `idCuentaPortal`.
2. Verificar alcance: usuario, endpoint, IP y ventana temporal.
3. Aplicar contencion: revocacion, bloqueo o ajuste de proxy.
4. Registrar evidencia en `EventoSeguridad`.
5. Documentar cierre y acciones preventivas.

## Proxy y red

- Si el backend esta detras de Nginx o IIS, usar `TRUST_PROXY_HEADERS=true` solo cuando el puerto del backend no este expuesto a Internet.
- En despliegue del mismo host, preferir `CORE_API_HOST=127.0.0.1` y `VACANTES_API_HOST=127.0.0.1` en vez de `0.0.0.0`.
- Si `portal.empresa.local` y `vacantes.empresa.local` comparten SSO de empleado, configurar `PORTAL_COOKIE_DOMAIN=.empresa.local` en `core-api`.
- El proxy debe enviar `X-Request-Id`, `X-Real-IP`, `X-Forwarded-For` y `X-Forwarded-Proto`.
- El backend ahora prioriza `x-client-ip` calculado internamente desde `ConnectInfo`; no conviene exponer el puerto Rust directo al publico.
- Limitar `/api/auth/login-empleado`, `/api/candidatos/login`, `/api/candidatos/register` y `/api/vacantes/cv/subir` tambien en el proxy, no solo en Rust.
