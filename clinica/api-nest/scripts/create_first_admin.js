const sql = require('mssql');
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const config = {
    user: process.env.MSSQL_USER || 'sa',
    password: process.env.MSSQL_PASSWORD,
    server: process.env.MSSQL_HOST || '190.56.16.85',
    port: parseInt(process.env.MSSQL_PORT || '1433', 10),
    database: process.env.MSSQL_DATABASE || 'medicoBD',
    options: {
        encrypt: process.env.MSSQL_ENCRYPT === 'true',
        trustServerCertificate: process.env.MSSQL_TRUST_CERT === 'true',
    },
};

async function run() {
    try {
        const pool = await sql.connect(config);
        console.log('✅ Conectado para crear primer admin.');

        const carnet = 'ADMIN001';
        const pass = 'Admin123!';
        const hash = await bcrypt.hash(pass, 10);

        // Buscar ID del rol ADMIN
        const roles = await pool.request().query("SELECT id_rol FROM roles WHERE nombre = 'ADMIN'");
        if (roles.recordset.length === 0) {
            throw new Error('Rol ADMIN no encontrado. ¿Ejecutaste sp_SeedData?');
        }
        const idRol = roles.recordset[0].id_rol;

        // Limpiar si ya existe
        await pool.request().input('Carnet', sql.VarChar, carnet).query("DELETE FROM usuarios WHERE carnet = @Carnet");

        // Insertar
        await pool.request()
            .input('Carnet', sql.VarChar, carnet)
            .input('Pass', sql.VarChar, hash)
            .input('Rol', sql.Int, idRol)
            .query(`
                INSERT INTO usuarios (carnet, password_hash, nombre_completo, correo, id_rol, pais, estado)
                VALUES (@Carnet, @Pass, 'Administrador Inicial', 'admin@claro.com.ni', @Rol, 'NI', 'A')
            `);

        console.log(`🚀 Usuario Admin creado: ${carnet} / ${pass}`);
        await pool.close();
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

run();
