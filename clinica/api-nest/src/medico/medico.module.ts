import { Module } from '@nestjs/common';
import { MedicoController } from './medico.controller';
import { MedicoService } from './medico.service';

@Module({
    imports: [],
    controllers: [MedicoController],
    providers: [MedicoService],
})
export class MedicoModule { }

