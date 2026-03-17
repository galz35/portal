import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Req,
  Res,
  HttpStatus,
  UseGuards,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { CandidatosService } from './candidatos.service';
import { CandidateSessionService } from './candidate-session.service';
import { CandidateCookiesService } from '../../shared/security/candidate-cookies.service';
import { SessionTokenService } from '../../shared/security/session-token.service';
import { CsrfService } from '../../shared/security/csrf.service';
import { RateLimitService } from '../../shared/security/rate-limit.service';
import { CandidateAuthGuard } from './guards/candidate-auth.guard';
import { extractClientIp } from '../../shared/security/request-metadata';

@Controller('api/candidatos')
export class CandidatosController {
  constructor(
    private readonly candidatosService: CandidatosService,
    private readonly sessionService: CandidateSessionService,
    private readonly cookies: CandidateCookiesService,
    private readonly tokenService: SessionTokenService,
    private readonly csrfService: CsrfService,
    private readonly rateLimitService: RateLimitService,
  ) {}

  @Post('register')
  async register(@Body() body: any, @Res() reply: FastifyReply) {
    const existing = await this.candidatosService.findByCorreo(body.correo);
    if (existing) {
      throw new BadRequestException('El correo ya esta registrado');
    }

    const idCandidato = await this.candidatosService.registrar(body.nombre, body.correo, body.clave);
    if (!idCandidato) {
      throw new BadRequestException('Error al registrar candidato');
    }

    return reply.status(HttpStatus.CREATED).send({ ok: true, message: 'Registro exitoso' });
  }

  @Post('login')
  async login(@Body() body: any, @Req() request: FastifyRequest, @Res() reply: FastifyReply) {
    const ip = extractClientIp(request);
    const limit = this.rateLimitService.checkSlidingWindow(`cand-login:${ip}`, 10, 300);
    if (!limit.allowed) {
      return reply.status(HttpStatus.TOO_MANY_REQUESTS).send({
        ok: false,
        message: 'Demasiados intentos',
        retryAfterSeconds: limit.retryAfterSeconds,
      });
    }

    const cand = await this.candidatosService.findByCorreo(body.correo);
    if (!cand || !cand.activo) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const passwordOk = await this.candidatosService.verifyPassword(cand.claveHash, body.clave);
    if (!passwordOk) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const sid = this.tokenService.generarSid();
    const sidHash = this.tokenService.hashToken(sid);
    const idSesion = await this.sessionService.crearSesion(cand.idCandidato, sidHash);
    
    if (!idSesion) {
      throw new BadRequestException('Error al iniciar sesion');
    }

    const csrfToken = this.csrfService.generarCsrfToken();
    const csrfHash = this.csrfService.hashCsrfToken(csrfToken);
    await this.sessionService.crearCsrfToken(idSesion, csrfHash);

    this.cookies.appendSessionCookies(reply, sid, csrfToken);

    return reply.status(HttpStatus.OK).send({
      ok: true,
      usuario: cand.nombre,
    });
  }

  @Get('me')
  @UseGuards(CandidateAuthGuard)
  async me(@Req() request: FastifyRequest) {
    const cand = (request as any).candidate;
    const profile = await this.candidatosService.getMe(cand.idCandidato);
    return { ok: true, perfil: profile };
  }

  @Put('me')
  @UseGuards(CandidateAuthGuard)
  async updateMe(@Body() body: any, @Req() request: FastifyRequest) {
    const cand = (request as any).candidate;
    const ok = await this.candidatosService.actualizarPerfil(cand.idCandidato, body);
    return { ok };
  }

  @Post('logout')
  @UseGuards(CandidateAuthGuard)
  async logout(@Req() request: FastifyRequest, @Res() reply: FastifyReply) {
    const cand = (request as any).candidate;
    await this.sessionService.revocar(cand.idSesionCandidato);
    this.cookies.clearSessionCookies(reply);
    return reply.send({ ok: true });
  }
}
