import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { CvService } from './cv.service';
import { PortalAuthGuard } from '../../shared/guards/portal-auth.guard';

@Controller('api/vacantes/cv')
@UseGuards(PortalAuthGuard)
export class CvController {
  constructor(private readonly service: CvService) {}

  @Get()
  @Get('actual')
  async actual(@Req() req: any) {
    const user = req.portalIdentity;
    if (!user.idPersona) return { archivo: null };
    const archivo = await this.service.obtenerCvActual(user.idPersona);
    return { archivo };
  }

  @Get('historial')
  async historial(@Req() req: any) {
    const user = req.portalIdentity;
    if (!user.idPersona) return { items: [] };
    const items = await this.service.listarHistorial(user.idPersona);
    return { items };
  }

  @Get('analisis/actual')
  async analisisActual(@Req() req: any) {
    const user = req.portalIdentity;
    if (!user.idPersona) return null;
    return this.service.obtenerAnalisisActual(user.idPersona);
  }

  @Get('analisis/historial')
  async analisisHistorial(@Req() req: any) {
    const user = req.portalIdentity;
    if (!user.idPersona) return [];
    return this.service.listarHistorialAnalisis(user.idPersona);
  }
}
