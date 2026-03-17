import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { PortalIntrospectService, PortalIdentity } from '../security/portal-introspect.service';

@Injectable()
export class PortalAuthGuard implements CanActivate {
  constructor(private readonly introspectService: PortalIntrospectService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const identity = await this.introspectService.introspect(request);
    
    // Attach identity to request
    (request as any).portalIdentity = identity;
    
    return true;
  }
}
