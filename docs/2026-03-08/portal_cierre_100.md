# Cierre Portal 100

## Estado de codigo

- `core-api` ya usa `SesionPortal` real con cookies HTTP.
- `login-empleado` crea sesion real en SQL y limpia cookies si falla.
- `refresh`, `logout`, `me`, `session-state` y `session/me` ya resuelven sesion por cookie.
- `portal-web` ya protege `/portal` y `/portal/perfil`.
- el usuario base `empleado.portal` ya no depende de `hash-demo-pendiente`; el codigo acepta `sha256$...`.

## Archivo SQL pendiente de aplicar

- `D:\portal\core\sql-core\12_fix_hash_usuario_base.sql`

Objetivo:
- actualizar la base ya creada `PortalCore` para que `empleado.portal` use el hash real de `Portal123!`.

## Validacion recomendada

1. aplicar `12_fix_hash_usuario_base.sql`
2. levantar `core-api`
3. levantar `portal-web`
4. probar:
   - `POST /api/auth/login-empleado`
   - `GET /api/auth/session-state`
   - `GET /api/auth/me`
   - `POST /api/auth/refresh`
   - `POST /api/auth/logout`
   - `POST /api/auth/logout-all`

## Credencial base actual

- usuario: `empleado.portal`
- clave: `Portal123!`
