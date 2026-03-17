import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { PacienteService } from './paciente.service';
import { SolicitudCitaDto } from './dto/solicitud-cita.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('paciente')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PACIENTE')
@Controller('paciente')
export class PacienteController {
    constructor(private readonly pacienteService: PacienteService) { }

    @Get('dashboard')
    @ApiOperation({ summary: 'Obtener KPIs del dashboard de paciente' })
    getDashboard(@Request() req) {
        return this.pacienteService.getDashboardStats(req.user.idPaciente);
    }

    @Post('solicitar-cita')
    @ApiOperation({ summary: 'Solicitar una cita (Wizard)' })
    solicitarCita(@Request() req, @Body() solicitudDto: SolicitudCitaDto) {
        return this.pacienteService.solicitarCita(req.user.idPaciente, solicitudDto);
    }

    @Get('mis-citas')
    @ApiOperation({ summary: 'Obtener historial de citas' })
    getMisCitas(@Request() req) {
        return this.pacienteService.getMisCitas(req.user.idPaciente);
    }

    @Get('mis-chequeos')
    @ApiOperation({ summary: 'Obtener historial de chequeos' })
    getMisChequeos(@Request() req) {
        return this.pacienteService.getMisChequeos(req.user.idPaciente);
    }

    @Get('mis-examenes')
    @ApiOperation({ summary: 'Obtener historial de exámenes' })
    getMisExamenes(@Request() req) {
        return this.pacienteService.getMisExamenes(req.user.idPaciente);
    }

    @Get('mis-vacunas')
    @ApiOperation({ summary: 'Obtener historial de vacunas' })
    getMisVacunas(@Request() req) {
        return this.pacienteService.getMisVacunas(req.user.idPaciente);
    }

    @Post('chequeo')
    @ApiOperation({ summary: 'Registrar un nuevo chequeo de bienestar' })
    crearChequeo(@Request() req, @Body() data: any) {
        return this.pacienteService.crearChequeo(req.user.idPaciente, data);
    }
}
