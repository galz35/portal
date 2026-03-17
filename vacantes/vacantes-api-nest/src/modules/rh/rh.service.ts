import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../shared/database/database.service';

@Injectable()
export class RhService {
  private readonly logger = new Logger(RhService.name);

  constructor(private readonly db: DatabaseService) {}

  async getDashboard() {
    try {
      const vResult = await this.db.execute('dbo.spVac_RH_ListarVacantes');
      const rResult = await this.db.execute('dbo.spReq_RH_ListarRequisiciones');
      const dResult = await this.db.execute('dbo.spDesc_ListarDescriptores');

      const vacantes = vResult.recordset ?? [];
      const requisiciones = rResult.recordset ?? [];
      const descriptores = dResult.recordset ?? [];
      
      const pendientes = requisiciones.filter((r: any) => r.EstadoRequisicion?.startsWith('PENDIENTE'));

      return {
        kpis: {
          vacantesPublicadas: vacantes.filter((v: any) => v.EstadoActual === 'PUBLICADA').length,
          requisicionesPendientes: pendientes.length,
          descriptoresVigentes: descriptores.length,
          vacantesEnExcepcion: vacantes.filter((v: any) => v.EstadoActual === 'PUBLICADA_CON_EXCEPCION').length,
        },
        pendientes: pendientes.slice(0, 5),
      };
    } catch { return { kpis: {}, pendientes: [] }; }
  }

  async listarVacantesRH() {
    try {
      const result = await this.db.execute('dbo.spVac_RH_ListarVacantes');
      return result.recordset || [];
    } catch { return []; }
  }

  async crearVacante(data: any) {
    try {
      const result = await this.db.execute('dbo.spVac_Insertar', {
        CodigoVacante: data.codigo_vacante,
        Titulo: data.titulo,
        Descripcion: data.descripcion,
        Requisitos: data.requisitos,
        Area: data.area,
        Gerencia: data.gerencia,
        Departamento: data.departamento,
        TipoVacante: data.tipo_vacante,
        Modalidad: data.modalidad,
        Ubicacion: data.ubicacion,
        CodigoPais: data.codigo_pais,
        NivelExperiencia: data.nivel_experiencia,
        SalarioMin: data.salario_min,
        SalarioMax: data.salario_max,
        AceptaInternos: data.acepta_internos,
        EsPublica: data.es_publica,
        CantidadPlazas: data.cantidad_plazas,
        Prioridad: data.prioridad,
        IdSolicitante: data.id_solicitante,
        IdResponsableRH: data.id_responsable_rh,
      });
      return result.recordset?.[0]?.IdVacante;
    } catch (err) { 
      this.logger.error(`crearVacante error: ${err}`);
      return null; 
    }
  }

  async cambiarEstadoVacante(idVacante: number, estado: string, idCuentaPortal: number, observacion?: string) {
    try {
      await this.db.execute('dbo.spVac_CambiarEstado', { 
        IdVacante: idVacante, 
        EstadoNuevo: estado,
        IdCuentaPortal: idCuentaPortal,
        Observacion: observacion
      });
      return true;
    } catch { return false; }
  }

  async listarRequisiciones() {
    try {
      const result = await this.db.execute('dbo.spReq_RH_ListarRequisiciones');
      return result.recordset || [];
    } catch { return []; }
  }

  async crearRequisicion(data: any) {
    try {
      const result = await this.db.execute('dbo.spReq_Crear', {
        CodigoRequisicion: data.codigo_requisicion,
        IdPuesto: data.id_puesto,
        IdDescriptorPuesto: data.id_descriptor_puesto,
        TipoNecesidad: data.tipo_necesidad,
        Justificacion: data.justificacion,
        CantidadPlazas: data.cantidad_plazas,
        CodigoPais: data.codigo_pais,
        Gerencia: data.gerencia,
        Departamento: data.departamento,
        Area: data.area,
        CentroCosto: data.centro_costo,
        IdCuentaPortalSolicitante: data.id_cuenta_portal_solicitante,
        IdCuentaPortalJefeAprobador: data.id_cuenta_portal_jefe_aprobador,
        IdCuentaPortalReclutamiento: data.id_cuenta_portal_reclutamiento,
        IdCuentaPortalCompensacion: data.id_cuenta_portal_compensacion,
        Prioridad: data.prioridad,
      });
      return result.recordset?.[0]?.IdRequisicionPersonal;
    } catch { return null; }
  }

  async aprobarRequisicion(idRequisicion: number, idCuentaAprobador: number, comentario?: string) {
    try {
      await this.db.execute('dbo.spReq_AprobarEtapa', { 
        IdRequisicionPersonal: idRequisicion, 
        IdCuentaPortal: idCuentaAprobador,
        Comentario: comentario
      });
      return true;
    } catch { return false; }
  }

  async rechazarRequisicion(idRequisicion: number, idCuentaAprobador: number, comentario?: string) {
    try {
      await this.db.execute('dbo.spReq_Rechazar', { 
        IdRequisicionPersonal: idRequisicion, 
        IdCuentaPortal: idCuentaAprobador,
        Comentario: comentario
      });
      return true;
    } catch { return false; }
  }

  async listarDescriptores() {
    try {
      const result = await this.db.execute('dbo.spDesc_ListarDescriptores');
      return result.recordset || [];
    } catch { return []; }
  }

