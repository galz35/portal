import { Module } from '@nestjs/common';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';
import { PortalIntrospectService } from '../../shared/security/portal-introspect.service';

@Module({
  controllers: [ReportesController],
  providers: [ReportesService, PortalIntrospectService],
})
export class ReportesModule {}
