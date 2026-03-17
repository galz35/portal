use chrono::{Duration, Utc};
use serde::Serialize;
use serde_json::{json, Value};
use tiberius::Row;

use crate::db_pool::SqlPool;

#[derive(Debug, Clone)]
pub struct CandidateCredentialLookup {
    pub id_candidato: i64,
    pub password_hash: String,
    pub activo: bool,
}

#[derive(Debug, Clone)]
pub struct CandidateSessionState {
    pub id_sesion_candidato: i64,
    pub id_candidato: i64,
}

#[derive(Debug, Clone, Serialize)]
pub struct CandidateProfile {
    pub id_candidato: i64,
    pub correo: String,
    pub nombres: String,
    pub apellidos: String,
    pub telefono: Option<String>,
    pub departamento_residencia: Option<String>,
    pub municipio_residencia: Option<String>,
    pub categoria_interes: Option<String>,
    pub modalidad_preferida: Option<String>,
    pub nivel_academico: Option<String>,
    pub linkedin_url: Option<String>,
    pub resumen_profesional: Option<String>,
    pub disponibilidad_viajar: bool,
    pub disponibilidad_horario_rotativo: bool,
    pub tiene_licencia_conducir: bool,
    pub tipo_licencia: Option<String>,
    pub tiene_vehiculo_propio: bool,
    pub fecha_registro: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct CandidateCvFile {
    pub id_archivo_candidato_cv: i64,
    pub nombre_original: String,
    pub extension: String,
    pub mime_type: String,
    pub tamano_bytes: i64,
    pub estado_archivo: String,
    pub es_cv_principal: bool,
    pub fecha_creacion: String,
    pub fecha_desactivacion: Option<String>,
}

pub async fn register_candidate(
    pool: &SqlPool,
    correo: &str,
    nombres: &str,
    apellidos: &str,
    telefono: Option<&str>,
    password_hash: &str,
) -> Result<i64, String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    let rows = client
        .query(
            "EXEC dbo.spCand_Registrar
                @Correo = @P1,
                @Nombres = @P2,
                @Apellidos = @P3,
                @PasswordHash = @P4",
            &[&correo, &nombres, &apellidos, &password_hash],
        )
        .await
        .map_err(|err| err.to_string())?
        .into_first_result()
        .await
        .map_err(|err| err.to_string())?;

    let id_candidato = rows
        .first()
        .and_then(|row| read_i64(row, "IdCandidato"))
        .filter(|value| *value > 0)
        .ok_or_else(|| "No se pudo obtener IdCandidato creado".to_string())?;

    if let Some(telefono) = telefono {
        let _ = update_candidate_profile(
            pool,
            id_candidato,
            nombres,
            apellidos,
            Some(telefono),
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            false,
            false,
            false,
            None,
            false,
        )
        .await;
    }

    Ok(id_candidato)
}

pub async fn verify_candidate_credentials(
    pool: &SqlPool,
    correo: &str,
) -> Result<Option<CandidateCredentialLookup>, String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    let rows = client
        .query("EXEC dbo.spCand_Login @Correo = @P1", &[&correo])
        .await
        .map_err(|err| err.to_string())?
        .into_first_result()
        .await
        .map_err(|err| err.to_string())?;

    Ok(rows.first().and_then(|row| {
        Some(CandidateCredentialLookup {
            id_candidato: read_i64(row, "IdCandidato")?,
            password_hash: text(row, "PasswordHash"),
            activo: row.get::<bool, _>("Activo").unwrap_or(false),
        })
    }))
}

