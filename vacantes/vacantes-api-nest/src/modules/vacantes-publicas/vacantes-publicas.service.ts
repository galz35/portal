import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../shared/database/database.service';

@Injectable()
export class VacantesPublicasService {
  private readonly logger = new Logger(VacantesPublicasService.name);

  constructor(private readonly db: DatabaseService) {}

  async listarPublicas() {
    try {
      const result = await this.db.execute('dbo.spVac_ListarPublicas');
      return result.recordset;
    } catch (err) {
      this.logger.error(`listarPublicas failed: ${err}`);
      return [];
    }
  }

  async obtenerDetallePorSlug(slug: string) {
    try {
      const result = await this.db.execute('dbo.spVac_ObtenerDetallePorSlug', { Slug: slug });
      return result.recordset?.[0] || null;
    } catch (err) {
      this.logger.error(`obtenerDetallePorSlug failed: ${err}`);
      return null;
    }
  }
}
