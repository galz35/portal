use serde::Deserialize;
use tiberius::Row;

use crate::db_pool::SqlPool;

#[derive(Debug, Clone, Deserialize)]
pub struct CreateVacancyRequest {
    pub codigo_vacante: String,
    pub titulo: String,
    pub descripcion: String,
    pub requisitos: Option<String>,
    pub area: Option<String>,
    pub gerencia: Option<String>,
    pub departamento: Option<String>,
    pub tipo_vacante: String,
    pub modalidad: Option<String>,
    pub ubicacion: Option<String>,
    pub codigo_pais: String,
    pub nivel_experiencia: Option<String>,
    pub salario_min: Option<f64>,
    pub salario_max: Option<f64>,
    pub acepta_internos: bool,
    pub es_publica: bool,
    pub cantidad_plazas: i32,
    pub prioridad: Option<String>,
    pub id_solicitante: Option<i32>,
    pub id_responsable_rh: Option<i32>,
    pub id_requisicion_personal: Option<i64>,
    pub id_descriptor_puesto: Option<i32>,
    pub es_excepcion_sin_requisicion: bool,
    pub motivo_excepcion: Option<String>,
    pub fecha_limite_regularizacion: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct ChangeStateRequest {
    pub estado_nuevo: String,
    pub observacion: Option<String>,
    pub id_cuenta_portal: i32,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CreateRequisitionRequest {
    pub codigo_requisicion: String,
    pub id_puesto: i64,
    pub id_descriptor_puesto: Option<i32>,
    pub tipo_necesidad: String,
    pub justificacion: String,
    pub cantidad_plazas: i32,
    pub codigo_pais: String,
    pub gerencia: Option<String>,
    pub departamento: Option<String>,
    pub area: Option<String>,
    pub centro_costo: Option<String>,
    pub id_cuenta_portal_solicitante: i32,
    pub id_cuenta_portal_jefe_aprobador: Option<i32>,
    pub id_cuenta_portal_reclutamiento: Option<i32>,
    pub id_cuenta_portal_compensacion: Option<i32>,
    pub fecha_necesaria_cobertura: Option<String>,
    pub prioridad: Option<String>,
    pub permite_publicacion_sin_completar: bool,
    pub fecha_limite_regularizacion: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct RequisitionDecisionRequest {
    pub id_cuenta_portal: i32,
    pub etapa: Option<String>,
    pub comentario: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct ApplyRequest {
    pub id_vacante: i32,
    pub id_persona: i32,
    pub es_interna: bool,
    pub fuente_postulacion: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CreateTernaRequest {
    pub id_vacante: i32,
    pub id_cuenta_portal_creador: i32,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CreateBlacklistRequest {
    pub id_persona: i32,
    pub motivo: String,
    pub categoria: Option<String>,
    pub fecha_inicio: String,
    pub fecha_fin: Option<String>,
    pub permanente: bool,
    pub id_cuenta_portal_registro: i32,
}

#[derive(Debug, Clone, Deserialize)]
pub struct ChangePostulationStateRequest {
    pub estado_nuevo: String,
    pub observacion: Option<String>,
    pub id_cuenta_portal: i32,
    pub origen_postulacion: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CreateDescriptorRequest {
    pub id_puesto: i64,
    pub titulo_puesto: String,
    pub version_descriptor: String,
    pub objetivo_puesto: Option<String>,
    pub funciones_principales: Option<String>,
    pub funciones_secundarias: Option<String>,
    pub competencias_tecnicas: Option<String>,
    pub competencias_blandas: Option<String>,
    pub escolaridad: Option<String>,
    pub experiencia_minima: Option<String>,
    pub idiomas: Option<String>,
    pub certificaciones: Option<String>,
    pub jornada: Option<String>,
    pub modalidad: Option<String>,
    pub rango_salarial_referencial: Option<String>,
    pub reporta_a: Option<String>,
    pub indicadores_exito: Option<String>,
    pub fecha_vigencia_desde: String,
    pub fecha_vigencia_hasta: Option<String>,
}

pub async fn create_vacancy(
    pool: &SqlPool,
    request: &CreateVacancyRequest,
) -> Result<i32, String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    let slug = slugify(&request.titulo);

    let rows = client
        .query(
            "EXEC dbo.spVac_Insertar
                @CodigoVacante = @P1,
                @Slug = @P2,
                @Titulo = @P3,
                @Descripcion = @P4,
                @Requisitos = @P5,
                @Area = @P6,
                @Gerencia = @P7,
                @Departamento = @P8,
                @TipoVacante = @P9,
                @Modalidad = @P10,
                @Ubicacion = @P11,
                @CodigoPais = @P12,
                @NivelExperiencia = @P13,
                @SalarioMin = @P14,
                @SalarioMax = @P15,
                @AceptaInternos = @P16,
                @EsPublica = @P17,
                @CantidadPlazas = @P18,
                @Prioridad = @P19,
                @IdSolicitante = @P20,
                @IdResponsableRH = @P21",
            &[
                &request.codigo_vacante,
                &slug,
                &request.titulo,
                &request.descripcion,
                &request.requisitos,
                &request.area,
                &request.gerencia,
                &request.departamento,
                &request.tipo_vacante,
                &request.modalidad,
                &request.ubicacion,
                &request.codigo_pais,
                &request.nivel_experiencia,
                &request.salario_min,
                &request.salario_max,
                &request.acepta_internos,
                &request.es_publica,
                &request.cantidad_plazas,
                &request.prioridad,
                &request.id_solicitante,
                &request.id_responsable_rh,
            ],
        )
        .await
        .map_err(|err| err.to_string())?
        .into_first_result()
        .await
        .map_err(|err| err.to_string())?;

    let id_vacante = rows
        .first()
        .and_then(|row| read_i32(row, "IdVacante"))
        .unwrap_or_default();

    if id_vacante <= 0 {
        return Err("No se pudo obtener IdVacante creado".to_string());
    }

    if request.id_requisicion_personal.is_some()
        || request.id_descriptor_puesto.is_some()
        || request.es_excepcion_sin_requisicion
        || request.motivo_excepcion.is_some()
        || request.fecha_limite_regularizacion.is_some()
    {
        client
            .execute(
                "UPDATE dbo.Vacante
                 SET IdRequisicionPersonal = @P2,
                     IdDescriptorPuesto = @P3,
                     EsExcepcionSinRequisicion = @P4,
                     MotivoExcepcion = @P5,
                     FechaLimiteRegularizacion = TRY_CONVERT(date, @P6),
                     EstadoRegularizacion = CASE
                         WHEN @P4 = 1 THEN 'PENDIENTE'
                         WHEN @P2 IS NOT NULL THEN 'ASOCIADA'
                         ELSE EstadoRegularizacion
                     END,
                     FechaModificacion = SYSDATETIME()
                 WHERE IdVacante = @P1",
                &[
                    &id_vacante,
                    &request.id_requisicion_personal,
                    &request.id_descriptor_puesto,
                    &request.es_excepcion_sin_requisicion,
                    &request.motivo_excepcion,
                    &request.fecha_limite_regularizacion,
                ],
            )
            .await
            .map_err(|err| err.to_string())?;
    }

    Ok(id_vacante)
}

pub async fn change_vacancy_state(
    pool: &SqlPool,
    id_vacante: i32,
    request: &ChangeStateRequest,
) -> Result<(), String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    client
        .execute(
            "EXEC dbo.spVac_CambiarEstado
                @IdVacante = @P1,
                @EstadoNuevo = @P2,
                @Observacion = @P3,
                @IdCuentaPortal = @P4",
            &[
                &id_vacante,
                &request.estado_nuevo,
                &request.observacion,
                &request.id_cuenta_portal,
            ],
        )
        .await
        .map_err(|err| err.to_string())?;
    Ok(())
}

pub async fn create_requisition(
    pool: &SqlPool,
    request: &CreateRequisitionRequest,
) -> Result<i64, String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    let rows = client
        .query(
            "EXEC dbo.spReq_Crear
                @CodigoRequisicion = @P1,
                @IdPuesto = @P2,
                @IdDescriptorPuesto = @P3,
                @TipoNecesidad = @P4,
                @Justificacion = @P5,
                @CantidadPlazas = @P6,
                @CodigoPais = @P7,
                @Gerencia = @P8,
                @Departamento = @P9,
                @Area = @P10,
                @CentroCosto = @P11,
                @IdCuentaPortalSolicitante = @P12,
                @IdCuentaPortalJefeAprobador = @P13,
                @IdCuentaPortalReclutamiento = @P14,
                @IdCuentaPortalCompensacion = @P15,
                @FechaNecesariaCobertura = TRY_CONVERT(date, @P16),
                @Prioridad = @P17,
                @PermitePublicacionSinCompletar = @P18,
                @FechaLimiteRegularizacion = TRY_CONVERT(date, @P19)",
            &[
                &request.codigo_requisicion,
                &request.id_puesto,
                &request.id_descriptor_puesto,
                &request.tipo_necesidad,
                &request.justificacion,
                &request.cantidad_plazas,
                &request.codigo_pais,
                &request.gerencia,
                &request.departamento,
                &request.area,
                &request.centro_costo,
                &request.id_cuenta_portal_solicitante,
                &request.id_cuenta_portal_jefe_aprobador,
                &request.id_cuenta_portal_reclutamiento,
                &request.id_cuenta_portal_compensacion,
                &request.fecha_necesaria_cobertura,
                &request.prioridad,
                &request.permite_publicacion_sin_completar,
                &request.fecha_limite_regularizacion,
            ],
        )
        .await
        .map_err(|err| err.to_string())?
        .into_first_result()
        .await
        .map_err(|err| err.to_string())?;

    rows.first()
        .and_then(|row| read_i64(row, "IdRequisicionPersonal"))
        .filter(|value| *value > 0)
        .ok_or_else(|| "No se pudo obtener IdRequisicionPersonal creado".to_string())
}

pub async fn approve_requisition(
    pool: &SqlPool,
    id_requisicion_personal: i64,
    request: &RequisitionDecisionRequest,
) -> Result<(), String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    client
        .execute(
            "EXEC dbo.spReq_AprobarEtapa
                @IdRequisicionPersonal = @P1,
                @Etapa = @P2,
                @IdCuentaPortal = @P3,
                @Comentario = @P4",
            &[
                &id_requisicion_personal,
                &request.etapa.clone().unwrap_or_else(|| "JEFE".to_string()),
                &request.id_cuenta_portal,
                &request.comentario,
            ],
        )
        .await
        .map_err(|err| err.to_string())?;
    Ok(())
}

pub async fn reject_requisition(
    pool: &SqlPool,
    id_requisicion_personal: i64,
    request: &RequisitionDecisionRequest,
) -> Result<(), String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    client
        .execute(
            "EXEC dbo.spReq_Rechazar
                @IdRequisicionPersonal = @P1,
                @IdCuentaPortal = @P2,
                @Comentario = @P3",
            &[
                &id_requisicion_personal,
                &request.id_cuenta_portal,
                &request
                    .comentario
                    .clone()
                    .unwrap_or_else(|| "Rechazo desde portal RH".to_string()),
            ],
        )
        .await
        .map_err(|err| err.to_string())?;
    Ok(())
}

pub async fn apply_to_vacancy(
    pool: &SqlPool,
    request: &ApplyRequest,
) -> Result<i32, String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    let rows = client
        .query(
            "EXEC dbo.spPost_Postular
                @IdVacante = @P1,
                @IdPersona = @P2,
                @EsInterna = @P3,
                @FuentePostulacion = @P4",
            &[
                &request.id_vacante,
                &request.id_persona,
                &request.es_interna,
                &request.fuente_postulacion,
            ],
        )
        .await
        .map_err(|err| err.to_string())?
        .into_first_result()
        .await
        .map_err(|err| err.to_string())?;

    rows.first()
        .and_then(|row| read_i32(row, "IdPostulacion"))
        .filter(|value| *value > 0)
        .ok_or_else(|| "No se pudo obtener IdPostulacion creado".to_string())
}

pub async fn count_recent_internal_postulations(
    pool: &SqlPool,
    id_persona: i32,
    window_seconds: u64,
) -> Result<i64, String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    let window_seconds = i32::try_from(window_seconds).unwrap_or(i32::MAX);
    let rows = client
        .query(
            "EXEC dbo.spPost_ContarRecientesPorPersona @IdPersona = @P1, @VentanaSegundos = @P2",
            &[&id_persona, &window_seconds],
        )
        .await
        .map_err(|err| err.to_string())?
        .into_first_result()
        .await
        .map_err(|err| err.to_string())?;

