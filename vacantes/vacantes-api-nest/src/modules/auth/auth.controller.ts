import { Controller, Get, Post, Body, Req, Res, UseGuards, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { PortalAuthGuard } from '../../shared/guards/portal-auth.guard';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('session-state')
  @UseGuards(PortalAuthGuard)
  async sessionState(@Req() request: FastifyRequest) {
    const identity = (request as any).portalIdentity;
    return {
      authenticated: true,
      identity,
    };
  }

  @Get('me')
  @UseGuards(PortalAuthGuard)
  async me(@Req() request: FastifyRequest) {
    const identity = (request as any).portalIdentity;
    if (!identity) throw new UnauthorizedException('No hay sesión de portal activa');
    return identity;
  }

  @Post('sso-login')
  async ssoLogin(@Body('token') token: string, @Res() reply: FastifyReply) {
    try {
      if (!token) throw new UnauthorizedException('Token no proporcionado');
      const user = await this.authService.validateSSOToken(token);
      
      return reply.status(HttpStatus.OK).send({
        ok: true,
        user
      });
    } catch (err: any) {
      const msg = err.message || 'Error en validación SSO';
      console.error(`[SSO Controller] ${msg}`);
      throw new UnauthorizedException(msg);
    }
  }
}
