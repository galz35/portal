import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../shared/database/database.service';

@Injectable()
export class PostulacionesService {
  private readonly logger = new Logger(PostulacionesService.name);

  constructor(private readonly db: DatabaseService) {}

  async postularCandidato(idCandidato: number, idVacante: number, datos: any) {
    try {
      await this.db.execute('dbo.spPost_PostularCandidato', {
        IdCandidato: idCandidato,
        IdVacante: idVacante,
        // ...
      });
      return true;
    } catch { return false; }
  }

  async postularInterno(idPersona: number, idVacante: number, datos: any) {
    try {
      await this.db.execute('dbo.spPost_PostularInterno', {
        IdPersona: idPersona,
        IdVacante: idVacante,
        // ...
      });
      return true;
    } catch { return false; }
  }

  async listarPorCandidato(idCandidato: number) {
    try {
      const result = await this.db.execute('dbo.spPost_ListarPorCandidato', { IdCandidato: idCandidato });
      return result.recordset;
    } catch { return []; }
  }

  async listarPorPersona(idPersona: number) {
    try {
      const result = await this.db.execute('dbo.spPost_ListarPorPersona', { IdPersona: idPersona });
      return result.recordset;
    } catch { return []; }
  }
}
