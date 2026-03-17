# Siguiente Fase SSO

## Lo que ya esta mejor

- `core-api` se comporta mas como autoridad central real
- `vacantes-api` es mas robusto frente a configuracion SMTP mala
- el flujo actual del frontend no se rompio

## Lo que aun falta

### 1. Refresh real

Hoy:

- acceso y refresh siguen compartiendo la misma base de sesion

Siguiente paso:

- separar token de acceso y token de refresh
- rotar refresh de forma real

### 2. Contrato interno entre servicios

Hoy:

- `vacantes-api` sigue consultando `PortalCore` directamente para identidad interna

Siguiente paso:

- crear endpoint interno en `core-api` para introspeccion de sesion
- mover validacion de permisos a `core-api`

### 3. Mejor rendimiento RH

Hoy:

- hay puntos con patron N+1 para nombres y datos internos

Siguiente paso:

- agregar endpoint batch o consulta consolidada

## Regla de arquitectura

Debe mantenerse esta frontera:

- `core-api` = identidad, seguridad, apps, permisos, sesion
- `vacantes-api` = negocio de vacantes
- candidatos externos = solo `vacantes-api`
