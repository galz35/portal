import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../shared/database/database.service';

@Injectable()
export class CvService {
  private readonly logger = new Logger(CvService.name);

  constructor(private readonly db: DatabaseService) {}

  async obtenerCvActual(idPersona: number) {
    try {
      const result = await this.db.execute('dbo.spCv_ObtenerCvPrincipalPorPersona', { IdPersona: idPersona });
      return result.recordset?.[0] || null;
    } catch { return null; }
  }

  async listarHistorial(idPersona: number) {
    try {
      const result = await this.db.execute('dbo.spCv_ListarArchivosPersona', { IdPersona: idPersona });
      return result.recordset;
    } catch { return []; }
  }

  async obtenerAnalisisActual(idPersona: number) {
    try {
      const result = await this.db.execute('dbo.spIA_ObtenerAnalisisPersonaVigente', { IdPersona: idPersona });
      return result.recordset?.[0] || null;
    } catch { return null; }
  }

  async listarHistorialAnalisis(idPersona: number) {
    try {
      const result = await this.db.execute('dbo.spIA_ListarHistoriaAnalisisPersona', { IdPersona: idPersona });
      return result.recordset;
    } catch { return []; }
  }
}
