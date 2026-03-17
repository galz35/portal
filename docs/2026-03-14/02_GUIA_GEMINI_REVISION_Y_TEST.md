# Guia Gemini - Revision y Test

## Objetivo

Permitir que Gemini revise rapido lo hecho hoy y lo pruebe sin perder tiempo buscando contexto.

## Backend tocado

- `D:\portal\core\core-api`
- `D:\portal\vacantes\vacantes-api`

## Archivos que debe revisar primero

1. `D:\portal\core\core-api\src\modules\auth\http\handlers.rs`
2. `D:\portal\vacantes\vacantes-api\src\config\mod.rs`
3. `D:\portal\vacantes\vacantes-api\src\shared\seguridad\mailer.rs`
4. `D:\portal\vacantes\vacantes-api\src\main.rs`

## Que debe validar

### `core-api`

1. `POST /api/auth/login` no debe autenticar.
2. Debe devolver error instructivo y no filtrar nombre de base.
3. `POST /api/auth/refresh` debe funcionar cuando exista `portal_refresh`.
4. El cambio no debe romper `logout`, `me` ni login empleado real.

### `vacantes-api`

1. El reset de contraseña no debe usar una URL quemada.
2. Si SMTP esta mal configurado, no debe haber `panic`.
3. La API debe responder error controlado.
4. `security_warnings()` debe alertar configuracion de reset insegura.

## Comandos de compilacion

```powershell
cd D:\portal\core\core-api
cargo check --target-dir D:\Users\gustavo.lira\.codex\memories\core-api-target
```

```powershell
cd D:\portal\vacantes\vacantes-api
cargo check --target-dir D:\Users\gustavo.lira\.codex\memories\vacantes-api-target
```

## Smoke recomendado

Script:

- `D:\portal\scripts\smoke_portal_vacantes.ps1`

Lectura basica:

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

## Pruebas manuales puntuales

### Prueba A - login base del portal

Esperado:

- status `400`
- `ok=false`
- mensaje indicando usar `/api/auth/login/empleado`

### Prueba B - refresh portal

Esperado:

- si existe sesion valida con cookie `portal_refresh`, `refresh` debe devolver `200`
- no debe depender unicamente de `portal_sid`

### Prueba C - reset candidato con base URL configurada

Preparacion:

```env
CANDIDATE_PASSWORD_RESET_BASE_URL=http://localhost:5173
```

Esperado:

- el link armado apunte a `/reset-password?token=...`
- no use `localhost:3000`

### Prueba D - reset candidato con SMTP roto

Preparacion:

- dejar `SMTP_HOST` vacio o invalido

Esperado:

- sin `panic`
- respuesta HTTP controlada
- log de error de inicializacion del mailer

## Criterio de aprobacion

Gemini puede dar por bueno este hardening si:

1. ambos `cargo check` pasan
2. el login base del portal ya no es engañoso
3. el refresh usa la cookie correcta primero
4. el reset de candidato ya no depende de URL quemada
5. SMTP malo no derriba el proceso