pub async fn create_candidate_session(
    pool: &SqlPool,
    id_candidato: i64,
    sid_hash: &str,
    ip_creacion: Option<&str>,
    user_agent: Option<&str>,
) -> Result<i64, String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    let fecha_expiracion = Utc::now().naive_utc() + Duration::days(7);
    let rows = client
        .query(
            "EXEC dbo.spCand_Sesion_Crear
                @IdCandidato = @P1,
                @SidHash = @P2,
                @IpCreacion = @P3,
                @UserAgent = @P4,
                @FechaExpiracion = @P5",
            &[
                &id_candidato,
                &sid_hash,
                &ip_creacion,
                &user_agent,
                &fecha_expiracion,
            ],
        )
        .await
        .map_err(|err| err.to_string())?
        .into_first_result()
        .await
        .map_err(|err| err.to_string())?;

    rows.first()
        .and_then(|row| read_i64(row, "IdSesionCandidato"))
        .filter(|value| *value > 0)
        .ok_or_else(|| "No se pudo crear sesion de candidato".to_string())
}

pub async fn validate_candidate_session(
    pool: &SqlPool,
    sid_hash: &str,
) -> Result<Option<CandidateSessionState>, String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    let rows = client
        .query(
            "EXEC dbo.spCand_Sesion_Validar @SidHash = @P1",
            &[&sid_hash],
        )
        .await
        .map_err(|err| err.to_string())?
        .into_first_result()
        .await
        .map_err(|err| err.to_string())?;

    Ok(rows.first().and_then(|row| {
        Some(CandidateSessionState {
            id_sesion_candidato: read_i64(row, "IdSesionCandidato")?,
            id_candidato: read_i64(row, "IdCandidato")?,
        })
    }))
}

pub async fn create_candidate_csrf(
    pool: &SqlPool,
    id_sesion_candidato: i64,
    token_hash: &str,
) -> Result<(), String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    let fecha_expiracion = Utc::now().naive_utc() + Duration::hours(2);
    client
        .execute(
            "EXEC dbo.spCand_Csrf_Crear
                @IdSesionCandidato = @P1,
                @TokenHash = @P2,
                @FechaExpiracion = @P3",
            &[&id_sesion_candidato, &token_hash, &fecha_expiracion],
        )
        .await
        .map_err(|err| err.to_string())?;
    Ok(())
}

pub async fn validate_candidate_csrf(
    pool: &SqlPool,
    id_sesion_candidato: i64,
    token_hash: &str,
) -> Result<bool, String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    let rows = client
        .query(
            "EXEC dbo.spCand_Csrf_Validar
                @IdSesionCandidato = @P1,
                @TokenHash = @P2",
            &[&id_sesion_candidato, &token_hash],
        )
        .await
        .map_err(|err| err.to_string())?
        .into_first_result()
        .await
        .map_err(|err| err.to_string())?;

    Ok(rows
        .first()
        .map(|row| !row.get::<bool, _>("Revocado").unwrap_or(true))
        .unwrap_or(false))
}

pub async fn revoke_candidate_csrf(
    pool: &SqlPool,
    id_sesion_candidato: i64,
) -> Result<(), String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    client
        .execute(
            "EXEC dbo.spCand_Csrf_RevocarPorSesion @IdSesionCandidato = @P1",
            &[&id_sesion_candidato],
        )
        .await
        .map_err(|err| err.to_string())?;
    Ok(())
}

pub async fn revoke_candidate_session(
    pool: &SqlPool,
    id_sesion_candidato: i64,
) -> Result<(), String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    client
        .execute(
            "EXEC dbo.spCand_Sesion_Revocar @IdSesionCandidato = @P1",
            &[&id_sesion_candidato],
        )
        .await
        .map_err(|err| err.to_string())?;
    Ok(())
}

