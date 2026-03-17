import { getCsrfTokenFromCookie } from "../security/csrf";

export type CandidateProfile = {
  id_candidato: number;
  correo: string;
  nombres: string;
  apellidos: string;
  telefono?: string | null;
  departamento_residencia?: string | null;
  municipio_residencia?: string | null;
  categoria_interes?: string | null;
  modalidad_preferida?: string | null;
  nivel_academico?: string | null;
  linkedin_url?: string | null;
  resumen_profesional?: string | null;
  disponibilidad_viajar?: boolean;
  disponibilidad_horario_rotativo?: boolean;
  tiene_licencia_conducir?: boolean;
  tipo_licencia?: string | null;
  tiene_vehiculo_propio?: boolean;
  fecha_registro: string;
};

export type CandidateCvFile = {
  id_archivo_candidato_cv: number;
  nombre_original: string;
  extension: string;
  mime_type: string;
  tamano_bytes: number;
  estado_archivo: string;
  es_cv_principal: boolean;
  fecha_creacion: string;
  fecha_desactivacion?: string | null;
};

type CandidateEnvelope = {
  ok?: boolean;
  message?: string;
  perfil?: CandidateProfile;
  archivo?: CandidateCvFile | null;
  items?: Array<Record<string, unknown> | CandidateCvFile>;
  idPostulacionCandidato?: number;
  idArchivoCandidatoCv?: number;
  retryAfterSeconds?: number;
};

export async function registerCandidate(payload: {
  correo: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  clave: string;
}) {
  const response = await fetch("/api/candidatos/register", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as CandidateEnvelope;
  return { response, data };
}

export async function loginCandidate(payload: { correo: string; clave: string }) {
  const response = await fetch("/api/candidatos/login", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as CandidateEnvelope;
  return { response, data };
}

export async function logoutCandidate() {
  const csrf = getCsrfTokenFromCookie("cand_csrf");
  const response = await fetch("/api/candidatos/logout", {
    method: "POST",
    credentials: "include",
    headers: csrf ? { "X-CSRF-Token": csrf } : {},
  });

  const data = (await response.json()) as CandidateEnvelope;
  return { response, data };
}

export async function getCandidateMe(): Promise<CandidateProfile | null> {
  const response = await fetch("/api/candidatos/me", {
    credentials: "include",
  });

  if (!response.ok) {
    return null;
  }

  try {
    const data = (await response.json()) as CandidateEnvelope;
    return data.perfil ?? null;
  } catch {
    return null;
  }
}

export async function updateCandidateProfile(payload: {
  nombres: string;
  apellidos: string;
  telefono?: string;
  departamento_residencia?: string;
  municipio_residencia?: string;
  categoria_interes?: string;
  modalidad_preferida?: string;
  nivel_academico?: string;
  linkedin_url?: string;
  resumen_profesional?: string;
  disponibilidad_viajar?: boolean;
  disponibilidad_horario_rotativo?: boolean;
  tiene_licencia_conducir?: boolean;
  tipo_licencia?: string;
  tiene_vehiculo_propio?: boolean;
}) {
  const csrf = getCsrfTokenFromCookie("cand_csrf");
  const response = await fetch("/api/candidatos/me", {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(csrf ? { "X-CSRF-Token": csrf } : {}),
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as CandidateEnvelope;
  return { response, data };
}

export async function listCandidatePostulations() {
  const response = await fetch("/api/candidatos/mis-postulaciones", {
    credentials: "include",
  });

  const data = (await response.json()) as CandidateEnvelope;
  return {
    response,
    items: (data.items ?? []) as Array<Record<string, unknown>>,
    message: data.message,
  };
}

export async function applyAsCandidate(idVacante: number) {
  const csrf = getCsrfTokenFromCookie("cand_csrf");
  const response = await fetch("/api/candidatos/postular", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(csrf ? { "X-CSRF-Token": csrf } : {}),
    },
    body: JSON.stringify({
      id_vacante: idVacante,
      fuente_postulacion: "PORTAL_CANDIDATO_WEB",
    }),
  });

  const data = (await response.json()) as CandidateEnvelope;
  return { response, data };
}

export async function getCandidateCurrentCv() {
  const response = await fetch("/api/vacantes/cv", {
    credentials: "include",
  });

  const data = (await response.json()) as CandidateEnvelope;
  return {
    response,
    archivo: data.archivo ?? null,
    message: data.message,
  };
}

export async function listCandidateCvHistory() {
  const response = await fetch("/api/vacantes/cv/historial", {
    credentials: "include",
  });

  const data = (await response.json()) as CandidateEnvelope;
  return {
    response,
    items: (data.items ?? []) as CandidateCvFile[],
    message: data.message,
  };
}

export async function uploadCandidateCv(file: File) {
  const csrf = getCsrfTokenFromCookie("cand_csrf");
  const body = new FormData();
  body.append("cv", file);

  const response = await fetch("/api/vacantes/cv/subir", {
    method: "POST",
    credentials: "include",
    headers: csrf ? { "X-CSRF-Token": csrf } : {},
    body,
  });

  const data = (await response.json()) as CandidateEnvelope;
  return { response, data };
}
