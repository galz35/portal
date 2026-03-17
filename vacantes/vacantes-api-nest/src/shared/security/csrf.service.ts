import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SessionTokenService } from './session-token.service';
import { CandidateCookiesService } from './candidate-cookies.service';
import { FastifyRequest } from 'fastify';

@Injectable()
export class CsrfService {
  constructor(
    private readonly tokenService: SessionTokenService,
    private readonly cookiesService: CandidateCookiesService,
  ) {}

  generarCsrfToken(): string {
    return `csrf_${randomUUID()}`;
  }

  hashCsrfToken(token: string): string {
    return this.tokenService.hashToken(token);
  }

  validarCsrfRequest(request: FastifyRequest): string | null {
    const headerToken = (request.headers['x-csrf-token'] as string)?.trim();
    if (!headerToken) return null;

    const cookieToken = this.cookiesService.readCookie(request, this.cookiesService.csrfCookiePolicy().name);
    if (!cookieToken) return null;

    return headerToken === cookieToken ? headerToken : null;
  }
}