    Ok(rows
        .first()
        .and_then(|row| read_i64(row, "Total"))
        .unwrap_or_default())
}

pub async fn create_terna(
    pool: &SqlPool,
    request: &CreateTernaRequest,
) -> Result<i32, String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    let rows = client
        .query(
            "EXEC dbo.spTerna_Crear
                @IdVacante = @P1,
                @IdCuentaPortalCreador = @P2",
            &[&request.id_vacante, &request.id_cuenta_portal_creador],
        )
        .await
        .map_err(|err| err.to_string())?
        .into_first_result()
        .await
        .map_err(|err| err.to_string())?;

    rows.first()
        .and_then(|row| read_i32(row, "IdTerna"))
        .filter(|value| *value > 0)
        .ok_or_else(|| "No se pudo obtener IdTerna creado".to_string())
}

pub async fn create_blacklist(
    pool: &SqlPool,
    request: &CreateBlacklistRequest,
) -> Result<i32, String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    let rows = client
        .query(
            "EXEC dbo.spListaNegra_Insertar
                @IdPersona = @P1,
                @Motivo = @P2,
                @Categoria = @P3,
                @FechaInicio = TRY_CONVERT(date, @P4),
                @FechaFin = TRY_CONVERT(date, @P5),
                @Permanente = @P6,
                @IdCuentaPortalRegistro = @P7",
            &[
                &request.id_persona,
                &request.motivo,
                &request.categoria,
                &request.fecha_inicio,
                &request.fecha_fin,
                &request.permanente,
                &request.id_cuenta_portal_registro,
            ],
        )
        .await
        .map_err(|err| err.to_string())?
        .into_first_result()
        .await
        .map_err(|err| err.to_string())?;

    rows.first()
        .and_then(|row| read_i32(row, "IdListaNegra"))
        .filter(|value| *value > 0)
        .ok_or_else(|| "No se pudo obtener IdListaNegra creado".to_string())
}

