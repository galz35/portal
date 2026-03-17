const sql = require('mssql');

const config = {
    user: 'sa',
    password: 'TuPasswordFuerte!2026',
    server: '190.56.16.85',
    options: { encrypt: false, trustServerCertificate: true }
};

async function checkRoutes() {
    const pool = await sql.connect(config);
    const r = await pool.request().query("SELECT Codigo, Nombre, Ruta FROM PortalCore.dbo.AplicacionSistema WHERE Activo = 1");
    console.log(JSON.stringify(r.recordset, null, 2));
    sql.close();
}

checkRoutes().catch(console.error);
