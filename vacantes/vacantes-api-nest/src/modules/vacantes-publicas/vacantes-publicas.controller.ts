import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { VacantesPublicasService } from './vacantes-publicas.service';

@Controller('api/vacantes/publicas')
export class VacantesPublicasController {
  constructor(private readonly service: VacantesPublicasService) {}

  @Get()
  async listar() {
    const items = await this.service.listarPublicas();
    return { items };
  }

  @Get(':slug')
  async detalle(@Param('slug') slug: string) {
    const vacante = await this.service.obtenerDetallePorSlug(slug);
    if (!vacante) {
      throw new NotFoundException('Vacante no encontrada');
    }
    return vacante;
  }
}
