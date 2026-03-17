import { Module } from '@nestjs/common';
import { PostulacionesController } from './postulaciones.controller';
import { PostulacionesService } from './postulaciones.service';
import { CandidatosModule } from '../candidatos/candidatos.module';
import { PortalIntrospectService } from '../../shared/security/portal-introspect.service';

@Module({
  imports: [CandidatosModule],
  controllers: [PostulacionesController],
  providers: [PostulacionesService, PortalIntrospectService],
})
export class PostulacionesModule {}
