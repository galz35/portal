# Fase 2 SSO - Implementacion Real

## Objetivo cumplido

Esta implementacion deja a `core-api` como autoridad central real para:

- introspeccion de sesion
- permisos RH de Vacantes
- enriquecimiento interno de empleado
- rotacion del `portal_refresh`

Y deja a `vacantes-api` sin dependencia SQL directa hacia `PortalCore`.

## Cambios aplicados

### 1. `core-api`

Se agregaron estos endpoints internos:

- `POST /api/auth/introspect`
- `GET /api/auth/employees/{id_persona}/profile`
- `POST /api/auth/employees/names`

Reglas importantes:

- `introspect` acepta `requireCsrf=true|false`
- los endpoints de empleados exigen sesion valida y permisos RH de Vacantes
- `refresh` rota el `SidHash` de sesion en cada uso

### 2. `vacantes-api`

Se hizo este cambio de arquitectura:

- ya no usa `core_sql`
- ya no necesita `CORE_MSSQL_DATABASE`
- usa `CORE_API_BASE_URL` para hablar con `core-api`
- crea un cliente HTTP interno con:
  - `connect_timeout = 2s`
  - `timeout total = 5s`
  - redirects desactivados
- reenvia solo `portal_sid`
- reenvia `X-CSRF-Token` y `X-Correlation-Id` si existen

### 3. Endurecimiento funcional

- `POST /api/vacantes/postular` ahora exige introspeccion con `require_csrf=true`
- RH read sigue validando app + permisos
- RH write sigue validando app + permisos + CSRF
- la lista RH y el detalle RH ya obtienen nombre/perfil de empleado por HTTP contra `core-api`

## SQL que se debe aplicar

### Archivo 1

- `D:\portal\core\sql-core\15_hardening_sesion_opaca.sql`

Nuevo procedimiento usado por backend:

- `dbo.spSeg_Sesion_RotarSidHash`

### Archivo 2

- `D:\portal\core\sql-core\22_sp_seguridad_identidad.sql`

Nuevo procedimiento usado por backend:

- `dbo.spSeg_Usuario_ListarNombresPerfil`

## Variables y configuracion

### `vacantes-api`

Nueva variable efectiva:

- `CORE_API_BASE_URL`

Ejemplo local:

```env
CORE_API_BASE_URL=http://127.0.0.1:8080
```

Variable que ya no hace falta para esta fase:

- `CORE_MSSQL_DATABASE`

## Archivos clave tocados

### `core-api`

- `D:\portal\core\core-api\src\modules\auth\http\handlers.rs`
- `D:\portal\core\core-api\src\modules\auth\http\routes.rs`
- `D:\portal\core\core-api\src\modules\auth\domain\mod.rs`
- `D:\portal\core\core-api\src\modules\sesiones\infra\sql_repository.rs`
- `D:\portal\core\core-api\src\sql_read_repository.rs`

### SQL

- `D:\portal\core\sql-core\15_hardening_sesion_opaca.sql`
- `D:\portal\core\sql-core\22_sp_seguridad_identidad.sql`

### `vacantes-api`

- `D:\portal\vacantes\vacantes-api\src\config\mod.rs`
- `D:\portal\vacantes\vacantes-api\src\app_state.rs`
- `D:\portal\vacantes\vacantes-api\src\shared\seguridad\portal_auth.rs`
- `D:\portal\vacantes\vacantes-api\src\main.rs`
- `D:\portal\vacantes\vacantes-api\src\db.rs`

## Verificacion hecha

Compilacion validada:

```powershell
cd D:\portal\core\core-api
cargo check
```

```powershell
cd D:\portal\vacantes\vacantes-api
cargo check
```

Ambos pasaron.

## Smoke test que Gemini debe correr

### 1. Login empleado

- iniciar sesion normal en `core-api`
- confirmar cookies `portal_sid`, `portal_refresh`, `portal_csrf`

### 2. Refresh rotativo

- hacer `POST /api/auth/refresh`
- confirmar que cambian `portal_sid` y `portal_refresh`
- repetir con la cookie anterior y validar que ya no sirva

### 3. Introspeccion

- llamar `POST /api/auth/introspect`
- probar sin cookie => `401`
- probar con cookie valida => `200`
- probar con `requireCsrf=true` y token invalido => `403`

### 4. Vacantes RH

- listar postulaciones RH
- abrir detalle RH de postulacion interna
- confirmar que nombre/perfil interno ya salen por HTTP desde `core-api`

### 5. Postulacion interna

- llamar `POST /api/vacantes/postular` con sesion valida y CSRF correcto
- repetir sin `X-CSRF-Token`
- esperado: rechazo controlado

## Regla de arquitectura desde ahora

No volver a introducir esto:

- `vacantes-api -> SQL PortalCore`

La frontera correcta queda asi:

- `core-api` = identidad, sesion, permisos, enriquecimiento interno de empleado
- `vacantes-api` = negocio Vacantes

Si Gemini necesita agregar mas datos internos del colaborador, debe exponerlos primero en `core-api` y luego consumirlos por HTTP desde `vacantes-api`.
