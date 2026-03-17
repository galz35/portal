export type DemoIdentity = {
  idCuentaPortal: number;
  idPersona: number;
  usuario: string;
  clave: string;
  nombre: string;
  apps: string[];
  permisos: string[];
};

export const DEMO_USERS: DemoIdentity[] = [
  {
    idCuentaPortal: 1001,
    idPersona: 501,
    usuario: 'empleado.portal',
    clave: 'Portal123*',
    nombre: 'Ana Portal',
    apps: ['portal', 'vacantes'],
    permisos: ['app.portal', 'app.vacantes', 'vacantes.rh.ver'],
  },
  {
    idCuentaPortal: 1002,
    idPersona: 502,
    usuario: 'candidato.demo',
    clave: 'Portal123*',
    nombre: 'Luis Candidato',
    apps: ['vacantes'],
    permisos: ['app.vacantes'],
  },
];
