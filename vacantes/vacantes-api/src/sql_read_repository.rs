use chrono::{NaiveDate, NaiveDateTime};
use serde_json::{json, Value};
use tiberius::Row;

use crate::db_pool::SqlPool;

pub async fn list_public_vacancies(pool: &SqlPool) -> Result<Vec<Value>, String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    let rows = client
        .query("EXEC dbo.spVac_ListarPublicas", &[])
        .await
        .map_err(|err| err.to_string())?
        .into_first_result()
        .await
        .map_err(|err| err.to_string())?;

    Ok(rows
        .into_iter()
        .map(|row| {
            json!({
                "idVacante": row.get::<i32, _>("IdVacante").unwrap_or_default(),
                "codigoVacante": text(&row, "CodigoVacante"),
                "slug": text(&row, "Slug"),
                "titulo": text(&row, "Titulo"),
                "ubicacion": text(&row, "Ubicacion"),
                "codigoPais": text(&row, "CodigoPais"),
                "modalidad": text(&row, "Modalidad"),
                "descripcion": text(&row, "Descripcion"),
                "requisitos": text(&row, "Requisitos"),
                "area": text(&row, "Area"),
                "departamento": text(&row, "Departamento"),
                "tipoVacante": text(&row, "TipoVacante"),
                "nivelExperiencia": text(&row, "NivelExperiencia"),
                "salarioMin": read_i64(&row, "SalarioMin"),
                "salarioMax": read_i64(&row, "SalarioMax"),
                "fechaPublicacion": date_time_text(&row, "FechaPublicacion")
            })
        })
        .collect())
}

pub async fn get_public_vacancy_detail(
    pool: &SqlPool,
    slug: &str,
) -> Result<Option<Value>, String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    let rows = client
        .query("EXEC dbo.spVac_ObtenerDetallePorSlug @Slug = @P1", &[&slug])
        .await
        .map_err(|err| err.to_string())?
        .into_first_result()
        .await
        .map_err(|err| err.to_string())?;

    Ok(rows.into_iter().next().map(|row| {
        json!({
            "idVacante": row.get::<i32, _>("IdVacante").unwrap_or_default(),
            "slug": text(&row, "Slug"),
            "titulo": text(&row, "Titulo"),
            "descripcion": text(&row, "Descripcion"),
            "requisitos": text(&row, "Requisitos"),
            "codigoPais": text(&row, "CodigoPais"),
            "modalidad": text(&row, "Modalidad"),
            "estadoActual": text(&row, "EstadoActual"),
            "tipoVacante": text(&row, "TipoVacante"),
            "ubicacion": text(&row, "Ubicacion"),
            "area": text(&row, "Area"),
            "departamento": text(&row, "Departamento"),
            "nivelExperiencia": text(&row, "NivelExperiencia"),
            "salarioMin": read_i64(&row, "SalarioMin"),
            "salarioMax": read_i64(&row, "SalarioMax")
        })
    }))
}

pub async fn list_postulations_by_person(
    pool: &SqlPool,
    id_persona: i32,
) -> Result<Vec<Value>, String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    let rows = client
        .query(
            "EXEC dbo.spPost_ListarPorPersona @IdPersona = @P1",
            &[&id_persona],
        )
        .await
        .map_err(|err| err.to_string())?
        .into_first_result()
        .await
        .map_err(|err| err.to_string())?;

    Ok(rows
        .into_iter()
        .map(|row| {
            json!({
                "idPostulacion": row.get::<i32, _>("IdPostulacion").unwrap_or_default(),
                "idVacante": row.get::<i32, _>("IdVacante").unwrap_or_default(),
                "titulo": text(&row, "Titulo"),
                "codigoVacante": text(&row, "CodigoVacante"),
                "estadoActual": text(&row, "EstadoActual"),
                "scoreIa": decimal_text(&row, "ScoreIA"),
                "scoreRh": decimal_text(&row, "ScoreRH"),
                "scoreJefe": decimal_text(&row, "ScoreJefe"),
                "fechaPostulacion": date_time_text(&row, "FechaPostulacion")
            })
        })
        .collect())
}

