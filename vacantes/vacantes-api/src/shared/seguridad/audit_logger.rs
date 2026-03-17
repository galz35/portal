use crate::db_pool::SqlPool;

pub async fn registrar_evento_vacantes(
    pool: &SqlPool,
    id_cuenta_portal: Option<i32>,
    usuario: Option<&str>,
    evento: &str,
    modulo: Option<&str>,
    exitoso: bool,
    detalle: Option<&str>,
    ip: Option<&str>,
    user_agent: Option<&str>,
) -> Result<(), String> {
    let mut client = pool.get().await.map_err(|err| err.to_string())?;
    client
        .execute(
            "INSERT INTO dbo.AuditoriaAcceso (
                IdCuentaPortal,
                Usuario,
                Evento,
                Modulo,
                Exitoso,
                Detalle,
                Ip,
                UserAgent
            )
            VALUES (
                @P1, @P2, UPPER(@P3), @P4, @P5, @P6, @P7, @P8
            )",
            &[
                &id_cuenta_portal,
                &usuario,
                &evento,
                &modulo,
                &exitoso,
                &detalle,
                &ip,
                &user_agent,
            ],
        )
        .await
        .map_err(|err| err.to_string())?;
    Ok(())
}

