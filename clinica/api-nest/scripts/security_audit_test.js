const API_URL = 'http://localhost:3000';

async function securityAudit() {
    console.log('🛡️ Iniciando Auditoría Profunda de Seguridad...');

    try {
        // 1. Obtener Token de Paciente
        console.log('\n[1] Probando Escalamiento de Privilegios (Paciente -> Admin)...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ carnet: 'PAC001', password: 'Paciente123!' })
        });
        const patientData = await loginRes.json();
        const patientToken = patientData.access_token;

        const forbiddenRes = await fetch(`${API_URL}/admin/usuarios`, {
            headers: { 'Authorization': `Bearer ${patientToken}` }
        });

        if (forbiddenRes.status === 403) {
            console.log('✅ BLOQUEADO: Paciente no puede acceder a /admin/usuarios (403 Forbidden)');
        } else {
            console.log('❌ VULNERABILIDAD: Paciente ACCEDIÓ a /admin/usuarios! Status:', forbiddenRes.status);
        }

        // 2. Probar Aislamiento de País (Admin NI -> Datos CR)
        console.log('\n[2] Probando Aislamiento de País (Admin NI intentando cruzar países)...');
        const adminLoginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ carnet: 'ADMIN001', password: 'Admin123!' })
        });
        const adminNiToken = (await adminLoginRes.json()).access_token;

        const uniqueCarnet = 'CR_USER_' + Date.now();
        const crossCountryRes = await fetch(`${API_URL}/admin/usuarios`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminNiToken}` 
            },
            body: JSON.stringify({
                carnet: uniqueCarnet,
                nombreCompleto: 'Hack Test',
                correo: `hack_${Date.now()}@cr.com`,
                rol: 'PACIENTE',
                pais: 'CR', // Intento de crear en otro país
                password: 'Test123!'
            })
        });
        const crossData = await crossCountryRes.json();
        
        if (crossData.user && crossData.user.pais === 'NI') {
            console.log('✅ BLOQUEADO/FORZADO: El servidor forzó el país a "NI" (País del Admin).');
        } else if (crossData.user && crossData.user.pais === 'CR') {
            console.log('❌ RIESGO: Admin de NI pudo crear un usuario en "CR".');
        } else {
            console.log('ℹ️ Respuesta creación cruzada:', crossData.message || crossData);
        }

        // 3. Probar Manipulación de IDs (Médico intentando actualizar usuario ajeno)
        console.log('\n[3] Probando Escalamiento de Datos (Update usuario de otro país)...');
        const docLoginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ carnet: 'DOC001', password: 'Medico123!' })
        });
        const docToken = (await docLoginRes.json()).access_token;

        // Intentar actualizar al ADMIN001 (que es de NI) siendo otro rol o intentando cruzar
        // Pero el doc no tiene rol ADMIN, así que debería dar 403 de base por el RolesGuard
        const updateForbiddenRes = await fetch(`${API_URL}/admin/usuarios/1`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${docToken}` 
            },
            body: JSON.stringify({ nombre_completo: 'Hacked' })
        });

        if (updateForbiddenRes.status === 403) {
            console.log('✅ BLOQUEADO: Médico no puede usar endpoints de Admin (403).');
        }

        console.log('\n🛡️ AUDITORÍA DE SEGURIDAD FINALIZADA.');

    } catch (err) {
        console.error('❌ ERROR CRÍTICO EN AUDITORÍA:', err.message);
    }
}

securityAudit();