pub async fn list_rh_vacancies(pool: &SqlPool) -> Result<Vec<Value>, String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    let rows = client
        .query("EXEC dbo.spVac_RH_ListarVacantes", &[])
        .await
        .map_err(|err| err.to_string())?
        .into_first_result()
        .await
        .map_err(|err| err.to_string())?;

    Ok(rows
        .into_iter()
        .map(|row| {
            json!({
                "idVacante": row.get::<i32, _>("IdVacante").unwrap_or_default(),
                "codigoVacante": text(&row, "CodigoVacante"),
                "titulo": text(&row, "Titulo"),
                "estadoActual": text(&row, "EstadoActual")
            })
        })
        .collect())
}

pub async fn list_requisitions(pool: &SqlPool) -> Result<Vec<Value>, String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    let rows = client
        .query("EXEC dbo.spReq_RH_ListarRequisiciones", &[])
        .await
        .map_err(|err| err.to_string())?
        .into_first_result()
        .await
        .map_err(|err| err.to_string())?;

    Ok(rows
        .into_iter()
        .map(|row| {
            json!({
                "idRequisicion": row.get::<i64, _>("IdRequisicionPersonal").unwrap_or_default(),
                "codigoRequisicion": text(&row, "CodigoRequisicion"),
                "idPuesto": row.get::<i64, _>("IdPuesto").unwrap_or_default(),
                "tituloPuesto": "",
                "area": text(&row, "Area"),
                "solicitante": "",
                "prioridad": text(&row, "Prioridad"),
                "estadoActual": text(&row, "EstadoRequisicion"),
                "tipoNecesidad": text(&row, "TipoNecesidad"),
                "fechaSolicitud": date_text(&row, "FechaSolicitud"),
                "fechaLimiteRegularizacion": date_text(&row, "FechaLimiteRegularizacion"),
                "permitePublicacionSinCompletar": row.get::<bool, _>("PermitePublicacionSinCompletar").unwrap_or(false)
            })
        })
        .collect())
}

pub async fn list_pending_requisition_approvals(
    pool: &SqlPool,
    id_cuenta_portal: i32,
) -> Result<Vec<Value>, String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    let rows = client
        .query(
            "EXEC dbo.spReq_ListarPendientesAprobacion @IdCuentaPortal = @P1",
            &[&id_cuenta_portal],
        )
        .await
        .map_err(|err| err.to_string())?
        .into_first_result()
        .await
        .map_err(|err| err.to_string())?;

    Ok(rows
        .into_iter()
        .map(|row| {
            json!({
                "idRequisicion": read_i64(&row, "IdRequisicionPersonal").unwrap_or_default(),
                "codigoRequisicion": text(&row, "CodigoRequisicion"),
                "idPuesto": 0,
                "tituloPuesto": "",
                "area": text(&row, "Area"),
                "solicitante": "",
                "prioridad": "",
                "estadoActual": text(&row, "EstadoRequisicion"),
                "tipoNecesidad": text(&row, "TipoNecesidad"),
                "fechaSolicitud": "",
                "fechaLimiteRegularizacion": "",
                "permitePublicacionSinCompletar": false,
                "etapa": text(&row, "Etapa"),
                "estadoAprobacion": text(&row, "EstadoAprobacion")
            })
        })
        .collect())
}

pub async fn list_descriptors(pool: &SqlPool) -> Result<Vec<Value>, String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    let rows = client
        .query("EXEC dbo.spDesc_ListarDescriptores", &[])
        .await
        .map_err(|err| err.to_string())?
        .into_first_result()
        .await
        .map_err(|err| err.to_string())?;

    Ok(rows
        .into_iter()
        .map(|row| {
            json!({
                "idDescriptorPuesto": row.get::<i32, _>("IdDescriptorPuesto").unwrap_or_default(),
                "idPuesto": row.get::<i64, _>("IdPuesto").unwrap_or_default(),
                "tituloPuesto": text(&row, "TituloPuesto"),
                "versionDescriptor": row.get::<i32, _>("VersionDescriptorNumero").unwrap_or_default(),
                "objetivoPuesto": text(&row, "ObjetivoPuesto"),
                "competenciasClave": [],
                "vigenciaDesde": date_text(&row, "FechaVigenciaDesde"),
                "estadoActual": if row.get::<bool, _>("Activo").unwrap_or(false) { "VIGENTE" } else { "INACTIVO" }
            })
        })
        .collect())
}

