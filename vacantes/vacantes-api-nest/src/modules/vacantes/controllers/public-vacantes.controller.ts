import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import { PostularVacanteDto } from '../dto/postular-vacante.dto';
import { VacantesService } from '../vacantes.service';

@Controller('api/vacantes')
export class PublicVacantesController {
  constructor(private readonly vacantesService: VacantesService) {}

  @Get('publicas')
  listPublicas() {
    return {
      items: this.vacantesService.listPublicVacantes(),
    };
  }

  @Get('publicas/:slug')
  getPublica(@Param('slug') slug: string) {
    return this.vacantesService.getPublicVacanteBySlug(slug);
  }

  @Get('mis-postulaciones')
  getMisPostulaciones(@Query('id_persona') idPersona?: string) {
    return this.vacantesService.listMisPostulaciones(
      typeof idPersona === 'string' && idPersona.length > 0 ? Number(idPersona) : undefined,
    );
  }

  @Post('postular')
  postular(@Body() payload: PostularVacanteDto) {
    return this.vacantesService.postular(payload);
  }
}
