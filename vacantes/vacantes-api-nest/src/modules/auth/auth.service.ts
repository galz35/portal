import { Injectable } from '@nestjs/common';
import { PortalIntrospectService, PortalIdentity } from '../../shared/security/portal-introspect.service';
import { FastifyRequest } from 'fastify';

@Injectable()
export class AuthService {
  constructor(private readonly introspectService: PortalIntrospectService) {}

  async getIdentity(request: FastifyRequest): Promise<PortalIdentity | null> {
    try {
      return await this.introspectService.introspect(request);
    } catch {
      return null;
    }
  }
  async validateSSOToken(token: string) {
    const SECRET = 'ClaroSSO_Shared_Secret_2026_!#';
    const jwt = require('jsonwebtoken');

    try {
      console.log(`[SSO] Validando ticket en Vacantes con secreto maestro...`);
      const decoded = jwt.verify(token, SECRET, { clockTolerance: 10 });
      
      if (decoded.type !== 'SSO_PORTAL') {
        throw new Error('Tipo de token no reconocido para SSO');
      }

      // Devolver los datos del usuario para el frontend
      return {
        idCuentaPortal: decoded.sub,
        usuario: decoded.username,
        carnet: decoded.carnet,
        nombre: decoded.name,
        correo: decoded.correo,
        apps: decoded.apps || [],
        permisos: decoded.permisos || [],
      };
    } catch (err: any) {
      console.error(`[SSO] Error de validación en Vacantes: ${err.message}`);
      throw new Error('Token de SSO inválido, expirado o firma incorrecta');
    }
  }
}