pub async fn get_current_descriptor(
    pool: &SqlPool,
    id_puesto: i64,
) -> Result<Option<Value>, String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    let rows = client
        .query(
            "EXEC dbo.spDesc_ObtenerVigente @IdPuesto = @P1",
            &[&id_puesto],
        )
        .await
        .map_err(|err| err.to_string())?
        .into_first_result()
        .await
        .map_err(|err| err.to_string())?;

    Ok(rows.into_iter().next().map(|row| {
        json!({
            "idDescriptorPuesto": row.get::<i32, _>("IdDescriptorPuesto").unwrap_or_default(),
            "idPuesto": row.get::<i64, _>("IdPuesto").unwrap_or_default(),
            "tituloPuesto": text(&row, "TituloPuesto"),
            "versionDescriptor": version_text(&row, "VersionDescriptor"),
            "objetivoPuesto": text(&row, "ObjetivoPuesto"),
            "funcionesPrincipales": text(&row, "FuncionesPrincipales"),
            "funcionesSecundarias": text(&row, "FuncionesSecundarias"),
            "competenciasTecnicas": split_multivalue(&text(&row, "CompetenciasTecnicas")),
            "competenciasBlandas": split_multivalue(&text(&row, "CompetenciasBlandas")),
            "vigenciaDesde": date_text(&row, "FechaVigenciaDesde"),
            "vigenciaHasta": date_text(&row, "FechaVigenciaHasta"),
            "estadoActual": if row.get::<bool, _>("Activo").unwrap_or(false) { "VIGENTE" } else { "INACTIVO" }
        })
    }))
}

pub async fn list_rh_postulations(pool: &SqlPool) -> Result<Vec<Value>, String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    let rows = client
        .query("EXEC dbo.spPost_RH_ListarTodas", &[])
        .await
        .map_err(|err| err.to_string())?
        .into_first_result()
        .await
        .map_err(|err| err.to_string())?;

    Ok(rows
        .into_iter()
        .map(|row| {
            json!({
                "idPostulacion": read_i64(&row, "IdPostulacion").unwrap_or_default(),
                "idVacante": row.get::<i32, _>("IdVacante").unwrap_or_default(),
                "idPersona": row.get::<i32, _>("IdPersona"),
                "idCandidato": read_i64(&row, "IdCandidato"),
                "titulo": text(&row, "Titulo"),
                "nombreCandidato": text(&row, "NombreCandidato"),
                "estadoActual": text(&row, "EstadoActual"),
                "scoreIa": row.get::<f64, _>("ScoreIA").unwrap_or(0.0),
                "scoreRh": row.get::<f64, _>("ScoreRH").unwrap_or(0.0),
                "tipoPostulacion": if text(&row, "OrigenPostulacion") == "CANDIDATO_EXTERNO" {
                    "CANDIDATO_EXTERNO"
                } else {
                    "EMPLEADO_INTERNO"
                },
                "origenPostulacion": text(&row, "OrigenPostulacion"),
                "codigoPais": text(&row, "CodigoPais"),
                "fechaPostulacion": text(&row, "FechaPostulacion"),
                "departamentoResidencia": nullable_text(&row, "DepartamentoResidencia"),
                "municipioResidencia": nullable_text(&row, "MunicipioResidencia"),
                "categoriaInteres": nullable_text(&row, "CategoriaInteres"),
                "modalidadPreferida": nullable_text(&row, "ModalidadPreferida"),
                "nivelAcademico": nullable_text(&row, "NivelAcademico"),
                "disponibilidadViajar": row.get::<bool, _>("DisponibilidadViajar"),
                "disponibilidadHorarioRotativo": row.get::<bool, _>("DisponibilidadHorarioRotativo"),
                "tieneLicenciaConducir": row.get::<bool, _>("TieneLicenciaConducir"),
                "tipoLicencia": nullable_text(&row, "TipoLicencia"),
                "tieneVehiculoPropio": row.get::<bool, _>("TieneVehiculoPropio")
            })
        })
        .collect())
}

