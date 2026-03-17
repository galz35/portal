# Estado General al 2026-03-08

## Estado actual

- `PortalCore` ya existe en SQL Server con tablas base de core, vacantes, IA CV, sesion global, seguridad avanzada y observabilidad.
- `core-api`, `vacantes-api`, `portal-web`, `vacantes-web` y shell de `planer` existen en `D:\portal`, pero todavia estan en nivel scaffold.
- El sistema real de Planer que hoy funciona vive fuera de este workspace, en `D:\planificacion\v2sistema`.

## Decision operativa

1. Terminar primero Portal/Core real.
2. Dejar Vacantes en un minimo funcional real.
3. Preparar integracion SSO de Planer sin tocar su negocio interno.
4. Cuando Portal este estable, construir la API puente o la validacion central para Planer.

## Riesgo principal actual

- Todavia no existe implementacion extremo a extremo de login, refresh, logout, `/me`, apps visibles y sesion central.
- Vacantes existe como contrato y SQL, pero no como sistema funcional completo.
- Planer hoy sigue usando auth propia con JWT y `localStorage`.
