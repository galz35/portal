import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { DbService } from '../database/db.service';
import { AgendarCitaDto } from './dto/agendar-cita.dto';
import { CrearAtencionDto } from './dto/crear-atencion.dto';

@Injectable()
export class MedicoService {
    constructor(private db: DbService) { }

    async getPacientes(pais: string) {
        return this.db.execute<any>('sp_Medico_GetPacientes', { Pais: pais });
    }

    async getChequeosPorPaciente(idPaciente: number) {
        return this.db.execute<any>('sp_Medico_GetChequeosPorPaciente', { IdPaciente: idPaciente });
    }

    async getCitasPorPaciente(idPaciente: number) {
        return this.db.execute<any>('sp_Medico_GetCitasPorPaciente', { IdPaciente: idPaciente });
    }

    async getExamenesPorPaciente(idPaciente: number) {
        return this.db.execute<any>('sp_Medico_GetExamenesPorPaciente', { IdPaciente: idPaciente });
    }

    async getVacunasPorPaciente(idPaciente: number) {
        return this.db.execute<any>('sp_Medico_GetVacunasPorPaciente', { IdPaciente: idPaciente });
    }

    async getDashboardStats(idMedico: number, pais: string) {
        const citasHoy = await this.db.execute<any>('sp_Medico_GetCitasHoy', { IdMedico: idMedico });

        const pacientesEnRojo = await this.db.execute<any>('sp_Medico_GetPacientesRojo', { Pais: pais });

        const casosAbiertosResult = await this.db.execute<any>('sp_Medico_CountCasosAbiertos', { Pais: pais });

        return {
            citasHoyCount: citasHoy.length,
            citasHoy,
            pacientesEnRojoCount: pacientesEnRojo.length,
            pacientesEnRojo,
            casosAbiertos: casosAbiertosResult[0]?.total || 0
        };
    }

    async getAgendaCitas(pais: string) {
        return this.db.execute<any>('sp_Medico_GetAgendaCitas', { Pais: pais });
    }

    async getCasosClinicos(pais: string, estado?: string) {
        return this.db.execute<any>('sp_Medico_GetCasosClinicos', {
            Pais: pais,
            Estado: estado || null
        });
    }

    async getCasoById(id: number) {
        const rows = await this.db.execute<any>('sp_Medico_GetCasoById', { Id: id });
        if (rows.length === 0) throw new NotFoundException('Caso clínico no encontrado');
        return rows[0];
    }

    async updateCaso(id: number, data: any) {
        const result = await this.db.executeOne<any>('sp_Medico_UpdateCaso', {
            Id: id,
            EstadoCaso: data.estado_caso || null,
            Semaforo: data.nivel_semaforo || null,
            Motivo: data.motivo_consulta || null,
        });
        if (!result) throw new NotFoundException('Caso clínico no encontrado');
        return result;
    }

    async getCitaById(id: number) {
        const rows = await this.db.execute<any>('sp_Medico_GetCitaById', { Id: id });
        if (rows.length === 0) throw new NotFoundException('Cita no encontrada');
        return rows[0];
    }

    async agendarCita(agendarCitaDto: AgendarCitaDto) {
        try {
            const result = await this.db.executeOne<any>('sp_Medico_AgendarCita', {
                IdCaso: agendarCitaDto.idCaso,
                IdMedico: agendarCitaDto.idMedico,
                FechaCita: agendarCitaDto.fechaCita,
                HoraCita: agendarCitaDto.horaCita,
            });
            return result;
        } catch (err: any) {
            if (err.message?.includes('no encontrado')) throw new NotFoundException(err.message);
            throw new InternalServerErrorException('Error al agendar cita: ' + err.message);
        }
    }

    async crearAtencion(crearAtencionDto: CrearAtencionDto) {
        try {
            const result = await this.db.executeOne<any>('sp_Medico_CrearAtencion', {
                IdCita: crearAtencionDto.idCita,
                IdMedico: crearAtencionDto.idMedico,
                Diagnostico: crearAtencionDto.diagnosticoPrincipal,
                Plan: crearAtencionDto.planTratamiento || null,
                Recomendaciones: crearAtencionDto.recomendaciones || null,
                RequiereSeg: crearAtencionDto.requiereSeguimiento ?? false,
                FechaSig: crearAtencionDto.fechaSiguienteCita || null,
                Peso: crearAtencionDto.pesoKg || null,
                Altura: crearAtencionDto.alturaM || null,
                Presion: crearAtencionDto.presionArterial || null,
                FC: crearAtencionDto.frecuenciaCardiaca || null,
                Temp: crearAtencionDto.temperaturaC || null
            });
            return result;
        } catch (err: any) {
            if (err instanceof NotFoundException) throw err;
            throw new InternalServerErrorException('Error al crear atención: ' + err.message);
        }
    }