pub async fn get_rh_dashboard(pool: &SqlPool) -> Result<Value, String> {
    let vacantes = list_rh_vacancies(pool).await?;
    let requisiciones = list_requisitions(pool).await?;
    let descriptores = list_descriptors(pool).await?;

    let pendientes = requisiciones
        .iter()
        .filter(|item| {
            item["estadoActual"]
                .as_str()
                .unwrap_or_default()
                .starts_with("PENDIENTE")
        })
        .take(3)
        .cloned()
        .collect::<Vec<Value>>();

    let vacantes_en_excepcion = vacantes
        .iter()
        .filter(|item| {
            item["estadoActual"].as_str().unwrap_or_default() == "PUBLICADA_CON_EXCEPCION"
        })
        .count();
    let requisiciones_pendientes = requisiciones
        .iter()
        .filter(|item| {
            item["estadoActual"]
                .as_str()
                .unwrap_or_default()
                .starts_with("PENDIENTE")
        })
        .count();

    Ok(json!({
        "kpis": {
            "vacantesPublicadas": vacantes.len(),
            "requisicionesPendientes": requisiciones_pendientes,
            "descriptoresVigentes": descriptores.len(),
            "vacantesEnExcepcion": vacantes_en_excepcion
        },
        "pendientes": pendientes
    }))
}

pub async fn get_rh_reports(pool: &SqlPool) -> Result<Value, String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;

    let vacantes_rows = client
        .query("EXEC dbo.spRep_VacantesResumen", &[])
        .await
        .map_err(|err| err.to_string())?
        .into_first_result()
        .await
        .map_err(|err| err.to_string())?;
    let vacantes = vacantes_rows.first();

    let postulaciones_rows = client
        .query("EXEC dbo.spRep_PostulacionesResumen", &[])
        .await
        .map_err(|err| err.to_string())?
        .into_first_result()
        .await
        .map_err(|err| err.to_string())?;
    let postulaciones = postulaciones_rows.first();

    let pais_rows = client
        .query("EXEC dbo.spRep_PostulacionesPorPais", &[])
        .await
        .map_err(|err| err.to_string())?
        .into_first_result()
        .await
        .map_err(|err| err.to_string())?;

    Ok(json!({
        "resumen": {
            "vacantesActivas": vacantes.and_then(|row| row.get::<i32, _>("VacantesActivas")).unwrap_or_default(),
            "vacantesOcupadas": vacantes.and_then(|row| row.get::<i32, _>("VacantesOcupadas")).unwrap_or_default(),
            "vacantesCerradas": vacantes.and_then(|row| row.get::<i32, _>("VacantesCerradas")).unwrap_or_default(),
            "vacantesEnExcepcion": 0,
            "totalPostulaciones": postulaciones.and_then(|row| row.get::<i32, _>("TotalPostulaciones")).unwrap_or_default()
        },
        "tiposPostulacion": [
            {
                "tipoPostulacion": "INTERNA",
                "total": postulaciones.and_then(|row| row.get::<i32, _>("Internas")).unwrap_or_default()
            },
            {
                "tipoPostulacion": "EXTERNA",
                "total": postulaciones.and_then(|row| row.get::<i32, _>("Externas")).unwrap_or_default()
            }
        ],
        "postulacionesPorPais": pais_rows.into_iter().map(|row| {
            json!({
                "codigoPais": text(&row, "CodigoPais"),
                "totalPostulaciones": row.get::<i32, _>("TotalPostulaciones").unwrap_or_default()
            })
        }).collect::<Vec<Value>>(),
        "tiemposProceso": {
            "promedioDiasAperturaAOcupada": 0.0,
            "promedioDiasPostulacionAContratacion": 0.0
        }
    }))
}

