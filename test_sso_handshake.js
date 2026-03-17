const PORTAL_API = 'http://127.0.0.1:3001';
const VACANTES_API = 'http://127.0.0.1:3002';

async function testSSO() {
  console.log('--- 🧪 PROBANDO HANDSHAKE SSO PORTAL -> VACANTES ---');

  try {
    // 1. Simular Login en Portal (Usando credenciales enviadas por el usuario antes)
    console.log('1. Autenticando en Portal...');
    const loginRes = await fetch(`${PORTAL_API}/api/auth/login-empleado`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: 'empleado.portal', clave: 'TuPasswordFuerte!2026' }) // Usuario de test central
    });

    if (loginRes.status !== 200) {
      const error = await loginRes.json();
      throw new Error(`Login fallido: ${error.message || loginRes.statusText}`);
    }

    // Extraer cookies de la respuesta
    const setCookie = loginRes.headers.get('set-cookie');
    if (!setCookie) throw new Error('No se recibio cookie de sesion del Portal');
    
    // El portal_sid es lo que necesitamos pasar a Vacantes
    const portalSid = setCookie.split(';').find(c => c.trim().startsWith('portal_sid='));
    console.log('✅ Sesion obtenida del Portal.');

    // 2. Llamar a Vacantes usando la cookie del Portal
    console.log('2. Validando identidad en Vacantes (Introspeccion)...');
    // Usamos un endpoint de Vacantes que requiera estar logueado en el Portal
    const vacantesRes = await fetch(`${VACANTES_API}/api/candidatos/me`, {
      headers: { 
        'Cookie': portalSid,
        'Accept': 'application/json'
      }
    });

    const body = await vacantesRes.json();
    
    if (vacantesRes.status === 200) {
      console.log('🚀 ¡IDENTIDAD VALIDADA EN VACANTES!');
      console.log('--------------------------------------');
      console.log('👤 Nombre:', body.perfil?.nombres || body.perfil?.nombre);
      console.log('📧 Correo:', body.perfil?.correo);
      console.log('🆔 Carnet:', body.perfil?.carnet || body.perfil?.id_externo);
      console.log('--------------------------------------');
      console.log('✅ El SSO y el contrato unificado funcionan perfectamente.');
    } else {
      console.error('❌ Error en Vacantes:', vacantesRes.status, body);
    }

  } catch (err) {
    console.error('💥 Error durante la prueba:', err.message);
  }
}

testSSO();
