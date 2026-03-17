import { Injectable, NotFoundException } from '@nestjs/common';

import {
  INITIAL_DESCRIPTORES,
  INITIAL_POSTULACIONES,
  INITIAL_REQUISICIONES,
  INITIAL_VACANTES,
  type DescriptorRecord,
  type ListaNegraRecord,
  type PostulacionRecord,
  type RequisicionRecord,
  type TernaRecord,
  type VacanteRecord,
} from '../../shared/data/vacantes.seed';
import { CreateDescriptorDto } from './dto/create-descriptor.dto';
import { CreateListaNegraDto } from './dto/create-lista-negra.dto';
import { CreateRequisicionDto } from './dto/create-requisicion.dto';
import { CreateTernaDto } from './dto/create-terna.dto';
import { CreateVacanteDto } from './dto/create-vacante.dto';
import { PostularVacanteDto } from './dto/postular-vacante.dto';

@Injectable()
export class VacantesService {
  private readonly vacantes: VacanteRecord[] = [...INITIAL_VACANTES];
  private readonly requisiciones: RequisicionRecord[] = [...INITIAL_REQUISICIONES];
  private readonly descriptores: DescriptorRecord[] = [...INITIAL_DESCRIPTORES];
  private readonly postulaciones: PostulacionRecord[] = [...INITIAL_POSTULACIONES];
  private readonly ternas: TernaRecord[] = [];
  private readonly listaNegra: ListaNegraRecord[] = [];

  private nextVacanteId = 2100;
  private nextRequisicionId = 3100;
  private nextDescriptorId = 4100;
  private nextPostulacionId = 5100;
  private nextTernaId = 6100;
  private nextListaNegraId = 7100;

  listPublicVacantes() {
    return this.vacantes
      .filter((item) => item.esPublica)
      .map(({ idVacante, codigoVacante, slug, titulo, ubicacion, codigoPais, modalidad }) => ({
        idVacante,
        codigoVacante,
        slug,
        titulo,
        ubicacion,
        codigoPais,
        modalidad,
      }));
  }

  getPublicVacanteBySlug(slug: string) {
    const vacante = this.vacantes.find((item) => item.slug === slug && item.esPublica);
    if (!vacante) {
      throw new NotFoundException({ message: 'Vacante no encontrada.' });
    }

    return vacante;
  }

  listMisPostulaciones(idPersona?: number) {
    const items =
      typeof idPersona === 'number'
        ? this.postulaciones.filter((item) => item.idPersona === idPersona)
        : this.postulaciones;

    return { items };
  }

  getDashboard() {
    const pendientes = this.requisiciones.filter((item) => item.estadoActual.startsWith('PENDIENTE'));

    return {
      kpis: {
        vacantesPublicadas: this.vacantes.filter((item) => item.estadoActual === 'PUBLICADA').length,
        requisicionesPendientes: pendientes.length,
        descriptoresVigentes: this.descriptores.filter((item) => item.estadoActual === 'VIGENTE').length,
        vacantesEnExcepcion: this.vacantes.filter((item) => item.esExcepcionSinRequisicion).length,
      },
      pendientes: pendientes.map((item) => ({
        idRequisicion: item.idRequisicion,
        codigoRequisicion: item.codigoRequisicion,
        tituloPuesto: item.tituloPuesto,
        estadoActual: item.estadoActual,
      })),
    };
  }

  listRhVacantes() {
    return {
      items: this.vacantes.map(({ idVacante, codigoVacante, titulo, estadoActual }) => ({
        idVacante,
        codigoVacante,
        titulo,
        estadoActual,
      })),
    };
  }

  createVacante(payload: CreateVacanteDto) {
    const idVacante = this.nextVacanteId++;
    const item: VacanteRecord = {
      idVacante,
      codigoVacante: payload.codigo_vacante,
      slug: this.slugify(payload.titulo),
      titulo: payload.titulo,
      descripcion: payload.descripcion,
      requisitos: payload.requisitos ?? 'Por definir',
      ubicacion: payload.ubicacion ?? 'Nicaragua',
      codigoPais: payload.codigo_pais,
      modalidad: payload.modalidad ?? 'HIBRIDA',
      estadoActual: payload.es_publica ? 'PUBLICADA' : 'BORRADOR',
      area: payload.area ?? 'General',
      prioridad: payload.prioridad ?? 'MEDIA',
      esPublica: payload.es_publica,
      esExcepcionSinRequisicion: payload.es_excepcion_sin_requisicion,
      fechaLimiteRegularizacion:
        payload.fecha_limite_regularizacion ?? new Date().toISOString().slice(0, 10),
    };

    this.vacantes.unshift(item);

    return {
      ok: true,
      idVacante,
      codigoVacante: item.codigoVacante,
    };
  }