  async crearDescriptor(data: any) {
    try {
      const result = await this.db.execute('dbo.spDesc_Crear', {
        IdPuesto: data.id_puesto,
        TituloPuesto: data.titulo_puesto,
        VersionDescriptor: data.version_descriptor,
        ObjetivoPuesto: data.objetivo_puesto,
        FuncionesPrincipales: data.funciones_principales,
        FuncionesSecundarias: data.funciones_secundarias,
        CompetenciasTecnicas: data.competencias_tecnicas,
        CompetenciasBlandas: data.competencias_blandas,
        Escolaridad: data.escolaridad,
        ExperienciaMinima: data.experiencia_minima,
        Idiomas: data.idiomas,
        Certificaciones: data.certificaciones,
        Jornada: data.jornada,
        Modalidad: data.modalidad,
        RangoSalarialReferencial: data.rango_salarial_referencial,
        ReportaA: data.reporta_a,
        IndicadoresExito: data.indicadores_exito,
        FechaVigenciaDesde: data.fecha_vigencia_desde,
      });
      return result.recordset?.[0]?.IdDescriptorPuesto;
    } catch { return null; }
  }

  async listarPostulacionesRH() {
    try {
      const result = await this.db.execute('dbo.spPost_RH_ListarTodas');
      return result.recordset || [];
    } catch { return []; }
  }

  async cambiarEstadoPostulacion(idPostulacion: number, estado: string, idCuentaPortal: number, observacion?: string) {
    try {
      await this.db.execute('dbo.spPost_CambiarEstado', {
        IdPostulacion: idPostulacion,
        EstadoNuevo: estado,
        IdCuentaPortal: idCuentaPortal,
        Observacion: observacion
      });
      return true;
    } catch { return false; }
  }

  async crearTerna(idVacante: number, idCuentaPortal: number) {
    try {
      const result = await this.db.execute('dbo.spTerna_Crear', {
        IdVacante: idVacante,
        IdCuentaPortalCreador: idCuentaPortal
      });
      return result.recordset?.[0]?.IdTerna;
    } catch { return null; }
  }

  async crearListaNegra(data: any) {
    try {
      const result = await this.db.execute('dbo.spListaNegra_Insertar', {
        IdPersona: data.id_persona,
        Motivo: data.motivo,
        Categoria: data.categoria,
        FechaInicio: data.fecha_init,
        Permanente: data.permanente,
        IdCuentaPortalRegistro: data.id_cuenta_portal_registro
      });
      return result.recordset?.[0]?.IdListaNegra;
    } catch { return null; }
  }

  async listarListaNegra() {
    try {
      return await this.db.query('SELECT * FROM ListaNegra ORDER BY FechaRegistro DESC');
    } catch { return []; }
  }

  async listarTernas() {
    try {
      const sql = 'SELECT t.*, v.Titulo as TituloVacante FROM Terna t LEFT JOIN Vacante v ON t.IdVacante = v.IdVacante ORDER BY t.FechaCreacion DESC';
      return await this.db.query(sql);
    } catch { return []; }
  }

  async obtenerDetallePostulacionRH(idPostulacion: number, origen: string) {
    try {
      const sp = origen === 'EMPLEADO_INTERNO' ? 'dbo.spPost_RH_DetalleInterno' : 'dbo.spPost_RH_DetalleExterno';
      const result = await this.db.execute(sp, { IdPostulacion: idPostulacion });
      
      const postulacion = result.recordsets[0]?.[0];
      const candidato = result.recordsets[1]?.[0];
      const cvHistorial = result.recordsets[2] || [];
      const analisisHistorial = result.recordsets[3] || [];

      if (!postulacion) return { ok: false };

      return {
        ok: true,
        origenPostulacion: origen,
        postulacion,
        candidato,
        cv: {
          actual: cvHistorial.find((c: any) => c.esCvPrincipal) || cvHistorial[0],
          historial: cvHistorial
        },
        analisisIa: {
          disponible: analisisHistorial.length > 0,
          actual: analisisHistorial[0],
          historial: analisisHistorial
        }
      };
    } catch (err) {
      this.logger.error(`obtenerDetallePostulacionRH error: ${err}`);
      return { ok: false };
    }
  }

  async obtenerHistorialVacante(idVacante: number) {
    try {
      return await this.db.query(
        'SELECT * FROM VacanteEstadoHistorial WHERE IdVacante = @id ORDER BY FechaCambio DESC',
        { id: idVacante }
      );
    } catch { return []; }
  }

  async reutilizarCandidato(idVacante: number, origen: string, id: number, idCuentaPortal: number) {
    try {
      this.logger.log(`Reutilizando ${origen} ID: ${id} para Vacante: ${idVacante}`);
      
      const isInternal = origen === 'EMPLEADO_INTERNO';
      const table = isInternal ? 'dbo.Postulacion' : 'dbo.PostulacionCandidatoExterno';
      const idCol = isInternal ? 'IdPersona' : 'IdCandidato';

      await this.db.query(`
        INSERT INTO ${table} (IdVacante, ${idCol}, EstadoActual, FechaPostulacion ${isInternal ? ', EsInterna' : ''})
        VALUES (${idVacante}, ${id}, 'POSTULADO', GETDATE() ${isInternal ? ', 1' : ''})
      `);

      return { ok: true };
    } catch (err: any) {
      this.logger.error(`reutilizarCandidato error: ${err}`);
      return { ok: false, message: err.message };
    }
  }
}
