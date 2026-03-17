# Handoff Backend - 2026-03-14

## Objetivo

Esta carpeta resume el hardening aplicado hoy sobre:

- `D:\portal\core\core-api`
- `D:\portal\vacantes\vacantes-api`

El foco fue mejorar seguridad y robustez sin romper el frontend actual.

## Contenido

- `01_CAMBIOS_BACKEND.md`
- `02_GUIA_GEMINI_REVISION_Y_TEST.md`
- `03_ENV_SQL_Y_NOTAS.md`
- `04_SIGUIENTE_FASE_SSO.md`
- `05_SSO_FASE_2_IMPLEMENTADA.md`
- `06_MANUAL_REPARACION_BACKEND_SSO.md`
- `07_CIERRE_TECNICO_Y_ESTABILIZACION.md`
- `08_MANUAL_USUARIO_SISTEMAS_CLARO.md`

## Estado actual

- `core-api` compila
- `vacantes-api` compila
- `vacantes-api` ya no depende de `PortalCore` por SQL directo
- si se requiere SQL nuevo para esta fase
- el flujo del frontend se mantiene

## Resumen corto

Se hicieron cuatro ajustes principales:

1. `core-api` expone introspeccion interna y endpoints internos para perfil/nombres de empleado.
2. `core-api` rota `portal_refresh` de forma atomica por uso.
3. `vacantes-api` valida sesion, permisos y enriquecimiento RH por HTTP contra `core-api`.
4. `vacantes-api` ya no necesita `CORE_MSSQL_DATABASE` ni `core_sql`.

## Documento relacionado

Existe un resumen corto adicional en:

- `D:\portal\docs\2026-03-14_hardening_portal_vacantes.md`
- `D:\portal\docs\2026-03-14\05_SSO_FASE_2_IMPLEMENTADA.md`
