import { Module } from '@nestjs/common';
import { CvController } from './cv.controller';
import { CvService } from './cv.service';
import { PortalIntrospectService } from '../../shared/security/portal-introspect.service';

@Module({
  controllers: [CvController],
  providers: [CvService, PortalIntrospectService],
})
export class CvModule {}
