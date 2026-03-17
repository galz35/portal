import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { DbService } from '../database/db.service';
import { SolicitudCitaDto } from './dto/solicitud-cita.dto';

@Injectable()
export class PacienteService {
    constructor(private db: DbService) { }

    async getMisChequeos(idPaciente: number) {
        return this.db.execute<any>('sp_Paciente_GetMisChequeos', { IdPaciente: idPaciente });
    }

    async getMisExamenes(idPaciente: number) {
        return this.db.execute<any>('sp_Paciente_GetMisExamenes', { IdPaciente: idPaciente });
    }

    async getMisVacunas(idPaciente: number) {
        return this.db.execute<any>('sp_Paciente_GetMisVacunas', { IdPaciente: idPaciente });
    }

    async getDashboardStats(idPaciente: number) {
        const rows = await this.db.execute<any>('sp_Paciente_GetDashboard', { IdPaciente: idPaciente });
        const data = rows[0] || {};

        // Timeline
        const timeline = await this.db.execute<any>('sp_Paciente_GetTimeline', { IdPaciente: idPaciente });

        return {
            kpis: {
                estadoActual: data.nivel_semaforo || 'V',
                ultimoChequeo: data.ultimo_chequeo_fecha || null,
                proximaCita: data.proxima_cita_fecha ? `${data.proxima_cita_fecha} ${data.proxima_cita_hora || ''}`.trim() : null,
                seguimientosActivos: data.seguimientos_activos || 0
            },
            ultimoChequeoData: data.ultimo_chequeo_id ? {
                id_chequeo: data.ultimo_chequeo_id,
                fecha_registro: data.ultimo_chequeo_fecha,
                nivel_semaforo: data.ultimo_chequeo_semaforo,
                datos_completos: data.ultimo_chequeo_datos,
            } : null,
            timeline
        };
    }

    async solicitarCita(idPaciente: number, solicitudDto: SolicitudCitaDto) {
        try {
            const result = await this.db.executeOne<any>('sp_Paciente_SolicitarCita', {
                IdPaciente: idPaciente,
                Ruta: solicitudDto.ruta || 'consulta',
                ComentarioGeneral: solicitudDto.comentarioGeneral || 'Solicitud de consulta',
                DatosCompletos: typeof solicitudDto.datosCompletos === 'string'
                    ? solicitudDto.datosCompletos
                    : JSON.stringify(solicitudDto.datosCompletos),
            });
            return result || { message: 'Solicitud procesada con éxito' };
        } catch (err: any) {
            throw new InternalServerErrorException('Error al procesar solicitud: ' + err.message);
        }
    }

    async getMisCitas(idPaciente: number) {
        return this.db.execute<any>('sp_Paciente_GetMisCitas', { IdPaciente: idPaciente });
    }

    async crearChequeo(idPaciente: number, data: any) {
        try {
            const result = await this.db.executeOne<any>('sp_Paciente_CrearChequeo', {
                IdPaciente: idPaciente,
                NivelRiesgo: data.nivelRiesgo || data.nivelSemaforo || 'V',
                DatosCompletos: typeof data === 'string' ? data : JSON.stringify(data),
            });
            return result;
        } catch (err: any) {
            throw new InternalServerErrorException('Error al crear chequeo: ' + err.message);
        }
    }
}