pub async fn get_internal_rh_postulation_detail(
    pool: &SqlPool,
    id_postulacion: i64,
) -> Result<Option<Value>, String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    let rows = client
        .query(
            "EXEC dbo.spPost_RH_DetalleInterno @IdPostulacion = @P1",
            &[&id_postulacion],
        )
        .await
        .map_err(|err| err.to_string())?
        .into_first_result()
        .await
        .map_err(|err| err.to_string())?;

    Ok(rows.first().map(|row| {
        json!({
            "idPostulacion": read_i64(row, "IdPostulacion").unwrap_or_default(),
            "idVacante": row.get::<i32, _>("IdVacante").unwrap_or_default(),
            "idPersona": row.get::<i32, _>("IdPersona"),
            "titulo": text(row, "Titulo"),
            "codigoVacante": text(row, "CodigoVacante"),
            "codigoPais": text(row, "CodigoPais"),
            "modalidad": text(row, "Modalidad"),
            "tipoVacante": text(row, "TipoVacante"),
            "estadoActual": text(row, "EstadoActual"),
            "scoreIa": row.get::<f64, _>("ScoreIA").unwrap_or(0.0),
            "scoreRh": row.get::<f64, _>("ScoreRH").unwrap_or(0.0),
            "scoreJefe": row.get::<f64, _>("ScoreJefe").unwrap_or(0.0),
            "fechaPostulacion": text(row, "FechaPostulacion"),
            "origenPostulacion": "EMPLEADO_INTERNO"
        })
    }))
}

pub async fn get_external_rh_postulation_detail(
    pool: &SqlPool,
    id_postulacion: i64,
) -> Result<Option<Value>, String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    let rows = client
        .query(
            "EXEC dbo.spPost_RH_DetalleExterno @IdPostulacion = @P1",
            &[&id_postulacion],
        )
        .await
        .map_err(|err| err.to_string())?
        .into_first_result()
        .await
        .map_err(|err| err.to_string())?;

    Ok(rows.first().map(|row| {
        json!({
            "idPostulacion": read_i64(row, "IdPostulacion").unwrap_or_default(),
            "idVacante": row.get::<i32, _>("IdVacante").unwrap_or_default(),
            "idCandidato": read_i64(row, "IdCandidato"),
            "titulo": text(row, "Titulo"),
            "codigoVacante": text(row, "CodigoVacante"),
            "codigoPais": text(row, "CodigoPais"),
            "modalidad": text(row, "Modalidad"),
            "tipoVacante": text(row, "TipoVacante"),
            "estadoActual": text(row, "EstadoActual"),
            "scoreIa": row.get::<f64, _>("ScoreIA").unwrap_or(0.0),
            "scoreRh": row.get::<f64, _>("ScoreRH").unwrap_or(0.0),
            "scoreJefe": row.get::<f64, _>("ScoreJefe").unwrap_or(0.0),
            "fechaPostulacion": text(row, "FechaPostulacion"),
            "origenPostulacion": "CANDIDATO_EXTERNO",
            "correo": text(row, "Correo"),
            "nombres": text(row, "Nombres"),
            "apellidos": text(row, "Apellidos"),
            "telefono": nullable_text(row, "Telefono"),
            "departamentoResidencia": nullable_text(row, "DepartamentoResidencia"),
            "municipioResidencia": nullable_text(row, "MunicipioResidencia"),
            "categoriaInteres": nullable_text(row, "CategoriaInteres"),
            "modalidadPreferida": nullable_text(row, "ModalidadPreferida"),
            "nivelAcademico": nullable_text(row, "NivelAcademico"),
            "linkedinUrl": nullable_text(row, "LinkedinUrl"),
            "resumenProfesional": nullable_text(row, "ResumenProfesional"),
            "disponibilidadViajar": row.get::<bool, _>("DisponibilidadViajar").unwrap_or(false),
            "disponibilidadHorarioRotativo": row.get::<bool, _>("DisponibilidadHorarioRotativo").unwrap_or(false),
            "tieneLicenciaConducir": row.get::<bool, _>("TieneLicenciaConducir").unwrap_or(false),
            "tipoLicencia": nullable_text(row, "TipoLicencia"),
            "tieneVehiculoPropio": row.get::<bool, _>("TieneVehiculoPropio").unwrap_or(false),
            "fechaRegistro": text(row, "FechaRegistro")
        })
    }))
}

