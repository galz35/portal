const API_URL = 'http://127.0.0.1:3002';

async function runStrongTests() {
  console.log(`\n🔥 INICIANDO AUDITORIA FUERTE: VACANTES API (${API_URL})\n`);

  const results = [];
  const runTest = async (name, fn) => {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      results.push({ name, pass: true });
    } catch (err) {
      console.log(`❌ [FAIL] ${name}`);
      console.log(`   👉 ${err.message}`);
      results.push({ name, pass: false, error: err.message });
    }
  };

  // 1. Salud
  await runTest('Health Check', async () => {
    const res = await fetch(`${API_URL}/api/health`);
    const body = await res.json();
    if (res.status !== 200 || body.status !== 'ok') throw new Error(`Status ${res.status}`);
  });

  // 2. Filtros Públicos (Estructura { items: [...] })
  let sampleSlug = '';
  await runTest('Vacantes - Listar Públicas (200)', async () => {
    const res = await fetch(`${API_URL}/api/vacantes/publicas`);
    const body = await res.json();
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!Array.isArray(body.items)) throw new Error('Data is not in "items" property');
    if (body.items.length > 0) sampleSlug = body.items[0].slug;
  });

  if (sampleSlug) {
    await runTest(`Vacantes - Detalle por Slug (${sampleSlug})`, async () => {
        const res = await fetch(`${API_URL}/api/vacantes/publicas/${sampleSlug}`);
        const body = await res.json();
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
        if (body.slug !== sampleSlug) throw new Error('Slug mismatch');
    });
  }

  // 3. Candidatos
  await runTest('Candidatos - Rechazar Login Inválido (401)', async () => {
    const res = await fetch(`${API_URL}/api/candidatos/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: 'fake@candidate.com', clave: 'password123' })
    });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  // 4. Observabilidad
  await runTest('Observabilidad - Snapshot (200)', async () => {
    const res = await fetch(`${API_URL}/api/observabilidad/snapshot`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
  });

  console.log(`\n--- RESUMEN VACANTES API: ${results.filter(r => r.pass).length}/${results.length} ---`);
}

runStrongTests();
