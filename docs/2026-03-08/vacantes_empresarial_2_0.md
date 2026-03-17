# Vacantes Empresarial 2.0

## Objetivo
Extender Vacantes desde un ATS basico a un flujo empresarial donde la necesidad de contratacion nace en una requisicion del area, se vincula a un descriptor de puesto y puede llegar a publicacion con o sin excepcion controlada.

## Conceptos base
- `RequisicionPersonal`: solicitud formal del area para cubrir una plaza.
- `DescriptorPuesto`: version vigente del puesto asociado a `IdPuesto` de HCM Oracle Cloud.
- `Vacante`: pieza reclutable que puede publicarse cuando RH lo decide.
- `Excepcion`: RH puede abrir/publicar una vacante aunque la requisicion no este cerrada, pero con fecha limite de regularizacion.

## Flujo recomendado
1. El area crea la requisicion.
2. El jefe aprueba o rechaza.
3. Reclutamiento revisa.
4. Compensacion revisa.
5. RH decide si publica, pausa o mantiene interna la vacante.
6. Si la vacante fue abierta con excepcion y no se regulariza, se suspende automaticamente.

## Estados
### Requisicion
- `BORRADOR`
- `PENDIENTE_JEFE`
- `PENDIENTE_RECLUTAMIENTO`
- `PENDIENTE_COMPENSACION`
- `APROBADA`
- `RECHAZADA`
- `VENCIDA`
- `CANCELADA`
- `REGULARIZADA_POR_EXCEPCION`

### Vacante
- `BORRADOR`
- `PUBLICADA`
- `PUBLICADA_CON_EXCEPCION`
- `PAUSADA`
- `SUSPENDIDA_REQUISICION`
- `CERRADA`
- `OCUPADA`

## SQL agregado
- [12_tablas_requisicion_descriptor.sql](/D:/portal/vacantes/sql-vacantes/12_tablas_requisicion_descriptor.sql)
- [13_indices_requisicion_descriptor.sql](/D:/portal/vacantes/sql-vacantes/13_indices_requisicion_descriptor.sql)
- [14_sp_requisicion_descriptor.sql](/D:/portal/vacantes/sql-vacantes/14_sp_requisicion_descriptor.sql)
- [15_sp_suspension_automatica.sql](/D:/portal/vacantes/sql-vacantes/15_sp_suspension_automatica.sql)

## API agregado en este bloque
- `GET /api/vacantes/rh/dashboard`
- `GET /api/vacantes/rh/requisiciones`
- `POST /api/vacantes/rh/requisiciones`
- `GET /api/vacantes/rh/requisiciones/pendientes`
- `POST /api/vacantes/rh/requisiciones/:id/aprobar`
- `POST /api/vacantes/rh/requisiciones/:id/rechazar`
- `GET /api/vacantes/rh/descriptores`
- `POST /api/vacantes/rh/descriptores`
- `GET /api/vacantes/rh/descriptores/:id_puesto/vigente`

## UI agregada en este bloque
- [RhDashboardPage.tsx](/D:/portal/vacantes/vacantes-web/src/modules/rh/pages/RhDashboardPage.tsx)
- [RhVacantesPage.tsx](/D:/portal/vacantes/vacantes-web/src/modules/rh/pages/RhVacantesPage.tsx)
- [RhRequisicionesPage.tsx](/D:/portal/vacantes/vacantes-web/src/modules/rh/pages/RhRequisicionesPage.tsx)
- [RhDescriptoresPage.tsx](/D:/portal/vacantes/vacantes-web/src/modules/rh/pages/RhDescriptoresPage.tsx)

## Falta para base funcional real
- conectar `vacantes-api` con `PortalCore` y SPs de Vacantes.
- persistir requisiciones, aprobaciones y descriptores.
- ejecutar la suspension automatica por job.
- permitir crear vacante desde requisicion y vigencia de descriptor.
- reportes reales por area, tiempo y excepcion.
- despues integrar seguimiento post contratacion.