pub async fn get_candidate_profile(
    pool: &SqlPool,
    id_candidato: i64,
) -> Result<Option<CandidateProfile>, String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    let rows = client
        .query(
            "EXEC dbo.spCand_ObtenerPerfil @IdCandidato = @P1",
            &[&id_candidato],
        )
        .await
        .map_err(|err| err.to_string())?
        .into_first_result()
        .await
        .map_err(|err| err.to_string())?;

    Ok(rows.first().and_then(|row| {
        Some(CandidateProfile {
            id_candidato: read_i64(row, "IdCandidato")?,
            correo: text(row, "Correo"),
            nombres: text(row, "Nombres"),
            apellidos: text(row, "Apellidos"),
            telefono: nullable_text(row, "Telefono"),
            departamento_residencia: nullable_text(row, "DepartamentoResidencia"),
            municipio_residencia: nullable_text(row, "MunicipioResidencia"),
            categoria_interes: nullable_text(row, "CategoriaInteres"),
            modalidad_preferida: nullable_text(row, "ModalidadPreferida"),
            nivel_academico: nullable_text(row, "NivelAcademico"),
            linkedin_url: nullable_text(row, "LinkedinUrl"),
            resumen_profesional: nullable_text(row, "ResumenProfesional"),
            disponibilidad_viajar: row.get::<bool, _>("DisponibilidadViajar").unwrap_or(false),
            disponibilidad_horario_rotativo: row
                .get::<bool, _>("DisponibilidadHorarioRotativo")
                .unwrap_or(false),
            tiene_licencia_conducir: row.get::<bool, _>("TieneLicenciaConducir").unwrap_or(false),
            tipo_licencia: nullable_text(row, "TipoLicencia"),
            tiene_vehiculo_propio: row.get::<bool, _>("TieneVehiculoPropio").unwrap_or(false),
            fecha_registro: text(row, "FechaRegistro"),
        })
    }))
}

pub async fn update_candidate_profile(
    pool: &SqlPool,
    id_candidato: i64,
    nombres: &str,
    apellidos: &str,
    telefono: Option<&str>,
    departamento_residencia: Option<&str>,
    municipio_residencia: Option<&str>,
    categoria_interes: Option<&str>,
    modalidad_preferida: Option<&str>,
    nivel_academico: Option<&str>,
    linkedin_url: Option<&str>,
    resumen_profesional: Option<&str>,
    disponibilidad_viajar: bool,
    disponibilidad_horario_rotativo: bool,
    tiene_licencia_conducir: bool,
    tipo_licencia: Option<&str>,
    tiene_vehiculo_propio: bool,
) -> Result<bool, String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    let rows = client
        .query(
            "EXEC dbo.spCand_ActualizarPerfil
                @IdCandidato = @P1,
                @Nombres = @P2,
                @Apellidos = @P3,
                @Telefono = @P4,
                @DepartamentoResidencia = @P5,
                @MunicipioResidencia = @P6,
                @CategoriaInteres = @P7,
                @ModalidadPreferida = @P8,
                @NivelAcademico = @P9,
                @LinkedinUrl = @P10,
                @ResumenProfesional = @P11,
                @DisponibilidadViajar = @P12,
                @DisponibilidadHorarioRotativo = @P13,
                @TieneLicenciaConducir = @P14,
                @TipoLicencia = @P15,
                @TieneVehiculoPropio = @P16",
            &[
                &id_candidato,
                &nombres,
                &apellidos,
                &telefono,
                &departamento_residencia,
                &municipio_residencia,
                &categoria_interes,
                &modalidad_preferida,
                &nivel_academico,
                &linkedin_url,
                &resumen_profesional,
                &disponibilidad_viajar,
                &disponibilidad_horario_rotativo,
                &tiene_licencia_conducir,
                &tipo_licencia,
                &tiene_vehiculo_propio,
            ],
        )
        .await
        .map_err(|err| err.to_string())?
        .into_first_result()
        .await
        .map_err(|err| err.to_string())?;

    Ok(rows
        .first()
        .and_then(|row| row.get::<i32, _>("RegistrosAfectados"))
        .unwrap_or_default()
        > 0)
}

pub async fn list_candidate_postulations(
    pool: &SqlPool,
    id_candidato: i64,
) -> Result<Vec<Value>, String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    let rows = client
        .query(
            "EXEC dbo.spCand_Postulaciones_Listar @IdCandidato = @P1",
            &[&id_candidato],
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
                "idPostulacionCandidato": read_i64(&row, "IdPostulacionCandidato").unwrap_or_default(),
                "idVacante": row.get::<i32, _>("IdVacante").unwrap_or_default(),
                "titulo": text(&row, "Titulo"),
                "codigoVacante": text(&row, "CodigoVacante"),
                "estadoActual": text(&row, "EstadoActual"),
                "scoreIa": decimal_text(&row, "ScoreIA"),
                "scoreRh": decimal_text(&row, "ScoreRH"),
                "scoreJefe": decimal_text(&row, "ScoreJefe"),
                "fechaPostulacion": text(&row, "FechaPostulacion")
            })
        })
        .collect())
}

