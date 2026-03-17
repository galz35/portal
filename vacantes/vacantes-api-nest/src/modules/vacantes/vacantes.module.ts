import { Module } from '@nestjs/common';

import { PublicVacantesController } from './controllers/public-vacantes.controller';
import { RhVacantesController } from './controllers/rh-vacantes.controller';
import { VacantesService } from './vacantes.service';

@Module({
  controllers: [PublicVacantesController, RhVacantesController],
  providers: [VacantesService],
})
export class VacantesModule {}
