# Runbook Smoke Backend

## Objetivo

Validar rapido `core-api` y `vacantes-api` sin probar a mano cada endpoint.

El script cubre:

- `health/live` y `health/ready`
- headers de seguridad y `request-id`
- login central empleado
- lectura de sesion portal
- vacantes publicas
- login o registro candidato
- lectura de perfil candidato
- `logout` con limpieza de navegador
- postular interno y externo si se usa `-AllowWriteOperations`

## Script

Archivo:

- `D:\portal\scripts\smoke_portal_vacantes.ps1`

## Ejemplos

Solo lectura:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File D:\portal\scripts\smoke_portal_vacantes.ps1 `
  -CoreBaseUrl http://127.0.0.1:8080 `
  -VacantesBaseUrl http://127.0.0.1:8081
```

Con login empleado:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File D:\portal\scripts\smoke_portal_vacantes.ps1 `
  -CoreBaseUrl http://127.0.0.1:8080 `
  -VacantesBaseUrl http://127.0.0.1:8081 `
  -EmpleadoUsuario empleado.portal `
  -EmpleadoClave "Portal123!"
```

Con candidato y operaciones de escritura:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File D:\portal\scripts\smoke_portal_vacantes.ps1 `
  -CoreBaseUrl http://127.0.0.1:8080 `
  -VacantesBaseUrl http://127.0.0.1:8081 `
  -EmpleadoUsuario empleado.portal `
  -EmpleadoClave "Portal123!" `
  -CandidateEmail smoke.portal@example.invalid `
  -CandidatePassword "Smoke#2026Portal" `
  -AllowWriteOperations
```

## Parametros utiles

- `-PublicVacancySlug`: fuerza probar una vacante publica concreta.
- `-VacancyId`: usa `IdVacante` directo si ya lo conoces.
- `-AllowWriteOperations`: permite postular interno/externo y registrar candidato si hace falta.
- `-CandidateEmail` y `-CandidatePassword`: para usar un candidato fijo.

Si usas `-AllowWriteOperations` sin `-CandidateEmail`, el script genera un correo temporal `@example.invalid`.

## Resultado esperado

- tabla resumen por paso
- `exit 0` si todo pasa
- `exit 1` si uno o mas pasos fallan
- si un backend no esta levantado, el resumen marca `status=0` y muestra `transport=...` en vez de abortar con excepcion cruda

## Notas

- El smoke de postular puede devolver `400` por duplicado y aun contarse como valido, porque confirma que el backend llego a la regla de negocio correcta.
- Si `empleado.portal` no entra, ejecuta primero `D:\portal\core\sql-core\06_seed_usuario_base.sql` y luego `D:\portal\core\sql-core\12_fix_hash_usuario_base.sql` en `PortalCore`.
- Los backends ya leen `.env` automaticamente con `dotenvy`; no hace falta precargar variables manualmente en PowerShell si ejecutas `cargo run` desde la carpeta del servicio.
- Si `vacantes.publicas.list` falla, revisa primero datos reales en `PortalVacantes`.
- Si `core.login-empleado` falla, revisa credenciales, cookies y conectividad a `PortalCore`.
- Si ves `status=0`, el problema es de disponibilidad o red antes de llegar al endpoint. Primero confirma que `core-api` y `vacantes-api` estan arriba en los puertos configurados.
