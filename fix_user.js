const sql = require('mssql');

const config = {
    user: 'sa',
    password: 'TuPasswordFuerte!2026',
    server: '190.56.16.85',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

async function fixUsers() {
    try {
        let pool = await sql.connect(config);
        
        let r = await pool.request().query("SELECT ClaveHash FROM PortalCore.dbo.CuentaPortal WHERE CorreoLogin = 'gustavo.lira@claro.com.ni'");
        if (r.recordset.length === 0) {
           console.log("Gustavo not found.");
           return;
        }
        let hash = r.recordset[0].ClaveHash;
        
        await pool.request()
            .input('hash', sql.NVarChar, hash)
            .query("UPDATE PortalCore.dbo.CuentaPortal SET ClaveHash = @hash, Activo = 1, Bloqueado = 0 WHERE CorreoLogin = 'candida.sanchez@claro.com.ni'");
        console.log("PortalCore: Candida's password synced to 123456.");

        let rPlaner = await pool.request().query("SELECT * FROM Bdplaner.dbo.p_usuarios WHERE LOWER(correo) = 'candida.sanchez@claro.com.ni'");
        
        if (rPlaner.recordset.length > 0) {
            await pool.request().query("UPDATE Bdplaner.dbo.p_usuarios SET activo = 1 WHERE LOWER(correo) = 'candida.sanchez@claro.com.ni'");
            console.log("Planer: Candida was enabled.");
        } else {
             let rPersona = await pool.request().query("SELECT p.Nombres, p.PrimerApellido, cp.Usuario, cp.CorreoLogin, cp.Carnet FROM PortalCore.dbo.CuentaPortal cp JOIN PortalCore.dbo.Persona p ON p.IdPersona = cp.IdPersona WHERE cp.CorreoLogin = 'candida.sanchez@claro.com.ni'");
             if(rPersona.recordset.length > 0) {
                 let usr = rPersona.recordset[0];
                 let name = usr.Nombres + ' ' + usr.PrimerApellido;
                 await pool.request()
                    .input('usr', sql.NVarChar, usr.Usuario)
                    .input('name', sql.NVarChar, name)
                    .input('correo', sql.NVarChar, usr.CorreoLogin)
                    .input('carnet', sql.NVarChar, usr.Carnet)
                    .query("INSERT INTO Bdplaner.dbo.p_usuarios (nombre, nombreCompleto, correo, activo, rolGlobal, idRol, carnet) VALUES (@usr, @name, @correo, 1, 'USER', 2, @carnet)");
                console.log("Planer: Cándida inserted successfully.");
             }
        }
        console.log("ALL DONE!");
    } catch (err) {
        console.error(err);
    } finally {
        sql.close();
    }
}

fixUsers();
