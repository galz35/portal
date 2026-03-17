import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { DatabaseModule } from './shared/database/database.module';
import { CandidatosModule } from './modules/candidatos/candidatos.module';
import { RhModule } from './modules/rh/rh.module';
import { PostulacionesModule } from './modules/postulaciones/postulaciones.module';
import { VacantesPublicasModule } from './modules/vacantes-publicas/vacantes-publicas.module';
import { CvModule } from './modules/cv/cv.module';
import { ReportesModule } from './modules/reportes/reportes.module';
import { ObservabilidadModule } from './modules/observabilidad/observabilidad.module';
import { SecurityModule } from './shared/security/security.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    SecurityModule,
    CandidatosModule,
    RhModule,
    PostulacionesModule,
    VacantesPublicasModule,
    HealthModule,
    AuthModule,
    CvModule,
    ReportesModule,
    ObservabilidadModule,
  ],
})
export class AppModule {}