pub async fn apply_candidate_to_vacancy(
    pool: &SqlPool,
    id_candidato: i64,
    id_vacante: i32,
    fuente_postulacion: Option<&str>,
) -> Result<i64, String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    let rows = client
        .query(
            "EXEC dbo.spCand_Postular
                @IdCandidato = @P1,
                @IdVacante = @P2,
                @FuentePostulacion = @P3",
            &[&id_candidato, &id_vacante, &fuente_postulacion],
        )
        .await
        .map_err(|err| err.to_string())?
        .into_first_result()
        .await
        .map_err(|err| err.to_string())?;

    rows.first()
        .and_then(|row| read_i64(row, "IdPostulacionCandidato"))
        .filter(|value| *value > 0)
        .ok_or_else(|| "No se pudo registrar la postulacion del candidato".to_string())
}

pub async fn count_candidate_cv_recent_attempts(
    pool: &SqlPool,
    id_candidato: i64,
    window_seconds: u64,
    ip_origen: Option<&str>,
) -> Result<i64, String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    let window_seconds = i32::try_from(window_seconds).unwrap_or(i32::MAX);
    let rows = client
        .query(
            "EXEC dbo.spCand_Cv_ContarIntentosRecientes
                @IdCandidato = @P1,
                @SegundosVentana = @P2,
                @IpOrigen = @P3",
            &[&id_candidato, &window_seconds, &ip_origen],
        )
        .await
        .map_err(|err| err.to_string())?
        .into_first_result()
        .await
        .map_err(|err| err.to_string())?;

    Ok(rows
        .first()
        .and_then(|row| read_i64(row, "TotalIntentos"))
        .unwrap_or_default())
}

pub async fn record_candidate_cv_attempt(
    pool: &SqlPool,
    id_candidato: i64,
    id_sesion_candidato: Option<i64>,
    ip_origen: Option<&str>,
    user_agent: Option<&str>,
    nombre_original: Option<&str>,
    extension: Option<&str>,
    tamano_bytes: Option<u64>,
    hash_sha256: Option<&str>,
    resultado: &str,
    detalle: Option<&str>,
) -> Result<(), String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    let tamano_param = tamano_bytes.map(|value| i64::try_from(value).unwrap_or(i64::MAX));
    client
        .execute(
            "EXEC dbo.spCand_Cv_RegistrarIntento
                @IdCandidato = @P1,
                @IdSesionCandidato = @P2,
                @IpOrigen = @P3,
                @UserAgent = @P4,
                @NombreOriginal = @P5,
                @Extension = @P6,
                @TamanoBytes = @P7,
                @HashSha256 = @P8,
                @Resultado = @P9,
                @Detalle = @P10",
            &[
                &id_candidato,
                &id_sesion_candidato,
                &ip_origen,
                &user_agent,
                &nombre_original,
                &extension,
                &tamano_param,
                &hash_sha256,
                &resultado,
                &detalle,
            ],
        )
        .await
        .map_err(|err| err.to_string())?;
    Ok(())
}

pub async fn has_active_candidate_cv_hash(
    pool: &SqlPool,
    id_candidato: i64,
    hash_sha256: &str,
) -> Result<bool, String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    let rows = client
        .query(
            "EXEC dbo.spCand_Cv_ExisteHashActivo
                @IdCandidato = @P1,
                @HashSha256 = @P2",
            &[&id_candidato, &hash_sha256],
        )
        .await
        .map_err(|err| err.to_string())?
        .into_first_result()
        .await
        .map_err(|err| err.to_string())?;

    Ok(rows.first().is_some())
}

