// All content (labels, texts, messages) in Spanish.

export type Rol = 'PACIENTE' | 'MEDICO' | 'ADMIN' | 'RRHH';
export type Pais = 'NI' | 'CR' | 'HN';
export type SemaforoNivel = 'V' | 'A' | 'R';
export type EstadoClinico = 'BIEN' | 'REGULAR' | 'MAL';

export interface UsuarioAplicacion {
  id_usuario?: number;
  carnet: string;
  rol: Rol;
  estado: 'A' | 'I';
  ultimo_acceso?: string;
  id_paciente?: number;
  id_medico?: number;
  nombre_completo: string;
  correo?: string;
  pais: Pais;
  nivel_semaforo?: SemaforoNivel;
  // Aliases para compatibilidad
  idUsuario?: number;
  nombreCompleto?: string;
  ultimoAcceso?: string;
}

export interface Paciente {
  id_paciente?: number;
  carnet: string;
  nombre_completo: string;
  fecha_nacimiento?: string;
  sexo?: string;
  telefono?: string;
  correo?: string;
  gerencia?: string;
  area?: string;
  estado_paciente: 'A' | 'I';
  nivel_semaforo?: SemaforoNivel;
  pais?: Pais;
  correo_usuario?: string;
}

export interface Medico {
  id_medico?: number;
  nombre_completo: string;
  especialidad?: string;
  tipo_medico: 'INTERNO' | 'EXTERNO';
  correo?: string;
  telefono?: string;
  estado_medico: 'A' | 'I';
  carnet?: string;
  pais?: Pais;
}

export interface ChequeoBienestar {
  id_chequeo?: number;
  id_paciente: number;
  fecha_registro: string;
  nivel_semaforo: SemaforoNivel;
  datos_completos: string; // JSON
  // Campos parseados (se extraen del JSON si se necesitan)
  estado_animo?: string;
  calidad_sueno?: string;
  consumo_agua?: string;
  nivel_estres?: string;
  ruta?: string;
  comentario_general?: string;
}

export interface TriajeIA {
  nivel_urgencia: "Baja" | "Moderada" | "Alta" | "Emergencia";
  especialidad_sugerida: string;
  resumen_medico: string;
  accion_recomendada: string;
}

export interface CasoClinico {
  id_caso?: number;
  codigo_caso?: string;
  id_paciente: number;
  fecha_creacion: string;
  estado_caso: string;
  nivel_semaforo: SemaforoNivel;
  motivo_consulta: string;
  resumen_clinico_usuario?: string;
  diagnostico_usuario?: string;
  datos_extra?: any;
  id_cita_principal?: number;
  // Campos populados por JOINs
  paciente_nombre?: string;
  paciente_carnet?: string;
  paciente_semaforo?: SemaforoNivel;
  triajeIA?: TriajeIA | null;
}

export interface CitaMedica {
  id_cita?: number;
  id_caso?: number;
  id_paciente: number;
  id_medico: number;
  fecha_cita: string;
  hora_cita: string;
  canal_origen: string;
  estado_cita: 'PROGRAMADA' | 'CONFIRMADA' | 'EN_ATENCION' | 'FINALIZADA' | 'CANCELADA';
  motivo_resumen: string;
  nivel_semaforo_paciente: SemaforoNivel;
  // Campos populados por JOINs
  paciente_nombre?: string;
  paciente_carnet?: string;
  medico_nombre?: string;
  medico_especialidad?: string;
  codigo_caso?: string;
  // Objeto embebido (del getCitaById detallado)
  paciente?: Paciente;
  medico?: Medico;
}

export interface AtencionMedica {
  id_atencion: number;
  id_cita: number;
  id_medico: number;
  fecha_atencion: string;
  diagnostico_principal: string;
  plan_tratamiento?: string;
  recomendaciones?: string;
  requiere_seguimiento: boolean;
  fecha_siguiente_cita?: string;
  tipo_siguiente_cita?: string;
  notas_seguimiento_medico?: string;
  peso_kg?: number;
  altura_m?: number;
  presion_arterial?: string;
  frecuencia_cardiaca?: number;
  temperatura_c?: number;
}

export interface VacunaAplicada {
  id_vacuna_registro: number;
  id_paciente: number;
  id_medico?: number;
  id_atencion?: number;
  tipo_vacuna: string;
  dosis: string;
  fecha_aplicacion: string;
  observaciones?: string;
  medico_nombre?: string;
}

export interface RegistroPsicosocial {
  id_registro_psico: number;
  id_paciente: number;
  id_medico?: number;
  id_atencion?: number;
  fecha_registro: string;
  confidencial: boolean;
  nivel_estres?: string;
  sintomas_psico?: string;
  estado_animo_gral?: string;
  analisis_sentiment?: string;
  riesgo_suicida?: boolean;
  derivar_a_psico?: boolean;
  notas_psico?: string;
}

export interface SeguimientoPaciente {
  id_seguimiento: number;
  id_caso?: number;
  id_atencion?: number;
  id_paciente: number;
  id_usuario_resp?: number;
  fecha_programada: string;
  fecha_real?: string;
  tipo_seguimiento: 'LLAMADA' | 'TEAMS' | 'PRESENCIAL';
  estado_seguimiento: 'PENDIENTE' | 'EN_PROCESO' | 'RESUELTO' | 'CANCELADO';
  nivel_semaforo: SemaforoNivel;
  notas_seguimiento?: string;
  motivo?: string;
  // Populados
  paciente_nombre?: string;
  paciente_carnet?: string;
  codigo_caso?: string;
  responsable_nombre?: string;
}

export interface ExamenMedico {
  id_examen: number;
  id_paciente: number;
  id_caso?: number;
  id_atencion?: number;
  tipo_examen: string;
  fecha_solicitud: string;
  fecha_resultado?: string;
  laboratorio?: string;
  resultado_resumen?: string;
  estado_examen: 'PENDIENTE' | 'ENTREGADO' | 'CANCELADO';
  paciente_nombre?: string;
  paciente_carnet?: string;
}

export interface EmpleadoEmp2024 {
  id_empleado?: number;
  carnet: string;
  nombreCompleto: string;
  nombre_completo?: string;
  correo: string;
  cargo: string;
  gerencia: string;
  subgerencia: string;
  area: string;
  telefono: string;
  nom_jefe?: string;
  correo_jefe?: string;
  carnet_jefe?: string;
  pais: Pais;
  fecha_nacimiento?: string;
  fecha_contratacion?: string;
  estado: 'ACTIVO' | 'INACTIVO';
}

// Interfaces para Roles y Permisos granulares
export interface RolSistema {
  id_rol: number;
  nombre: string;
  descripcion?: string;
}

export interface PermisoSistema {
  id_permiso: number;
  clave: string;
  descripcion?: string;
  modulo: string;
}

export interface RolesPermisosData {
  roles: RolSistema[];
  relaciones: { id_rol: number; id_permiso: number; clave: string; modulo: string }[];
  catalogoPermisos: PermisoSistema[];
}
