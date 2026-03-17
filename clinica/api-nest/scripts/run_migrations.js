const fs = require('fs');
const path = require('path');
const sql = require('mssql');
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

async function executeSqlFile(filePath, pool) {
    console.log(`Ejecutando script: ${filePath}`);
    const sqlString = fs.readFileSync(filePath, 'utf8');
    // MSSQL Node adapter no soporta GO como delimitador para múltiples batches en una misma llamada si no se usa batch()
    // Pero mssql soporta `request.batch(query)`

    const batches = sqlString.split(/^GO/im);
    for (let batch of batches) {
        if (batch.trim().length > 0) {
            try {
                await pool.request().batch(batch);
            } catch (err) {
                console.error('Error al ejecutar batch:', batch.substring(0, 100) + '...');
                console.error(err);
                throw err;
            }
        }
    }
}

async function run() {
    try {
        console.log('Conectando a SQL Server...', config.database);
        const pool = await sql.connect(config);
        console.log('✅ Conectado.');

        const scriptsPath = path.join(__dirname);
        const files = ['01_create_tables.sql', '02_create_procedures.sql', '03_create_indexes.sql'];

        for (const file of files) {
            await executeSqlFile(path.join(scriptsPath, file), pool);
        }

        // Ejecutar semilla
        console.log('Ejecutando Semilla de roles y permisos iniciales...');
        await pool.request().execute('sp_SeedData');
        console.log('✅ Semilla ejecutada.');

        console.log('🎉 Migración completada.');
        await pool.close();
    } catch (err) {
        console.error('❌ Error en la migración:', err);
        process.exit(1);
    }
}

run();