pub async fn register_candidate_cv_file(
    pool: &SqlPool,
    id_candidato: i64,
    nombre_original: &str,
    extension: &str,
    mime_declarado: Option<&str>,
    mime_detectado: &str,
    tamano_bytes: u64,
    hash_sha256: &str,
    ruta_storage: &str,
    origen_carga: &str,
) -> Result<i64, String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    let tamano_bytes = i64::try_from(tamano_bytes).unwrap_or(i64::MAX);
    let rows = client
        .query(
            "EXEC dbo.spCand_Cv_RegistrarArchivo
                @IdCandidato = @P1,
                @NombreOriginal = @P2,
                @Extension = @P3,
                @MimeDeclarado = @P4,
                @MimeDetectado = @P5,
                @TamanoBytes = @P6,
                @HashSha256 = @P7,
                @RutaStorage = @P8,
                @OrigenCarga = @P9",
            &[
                &id_candidato,
                &nombre_original,
                &extension,
                &mime_declarado,
                &mime_detectado,
                &tamano_bytes,
                &hash_sha256,
                &ruta_storage,
                &origen_carga,
            ],
        )
        .await
        .map_err(|err| err.to_string())?
        .into_first_result()
        .await
        .map_err(|err| err.to_string())?;

    rows.first()
        .and_then(|row| read_i64(row, "IdArchivoCandidatoCv"))
        .filter(|value| *value > 0)
        .ok_or_else(|| "No se pudo registrar el CV del candidato".to_string())
}

pub async fn get_candidate_cv_current(
    pool: &SqlPool,
    id_candidato: i64,
) -> Result<Option<CandidateCvFile>, String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    let rows = client
        .query(
            "EXEC dbo.spCand_Cv_ObtenerActual @IdCandidato = @P1",
            &[&id_candidato],
        )
        .await
        .map_err(|err| err.to_string())?
        .into_first_result()
        .await
        .map_err(|err| err.to_string())?;

    Ok(rows.first().and_then(build_candidate_cv_file))
}

pub async fn list_candidate_cv_history(
    pool: &SqlPool,
    id_candidato: i64,
) -> Result<Vec<CandidateCvFile>, String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    let rows = client
        .query(
            "EXEC dbo.spCand_Cv_ListarHistorial @IdCandidato = @P1",
            &[&id_candidato],
        )
        .await
        .map_err(|err| err.to_string())?
        .into_first_result()
        .await
        .map_err(|err| err.to_string())?;

    Ok(rows.iter().filter_map(build_candidate_cv_file).collect())
}

pub async fn record_candidate_security_attempt(
    pool: &SqlPool,
    id_candidato: Option<i64>,
    correo_normalizado: Option<&str>,
    ip_origen: Option<&str>,
    user_agent: Option<&str>,
    tipo_operacion: &str,
    resultado: &str,
    detalle: Option<&str>,
) -> Result<(), String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    client
        .execute(
            "EXEC dbo.spCand_Seg_RegistrarIntento
                @IdCandidato = @P1,
                @CorreoNormalizado = @P2,
                @IpOrigen = @P3,
                @UserAgent = @P4,
                @TipoOperacion = @P5,
                @Resultado = @P6,
                @Detalle = @P7",
            &[
                &id_candidato,
                &correo_normalizado,
                &ip_origen,
                &user_agent,
                &tipo_operacion,
                &resultado,
                &detalle,
            ],
        )
        .await
        .map_err(|err| err.to_string())?;
    Ok(())
}

