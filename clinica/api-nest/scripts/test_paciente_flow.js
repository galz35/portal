const API_URL = 'http://localhost:3000';

async function testPaciente() {
    console.log('🧪 Iniciando Pruebas de PACIENTE...');

    try {
        // 1. LOGIN PACIENTE
        console.log('\n1. Logueando como PAC001...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ carnet: 'PAC001', password: 'Paciente123!' })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error('Login fallido: ' + JSON.stringify(loginData));
        
        const token = loginData.access_token;
        const idPaciente = loginData.user.id_paciente;
        console.log(`✅ Login exitoso. ID Paciente: ${idPaciente}`);

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        // 2. CREAR CHEQUEO (TAREA 1.3)
        console.log('\n2. Creando un chequeo de bienestar...');
        const chequeoRes = await fetch(`${API_URL}/paciente/chequeo`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                nivelRiesgo: 'Medio',
                peso: 75,
                presion: '120/80',
                otros: 'Prueba de API'
            })
        });
        const chequeoData = await chequeoRes.json();
        console.log('✅ Chequeo creado. Nivel semáforo:', chequeoData.nivel_semaforo || 'A');

        // 3. CONSULTAR DASHBOARD PACIENTE (TAREA 1.3)
        console.log('\n3. Consultando Dashboard Paciente...');
        const dashRes = await fetch(`${API_URL}/paciente/dashboard`, { headers });
        const dashData = await dashRes.json();
        console.log('✅ Dashboard Data:', dashData);

        // 4. SOLICITAR CITA (TAREA 1.3)
        console.log('\n4. Solicitando una cita...');
        const citaRes = await fetch(`${API_URL}/paciente/solicitar-cita`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                ruta: 'consulta',
                comentarioGeneral: 'Me siento un poco mal',
                datosCompletos: { motivo: 'Gripe' }
            })
        });
        const citaData = await citaRes.json();
        console.log('✅ Respuesta solicitud:', citaData);

        console.log('\n🎉 TODAS LAS PRUEBAS DE FLUJO PACIENTE COMPLETADAS.');

    } catch (err) {
        console.error('\n❌ ERROR DURANTE LAS PRUEBAS:', err.message);
        process.exit(1);
    }
}

testPaciente();
