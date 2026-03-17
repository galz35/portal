import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { PortalAuthGuard } from '../../shared/guards/portal-auth.guard';

@Controller('api/vacantes/rh/reportes')
@UseGuards(PortalAuthGuard)
export class ReportesController {
  constructor(private readonly service: ReportesService) {}

  @Get()
  async reportes() {
    return this.service.obtenerReportesRH();
  }
}
