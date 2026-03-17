# Cambios Backend

## `core-api`

Archivo:

- `D:\portal\core\core-api\src\modules\auth\http\handlers.rs`

### Cambio 1

El endpoint base `POST /api/auth/login` ya no responde como si autenticara correctamente.

Antes:

- devolvia `ok: true`
- exponia informacion interna de base de datos

Ahora:

- devuelve `400`
- indica usar `POST /api/auth/login/empleado`

Motivo:

- evitar clientes mal configurados
- quitar una respuesta engañosa
- reducir exposicion innecesaria

### Cambio 2

El endpoint `POST /api/auth/refresh` ahora intenta resolver la sesion con este orden:

1. `portal_refresh`
2. `portal_sid`

Motivo:

- acercar el comportamiento al refresh real
- mantener compatibilidad con el esquema actual
- evitar que falle el refresh solo porque expiró la cookie corta

### Nota

Todavia no existe separacion completa entre token de acceso y token de refresh. Este cambio solo endurece el modelo actual sin romperlo.

## `vacantes-api`

Archivos:

- `D:\portal\vacantes\vacantes-api\src\config\mod.rs`
- `D:\portal\vacantes\vacantes-api\src\shared\seguridad\mailer.rs`
- `D:\portal\vacantes\vacantes-api\src\main.rs`

### Cambio 1

`Mailer::new` ahora devuelve `Result<Mailer, String>`.

Antes:

- usaba `unwrap()` en la configuracion SMTP
- podia tirar `panic` si el relay o TLS estaban mal configurados

Ahora:

- valida `SMTP_HOST`
- valida `SMTP_FROM`
- devuelve error controlado si la configuracion no sirve

### Cambio 2

Se agrego la variable:

```env
CANDIDATE_PASSWORD_RESET_BASE_URL
```

Se usa para construir el link de reset de candidato:

```text
{base}/reset-password?token=...
```

Antes:

- la URL quedaba quemada a `http://localhost:3000`

Ahora:

- la URL sale de configuracion
- se normaliza quitando `/` final
- se avisa en `security_warnings()` si sigue apuntando a localhost en host no local

### Cambio 3

El flujo de reset de contraseña de candidato ya no falla con `panic` al inicializar el mailer.

Ahora:

- el backend registra error controlado
- responde `500` con mensaje manejable
- mantiene el flujo HTTP estable

## Validacion realizada

Se ejecutó:

```powershell
cd D:\portal\core\core-api
cargo check --target-dir D:\Users\gustavo.lira\.codex\memories\core-api-target
```

```powershell
cd D:\portal\vacantes\vacantes-api
cargo check --target-dir D:\Users\gustavo.lira\.codex\memories\vacantes-api-target
```

Resultado:

- ambos compilan sin error
