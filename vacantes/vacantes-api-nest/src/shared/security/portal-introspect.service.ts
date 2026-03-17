import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FastifyRequest } from 'fastify';
import axios from 'axios';

export interface PortalIdentity {
  idSesionPortal: number;
  idCuentaPortal: number;
  idPersona: number | null;
  usuario: string;
  nombre: string;
  correo?: string;
  carnet?: string;
  apps: string[];
  permisos: string[];
}

@Injectable()
export class PortalIntrospectService {
  private readonly logger = new Logger(PortalIntrospectService.name);
  private readonly coreApiUrl: string;

  constructor(private readonly config: ConfigService) {
    this.coreApiUrl = this.config.get<string>('PORTAL_API_URL', 'http://localhost:3110').replace(/\/$/, '');
  }

  async introspect(request: FastifyRequest, requireCsrf = false): Promise<PortalIdentity> {
    const portalSid = (request.cookies as any)?.['portal_sid'];
    if (!portalSid) {
      throw new HttpException('Sesion de portal no encontrada', HttpStatus.UNAUTHORIZED);
    }

    const headers: Record<string, string> = {
      cookie: `portal_sid=${portalSid}`,
    };

    if (requireCsrf) {
      const csrfToken = request.headers['x-csrf-token'] as string;
      if (csrfToken) headers['x-csrf-token'] = csrfToken;
    }

    const correlationId = request.headers['x-correlation-id'] as string;
    if (correlationId) headers['x-correlation-id'] = correlationId;

    try {
      const response = await axios.post(`${this.coreApiUrl}/api/auth/introspect`, 
        { requireCsrf }, 
        { headers }
      );

      const data = response.data; // Ya no hay wrapper .data.data (compatibilidad con Rust)
      if (!data?.authenticated) {
        throw new HttpException('Autenticacion de portal invalida', HttpStatus.UNAUTHORIZED);
      }

      const identity = data.identity;
      return {
        idSesionPortal: identity.idSesionPortal,
        idCuentaPortal: identity.idCuentaPortal,
        idPersona: (identity.idPersona > 0) ? identity.idPersona : null,
        usuario: identity.usuario,
        nombre: identity.nombre,
        correo: identity.correo, // Nuevo campo
        carnet: identity.carnet, // Nuevo campo
        apps: identity.apps ?? [],
        permisos: identity.permisos ?? [],
      };
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new HttpException('Sesion de portal expirada o invalida', HttpStatus.UNAUTHORIZED);
      }
      if (error.response?.status === 403) {
        throw new HttpException('Falta validacion CSRF de portal', HttpStatus.FORBIDDEN);
      }
      this.logger.error(`Introspect failed: ${error.message}`);
      throw new HttpException('Error de comunicacion con el portal', HttpStatus.BAD_GATEWAY);
    }
  }
}