pub async fn get_person_current_cv(
    pool: &SqlPool,
    id_persona: i32,
) -> Result<Option<Value>, String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    let rows = client
        .query(
            "EXEC dbo.spCv_ObtenerCvPrincipalPorPersona @IdPersona = @P1",
            &[&id_persona],
        )
        .await
        .map_err(|err| err.to_string())?
        .into_first_result()
        .await
        .map_err(|err| err.to_string())?;

    Ok(rows.first().map(build_person_cv_file))
}

pub async fn list_person_cv_history(
    pool: &SqlPool,
    id_persona: i32,
) -> Result<Vec<Value>, String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    let rows = client
        .query(
            "EXEC dbo.spCv_ListarArchivosPersona @IdPersona = @P1",
            &[&id_persona],
        )
        .await
        .map_err(|err| err.to_string())?
        .into_first_result()
        .await
        .map_err(|err| err.to_string())?;

    Ok(rows.iter().map(build_person_cv_file).collect())
}

pub async fn get_person_current_analysis(
    pool: &SqlPool,
    id_persona: i32,
) -> Result<Option<Value>, String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    let rows = client
        .query(
            "EXEC dbo.spIA_ObtenerAnalisisPersonaVigente @IdPersona = @P1",
            &[&id_persona],
        )
        .await
        .map_err(|err| err.to_string())?
        .into_first_result()
        .await
        .map_err(|err| err.to_string())?;

    Ok(rows.first().map(build_analysis_item))
}

pub async fn list_person_analysis_history(
    pool: &SqlPool,
    id_persona: i32,
) -> Result<Vec<Value>, String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    let rows = client
        .query(
            "EXEC dbo.spIA_ListarHistoriaAnalisisPersona @IdPersona = @P1",
            &[&id_persona],
        )
        .await
        .map_err(|err| err.to_string())?
        .into_first_result()
        .await
        .map_err(|err| err.to_string())?;

    Ok(rows.iter().map(build_analysis_item).collect())
}

pub async fn get_observability_snapshot(pool: &SqlPool) -> Result<Value, String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;

    let vacantes_rows = client
        .query("EXEC dbo.spRep_ObservabilidadVacantes", &[])
        .await
        .map_err(|err| err.to_string())?
        .into_first_result()
        .await
        .map_err(|err| err.to_string())?;
    let vacantes = vacantes_rows.first();

    let postulaciones_rows = client
        .query("EXEC dbo.spRep_ObservabilidadPostulaciones", &[])
        .await
        .map_err(|err| err.to_string())?
        .into_first_result()
        .await
        .map_err(|err| err.to_string())?;
    let postulaciones = postulaciones_rows.first();

    Ok(json!({
        "vacantesPublicas": vacantes.and_then(|row| read_i64(row, "VacantesPublicas")).unwrap_or_default(),
        "vacantesActivas": vacantes.and_then(|row| read_i64(row, "VacantesActivas")).unwrap_or_default(),
        "postulacionesInternas": postulaciones.and_then(|row| read_i64(row, "PostulacionesInternas")).unwrap_or_default(),
        "postulacionesExternas": postulaciones.and_then(|row| read_i64(row, "PostulacionesExternas")).unwrap_or_default(),
        "cvsActivos": postulaciones.and_then(|row| read_i64(row, "CvsActivos")).unwrap_or_default(),
        "cvIntentosRechazados24h": postulaciones.and_then(|row| read_i64(row, "IntentosCvRechazados24h")).unwrap_or_default(),
        "operacionCandidatoFallida24h": postulaciones.and_then(|row| read_i64(row, "IntentosOperacionFallidos24h")).unwrap_or_default(),
        "analisisIaFallidos24h": postulaciones.and_then(|row| read_i64(row, "AnalisisIaFallidos24h")).unwrap_or_default()
    }))
}

