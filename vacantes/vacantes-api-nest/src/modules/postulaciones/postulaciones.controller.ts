import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { PostulacionesService } from './postulaciones.service';
import { CandidateAuthGuard } from '../candidatos/guards/candidate-auth.guard';
import { PortalAuthGuard } from '../../shared/guards/portal-auth.guard';

@Controller('api')
export class PostulacionesController {
  constructor(private readonly service: PostulacionesService) {}

  @Post('candidatos/postular')
  @UseGuards(CandidateAuthGuard)
  async postularExterno(@Body() body: any, @Req() req: any) {
    const cand = req.candidate;
    return this.service.postularCandidato(cand.idCandidato, body.idVacante, body);
  }

  @Get('candidatos/mis-postulaciones')
  @UseGuards(CandidateAuthGuard)
  async misPostulacionesExterno(@Req() req: any) {
    const cand = req.candidate;
    const items = await this.service.listarPorCandidato(cand.idCandidato);
    return { items };
  }

  @Post('vacantes/postular')
  @UseGuards(PortalAuthGuard)
  async postularInterno(@Body() body: any, @Req() req: any) {
    const user = req.portalIdentity;
    if (!user.idPersona) throw new Error('Usuario sin idPersona');
    return this.service.postularInterno(user.idPersona, body.idVacante, body);
  }

  @Get('vacantes/mis-postulaciones')
  @UseGuards(PortalAuthGuard)
  async misPostulacionesInterno(@Req() req: any) {
    const user = req.portalIdentity;
    if (!user.idPersona) return [];
    const items = await this.service.listarPorPersona(user.idPersona);
    return { items };
  }
}
