# Fase 5 - IA CV, observabilidad y automatizacion

## Objetivo

Hacer que la capa IA y la capa operativa sean confiables, trazables y sostenibles.

## Resultado esperado

- el analisis IA de CV no bloquea la UX
- hay costos, errores y tiempos medidos
- existe trazabilidad completa de decisiones asistidas por IA
- el equipo puede operar incidentes con evidencia

## Base de datos

### Tablas actuales a consolidar

- `ArchivoPersona`
- `CvTextoExtraido`
- `AnalisisCvIa`
- `PerfilCvNormalizado`
- `AnalisisCvIaAuditoria`
- `MetricaNegocioDiaria`
- `IncidenteAplicacion`
- `DisponibilidadServicioDiaria`
- `IntegracionExternaMetrica`

### Tablas nuevas recomendadas

- `TrabajoIA`
- `TrabajoIAIntento`
- `CostoIA`
- `PromptPlantillaIA`
- `ProveedorIAEstado`

## Stored procedures

### IA

- `spCv_RegistrarArchivo`
- `spCv_GuardarTextoExtraido`
- `spCv_ObtenerCvPrincipalPorPersona`
- `spCv_ListarArchivosPersona`
- `spIA_GuardarAnalisisCv`
- `spIA_MarcarAnalisisAnteriorNoVigente`
- `spIA_ObtenerAnalisisVigentePorPersona`
- `spIA_ObtenerAnalisisPorPersonaVacante`
- `spIA_GuardarPerfilNormalizado`
- `spIA_RegistrarAuditoriaAnalisis`
- `spIA_CrearTrabajoAnalisis`
- `spIA_MarcarTrabajoFallo`
- `spIA_RegistrarCosto`

### Observabilidad

- `spObs_RegistrarMetricaNegocio`
- `spObs_RegistrarIncidenteAplicacion`
- `spObs_RegistrarDisponibilidadServicio`
- `spObs_RegistrarIntegracionExterna`
- `spObs_ObtenerMetricasDashboard`
- `spObs_ObtenerIncidentesAbiertos`

## Backend

- ejecutar IA en cola o worker, no inline en request critico si el tiempo es alto
- versionar prompts
- registrar proveedor, modelo, latencia, tokens o costo equivalente
- soportar reproceso manual
- permitir fallback manual si proveedor IA falla

## Frontend

- historial de analisis
- estado de procesamiento
- reproceso manual
- indicadores de confianza
- advertencias de uso asistido

## Seguridad y cumplimiento

- no tomar decisiones finales de rechazo solo por IA
- permitir override humano
- registrar quien acepto o desestimo sugerencia IA
- no exponer prompts sensibles ni respuestas completas al cliente si no hace falta

## Pruebas

- archivo correcto e incorrecto
- fallo de OCR
- fallo de proveedor IA
- reproceso
- auditoria de override humano
- dashboards con datos reales

## Criterio de salida

- IA y observabilidad pasan de demo a sistema operable

