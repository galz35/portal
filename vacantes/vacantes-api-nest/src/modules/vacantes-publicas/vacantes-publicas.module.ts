import { Module } from '@nestjs/common';
import { VacantesPublicasController } from './vacantes-publicas.controller';
import { VacantesPublicasService } from './vacantes-publicas.service';

@Module({
  controllers: [VacantesPublicasController],
  providers: [VacantesPublicasService],
})
export class VacantesPublicasModule {}
