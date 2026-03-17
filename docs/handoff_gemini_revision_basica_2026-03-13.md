# Handoff Gemini - Revision Basica Portal + Vacantes

## Objetivo

Este documento es para que Gemini ayude a revisar, probar y continuar el proyecto en el alcance basico actual.

No trabajar produccion.
No trabajar IA.
El alcance actual es:

- portal central de login de empleado
- sesion portal
- vacantes publicas
- candidato externo con registro/login
- postulacion interna y externa
- RH
- carga segura de CV

## Estado real al 13 de marzo de 2026

- `core-api` arranca bien
- `vacantes-api` arranca bien
- `portal-web` compila
- `vacantes-web` compila
- el smoke backend ya pasa en modo lectura
- los `panic` de `axum 0.8` por rutas ya fueron corregidos
- la interfaz visible ya fue simplificada para basico y se ocultaron superficies de IA

Archivos clave actualizados recientemente:

- `D:\portal\core\core-api\src\main.rs`
- `D:\portal\core\core-api\src\modules\observabilidad\http\handlers.rs`
- `D:\portal\vacantes\vacantes-api\src\main.rs`
- `D:\portal\vacantes\vacantes-api\src\config\mod.rs`
- `D:\portal\vacantes\vacantes-api\src\modules\observabilidad\http\handlers.rs`
- `D:\portal\vacantes\vacantes-web\src\modules\candidato\pages\MiCvPage.tsx`
- `D:\portal\vacantes\vacantes-web\src\modules\rh\pages\RhCandidatoDetallePage.tsx`
- `D:\portal\scripts\smoke_portal_vacantes.ps1`
- `D:\portal\docs\runbook_smoke_backend.md`

## Usuario de prueba actual

### Empleado portal

Usuario base documentado:

- usuario: `empleado.portal`
- clave: `Portal123!`

Esto depende de que ya se hayan ejecutado estos SQL en `PortalCore`:

- `D:\portal\core\sql-core\06_seed_usuario_base.sql`
- `D:\portal\core\sql-core\12_fix_hash_usuario_base.sql`

Si `empleado.portal` no funciona, Gemini debe revisar primero si esos 2 scripts ya fueron ejecutados en `PortalCore`.

### Candidato externo

No existe un candidato base fijo en el codigo.
La prueba correcta es registrar uno desde:

- `http://localhost:5174/registro`

o usar el smoke con:

- `-CandidateEmail`
- `-CandidatePassword`
- `-AllowWriteOperations`

## Como levantar el sistema en desarrollo

Importante:

- los backends Rust ya leen `.env` automaticamente con `dotenvy`
- basta ejecutar `cargo run` desde la carpeta correcta

### Terminal 1 - core-api

```powershell
cd D:\portal\core\core-api
cargo run --target-dir D:\Users\gustavo.lira\.codex\memories\cargo-target\core-api
```

Debe quedar en:

- `http://127.0.0.1:8080`

### Terminal 2 - vacantes-api

```powershell
cd D:\portal\vacantes\vacantes-api
cargo run --target-dir D:\Users\gustavo.lira\.codex\memories\cargo-target\vacantes-api
```

### Script rapido de arranque

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File D:\portal\scripts\run_dev_basico.ps1
```

### Script rapido de parada

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File D:\portal\scripts\stop_dev.ps1
```

Debe quedar en:

- `http://127.0.0.1:8081`

### Terminal 3 - portal-web

```powershell
cd D:\portal\core\portal-web
npm install
npm run dev
```

Abre:

- `http://localhost:5173/login-empleado`

### Terminal 4 - vacantes-web

```powershell
cd D:\portal\vacantes\vacantes-web
npm install
npm run dev
```

Abre:

- `http://localhost:5174/`

## Como probar manualmente

### Prueba 1 - portal empleado

1. Abrir `http://localhost:5173/login-empleado`
2. Entrar con:
   - usuario `empleado.portal`
   - clave `Portal123!`
3. Confirmar acceso a:
   - `/portal`
   - `/portal/perfil`

### Prueba 2 - vacantes publico

1. Abrir `http://localhost:5174/`
2. Revisar listado publico
3. Si no salen vacantes, no es necesariamente error de codigo: puede significar que `PortalVacantes` aun no tiene vacantes publicas cargadas

### Prueba 3 - candidato externo

1. Abrir `http://localhost:5174/registro`
2. Registrar un candidato nuevo
3. Entrar por `http://localhost:5174/login`
4. Probar:
   - `/app/vacantes/perfil`
   - `/app/vacantes/cv`
   - `/app/vacantes/mis-postulaciones`

### Prueba 4 - RH

1. Entrar primero al portal con `empleado.portal`
2. Luego abrir `http://localhost:5174/login-empleado`
3. Validar acceso RH a:
   - `/app/vacantes/rh/dashboard`
   - `/app/vacantes/rh/vacantes`
   - `/app/vacantes/rh/postulaciones`

Nota:

- el usuario base `empleado.portal` recibe `RH_VACANTES` en `06_seed_usuario_base.sql` para la app `vacantes`
- por eso sirve como usuario inicial de prueba para RH

## Como correr smoke automatico

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

Con escritura y candidato:

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

## Resultado esperado hoy

- health de ambos servicios responde `200`
- headers de seguridad responden
- el smoke lectura pasa
- puede no haber vacantes publicas cargadas todavia y eso en desarrollo es valido
- el login de empleado depende del seed base en `PortalCore`
- el candidato externo se crea desde el flujo publico

## Si algo falla

### Si falla login de empleado

Revisar:

- `D:\portal\core\sql-core\06_seed_usuario_base.sql`
- `D:\portal\core\sql-core\12_fix_hash_usuario_base.sql`
- que el usuario exista en `PortalCore.dbo.CuentaPortal`

Consulta util:

```sql
SELECT IdCuentaPortal, Usuario, CorreoLogin, Activo, Bloqueado
FROM dbo.CuentaPortal
WHERE Usuario = 'empleado.portal';
```

### Si no aparecen vacantes publicas

No asumir error del backend.
Primero revisar si hay datos publicos en `PortalVacantes`.

### Si falla vacantes-web en login-empleado

Recordar:

- `vacantes-web` redirige al portal central
- `portal-web` debe estar arriba en `http://localhost:5173`

## Lo que Gemini no debe cambiar ahora

- nada de produccion
- nada de Ubuntu VPS
- nada de TLS/Nginx
- nada de IA

El trabajo actual debe quedarse en funcionalidad basica de desarrollo.
