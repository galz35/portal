# Vacantes

## Vision

Ser la plataforma corporativa de reclutamiento de Claro Nicaragua para administrar requisiciones, descriptores de puesto, vacantes, postulaciones, RH, terna, blacklist y futuras extensiones como seguimiento post contratacion.

## Mision

Digitalizar el flujo real del negocio de atraccion de talento, reemplazando correos y procesos dispersos por un sistema conectado al Portal, con trazabilidad, aprobaciones, publicacion controlada y operacion RH.

## Alcance funcional actual

- vacantes publicas
- detalle de vacante
- postulacion
- mis postulaciones
- dashboard RH
- vacantes RH
- cambio de estado de vacante
- requisiciones RH
- aprobacion y rechazo de requisicion
- descriptores de puesto
- descriptor vigente por `IdPuesto`
- postulaciones RH
- cambio de estado de postulacion
- reportes RH
- terna
- lista negra

## Vision empresarial 2.0

Vacantes no debe ser solo una bolsa de empleo. Debe operar como sistema empresarial con:

- requisicion del area
- descriptor del puesto
- aprobaciones por jefe, reclutamiento y compensacion
- vacante con o sin excepcion
- publicacion controlada por RH
- suspension automatica por falta de regularizacion
- trazabilidad y reportes

## Estructura tecnica

### Backend

- `D:\portal\vacantes\vacantes-api\src\main.rs`
- `D:\portal\vacantes\vacantes-api\src\app_state.rs`
- `D:\portal\vacantes\vacantes-api\src\config\mod.rs`
- `D:\portal\vacantes\vacantes-api\src\db.rs`
- `D:\portal\vacantes\vacantes-api\src\sql_read_repository.rs`
- `D:\portal\vacantes\vacantes-api\src\sql_write_repository.rs`

### Frontend

- `D:\portal\vacantes\vacantes-web\src\app\router.tsx`
- `D:\portal\vacantes\vacantes-web\src\modules\publico\...`
- `D:\portal\vacantes\vacantes-web\src\modules\candidato\...`
- `D:\portal\vacantes\vacantes-web\src\modules\rh\...`
- `D:\portal\vacantes\vacantes-web\src\shared\api\vacantesApi.ts`
- `D:\portal\vacantes\vacantes-web\src\shared\api\coreSessionApi.ts`

### SQL

- `D:\portal\vacantes\sql-vacantes\00_crear_portal_vacantes.sql`
- `D:\portal\vacantes\sql-vacantes\00_bootstrap_portal_vacantes.sql`
- `D:\portal\vacantes\sql-vacantes\01_tablas_vacantes.sql`
- `D:\portal\vacantes\sql-vacantes\05_sp_postulaciones.sql`
- `D:\portal\vacantes\sql-vacantes\06_sp_terna.sql`
- `D:\portal\vacantes\sql-vacantes\07_sp_lista_negra.sql`
- `D:\portal\vacantes\sql-vacantes\12_tablas_requisicion_descriptor.sql`
- `D:\portal\vacantes\sql-vacantes\14_sp_requisicion_descriptor.sql`

## Base separada

- base: `PortalVacantes`
- creada aparte para desacoplar reclutamiento de `PortalCore`

## Estado actual

- lectura SQL real en vacantes publicas, RH, reportes, requisiciones, descriptores y postulaciones
- escritura SQL real en vacantes, requisiciones, estados, postulacion, terna y lista negra
- frontend RH ya opera formularios y acciones principales
- frontend publico y candidato ya consume parte del flujo real

## Faltante real para cierre operativo

- levantar `vacantes-api`
- levantar `vacantes-web`
- validar extremo a extremo contra `PortalVacantes`
- revisar datos reales de personas/usuarios para postulacion y RH
- probar todos los SP existentes con data operativa

## Estado recomendado

- codigo: muy cercano al cierre
- operativo: pendiente de pruebas reales y afinacion final
