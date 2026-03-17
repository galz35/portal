import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../shared/database/database.service';

export interface CandidateSession {
  idSesionCandidato: number;
  idCandidato: number;
  valida: boolean;
}

@Injectable()
export class CandidateSessionService {
  private readonly logger = new Logger(CandidateSessionService.name);

  constructor(private readonly db: DatabaseService) {}

  async crearSesion(idCandidato: number, sidHash: string): Promise<number | null> {
    try {
      const fechaExpiracion = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const request = this.db.Pool.request();
      request.input('IdCandidato', idCandidato);
      request.input('SidHash', sidHash);
      request.input('UserAgent', 'vacantes-api-nest');
      request.input('FechaExpiracion', fechaExpiracion);
      const result = await request.execute('dbo.spCand_Sesion_Crear');
      return result.recordset?.[0]?.IdSesionCandidato ?? null;
    } catch (err) {
      this.logger.error(`crearSesion failed: ${err}`);
      return null;
    }
  }

  async resolverPorSidHash(sidHash: string): Promise<CandidateSession | null> {
    try {
      const request = this.db.Pool.request();
      request.input('SidHash', sidHash);
      const result = await request.execute('dbo.spCand_Sesion_Validar');
      const row = result.recordset?.[0];
      if (!row) return null;

      return {
        idSesionCandidato: row.IdSesionCandidato,
        idCandidato: row.IdCandidato,
        valida: row.Valida === true,
      };
    } catch {
      return null;
    }
  }

  async revocar(idSesionCandidato: number): Promise<void> {
    try {
      const request = this.db.Pool.request();
      request.input('IdSesionCandidato', idSesionCandidato);
      await request.execute('dbo.spCand_Sesion_Revocar');
    } catch {}
  }

  async crearCsrfToken(idSesionCandidato: number, tokenHash: string): Promise<void> {
    try {
      const fechaExpiracion = new Date(Date.now() + 2 * 60 * 60 * 1000);
      const request = this.db.Pool.request();
      request.input('IdSesionCandidato', idSesionCandidato);
      request.input('TokenHash', tokenHash);
      request.input('FechaExpiracion', fechaExpiracion);
      await request.execute('dbo.spCand_Csrf_Crear');
    } catch {}
  }

  async validarCsrfToken(idSesionCandidato: number, tokenHash: string): Promise<boolean> {
    try {
      const request = this.db.Pool.request();
      request.input('IdSesionCandidato', idSesionCandidato);
      request.input('TokenHash', tokenHash);
      const result = await request.execute('dbo.spCand_Csrf_Validar');
      return result.recordset?.[0]?.EsValido === true;
    } catch {
      return false;
    }
  }
}
