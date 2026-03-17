import { Module } from '@nestjs/common';
import { RhController } from './rh.controller';
import { RhService } from './rh.service';
import { PortalIntrospectService } from '../../shared/security/portal-introspect.service';

@Module({
  controllers: [RhController],
  providers: [RhService, PortalIntrospectService],
})
export class RhModule {}