  changeVacanteState(idVacante: number, estadoNuevo: string) {
    const vacante = this.vacantes.find((item) => item.idVacante === idVacante);
    if (!vacante) {
      throw new NotFoundException({ message: 'Vacante no encontrada.' });
    }

    vacante.estadoActual = estadoNuevo;
    vacante.esPublica = estadoNuevo === 'PUBLICADA' || vacante.esPublica;

    return {
      ok: true,
      idVacante,
      estadoActual: vacante.estadoActual,
    };
  }

  listRequisiciones() {
    return { items: this.requisiciones };
  }

  listPendientesRequisicion() {
    return {
      items: this.requisiciones
        .filter((item) => item.estadoActual.startsWith('PENDIENTE'))
        .map((item) => ({
          idRequisicion: item.idRequisicion,
          codigoRequisicion: item.codigoRequisicion,
          tituloPuesto: item.tituloPuesto,
          estadoActual: item.estadoActual,
        })),
    };
  }

  createRequisicion(payload: CreateRequisicionDto) {
    const item: RequisicionRecord = {
      idRequisicion: this.nextRequisicionId++,
      codigoRequisicion: payload.codigo_requisicion,
      idPuesto: payload.id_puesto,
      tituloPuesto: `Puesto ${payload.id_puesto}`,
      area: payload.area ?? 'General',
      solicitante: `Cuenta ${payload.id_cuenta_portal_solicitante}`,
      prioridad: payload.prioridad ?? 'MEDIA',
      estadoActual: 'PENDIENTE_JEFE',
      tipoNecesidad: payload.tipo_necesidad,
      fechaSolicitud: new Date().toISOString().slice(0, 10),
      fechaLimiteRegularizacion:
        payload.fecha_limite_regularizacion ?? new Date().toISOString().slice(0, 10),
      permitePublicacionSinCompletar: payload.permite_publicacion_sin_completar,
    };

    this.requisiciones.unshift(item);

    return {
      ok: true,
      idRequisicion: item.idRequisicion,
      codigoRequisicion: item.codigoRequisicion,
    };
  }

  approveRequisicion(idRequisicion: number) {
    return this.setRequisicionState(idRequisicion, 'APROBADA');
  }

  rejectRequisicion(idRequisicion: number) {
    return this.setRequisicionState(idRequisicion, 'RECHAZADA');
  }

  listDescriptores() {
    return { items: this.descriptores };
  }

  createDescriptor(payload: CreateDescriptorDto) {
    const competencias = [
      ...(payload.competencias_tecnicas?.split('|') ?? []),
      ...(payload.competencias_blandas?.split('|') ?? []),
    ]
      .map((item) => item.trim())
      .filter(Boolean);

    const item: DescriptorRecord = {
      idDescriptorPuesto: this.nextDescriptorId++,
      idPuesto: payload.id_puesto,
      tituloPuesto: payload.titulo_puesto,
      versionDescriptor: Number(payload.version_descriptor),
      objetivoPuesto: payload.objetivo_puesto ?? 'Objetivo pendiente de documentar.',
      competenciasClave: competencias,
      vigenciaDesde: payload.fecha_vigencia_desde,
      estadoActual: 'VIGENTE',
    };

    this.descriptores.unshift(item);

    return {
      ok: true,
      idDescriptorPuesto: item.idDescriptorPuesto,
    };
  }

  listPostulaciones() {
    return { items: this.postulaciones };
  }