fn text(row: &Row, column: &str) -> String {
    row.get::<&str, _>(column).unwrap_or_default().to_string()
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

fn date_text(row: &Row, column: &str) -> String {
    if let Some(value) = row.get::<NaiveDate, _>(column) {
        return value.to_string();
    }
    String::new()
}

fn date_time_text(row: &Row, column: &str) -> String {
    if let Some(value) = row.get::<NaiveDateTime, _>(column) {
        return value.format("%Y-%m-%d %H:%M:%S").to_string();
    }
    text(row, column)
}

fn decimal_text(row: &Row, column: &str) -> String {
    row.get::<f64, _>(column)
        .map(|value| format!("{value:.2}"))
        .unwrap_or_else(|| "0.00".to_string())
}

fn version_text(row: &Row, column: &str) -> String {
    if let Some(value) = row.get::<&str, _>(column) {
        return value.to_string();
    }

    if let Some(value) = row.get::<i32, _>(column) {
        return value.to_string();
    }

    String::new()
}

fn split_multivalue(value: &str) -> Vec<String> {
    value
        .split(['|', ';', '\n'])
        .map(str::trim)
        .filter(|item| !item.is_empty())
        .map(ToString::to_string)
        .collect()
}

fn build_person_cv_file(row: &Row) -> Value {
    json!({
        "idArchivoPersona": row.get::<i32, _>("IdArchivoPersona").unwrap_or_default(),
        "tipoArchivo": text(row, "TipoArchivo"),
        "nombreOriginal": text(row, "NombreOriginal"),
        "rutaStorage": text(row, "RutaStorage"),
        "mimeType": text(row, "MimeType"),
        "tamanoBytes": read_i64(row, "TamanoBytes").unwrap_or_default(),
        "extension": text(row, "Extension"),
        "esCvPrincipal": row.get::<bool, _>("EsCvPrincipal").unwrap_or(false),
        "origen": text(row, "Origen"),
        "estadoArchivo": text(row, "EstadoArchivo"),
        "fechaCreacion": date_time_text(row, "FechaCreacion")
    })
}

fn build_analysis_item(row: &Row) -> Value {
    json!({
        "idAnalisisCvIa": row.get::<i32, _>("IdAnalisisCvIa").unwrap_or_default(),
        "idVacante": row.get::<i32, _>("IdVacante"),
        "idArchivoPersona": row.get::<i32, _>("IdArchivoPersona").unwrap_or_default(),
        "motorIa": text(row, "MotorIA"),
        "versionModelo": text(row, "VersionModelo"),
        "versionPrompt": text(row, "VersionPrompt"),
        "resumenCandidato": text(row, "ResumenCandidato"),
        "fortalezas": split_multivalue(&text(row, "Fortalezas")),
        "debilidades": split_multivalue(&text(row, "Debilidades")),
        "alertas": split_multivalue(&text(row, "Alertas")),
        "scoreTotal": row.get::<f64, _>("ScoreCalculado"),
        "scoreHabilidades": row.get::<f64, _>("ScoreHabilidades"),
        "scoreExperiencia": row.get::<f64, _>("ScoreExperiencia"),
        "scoreEducacion": row.get::<f64, _>("ScoreEducacion"),
        "scoreContexto": row.get::<f64, _>("ScoreContexto"),
        "fueExitoso": row.get::<bool, _>("FueExitoso").unwrap_or(false),
        "errorTecnico": nullable_text(row, "ErrorTecnico"),
        "esVigente": row.get::<bool, _>("EsVigente").unwrap_or(false),
        "fechaAnalisis": text(row, "FechaAnalisis"),
        "perfilNormalizado": {
            "nombreCompletoInferido": nullable_text(row, "NombreCompletoInferido"),
            "correoInferido": nullable_text(row, "CorreoInferido"),
            "telefonoInferido": nullable_text(row, "TelefonoInferido"),
            "experienciaAnios": row.get::<f64, _>("ExperienciaAnios"),
            "nivelAcademico": nullable_text(row, "NivelAcademico"),
            "habilidadesJson": nullable_text(row, "HabilidadesJson"),
            "idiomasJson": nullable_text(row, "IdiomasJson"),
            "certificacionesJson": nullable_text(row, "CertificacionesJson")
        }
    })
}

fn nullable_text(row: &Row, column: &str) -> Option<String> {
    row.get::<&str, _>(column)
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(ToString::to_string)
}

