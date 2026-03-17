# Apendice - Tablas y stored procedures

## 1. Tablas actuales PortalCore

- `Persona`
- `CuentaPortal`
- `AplicacionSistema`
- `RolSistema`
- `PermisoSistema`
- `RolPermiso`
- `UsuarioAplicacion`
- `UsuarioRolAplicacion`
- `RefreshToken`
- `AuditoriaAcceso`
- `Pais`
- `SesionPortal`
- `AccessTokenRevocado`
- `BloqueoCuenta`
- `IntentoLogin`
- `TokenCsrf`
- `EventoSeguridad`
- `MfaCuenta`
- `MfaDesafio`
- `MetricaNegocioDiaria`
- `IncidenteAplicacion`
- `DisponibilidadServicioDiaria`
- `IntegracionExternaMetrica`

## 2. Tablas nuevas recomendadas PortalCore

- `Empresa`
- `UnidadOrganizativa`
- `UsuarioScopePais`
- `UsuarioScopeEmpresa`
- `UsuarioScopeOrg`
- `SesionPortalDispositivo`
- `CuentaPortalPasswordHistorial`
- `EmpleadoSnapshot`
- `EmpleadoSnapshotSyncLog`
- `ApiClientInterno`

## 3. Tablas actuales PortalVacantes

- `Vacante`
- `VacanteEstadoHistorial`
- `Postulacion`
- `PostulacionEstadoHistorial`
- `ArchivoPersona`
- `AnalisisCvIa`
- `Terna`
- `TernaDetalle`
- `ListaNegra`
- `Notificacion`
- `CatalogoTipoVacante`
- `CatalogoModalidad`
- `CatalogoMotivoRechazo`
- `CatalogoFuentePostulacion`
- `CvTextoExtraido`
- `PerfilCvNormalizado`
- `AnalisisCvIaAuditoria`
- `DescriptorPuesto`
- `RequisicionPersonal`
- `RequisicionAprobacion`
- `RequisicionHistorial`
- `RequisicionAdjunto`
- `VacanteRegularizacionHistorial`

## 4. Tablas nuevas recomendadas PortalVacantes

- `Candidato`
- `CuentaCandidato`
- `CandidatoSesion`
- `CandidatoVerificacionCorreo`
- `CandidatoPasswordReset`
- `CandidatoPreferencia`
- `TrabajoIA`
- `TrabajoIAIntento`
- `CostoIA`
- `PromptPlantillaIA`
- `ProveedorIAEstado`

## 5. SP actuales PortalCore

- `spSeg_Login`
- `spSeg_UsuarioApps`
- `spSeg_UsuarioPermisos`
- `spSeg_Me`
- `spSeg_Refresh_Insertar`
- `spSeg_Refresh_Obtener`
- `spSeg_Refresh_Revocar`
- `spSeg_Auditoria_Insertar`
- `spEmp_ValidarActivo`
- `spSeg_Sesion_Crear`
- `spSeg_Sesion_ActualizarActividad`
- `spSeg_Sesion_ObtenerActiva`
- `spSeg_Sesion_Revocar`
- `spSeg_Sesion_RevocarTodas`
- `spSeg_AccessToken_Revocar`
- `spSeg_AccessToken_EstaRevocado`
- `spSeg_Sesion_Me`
- `spSeg_IntentoLogin_Registrar`
- `spSeg_IntentoLogin_ContarVentana`
- `spSeg_BloqueoCuenta_Activar`
- `spSeg_BloqueoCuenta_Validar`
- `spSeg_Csrf_Crear`
- `spSeg_Csrf_Validar`
- `spSeg_EventoSeguridad_Registrar`
- `spSeg_Mfa_ObtenerEstado`
- `spSeg_Mfa_Desafio_Crear`
- `spSeg_Mfa_Desafio_Consumir`
- `spObs_RegistrarMetricaNegocio`
- `spObs_RegistrarIncidenteAplicacion`
- `spObs_RegistrarDisponibilidadServicio`
- `spObs_RegistrarIntegracionExterna`
- `spObs_ObtenerMetricasDashboard`
- `spObs_ObtenerIncidentesAbiertos`

## 6. SP nuevos recomendados PortalCore

- `spSeg_LoginEmpleado`
- `spSeg_Sesion_ValidarPorSidHash`
- `spSeg_Sesion_ListarActivasPorCuenta`
- `spSeg_Sesion_CerrarActual`
- `spSeg_ScopePais_Listar`
- `spSeg_ScopeEmpresa_Listar`
- `spSeg_ScopeOrg_Listar`
- `spEmp_Snapshot_Sync`
- `spEmp_Snapshot_ObtenerPorCuenta`
- `spApp_Registrar`
- `spApp_Actualizar`
- `spApp_Desactivar`
- `spApp_AsignarUsuario`
- `spApp_QuitarUsuario`

## 7. SP actuales Vacantes

- `spVac_Listar_Publicas`
- `spVac_Obtener_Detalle`
- `spVac_Insertar`
- `spVac_Actualizar`
- `spVac_CambiarEstado`
- `spVac_Listar_RH`
- `spPost_Postular`
- `spPost_ListarPorPersona`
- `spPost_ListarPorVacante`
- `spPost_ObtenerDetalle`
- `spPost_CambiarEstado`
- `spPost_GuardarScoreIA`
- `spPost_GuardarScoreRH`
- `spPost_GuardarScoreJefe`
- `spTerna_Crear`
- `spTerna_AgregarDetalle`
- `spTerna_ListarPorVacante`
- `spTerna_Cerrar`
- `spListaNegra_Insertar`
- `spListaNegra_ConsultarPersona`
- `spListaNegra_Revocar`
- `spRep_VacantesResumen`
- `spRep_PostulacionesResumen`
- `spRep_TiemposProceso`
- `spRep_InternosVsExternos`
- `spRep_PostulacionesPorPais`
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
- `spReq_Crear`
- `spReq_EnviarAprobacion`
- `spReq_AprobarEtapa`
- `spReq_Rechazar`
- `spReq_ListarPendientesAprobacion`
- `spDesc_Crear`
- `spDesc_ObtenerVigente`
- `spVac_SuspenderPorRequisicionVencida`

## 8. SP nuevos recomendados Vacantes

- `spVac_Buscar_Publicas`
- `spVac_Publicar`
- `spVac_Pausar`
- `spVac_Cerrar`
- `spVac_MarcarOcupada`
- `spCand_RegistrarCuenta`
- `spCand_VerificarCorreo`
- `spCand_Login`
- `spCand_Sesion_Crear`
- `spCand_Sesion_Validar`
- `spCand_Sesion_Cerrar`
- `spCand_Perfil_Obtener`
- `spCand_Perfil_Actualizar`
- `spCand_PasswordReset_Solicitar`
- `spCand_PasswordReset_Consumir`
- `spPost_RetirarPorCandidato`
- `spPost_ValidarElegibilidad`
- `spReq_ObtenerDetalle`
- `spReq_AsociarVacante`
- `spDesc_Listar`
- `spIA_CrearTrabajoAnalisis`
- `spIA_MarcarTrabajoFallo`
- `spIA_RegistrarCosto`

## 9. Regla central

Toda mutacion sensible debe cumplir:

- identidad resuelta en backend
- autorizacion real
- auditoria
- validacion de datos
- si aplica, transaccion SQL con `XACT_ABORT ON`