  postular(payload: PostularVacanteDto) {
    const vacante = this.vacantes.find((item) => item.idVacante === payload.id_vacante);
    if (!vacante) {
      throw new NotFoundException({ message: 'Vacante no encontrada.' });
    }

    const item: PostulacionRecord = {
      idPostulacion: this.nextPostulacionId++,
      idVacante: payload.id_vacante,
      idPersona: payload.id_persona,
      titulo: vacante.titulo,
      nombreCandidato: `Persona ${payload.id_persona}`,
      estadoActual: 'NUEVA',
      scoreIa: 75,
      scoreRh: 0,
      tipoPostulacion: payload.es_interna ? 'INTERNA' : 'EXTERNA',
      codigoPais: vacante.codigoPais,
      fechaPostulacion: new Date().toISOString().slice(0, 10),
    };

    this.postulaciones.unshift(item);

    return {
      ok: true,
      idPostulacion: item.idPostulacion,
    };
  }

  changePostulacionState(idPostulacion: number, estadoNuevo: string) {
    const postulacion = this.postulaciones.find((item) => item.idPostulacion === idPostulacion);
    if (!postulacion) {
      throw new NotFoundException({ message: 'Postulacion no encontrada.' });
    }

    postulacion.estadoActual = estadoNuevo;
    if (estadoNuevo === 'REVISION_RH') {
      postulacion.scoreRh = 65;
    }
    if (estadoNuevo === 'PRESELECCIONADA') {
      postulacion.scoreRh = 88;
    }

    return {
      ok: true,
      idPostulacion,
      estadoActual: postulacion.estadoActual,
    };
  }

  createTerna(payload: CreateTernaDto) {
    const terna: TernaRecord = {
      idTerna: this.nextTernaId++,
      idVacante: payload.id_vacante,
      idCuentaPortalCreador: payload.id_cuenta_portal_creador,
      fechaCreacion: new Date().toISOString(),
    };

    this.ternas.unshift(terna);

    return {
      ok: true,
      idTerna: terna.idTerna,
    };
  }

  getReportes() {
    const resumen = {
      vacantesActivas: this.vacantes.filter((item) => ['PUBLICADA', 'EN_PROCESO'].includes(item.estadoActual)).length,
      vacantesOcupadas: this.vacantes.filter((item) => item.estadoActual === 'OCUPADA').length,
      vacantesCerradas: this.vacantes.filter((item) => item.estadoActual === 'CERRADA').length,
      vacantesEnExcepcion: this.vacantes.filter((item) => item.esExcepcionSinRequisicion).length,
      totalPostulaciones: this.postulaciones.length,
    };

    const tiposMap = new Map<string, number>();
    for (const item of this.postulaciones) {
      tiposMap.set(item.tipoPostulacion, (tiposMap.get(item.tipoPostulacion) ?? 0) + 1);
    }

    const paisMap = new Map<string, number>();
    for (const item of this.postulaciones) {
      paisMap.set(item.codigoPais, (paisMap.get(item.codigoPais) ?? 0) + 1);
    }

    return {
      resumen,
      tiposPostulacion: Array.from(tiposMap.entries()).map(([tipoPostulacion, total]) => ({
        tipoPostulacion,
        total,
      })),
      postulacionesPorPais: Array.from(paisMap.entries()).map(([codigoPais, totalPostulaciones]) => ({
        codigoPais,
        totalPostulaciones,
      })),
      tiemposProceso: {
        promedioDiasAperturaAOcupada: 18,
        promedioDiasPostulacionAContratacion: 11,
      },
    };
  }

  createListaNegra(payload: CreateListaNegraDto) {
    const item: ListaNegraRecord = {
      idListaNegra: this.nextListaNegraId++,
      idPersona: payload.id_persona,
      motivo: payload.motivo,
      categoria: payload.categoria,
      fechaInicio: payload.fecha_inicio,
      fechaFin: payload.fecha_fin,
      permanente: payload.permanente,
      idCuentaPortalRegistro: payload.id_cuenta_portal_registro,
    };

    this.listaNegra.unshift(item);

    return {
      ok: true,
      idListaNegra: item.idListaNegra,
    };
  }

  private setRequisicionState(idRequisicion: number, estadoActual: string) {
    const requisicion = this.requisiciones.find((item) => item.idRequisicion === idRequisicion);
    if (!requisicion) {
      throw new NotFoundException({ message: 'Requisicion no encontrada.' });
    }

    requisicion.estadoActual = estadoActual;

    return {
      ok: true,
      idRequisicion,
      estadoActual,
    };
  }

  private slugify(value: string) {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);
  }
}