    async getExamenes(pais: string) {
        return this.db.execute<any>('sp_Medico_GetExamenes', { Pais: pais });
    }

    async updateExamen(id: number, data: any) {
        const result = await this.db.executeOne<any>('sp_Medico_UpdateExamen', {
            Id: id,
            ResultadoResumen: data.resultadoResumen || null,
            EstadoExamen: data.estadoExamen || 'ENTREGADO',
            FechaResultado: data.fechaResultado || new Date().toISOString(),
        });
        if (!result) throw new NotFoundException('Examen no encontrado');
        return result;
    }

    async getSeguimientos(pais: string) {
        return this.db.execute<any>('sp_Medico_GetSeguimientos', { Pais: pais });
    }

    async updateSeguimiento(id: number, data: any) {
        const result = await this.db.executeOne<any>('sp_Medico_UpdateSeguimiento', {
            Id: id,
            Estado: data.estado_seguimiento || null,
            Notas: data.notas_seguimiento || null,
            FechaReal: data.fecha_real || null,
            Semaforo: data.nivel_semaforo || null,
        });
        if (!result) throw new NotFoundException('Seguimiento no encontrado');
        return result;
    }

    async getCitasPorMedico(idMedico: number, pais: string) {
        return this.db.execute<any>('sp_Medico_GetCitasPorMedico', { IdMedico: idMedico, Pais: pais });
    }

    async registrarVacuna(data: any) {
        return this.db.executeOne<any>('sp_Medico_RegistrarVacuna', {
            IdPaciente: +data.idPaciente,
            IdMedico: +data.idMedico,
            Tipo: data.tipoVacuna,
            Dosis: data.dosis,
            Fecha: data.fechaAplicacion,
            Obs: data.observaciones || null
        });
    }

    async crearCasoClinico(data: any) {
        return this.db.executeOne<any>('sp_Medico_CrearCaso', {
            IdPaciente: data.idPaciente,
            Semaforo: data.nivelSemaforo || 'V',
            Motivo: data.motivoConsulta,
            ResumenClinico: data.resumenClinicoUsuario || null,
            DiagnosticoUsuario: data.diagnosticoUsuario || null,
        });
    }

    // ==========================================
    // REPORTES IMPRIMIBLES
    // ==========================================

    async getReporteAtencion(idAtencion: number) {
        const rows = await this.db.execute<any>('sp_Medico_GetReporteAtencion', { Id: idAtencion });
        if (rows.length === 0) throw new NotFoundException('Atención no encontrada');
        return { ...rows[0], fechaGeneracion: new Date().toISOString() };
    }

    async getReportePaciente(idPaciente: number) {
        const rows = await this.db.execute<any>('sp_Medico_GetReportePaciente', { Id: idPaciente });
        if (rows.length === 0) throw new NotFoundException('Paciente no encontrado');
        return { ...rows[0], fechaGeneracion: new Date().toISOString() };
    }

    async getRegistrosPsicosociales(pais: string) {
        return this.db.execute<any>('sp_Medico_GetRegistrosPsicosociales', { Pais: pais });
    }

    async crearRegistroPsicosocial(data: any) {
        return this.db.executeOne<any>('sp_Medico_CrearRegistroPsicosocial', {
            IdPaciente: data.idPaciente,
            IdMedico: data.idMedico,
            IdAtencion: data.idAtencion || null,
            Confidencial: data.confidencial ? 1 : 0,
            NivelEstres: data.nivelEstres || null,
            SintomasPsico: data.sintomasPsico ? JSON.stringify(data.sintomasPsico) : null,
            EstadoAnimoGral: data.estadoAnimoGeneral || null,
            AnalisisSentiment: data.analisisSentimiento || null,
            RiesgoSuicida: data.riesgoSuicida ? 1 : 0,
            DerivarAPsico: data.derivarAPsico ? 1 : 0,
            NotasPsico: data.notasPsico || null,
        });
    }
}
