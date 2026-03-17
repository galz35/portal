import { getCsrfTokenFromCookie } from "../security/csrf";

export type VacantePublica = {
  idVacante: number;
  codigoVacante: string;
  slug: string;
  titulo: string;
  ubicacion: string;
  codigoPais: string;
  modalidad: string;
  descripcion?: string;
  requisitos?: string;
  area?: string;
  departamento?: string;
  tipoVacante?: string;
  nivelExperiencia?: string;
  salarioMin?: number | null;
  salarioMax?: number | null;
  fechaPublicacion?: string;
};

export type RhVacante = {
  idVacante: number;
  codigoVacante: string;
  titulo: string;
  estadoActual: string;
  ubicacion: string;
  area?: string;
  departamento?: string;
  idResponsableRh?: number;
};

export type RhDashboard = {
  kpis: {
    vacantesPublicadas: number;
    requisicionesPendientes: number;
    descriptoresVigentes: number;
    vacantesEnExcepcion: number;
  };
  pendientes: Array<{
    idRequisicion: number;
    codigoRequisicion: string;
    tituloPuesto: string;
    estadoActual: string;
  }>;
};

export type RequisicionRh = {
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

export type DescriptorPuestoRh = {
  idDescriptorPuesto: number;
  idPuesto: number;
  tituloPuesto: string;
  versionDescriptor: number;
  objetivoPuesto: string;
  competenciasClave: string[];
  vigenciaDesde: string;
  estadoActual: string;
};

export type PostulacionRh = {
  idPostulacion: number;
  idVacante: number;
  idPersona?: number | null;
  idCandidato?: number | null;
  titulo: string;
  nombreCandidato: string;
  estadoActual: string;
  scoreIa: number;
  scoreRh: number;
  tipoPostulacion: string;
  origenPostulacion: string;
  codigoPais: string;
  fechaPostulacion: string;
  departamentoResidencia?: string | null;
  municipioResidencia?: string | null;
  categoriaInteres?: string | null;
  modalidadPreferida?: string | null;
  nivelAcademico?: string | null;
  disponibilidadViajar?: boolean | null;
  disponibilidadHorarioRotativo?: boolean | null;
  tieneLicenciaConducir?: boolean | null;
  tipoLicencia?: string | null;
  tieneVehiculoPropio?: boolean | null;
};

export type RhCvArchivo = {
  idArchivoPersona?: number;
  idArchivoCandidatoCv?: number;
  nombreOriginal: string;
  extension: string;
  mimeType?: string;
  tamanoBytes: number;
  estadoArchivo: string;
  esCvPrincipal?: boolean;
  fechaCreacion: string;
  fechaDesactivacion?: string | null;
};

export type RhAnalisisIa = {
  idAnalisisCvIa: number;
  idVacante?: number | null;
  idArchivoPersona: number;
  motorIa: string;
  versionModelo: string;
  versionPrompt: string;
  resumenCandidato: string;
  fortalezas: string[];
  debilidades: string[];
  alertas: string[];
  scoreTotal?: number | null;
  scoreHabilidades?: number | null;
  scoreExperiencia?: number | null;
  scoreEducacion?: number | null;
  scoreContexto?: number | null;
  fueExitoso: boolean;
  errorTecnico?: string | null;
  esVigente: boolean;
  fechaAnalisis: string;
  perfilNormalizado?: {
    nombreCompletoInferido?: string | null;
    correoInferido?: string | null;
    telefonoInferido?: string | null;
    experienciaAnios?: number | null;
    nivelAcademico?: string | null;
    habilidadesJson?: string | null;
    idiomasJson?: string | null;
    certificacionesJson?: string | null;
  };
};

export type RhPostulacionDetalle = {
  ok: boolean;
  origenPostulacion: string;
  postulacion: {
    idPostulacion: number;
    idVacante: number;
    idPersona?: number | null;
    idCandidato?: number | null;
    titulo: string;
    codigoVacante: string;
    codigoPais: string;
    modalidad?: string;
    tipoVacante?: string;
    estadoActual: string;
    scoreIa: number;
    scoreRh: number;
    scoreJefe?: number | null;
    fechaPostulacion: string;
    origenPostulacion: string;
  };
  candidato?: {
    idPersona?: number;
    idCandidato?: number;
    nombre: string;
    correo?: string | null;
    telefono?: string | null;
    departamentoResidencia?: string | null;
    municipioResidencia?: string | null;
    categoriaInteres?: string | null;
    modalidadPreferida?: string | null;
    nivelAcademico?: string | null;
    linkedinUrl?: string | null;
    resumenProfesional?: string | null;
    disponibilidadViajar?: boolean;
    disponibilidadHorarioRotativo?: boolean;
    tieneLicenciaConducir?: boolean;
    tipoLicencia?: string | null;
    tieneVehiculoPropio?: boolean;
    cargo?: string | null;
    empresa?: string | null;
    departamento?: string | null;
    pais?: string | null;
    jefe?: string | null;
    fechaRegistro?: string | null;
  } | null;
  cv: {
    actual?: RhCvArchivo | null;
    historial: RhCvArchivo[];
  };
  analisisIa: {
    disponible: boolean;
    actual?: RhAnalisisIa | null;
    historial: RhAnalisisIa[];
    nota?: string | null;
  };
};

export type ReportesRh = {
  resumen: {
    vacantesActivas: number;
    vacantesOcupadas: number;
    vacantesCerradas: number;
    vacantesEnExcepcion: number;
    totalPostulaciones: number;
  };
  tiposPostulacion: Array<{
    tipoPostulacion: string;
    total: number;
  }>;
  postulacionesPorPais: Array<{
    codigoPais: string;
    totalPostulaciones: number;
  }>;
  tiemposProceso: {
    promedioDiasAperturaAOcupada: number;
    promedioDiasPostulacionAContratacion: number;
  };
};

export type CrearVacanteRhRequest = {
  codigo_vacante: string;
  titulo: string;
  descripcion: string;
  requisitos?: string;
  area?: string;
  gerencia?: string;
  departamento?: string;
  tipo_vacante: string;
  modalidad?: string;
  ubicacion?: string;
  codigo_pais: string;
  nivel_experiencia?: string;
  salario_min?: number;
  salario_max?: number;
  acepta_internos: boolean;
  es_publica: boolean;
  cantidad_plazas: number;
  prioridad?: string;
  id_solicitante?: number;
  id_responsable_rh?: number;
  id_requisicion_personal?: number;
  id_descriptor_puesto?: number;
  es_excepcion_sin_requisicion: boolean;
  motivo_excepcion?: string;
  fecha_limite_regularizacion?: string;
};

export type CrearRequisicionRhRequest = {
  codigo_requisicion: string;
  id_puesto: number;
  id_descriptor_puesto?: number;
  tipo_necesidad: string;
  justificacion: string;
  cantidad_plazas: number;
  codigo_pais: string;
  gerencia?: string;
  departamento?: string;
  area?: string;
  centro_costo?: string;
  id_cuenta_portal_solicitante: number;
  id_cuenta_portal_jefe_aprobador?: number;
  id_cuenta_portal_reclutamiento?: number;
  id_cuenta_portal_compensacion?: number;
  fecha_necesaria_cobertura?: string;
  prioridad?: string;
  permite_publicacion_sin_completar: boolean;
  fecha_limite_regularizacion?: string;
};

export type CrearDescriptorRhRequest = {
  id_puesto: number;
  titulo_puesto: string;
  version_descriptor: string;
  objetivo_puesto?: string;
  funciones_principales?: string;
  funciones_secundarias?: string;
  competencias_tecnicas?: string;
  competencias_blandas?: string;
  escolaridad?: string;
  experiencia_minima?: string;
  idiomas?: string;
  certificaciones?: string;
  jornada?: string;
  modalidad?: string;
  rango_salarial_referencial?: string;
  reporta_a?: string;
  indicadores_exito?: string;
  fecha_vigencia_desde: string;
  fecha_vigencia_hasta?: string;
};

export async function listarVacantesPublicas(): Promise<VacantePublica[]> {
  const response = await fetch("/api/vacantes/publicas", {
    credentials: "include",
  });

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as { items?: VacantePublica[] };
  return data.items ?? [];
}

export async function obtenerDetalleVacante(slug: string) {
  const response = await fetch(`/api/vacantes/publicas/${slug}`, {
    credentials: "include",
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export async function obtenerMisPostulaciones() {
  const response = await fetch("/api/vacantes/mis-postulaciones", {
    credentials: "include",
  });

  if (!response.ok) {
    return { items: [] };
  }

  return response.json();
}

export async function obtenerRhDashboard(): Promise<RhDashboard | null> {
  const response = await fetch("/api/vacantes/rh/dashboard", {
    credentials: "include",
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export async function listarRhVacantes(): Promise<RhVacante[]> {
  const response = await fetch("/api/vacantes/rh/vacantes", {
    credentials: "include",
  });

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as { items?: RhVacante[] };
  return data.items ?? [];
}

export async function listarRequisicionesRh(): Promise<RequisicionRh[]> {
  const response = await fetch("/api/vacantes/rh/requisiciones", {
    credentials: "include",
  });

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as { items?: RequisicionRh[] };
  return data.items ?? [];
}

export async function listarPendientesAprobacionRh() {
  const response = await fetch("/api/vacantes/rh/requisiciones/pendientes", {
    credentials: "include",
  });

  if (!response.ok) {
    return { items: [] };
  }

  return response.json();
}

export async function listarDescriptoresRh(): Promise<DescriptorPuestoRh[]> {
  const response = await fetch("/api/vacantes/rh/descriptores", {
    credentials: "include",
  });

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as { items?: DescriptorPuestoRh[] };
  return data.items ?? [];
}

export async function listarPostulacionesRh(): Promise<PostulacionRh[]> {
  const response = await fetch("/api/vacantes/rh/postulaciones", {
    credentials: "include",
  });

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as { items?: PostulacionRh[] };
  return data.items ?? [];
}

export async function obtenerReportesRh(): Promise<ReportesRh | null> {
  const response = await fetch("/api/vacantes/rh/reportes", {
    credentials: "include",
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export async function obtenerDetallePostulacionRh(
  idPostulacion: number,
  origenPostulacion: string,
): Promise<RhPostulacionDetalle | null> {
  const response = await fetch(
    `/api/vacantes/rh/postulaciones/${idPostulacion}/detalle?origen=${encodeURIComponent(origenPostulacion)}`,
    {
      credentials: "include",
    },
  );

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export async function crearVacanteRh(payload: CrearVacanteRhRequest) {
  const csrf = getCsrfTokenFromCookie();
  const response = await fetch("/api/vacantes/rh/vacantes", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(csrf ? { "X-CSRF-Token": csrf } : {}),
    },
    body: JSON.stringify(payload),
  });

  return response.json();
}

export async function crearRequisicionRh(payload: CrearRequisicionRhRequest) {
  const csrf = getCsrfTokenFromCookie();
  const response = await fetch("/api/vacantes/rh/requisiciones", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(csrf ? { "X-CSRF-Token": csrf } : {}),
    },
    body: JSON.stringify(payload),
  });

  return response.json();
}

export async function aprobarRequisicionRh(idRequisicion: number, idCuentaPortal: number, comentario?: string) {
  const csrf = getCsrfTokenFromCookie();
  const response = await fetch(`/api/vacantes/rh/requisiciones/${idRequisicion}/aprobar`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(csrf ? { "X-CSRF-Token": csrf } : {}),
    },
    body: JSON.stringify({
      id_cuenta_portal: idCuentaPortal,
      etapa: "JEFE",
      comentario,
    }),
  });

  return response.json();
}

export async function rechazarRequisicionRh(idRequisicion: number, idCuentaPortal: number, comentario?: string) {
  const csrf = getCsrfTokenFromCookie();
  const response = await fetch(`/api/vacantes/rh/requisiciones/${idRequisicion}/rechazar`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(csrf ? { "X-CSRF-Token": csrf } : {}),
    },
    body: JSON.stringify({
      id_cuenta_portal: idCuentaPortal,
      comentario,
    }),
  });

  return response.json();
}

export async function cambiarEstadoVacanteRh(idVacante: number, estadoNuevo: string, idCuentaPortal: number, observacion?: string) {
  const csrf = getCsrfTokenFromCookie();
  const response = await fetch(`/api/vacantes/rh/vacantes/${idVacante}/estado`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(csrf ? { "X-CSRF-Token": csrf } : {}),
    },
    body: JSON.stringify({
      estado_nuevo: estadoNuevo,
      observacion,
      id_cuenta_portal: idCuentaPortal,
    }),
  });

  return response.json();
}

export async function postularVacante(idVacante: number) {
  const csrf = getCsrfTokenFromCookie();
  const response = await fetch("/api/vacantes/postular", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(csrf ? { "X-CSRF-Token": csrf } : {}),
    },
    body: JSON.stringify({
      id_vacante: idVacante,
      id_persona: 0,
      es_interna: true,
      fuente_postulacion: "PORTAL_INTERNO_WEB",
    }),
  });

  return response.json();
}

