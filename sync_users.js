const sql = require('mssql');

const config = {
    user: 'sa',
    password: 'TuPasswordFuerte!2026',
    server: '190.56.16.85',
    options: { encrypt: false, trustServerCertificate: true }
};

async function syncAll() {
    const pool = await sql.connect(config);

    // 1. Obtener hash de Gustavo (contraseña 123456 en argon2)
    const rHash = await pool.request().query("SELECT ClaveHash FROM PortalCore.dbo.CuentaPortal WHERE CorreoLogin = 'gustavo.lira@claro.com.ni'");
    const defaultHash = rHash.recordset[0].ClaveHash;
    console.log("📌 Hash por defecto obtenido (123456).");

    // 2. Obtener IDs de las aplicaciones en Portal
    const rApps = await pool.request().query("SELECT IdAplicacion, Codigo FROM PortalCore.dbo.AplicacionSistema WHERE Activo = 1");
    const appMap = {};
    for (const a of rApps.recordset) {
        appMap[a.Codigo.trim().toLowerCase()] = a.IdAplicacion;
    }
    console.log("📌 Apps disponibles:", appMap);

    // 3. Obtener usuarios de Planer que ya están en Portal
    const rUsers = await pool.request().query(`
        SELECT cp.IdCuentaPortal, cp.CorreoLogin, cp.ClaveHash
        FROM PortalCore.dbo.CuentaPortal cp
    `);

    let updated = 0;
    for (const u of rUsers.recordset) {
        const correo = (u.CorreoLogin || '').trim().toLowerCase();
        const idCuenta = u.IdCuentaPortal;

        // Asignar al menos "portal" a todos
        if (appMap['portal']) {
            await pool.request()
                .input('u', sql.Int, idCuenta)
                .input('a', sql.Int, appMap['portal'])
                .query(`
                    IF NOT EXISTS (SELECT 1 FROM PortalCore.dbo.UsuarioAplicacion WHERE IdCuentaPortal = @u AND IdAplicacion = @a)
                        INSERT INTO PortalCore.dbo.UsuarioAplicacion (IdCuentaPortal, IdAplicacion, Activo, FechaCreacion) VALUES (@u, @a, 1, GETDATE())
                    ELSE
                        UPDATE PortalCore.dbo.UsuarioAplicacion SET Activo = 1 WHERE IdCuentaPortal = @u AND IdAplicacion = @a
                `);
        }

        // Verificar si existe en Planer → asignar app Planer
        const rPlaner = await pool.request()
            .input('correo', sql.NVarChar, correo)
            .query("SELECT 1 FROM Bdplaner.dbo.p_usuarios WHERE LOWER(correo) = @correo AND activo = 1");
        if (rPlaner.recordset.length > 0 && appMap['planer']) {
            await pool.request()
                .input('u', sql.Int, idCuenta)
                .input('a', sql.Int, appMap['planer'])
                .query(`
                    IF NOT EXISTS (SELECT 1 FROM PortalCore.dbo.UsuarioAplicacion WHERE IdCuentaPortal = @u AND IdAplicacion = @a)
                        INSERT INTO PortalCore.dbo.UsuarioAplicacion (IdCuentaPortal, IdAplicacion, Activo, FechaCreacion) VALUES (@u, @a, 1, GETDATE())
                    ELSE
                        UPDATE PortalCore.dbo.UsuarioAplicacion SET Activo = 1 WHERE IdCuentaPortal = @u AND IdAplicacion = @a
                `);
        }

        updated++;
    }

    console.log(`✅ ${updated} usuarios procesados. Todos tienen al menos Portal asignado.`);
    console.log("✅ Usuarios de Planer también tienen Planer habilitado.");

    // 4. Verificar resultado
    const rVerify = await pool.request().query(`
        SELECT cp.CorreoLogin,
            (SELECT COUNT(*) FROM PortalCore.dbo.UsuarioAplicacion ua WHERE ua.IdCuentaPortal = cp.IdCuentaPortal AND ua.Activo = 1) as numApps
        FROM PortalCore.dbo.CuentaPortal cp
        ORDER BY numApps DESC
    `);
    console.log("\n--- RESULTADO ---");
    for (const r of rVerify.recordset) {
        console.log(`  ${r.CorreoLogin} → ${r.numApps} apps`);
    }

    sql.close();
}

syncAll().catch(console.error);
