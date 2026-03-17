import { Injectable, NotFoundException } from '@nestjs/common';
import { DbService } from '../database/db.service';

@Injectable()
export class SeguimientoService {
    constructor(private db: DbService) { }

    async create(createSeguimientoDto: any) {
        return this.db.executeOne<any>('sp_Seguimiento_Crear', {
            IdCaso: createSeguimientoDto.idCaso || null,
            IdAtencion: createSeguimientoDto.idAtencion || null,
            IdPaciente: createSeguimientoDto.idPaciente,
            IdUsuarioResp: createSeguimientoDto.idUsuarioResp || null,
            FechaProg: createSeguimientoDto.fechaProgramada,
            Tipo: createSeguimientoDto.tipoSeguimiento || 'PRESENCIAL',
            Estado: createSeguimientoDto.estadoSeguimiento || 'PENDIENTE',
            Semaforo: createSeguimientoDto.nivelSemaforo || 'V',
            Notas: createSeguimientoDto.notasSeguimiento || null,
            Motivo: createSeguimientoDto.motivo || null,
        });
    }

    async findAll(pais?: string) {
        return this.db.execute<any>('sp_Seguimiento_GetAll', { Pais: pais || null });
    }

    async findOne(id: number) {
        const rows = await this.db.execute<any>('sp_Seguimiento_GetById', { Id: id });
        if (rows.length === 0) throw new NotFoundException('Seguimiento no encontrado');
        return rows[0];
    }

    async update(id: number, updateSeguimientoDto: any) {
        const result = await this.db.executeOne<any>('sp_Seguimiento_Update', {
            Id: id,
            Estado: updateSeguimientoDto.estadoSeguimiento || null,
            Notas: updateSeguimientoDto.notasSeguimiento || null,
            FechaReal: updateSeguimientoDto.fechaReal || null,
            Semaforo: updateSeguimientoDto.nivelSemaforo || null,
        });
        if (!result) throw new NotFoundException('Seguimiento no encontrado');
        return result;
    }

    async remove(id: number) {
        await this.db.executeNonQuery('sp_Seguimiento_Delete', { Id: id });
        return { message: 'Seguimiento eliminado' };
    }
}
