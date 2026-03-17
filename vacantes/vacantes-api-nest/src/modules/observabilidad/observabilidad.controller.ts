import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from '../../shared/database/database.service';

@Controller('api/observabilidad')
export class ObservabilidadController {
  constructor(private readonly db: DatabaseService) {}

  @Get('snapshot')
  async snapshot() {
    try {
        const vResult = await this.db.execute('dbo.spRep_ObservabilidadVacantes');
        const pResult = await this.db.execute('dbo.spRep_ObservabilidadPostulaciones');
        
        const vacantes = vResult.recordset?.[0] || {};
        const postulaciones = pResult.recordset?.[0] || {};

        return {
            vacantesPublicas: vacantes.VacantesPublicas ?? 0,
            vacantesActivas: vacantes.VacantesActivas ?? 0,
            postulacionesInternas: postulaciones.PostulacionesInternas ?? 0,
            postulacionesExternas: postulaciones.PostulacionesExternas ?? 0,
            cvsActivos: postulaciones.CvsActivos ?? 0,
            cvIntentosRechazados24h: postulaciones.IntentosCvRechazados24h ?? 0,
            operacionCandidatoFallida24h: postulaciones.IntentosOperacionFallidos24h ?? 0,
            analisisIaFallidos24h: postulaciones.AnalisisIaFallidos24h ?? 0
        };
    } catch { return {}; }
  }
}
