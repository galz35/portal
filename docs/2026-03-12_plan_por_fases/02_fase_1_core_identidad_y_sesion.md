# Fase 1 - Core de identidad y sesion

## Objetivo

Cerrar la autenticacion interna de empleados, la sesion central y el modelo base de permisos.

## Resultado esperado

Al terminar esta fase:

- un empleado puede iniciar sesion en `Portal`
- la sesion vive en backend y SQL Server
- `portal-web` consume identidad real
- `logout` y `logout-all` son reales
- la auditoria y seguridad dejan evidencia util

## Base de datos

### Tablas actuales base

- `CuentaPortal`
- `AplicacionSistema`
- `RolSistema`
- `PermisoSistema`
- `UsuarioAplicacion`
- `UsuarioRolAplicacion`
- `SesionPortal`
- `TokenCsrf`
- `MfaCuenta`
- `MfaDesafio`

### Tablas nuevas recomendadas

- `EmpleadoSnapshot`
- `EmpleadoSnapshotSyncLog`
- `UsuarioScopePais`
- `UsuarioScopeOrg`
- `SesionPortalDispositivo`
- `CuentaPortalPasswordHistorial`

## Stored procedures obligatorios

### Reutilizar o endurecer

- `spSeg_Login`
- `spSeg_UsuarioApps`
- `spSeg_UsuarioPermisos`
- `spSeg_Me`
- `spSeg_Sesion_Crear`
- `spSeg_Sesion_ActualizarActividad`
- `spSeg_Sesion_ObtenerActiva`
- `spSeg_Sesion_Revocar`
- `spSeg_Sesion_RevocarTodas`
- `spSeg_Csrf_Crear`
- `spSeg_Csrf_Validar`
- `spSeg_Mfa_ObtenerEstado`

### Crear o renombrar como capa final

- `spSeg_LoginEmpleado`
- `spSeg_Sesion_ValidarPorSidHash`
- `spSeg_Sesion_ListarActivasPorCuenta`
- `spSeg_Sesion_CerrarActual`
- `spSeg_ScopePais_Listar`
- `spSeg_ScopeOrg_Listar`
- `spEmp_Snapshot_Sync`
- `spEmp_Snapshot_ObtenerPorCuenta`

## Backend

### Core API

- reemplazar cookie con `IdSesionPortal` por token opaco aleatorio
- guardar solo hash del token de sesion
- implementar middleware auth reutilizable
- implementar CSRF real
- resolver `me`, `apps`, `session-state` sin fallback demo
- registrar auditoria de login, logout y fallos

### Reglas

- no usar `AppState` demo como fuente de verdad
- no devolver permisos desde datos en memoria si la DB falla
- la falla debe ser visible y operable

## Frontend

- login empleado limpio
- bootstrap de sesion
- modal de sesion expirada
- cierre de sesion actual y global

## Seguridad

- `HttpOnly`
- `Secure`
- `SameSite=Lax`
- `X-CSRF-Token` en mutaciones
- MFA opcional para perfiles privilegiados

## Pruebas

- login correcto
- login fallido
- bloqueo temporal por abuso
- logout
- logout-all
- expiracion de sesion
- CSRF valido e invalido

## Criterio de salida

- flujo interno de identidad listo para produccion controlada
- sin fallback demo en auth central

