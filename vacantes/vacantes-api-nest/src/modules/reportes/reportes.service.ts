import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../shared/database/database.service';

@Injectable()
export class ReportesService {
  private readonly logger = new Logger(ReportesService.name);

  constructor(private readonly db: DatabaseService) {}

  async obtenerReportesRH() {
    try {
      const request = this.db.Pool.request();
      
      const vResult = await request.execute('dbo.spRep_VacantesResumen');
      const pResult = await request.execute('dbo.spRep_PostulacionesResumen');
      const paisResult = await request.execute('dbo.spRep_PostulacionesPorPais');

      return {
        resumen: {
            vacantesActivas: vResult.recordset?.[0]?.VacantesActivas ?? 0,
            vacantesOcupadas: vResult.recordset?.[0]?.VacantesOcupadas ?? 0,
            vacantesCerradas: vResult.recordset?.[0]?.VacantesCerradas ?? 0,
            totalPostulaciones: pResult.recordset?.[0]?.TotalPostulaciones ?? 0
        },
        tiposPostulacion: [
            { tipoPostulacion: 'INTERNA', total: pResult.recordset?.[0]?.Internas ?? 0 },
            { tipoPostulacion: 'EXTERNA', total: pResult.recordset?.[0]?.Externas ?? 0 }
        ],
        postulacionesPorPais: paisResult.recordset ?? []
      };
    } catch { return {}; }
  }
}
