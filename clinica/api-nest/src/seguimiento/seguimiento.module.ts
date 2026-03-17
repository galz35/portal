import { Module } from '@nestjs/common';
import { SeguimientoController } from './seguimiento.controller';
import { SeguimientoService } from './seguimiento.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [AuthModule],
    controllers: [SeguimientoController],
    providers: [SeguimientoService],
})
export class SeguimientoModule { }