pub async fn change_postulation_state(
    pool: &SqlPool,
    id_postulacion: i32,
    request: &ChangePostulationStateRequest,
) -> Result<(), String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    client
        .execute(
            "EXEC dbo.spPost_CambiarEstado
                @IdPostulacion = @P1,
                @EstadoNuevo = @P2,
                @Observacion = @P3,
                @IdCuentaPortal = @P4",
            &[
                &id_postulacion,
                &request.estado_nuevo,
                &request.observacion,
                &request.id_cuenta_portal,
            ],
        )
        .await
        .map_err(|err| err.to_string())?;
    Ok(())
}

pub async fn change_external_candidate_postulation_state(
    pool: &SqlPool,
    id_postulacion_candidato: i64,
    request: &ChangePostulationStateRequest,
) -> Result<(), String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    client
        .execute(
            "EXEC dbo.spPostCand_CambiarEstado
                @IdPostulacionCandidato = @P1,
                @EstadoNuevo = @P2,
                @Observacion = @P3,
                @IdCuentaPortal = @P4",
            &[
                &id_postulacion_candidato,
                &request.estado_nuevo,
                &request.observacion,
                &request.id_cuenta_portal,
            ],
        )
        .await
        .map_err(|err| err.to_string())?;
    Ok(())
}