export async function crearTernaRh(idVacante: number, idCuentaPortalCreador: number) {
  const csrf = getCsrfTokenFromCookie();
  const response = await fetch("/api/vacantes/rh/terna", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(csrf ? { "X-CSRF-Token": csrf } : {}),
    },
    body: JSON.stringify({
      id_vacante: idVacante,
      id_cuenta_portal_creador: idCuentaPortalCreador,
    }),
  });

  return response.json();
}

export async function cambiarEstadoPostulacionRh(
  idPostulacion: number,
  estadoNuevo: string,
  idCuentaPortal: number,
  origenPostulacion: string,
  observacion?: string,
) {
  const csrf = getCsrfTokenFromCookie();
  const response = await fetch(`/api/vacantes/rh/postulaciones/${idPostulacion}/estado`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(csrf ? { "X-CSRF-Token": csrf } : {}),
    },
    body: JSON.stringify({
      estado_nuevo: estadoNuevo,
      observacion,
      id_cuenta_portal: idCuentaPortal,
      origen_postulacion: origenPostulacion,
    }),
  });

  return response.json();
}

export async function crearDescriptorRh(payload: CrearDescriptorRhRequest) {
  const csrf = getCsrfTokenFromCookie();
  const response = await fetch("/api/vacantes/rh/descriptores", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(csrf ? { "X-CSRF-Token": csrf } : {}),
    },
    body: JSON.stringify(payload),
  });

  return response.json();
}

