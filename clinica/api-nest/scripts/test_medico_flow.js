const API_URL = 'http://localhost:3000';

async function testMedico() {
    console.log('🧪 Iniciando Pruebas de MEDICO (Flujo Completo)...');

    try {
        // 1. LOGIN ADMIN para crear usuario médico
        console.log('\n1. Verificando Usuario Médico via Admin (crear si no existe)...');
        const adminLoginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ carnet: 'ADMIN001', password: 'Admin123!' })
        });
        const adminToken = (await adminLoginRes.json()).access_token;

        await fetch(`${API_URL}/admin/usuarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
            body: JSON.stringify({
                carnet: 'DOC001',
                nombreCompleto: 'Dr. Strange',
                correo: 'strange@marv.el',
                rol: 'MEDICO',
                pais: 'NI',
                password: 'Medico123!'
            })
        });

        // 2. LOGIN MEDICO
        console.log('\n2. Logueando como DOC001...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ carnet: 'DOC001', password: 'Medico123!' })
        });
        const loginData = await loginRes.json();
        const token = loginData.access_token;
        const idMedico = loginData.user.id_medico;
        console.log(`✅ Login exitoso. ID Medico: ${idMedico}`);

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        // 3. CONSULTAR AGENDA (Casos Abiertos)
        console.log('\n3. Consultando Agenda de Casos Abiertos (agenda-citas)...');
        const agendaRes = await fetch(`${API_URL}/medico/agenda-citas`, { headers });
        const agenda = await agendaRes.json();
        
        if (!Array.isArray(agenda)) {
            console.log('❌ Error: El resultado de agenda no es un array:', agenda);
            return;
        }
        
        console.log(`✅ Casos encontrados: ${agenda.length}`);
        
        if (agenda.length > 0) {
            const caso = agenda[0];
            const idCaso = caso.id_caso;

            // 4. AGENDAR CITA
            console.log(`\n4. Agendando cita para el caso ${idCaso} (agenda-citas/agendar)...`);
            const citaRes = await fetch(`${API_URL}/medico/agenda-citas/agendar`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    idCaso: idCaso,
                    idMedico: idMedico,
                    fechaCita: '2026-03-15',
                    horaCita: '10:00 AM'
                })
            });
            const citaData = await citaRes.json();
            const idCita = citaData.id_cita;
            console.log(`✅ Cita agendada. ID: ${idCita}`);

            // 5. REGISTRAR ATENCION
            console.log(`\n5. Realizando Atención Médica para la cita ${idCita} (atencion)...`);
            const atencionRes = await fetch(`${API_URL}/medico/atencion`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    idCita: idCita,
                    idMedico: idMedico,
                    diagnosticoPrincipal: 'Infección leve detectada en prueba de API',
                    planTratamiento: 'Reposo y mucha agua',
                    pesoKg: 70,
                    alturaM: 1.75
                })
            });
            const atencionData = await atencionRes.json();
            console.log('✅ Atención registrada con éxito:', atencionData.id_atencion || 'OK');
        }

        console.log('\n🎉 TODAS LAS PRUEBAS DE FLUJO MEDICO COMPLETADAS.');

    } catch (err) {
        console.error('\n❌ ERROR DURANTE LAS PRUEBAS:', err.message);
        process.exit(1);
    }
}

testMedico();
