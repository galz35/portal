# Fase 4 - Vacantes RH y aprobaciones internas

## Objetivo

Completar el circuito interno de vacantes usando la sesion central del portal.

## Resultado esperado

- RH entra con login corporativo
- crea y gestiona vacantes
- gestiona requisiciones y aprobaciones
- mueve postulaciones
- crea terna
- gestiona lista negra
- ve reportes segun permisos y alcance

## Base de datos

### Tablas usadas

- `Vacante`
- `VacanteEstadoHistorial`
- `Postulacion`
- `PostulacionEstadoHistorial`
- `DescriptorPuesto`
- `RequisicionPersonal`
- `RequisicionAprobacion`
- `RequisicionHistorial`
- `Terna`
- `TernaDetalle`
- `ListaNegra`
- `VacanteRegularizacionHistorial`

### Reglas

- los IDs de usuario interno quedan como referencia logica a `IdCuentaPortal`
- no usar FK cross-database; validar desde aplicacion y SP

## Stored procedures

### Vacantes

- `spVac_Insertar`
- `spVac_Actualizar`
- `spVac_CambiarEstado`
- `spVac_Listar_RH`
- `spVac_Publicar`
- `spVac_Pausar`
- `spVac_Cerrar`
- `spVac_MarcarOcupada`

### Requisiciones

- `spReq_Crear`
- `spReq_EnviarAprobacion`
- `spReq_AprobarEtapa`
- `spReq_Rechazar`
- `spReq_ListarPendientesAprobacion`
- `spReq_ObtenerDetalle`
- `spReq_AsociarVacante`

### Descriptores

- `spDesc_Crear`
- `spDesc_ObtenerVigente`
- `spDesc_Listar`

### Postulaciones

- `spPost_ListarPorVacante`
- `spPost_ObtenerDetalle`
- `spPost_CambiarEstado`
- `spPost_GuardarScoreRH`
- `spPost_GuardarScoreJefe`

### Terna y lista negra

- `spTerna_Crear`
- `spTerna_AgregarDetalle`
- `spTerna_ListarPorVacante`
- `spTerna_Cerrar`
- `spListaNegra_Insertar`
- `spListaNegra_ConsultarPersona`
- `spListaNegra_Revocar`

## Backend

- `vacantes-api` valida la sesion central en backend
- cualquier accion RH resuelve `IdCuentaPortal` desde sesion, no desde el body
- aplicar permisos por modulo:
  - crear vacante
  - mover estado
  - aprobar requisicion
  - lista negra
  - reportes

## Frontend

- dashboard RH
- gestion de vacantes
- requisiciones
- pendientes de aprobacion
- descriptores
- postulaciones
- terna
- lista negra
- reportes

## Seguridad

- toda mutacion lleva `X-CSRF-Token`
- auditoria obligatoria de cambios de estado
- validacion de scopes por pais y org si aplica

## Pruebas

- empleado sin permiso RH no entra
- empleado RH con permiso parcial entra solo a sus funciones
- aprobacion por etapa
- rechazo con comentario
- publicacion de vacante con y sin requisitos completos
- regularizacion de vacante excepcional

## Criterio de salida

- RH y aprobadores pueden operar Vacantes internamente usando Portal como llave
- no existe bypass serio desde frontend

