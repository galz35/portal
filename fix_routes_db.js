const sql = require('mssql');

const config = {
    user: 'sa',
    password: 'TuPasswordFuerte!2026',
    server: '190.56.16.85',
    options: { encrypt: false, trustServerCertificate: true },
    database: 'PortalCore'
};

async function checkAndFix() {
    try {
        let pool = await sql.connect(config);
        console.log("--- RUTAS ACTUALES EN BD ---");
        let result = await pool.request().query("SELECT Codigo, Nombre, Ruta FROM AplicacionSistema WHERE Activo = 1");
        result.recordset.forEach(app => {
            console.log(`${app.Codigo}: ${app.Ruta} (${app.Nombre})`);
        });

        console.log("\n--- CORRIGIENDO RUTAS ---");
        const fixes = [
            { code: 'portal', url: 'http://localhost:5173' },
            { code: 'clinica', url: 'http://localhost:5174' },
            { code: 'planer', url: 'http://localhost:5175' },
            { code: 'inventario', url: 'http://localhost:5176' },
            { code: 'vacantes', url: 'http://localhost:5177/app/vacantes/rh/dashboard' }
        ];

        for (const fix of fixes) {
            await pool.request()
                .input('ruta', sql.VarChar, fix.url)
                .input('codigo', sql.VarChar, fix.code)
                .query("UPDATE AplicacionSistema SET Ruta = @ruta WHERE Codigo = @codigo");
            console.log(`[OK] ${fix.code} -> ${fix.url}`);
        }

        console.log("\n--- VERIFICACIÓN FINAL ---");
        let final = await pool.request().query("SELECT Codigo, Nombre, Ruta FROM AplicacionSistema WHERE Activo = 1");
        final.recordset.forEach(app => {
            console.log(`${app.Codigo}: ${app.Ruta}`);
        });

        await sql.close();
    } catch (err) {
        console.error(err);
    }
}

checkAndFix();
