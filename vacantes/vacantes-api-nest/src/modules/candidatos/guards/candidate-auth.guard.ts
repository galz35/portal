import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { CandidateCookiesService } from '../../../shared/security/candidate-cookies.service';
import { SessionTokenService } from '../../../shared/security/session-token.service';
import { CandidateSessionService } from '../candidate-session.service';

@Injectable()
export class CandidateAuthGuard implements CanActivate {
  constructor(
    private readonly cookies: CandidateCookiesService,
    private readonly tokenService: SessionTokenService,
    private readonly sessionService: CandidateSessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();

    const sid = this.cookies.readCookie(request, this.cookies.accessCookiePolicy().name);
    if (!sid) {
      throw new UnauthorizedException('Inicie sesion para continuar');
    }

    const sidHash = this.tokenService.hashToken(sid);
    const session = await this.sessionService.resolverPorSidHash(sidHash);

    if (!session || !session.valida) {
      throw new UnauthorizedException('Sesion expirada o invalida');
    }

    (request as any).candidate = {
      idCandidato: session.idCandidato,
      idSesionCandidato: session.idSesionCandidato,
    };

    return true;
  }
}