pub async fn count_candidate_security_attempts(
    pool: &SqlPool,
    tipo_operacion: &str,
    window_seconds: u64,
    id_candidato: Option<i64>,
    correo_normalizado: Option<&str>,
    ip_origen: Option<&str>,
    solo_fallidos: bool,
) -> Result<i64, String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    let window_seconds = i32::try_from(window_seconds).unwrap_or(i32::MAX);
    let rows = client
        .query(
            "EXEC dbo.spCand_Seg_ContarIntentosRecientes
                @TipoOperacion = @P1,
                @SegundosVentana = @P2,
                @IdCandidato = @P3,
                @CorreoNormalizado = @P4,
                @IpOrigen = @P5,
                @SoloFallidos = @P6",
            &[
                &tipo_operacion,
                &window_seconds,
                &id_candidato,
                &correo_normalizado,
                &ip_origen,
                &solo_fallidos,
            ],
        )
        .await
        .map_err(|err| err.to_string())?
        .into_first_result()
        .await
        .map_err(|err| err.to_string())?;

    Ok(rows
        .first()
        .and_then(|row| read_i64(row, "TotalIntentos"))
        .unwrap_or_default())
}

pub async fn request_password_reset(
    pool: &SqlPool,
    correo: &str,
    token_hash: &str,
    ip_solicitud: Option<&str>,
) -> Result<Option<(i64, String, String)>, String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    let rows = client
        .query(
            "EXEC dbo.spCand_PasswordReset_Solicitar @Correo = @P1, @TokenHash = @P2, @IpSolicitud = @P3",
            &[&correo, &token_hash, &ip_solicitud],
        )
        .await
        .map_err(|err| err.to_string())?
        .into_first_result()
        .await
        .map_err(|err| err.to_string())?;

    let row = rows
        .first()
        .ok_or_else(|| "No se obtuvo respuesta del SP".to_string())?;
    let ok = row.get::<i32, _>("Ok").unwrap_or(0);
    if ok == 0 {
        return Ok(None);
    }

    Ok(Some((
        read_i64(row, "IdCandidato").unwrap_or(0),
        text(row, "Nombres"),
        text(row, "Apellidos"),
    )))
}

pub async fn validate_password_reset_token(
    pool: &SqlPool,
    token_hash: &str,
) -> Result<Option<(i64, i64)>, String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    let rows = client
        .query(
            "EXEC dbo.spCand_PasswordReset_Validar @TokenHash = @P1",
            &[&token_hash],
        )
        .await
        .map_err(|err| err.to_string())?
        .into_first_result()
        .await
        .map_err(|err| err.to_string())?;

    Ok(rows
        .first()
        .and_then(|row| Some((read_i64(row, "IdReset")?, read_i64(row, "IdCandidato")?))))
}

pub async fn complete_password_reset(
    pool: &SqlPool,
    token_hash: &str,
    new_password_hash: &str,
) -> Result<(), String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    let _ = client
        .query(
            "EXEC dbo.spCand_PasswordReset_Completar @TokenHash = @P1, @NewPasswordHash = @P2",
            &[&token_hash, &new_password_hash],
        )
        .await
        .map_err(|err| err.to_string())?
        .into_first_result()
        .await
        .map_err(|err| err.to_string())?;

    Ok(())
}

fn text(row: &Row, column: &str) -> String {
    row.get::<&str, _>(column).unwrap_or_default().to_string()
}

fn nullable_text(row: &Row, column: &str) -> Option<String> {
    row.get::<&str, _>(column)
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(ToString::to_string)
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

fn decimal_text(row: &Row, column: &str) -> String {
    row.get::<f64, _>(column)
        .map(|value| format!("{value:.2}"))
        .unwrap_or_else(|| "0.00".to_string())
}

fn build_candidate_cv_file(row: &Row) -> Option<CandidateCvFile> {
    Some(CandidateCvFile {
        id_archivo_candidato_cv: read_i64(row, "IdArchivoCandidatoCv")?,
        nombre_original: text(row, "NombreOriginal"),
        extension: text(row, "Extension"),
        mime_type: text(row, "MimeDetectado"),
        tamano_bytes: read_i64(row, "TamanoBytes").unwrap_or_default(),
        estado_archivo: text(row, "EstadoArchivo"),
        es_cv_principal: row.get::<bool, _>("EsCvPrincipal").unwrap_or(false),
        fecha_creacion: text(row, "FechaCreacion"),
        fecha_desactivacion: nullable_text(row, "FechaDesactivacion"),
    })
}

