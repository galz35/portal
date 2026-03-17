import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../shared/database/database.service';
import * as argon2 from 'argon2';

export interface CandidatoLookup {
  idCandidato: number;
  correo: string;
  nombre: string;
  claveHash: string;
  activo: boolean;
}

@Injectable()
export class CandidatosService {
  private readonly logger = new Logger(CandidatosService.name);

  constructor(private readonly db: DatabaseService) {}

  async findByCorreo(correo: string): Promise<CandidatoLookup | null> {
    try {
      const result = await this.db.execute('dbo.spCand_ObtenerPorCorreo', { Correo: correo });
      const row = result.recordset?.[0];
      if (!row) return null;

      return {
        idCandidato: row.IdCandidato,
        correo: row.Correo,
        nombre: row.Nombre,
        claveHash: row.ClaveHash,
        activo: row.Activo === true,
      };
    } catch {
      return null;
    }
  }

  async registrar(nombre: string, correo: string, clavePlana: string): Promise<number | null> {
    try {
      const hash = await argon2.hash(clavePlana);
      const result = await this.db.execute('dbo.spCand_Registrar', {
        Nombre: nombre,
        Correo: correo,
        ClaveHash: hash,
      });
      return result.recordset?.[0]?.IdCandidato ?? null;
    } catch (err) {
      this.logger.error(`registrar failed: ${err}`);
      return null;
    }
  }

  async verifyPassword(hash: string, plain: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plain);
    } catch {
      return false;
    }
  }

  async getMe(idCandidato: number) {
    try {
      const result = await this.db.execute('dbo.spCand_ObtenerPerfil', { IdCandidato: idCandidato });
      const row = result.recordset?.[0];
      if (!row) return null;

      // Mapeo manual para asegurar compatibilidad con CandidateProfile (snake_case)
      return {
        id_candidato: row.IdCandidato,
        correo: row.Correo,
        nombres: row.Nombres || row.Nombre,
        apellidos: row.Apellidos || '',
        telefono: row.Telefono,
        departamento_residencia: row.DepartamentoResidencia,
        municipio_residencia: row.MunicipioResidencia,
        categoria_interes: row.CategoriaInteres,
        modalidad_preferida: row.ModalidadPreferida,
        nivel_academico: row.NivelAcademico,
        linkedin_url: row.LinkedinUrl,
        resumen_profesional: row.ResumenProfesional,
        disponibilidad_viajar: row.DisponibilidadViajar,
        disponibilidad_horario_rotativo: row.DisponibilidadHorarioRotativo,
        tiene_licencia_conducir: row.TieneLicenciaConducir,
        tipo_licencia: row.TipoLicencia,
        tiene_vehiculo_propio: row.TieneVehiculoPropio,
        fecha_registro: row.FechaRegistro,
      };
    } catch {
      return null;
    }
  }

  async actualizarPerfil(idCandidato: number, data: any) {
    try {
      await this.db.execute('dbo.spCand_ActualizarPerfil', {
        IdCandidato: idCandidato,
        Nombre: data.nombre,
        Telefono: data.telefono,
        Pais: data.pais,
        // ... otros campos
      });
      return true;
    } catch {
      return false;
    }
  }
}
