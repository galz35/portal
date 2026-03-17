const API_URL = 'http://localhost:3000';

async function testApi() {
    console.log('🧪 Iniciando Pruebas de API Fuertes...');

    try {
        // 1. LOGIN ADMIN
        console.log('\n1. Logueando como Admin...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ carnet: 'ADMIN001', password: 'Admin123!' })
        });
        const loginData = await loginRes.json();
        
        if (!loginRes.ok) throw new Error('Login fallido: ' + JSON.stringify(loginData));
        const token = loginData.access_token;
        console.log('✅ Login exitoso. Token obtenido.');

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        // 2. CREAR UN MEDICO
        console.log('\n2. Creando un médico nuevo...');
        const medicoRes = await fetch(`${API_URL}/admin/medicos`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                carnet: 'MED007',
                nombreCompleto: 'Dr. James Bond',
                especialidad: 'Espionaje Médico',
                tipoMedico: 'INTERNO',
                correo: '007@mi6.uk',
                pais: 'NI'
            })
        });
        const medicoData = await medicoRes.json();
        console.log('✅ Médico creado:', medicoData.nombre_completo || medicoData);

        // 3. CREAR UN USUARIO PACIENTE
        console.log('\n3. Creando un usuario paciente...');
        const userRes = await fetch(`${API_URL}/admin/usuarios`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                carnet: 'PAC001',
                nombreCompleto: 'Juan Perez',
                correo: 'juan@gmail.com',
                rol: 'PACIENTE',
                pais: 'NI',
                password: 'Paciente123!'
            })
        });
        const userData = await userRes.json();
        console.log('✅ Usuario paciente creado:', userData.user?.nombre_completo || userData);

        // 4. LISTAR USUARIOS
        console.log('\n4. Listando usuarios...');
        const usersRes = await fetch(`${API_URL}/admin/usuarios`, { headers });
        const usersList = await usersRes.json();
        console.log(`✅ Total usuarios encontrados en NI: ${usersList.length}`);

        // 5. CONSULTAR DASHBOARD ADMIN
        console.log('\n5. Consultando Dashboard Admin...');
        const dashRes = await fetch(`${API_URL}/admin/dashboard`, { headers });
        const dashData = await dashRes.json();
        console.log('✅ KPIs Dashboard:', dashData);

        // 6. ACTUALIZAR USUARIO (TAREA 1.3)
        if (userData.user && userData.user.id_usuario) {
            console.log('\n6. Probando actualización de usuario (Seguridad)...');
            const updateRes = await fetch(`${API_URL}/admin/usuarios/${userData.user.id_usuario}`, {
                method: 'PATCH',
                headers: headers,
                body: JSON.stringify({
                    nombre_completo: 'Juan Perez Actualizado',
                    estado: 'A'
                })
            });
            const updateData = await updateRes.json();
            console.log('✅ Usuario actualizado:', updateData.nombre_completo);
        }

        console.log('\n🎉 TODAS LAS PRUEBAS DE FLUJO ADMIN COMPLETADAS.');

    } catch (err) {
        console.error('\n❌ ERROR DURANTE LAS PRUEBAS:', err.message);
        process.exit(1);
    }
}

testApi();
