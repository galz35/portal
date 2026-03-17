# Portal

## Vision

Ser la puerta unica de acceso al ecosistema interno de Claro Nicaragua, con autenticacion central, sesion global, control de aplicaciones y experiencia simple para empleado, RH y futuros sistemas corporativos.

## Mision

Unificar login, sesion, permisos y salida global para que aplicaciones como Vacantes y Planer no dupliquen autenticacion, reduzcan friccion operativa y compartan una base comun de identidad.

## Alcance funcional

- login central
- login empleado
- sesion global
- refresh
- logout
- logout-all
- `/me`
- `/session-state`
- `/session/me`
- selector de aplicaciones
- perfil base
- base de permisos por app

## Estructura tecnica

### Backend

- `D:\portal\core\core-api\src\main.rs`
- `D:\portal\core\core-api\src\app_state.rs`
- `D:\portal\core\core-api\src\config\mod.rs`
- `D:\portal\core\core-api\src\db.rs`
- `D:\portal\core\core-api\src\sql_read_repository.rs`
- `D:\portal\core\core-api\src\modules\auth\...`
- `D:\portal\core\core-api\src\modules\sesiones\...`
- `D:\portal\core\core-api\src\shared\seguridad\cookies.rs`

### Frontend

- `D:\portal\core\portal-web\src\App.tsx`
- `D:\portal\core\portal-web\src\app\router.tsx`
- `D:\portal\core\portal-web\src\modules\auth\pages\...`
- `D:\portal\core\portal-web\src\modules\portal\pages\...`
- `D:\portal\core\portal-web\src\shared\api\coreApi.ts`
- `D:\portal\core\portal-web\src\shared\security\authSession.ts`
- `D:\portal\core\portal-web\src\shared\guards\...`

### SQL

- `D:\portal\core\sql-core\01_tablas_core.sql`
- `D:\portal\core\sql-core\04_sp_seguridad.sql`
- `D:\portal\core\sql-core\06_tablas_sesion_global.sql`
- `D:\portal\core\sql-core\08_sp_sesion_global.sql`
- `D:\portal\core\sql-core\06_seed_usuario_base.sql`
- `D:\portal\core\sql-core\12_fix_hash_usuario_base.sql`

## Estado actual

- backend ya resuelve sesion por cookie y `SesionPortal`
- login ya no depende de exito falso
- refresh, logout, me y session-state ya usan sesion real
- frontend ya protege dashboard y perfil
- hay usuario base `empleado.portal`

## Credencial base definida

- usuario: `empleado.portal`
- clave: `Portal123!`

## Falta real para cierre operativo

- aplicar `12_fix_hash_usuario_base.sql` en la base ya existente
- levantar `core-api`
- levantar `portal-web`
- probar flujo completo en ambiente

## Estado recomendado

- codigo: practicamente cerrado
- operativo: pendiente de prueba final