pub async fn create_descriptor(
    pool: &SqlPool,
    request: &CreateDescriptorRequest,
) -> Result<i32, String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    let rows = client
        .query(
            "EXEC dbo.spDesc_Crear
                @IdPuesto = @P1,
                @TituloPuesto = @P2,
                @VersionDescriptor = @P3,
                @ObjetivoPuesto = @P4,
                @FuncionesPrincipales = @P5,
                @FuncionesSecundarias = @P6,
                @CompetenciasTecnicas = @P7,
                @CompetenciasBlandas = @P8,
                @Escolaridad = @P9,
                @ExperienciaMinima = @P10,
                @Idiomas = @P11,
                @Certificaciones = @P12,
                @Jornada = @P13,
                @Modalidad = @P14,
                @RangoSalarialReferencial = @P15,
                @ReportaA = @P16,
                @IndicadoresExito = @P17,
                @FechaVigenciaDesde = TRY_CONVERT(date, @P18),
                @FechaVigenciaHasta = TRY_CONVERT(date, @P19)",
            &[
                &request.id_puesto,
                &request.titulo_puesto,
                &request.version_descriptor,
                &request.objetivo_puesto,
                &request.funciones_principales,
                &request.funciones_secundarias,
                &request.competencias_tecnicas,
                &request.competencias_blandas,
                &request.escolaridad,
                &request.experiencia_minima,
                &request.idiomas,
                &request.certificaciones,
                &request.jornada,
                &request.modalidad,
                &request.rango_salarial_referencial,
                &request.reporta_a,
                &request.indicadores_exito,
                &request.fecha_vigencia_desde,
                &request.fecha_vigencia_hasta,
            ],
        )
        .await
        .map_err(|err| err.to_string())?
        .into_first_result()
        .await
        .map_err(|err| err.to_string())?;

    rows.first()
        .and_then(|row| read_i32(row, "IdDescriptorPuesto"))
        .filter(|value| *value > 0)
        .ok_or_else(|| "No se pudo obtener IdDescriptorPuesto creado".to_string())
}

fn slugify(text: &str) -> String {
    let mut slug = String::with_capacity(text.len());
    let mut previous_dash = false;

    for ch in text.chars() {
        let lower = ch.to_ascii_lowercase();
        if lower.is_ascii_alphanumeric() {
            slug.push(lower);
            previous_dash = false;
        } else if !previous_dash {
            slug.push('-');
            previous_dash = true;
        }
    }

    slug.trim_matches('-').to_string()
}

fn read_i64(row: &Row, column: &str) -> Option<i64> {
    if let Ok(Some(value)) = row.try_get::<i64, _>(column) {
        return Some(value);
    }

    row.try_get::<tiberius::numeric::Numeric, _>(column)
        .ok()
        .flatten()
        .map(|value| {
            let raw = value.to_string();
            raw.parse::<i64>()
                .or_else(|_| raw.parse::<f64>().map(|parsed| parsed as i64))
                .unwrap_or_default()
        })
}

fn read_i32(row: &Row, column: &str) -> Option<i32> {
    read_i64(row, column).and_then(|value| i32::try_from(value).ok())
}

