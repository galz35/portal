const { spawn } = require('child_process');
const path = require('path');

const services = [
  { name: 'Portal API (3110)', cwd: 'core/portal-api-nest', command: 'npm', args: ['run', 'dev'] },
  { name: 'Vacantes API (3300)', cwd: 'vacantes/vacantes-api-nest', command: 'npm', args: ['run', 'dev'] },
  { name: 'Portal WEB (5173)', cwd: 'core/portal-web', command: 'npm', args: ['run', 'dev'] },
  { name: 'Clinica WEB (3400)', cwd: 'clinica/web', command: 'npm', args: ['run', 'dev', '--', '-p', '3400'] },
  { name: 'Clinica API (3000)', cwd: 'clinica/api-nest', command: 'npm', args: ['run', 'start:dev'] },
  { name: 'Inventario WEB (3500)', cwd: 'inventario/web', command: 'npm', args: ['run', 'dev', '--', '-p', '3500'] },
  { name: 'Inventario API (3001)', cwd: 'inventario/api-nest', command: 'npm', args: ['run', 'start:dev'] }
];

console.log('🚀 Iniciando Ecosistema NestJS + React...');

services.forEach(service => {
  const child = spawn(service.command, service.args, {
    cwd: path.resolve(__dirname, service.cwd),
    shell: true,
    stdio: 'inherit'
  });

  child.on('error', (err) => {
    console.error(`❌ Error en ${service.name}:`, err);
  });

  console.log(`✅ ${service.name} arrancando en segundo plano...`);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando todos los servicios...');
  process.exit();
});