export async function registrarListaNegraRh(payload: {
  id_persona: number;
  motivo: string;
  categoria?: string;
  fecha_inicio: string;
  fecha_fin?: string;
  permanente: boolean;
}, idCuentaPortalRegistro: number) {
  const csrf = getCsrfTokenFromCookie();
  const response = await fetch("/api/vacantes/rh/lista-negra", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(csrf ? { "X-CSRF-Token": csrf } : {}),
    },
    body: JSON.stringify({
      ...payload,
      id_cuenta_portal_registro: idCuentaPortalRegistro,
    }),
  });

  return response.json();
}

export async function listarListaNegraRh() {
  const response = await fetch("/api/vacantes/rh/lista-negra", { credentials: "include" });
  return response.json();
}

export async function listarTernasRh() {
  const response = await fetch("/api/vacantes/rh/terna", { credentials: "include" });
  return response.json();
}

export async function postularEnOtraVacanteRh(payload: { idVacante: number, origen: string, id: number, idCuentaPortal: number }) {
  const csrf = getCsrfTokenFromCookie();
  const response = await fetch("/api/vacantes/rh/reutilizar-candidato", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(csrf ? { "X-CSRF-Token": csrf } : {}),
    },
    body: JSON.stringify(payload),
  });
  return response.json();
}

export async function solicitarRecuperacionPassword(correo: string): Promise<{ ok: boolean; message: string }> {
  const response = await fetch("/api/candidatos/password-reset/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo }),
  });
  return response.json();
}

export async function verificarTokenPassword(token: string): Promise<{ ok: boolean; message: string }> {
  const response = await fetch(`/api/candidatos/password-reset/verify/${token}`);
  return response.json();
}

export async function completarRecuperacionPassword(token: string, nueva_clave: string): Promise<{ ok: boolean; message: string }> {
  const response = await fetch("/api/candidatos/password-reset/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, nueva_clave }),
  });
  return response.json();
}
