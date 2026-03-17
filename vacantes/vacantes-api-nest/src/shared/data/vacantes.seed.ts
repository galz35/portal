export type VacanteRecord = {
  idVacante: number;
  codigoVacante: string;
  slug: string;
  titulo: string;
  descripcion: string;
  requisitos: string;
  ubicacion: string;
  codigoPais: string;
  modalidad: string;
  estadoActual: string;
  area: string;
  prioridad: string;
  esPublica: boolean;
  esExcepcionSinRequisicion: boolean;
  fechaLimiteRegularizacion: string;
};

export type RequisicionRecord = {
  idRequisicion: number;
  codigoRequisicion: string;
  idPuesto: number;
  tituloPuesto: string;
  area: string;
  solicitante: string;
  prioridad: string;
  estadoActual: string;
  tipoNecesidad: string;
  fechaSolicitud: string;
  fechaLimiteRegularizacion: string;
  permitePublicacionSinCompletar: boolean;
};

export type DescriptorRecord = {
  idDescriptorPuesto: number;
  idPuesto: number;
  tituloPuesto: string;
  versionDescriptor: number;
  objetivoPuesto: string;
  competenciasClave: string[];
  vigenciaDesde: string;
  estadoActual: string;
};

export type PostulacionRecord = {
  idPostulacion: number;
  idVacante: number;
  idPersona: number;
  titulo: string;
  nombreCandidato: string;
  estadoActual: string;
  scoreIa: number;
  scoreRh: number;
  tipoPostulacion: string;
  codigoPais: string;
  fechaPostulacion: string;
};

export type ListaNegraRecord = {
  idListaNegra: number;
  idPersona: number;
  motivo: string;
  categoria?: string;
  fechaInicio: string;
  fechaFin?: string;
  permanente: boolean;
  idCuentaPortalRegistro: number;
};

export type TernaRecord = {
  idTerna: number;
  idVacante: number;
  idCuentaPortalCreador: number;
  fechaCreacion: string;
};

export const INITIAL_VACANTES: VacanteRecord[] = [
  {
    idVacante: 2001,
    codigoVacante: 'VAC-2001',
    slug: 'ejecutivo-ventas-empresariales',
    titulo: 'Ejecutivo de ventas empresariales',
    descripcion: 'Gestiona cartera empresarial y oportunidades consultivas.',
    requisitos: 'Ventas consultivas, CRM y negociacion.',
    ubicacion: 'Managua, Nicaragua',
    codigoPais: 'NI',
    modalidad: 'HIBRIDA',
    estadoActual: 'PUBLICADA',
    area: 'Comercial',
    prioridad: 'ALTA',
    esPublica: true,
    esExcepcionSinRequisicion: false,
    fechaLimiteRegularizacion: '2026-03-20',
  },
  {
    idVacante: 2002,
    codigoVacante: 'VAC-2002',
    slug: 'analista-reclutamiento-digital',
    titulo: 'Analista de reclutamiento digital',
    descripcion: 'Opera fuentes, filtros y seguimiento del pipeline de talento.',
    requisitos: 'ATS, entrevistas y analitica de reclutamiento.',
    ubicacion: 'San Jose, Costa Rica',
    codigoPais: 'CR',
    modalidad: 'REMOTA',
    estadoActual: 'BORRADOR',
    area: 'Recursos Humanos',
    prioridad: 'MEDIA',
    esPublica: false,
    esExcepcionSinRequisicion: true,
    fechaLimiteRegularizacion: '2026-03-18',
  },
];

export const INITIAL_REQUISICIONES: RequisicionRecord[] = [
  {
    idRequisicion: 3001,
    codigoRequisicion: 'REQ-3001',
    idPuesto: 6001001,
    tituloPuesto: 'Ejecutivo de ventas empresariales',
    area: 'Comercial',
    solicitante: 'Ana Portal',
    prioridad: 'ALTA',
    estadoActual: 'PENDIENTE_JEFE',
    tipoNecesidad: 'RENUNCIA',
    fechaSolicitud: '2026-03-08',
    fechaLimiteRegularizacion: '2026-03-20',
    permitePublicacionSinCompletar: true,
  },
];

export const INITIAL_DESCRIPTORES: DescriptorRecord[] = [
  {
    idDescriptorPuesto: 4001,
    idPuesto: 6001001,
    tituloPuesto: 'Ejecutivo de ventas empresariales',
    versionDescriptor: 1,
    objetivoPuesto: 'Captar y sostener cartera empresarial alineada a objetivos comerciales.',
    competenciasClave: ['Ventas consultivas', 'CRM', 'Negociacion'],
    vigenciaDesde: '2026-03-01',
    estadoActual: 'VIGENTE',
  },
];

export const INITIAL_POSTULACIONES: PostulacionRecord[] = [
  {
    idPostulacion: 5001,
    idVacante: 2001,
    idPersona: 502,
    titulo: 'Ejecutivo de ventas empresariales',
    nombreCandidato: 'Luis Candidato',
    estadoActual: 'NUEVA',
    scoreIa: 84,
    scoreRh: 0,
    tipoPostulacion: 'INTERNA',
    codigoPais: 'NI',
    fechaPostulacion: '2026-03-08',
  },
];
