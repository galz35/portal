import { Controller, Get, Post, Body, UseGuards, Request, Param, Query, Patch } from '@nestjs/common';
import { MedicoService } from './medico.service';
import { AgendarCitaDto } from './dto/agendar-cita.dto';
import { CrearAtencionDto } from './dto/crear-atencion.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('medico')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('MEDICO')
@Controller('medico')
export class MedicoController {
    constructor(private readonly medicoService: MedicoService) { }

    @Get('dashboard')
    @ApiOperation({ summary: 'Obtener KPIs del dashboard de médico' })
    getDashboard(@Request() req) {
        return this.medicoService.getDashboardStats(req.user.idMedico, req.user.pais);
    }

    @Get('agenda-citas')
    @ApiOperation({ summary: 'Obtener casos abiertos para agendar' })
    getAgendaCitas(@Request() req) {
        return this.medicoService.getAgendaCitas(req.user.pais);
    }

    @Post('agenda-citas/agendar')
    @ApiOperation({ summary: 'Agendar una cita para un caso clínico' })
    agendarCita(@Body() agendarCitaDto: AgendarCitaDto) {
        return this.medicoService.agendarCita(agendarCitaDto);
    }

    @Post('atencion')
    @ApiOperation({ summary: 'Registrar atención médica' })
    crearAtencion(@Body() crearAtencionDto: CrearAtencionDto) {
        return this.medicoService.crearAtencion(crearAtencionDto);
    }
    @Get('pacientes')
    @ApiOperation({ summary: 'Obtener lista de pacientes del país' })
    getPacientes(@Request() req) {
        return this.medicoService.getPacientes(req.user.pais);
    }

    @Get('pacientes/:id/chequeos')
    @ApiOperation({ summary: 'Obtener chequeos de un paciente' })
    getChequeosPorPaciente(@Param('id') id: string) {
        return this.medicoService.getChequeosPorPaciente(+id);
    }

    @Get('pacientes/:id/citas')
    @ApiOperation({ summary: 'Obtener citas de un paciente' })
    getCitasPorPaciente(@Param('id') id: string) {
        return this.medicoService.getCitasPorPaciente(+id);
    }

    @Get('pacientes/:id/examenes')
    @ApiOperation({ summary: 'Obtener exámenes de un paciente' })
    getExamenesPorPaciente(@Param('id') id: string) {
        return this.medicoService.getExamenesPorPaciente(+id);
    }

    @Get('pacientes/:id/vacunas')
    @ApiOperation({ summary: 'Obtener vacunas de un paciente' })
    getVacunasPorPaciente(@Param('id') id: string) {
        return this.medicoService.getVacunasPorPaciente(+id);
    }

    @Get('casos')
    @ApiOperation({ summary: 'Obtener casos clínicos' })
    getCasosClinicos(@Request() req, @Query('estado') estado?: string) {
        return this.medicoService.getCasosClinicos(req.user.pais, estado);
    }

    @Get('casos/:id')
    @ApiOperation({ summary: 'Obtener caso clínico por ID' })
    getCasoById(@Param('id') id: string) {
        return this.medicoService.getCasoById(+id);
    }

    @Patch('casos/:id')
    @ApiOperation({ summary: 'Actualizar caso clínico' })
    updateCaso(@Param('id') id: string, @Body() data: any) {
        return this.medicoService.updateCaso(+id, data);
    }

    @Get('citas/:id')
    @ApiOperation({ summary: 'Obtener cita por ID' })
    getCitaById(@Param('id') id: string) {
        return this.medicoService.getCitaById(+id);
    }

    @Get('examenes')
    @ApiOperation({ summary: 'Listar todos los exámenes' })
    getExamenes(@Request() req) {
        return this.medicoService.getExamenes(req.user.pais);
    }

    @Get('seguimientos')
    @ApiOperation({ summary: 'Listar todos los seguimientos' })
    getSeguimientos(@Request() req) {
        return this.medicoService.getSeguimientos(req.user.pais);
    }

    @Patch('seguimientos/:id')
    @ApiOperation({ summary: 'Actualizar seguimiento' })
    updateSeguimiento(@Param('id') id: string, @Body() data: any) {
        return this.medicoService.updateSeguimiento(+id, data);
    }

    @Get('citas')
    @ApiOperation({ summary: 'Obtener citas del médico (calendario)' })
    getCitasPorMedico(@Request() req) {
        return this.medicoService.getCitasPorMedico(req.user.idMedico, req.user.pais);
    }

    @Post('vacunas')
    @ApiOperation({ summary: 'Registrar vacuna' })
    registrarVacuna(@Body() data: any) {
        return this.medicoService.registrarVacuna(data);
    }

    @Patch('examenes/:id')
    @ApiOperation({ summary: 'Actualizar resultado de examen médico' })
    updateExamen(@Param('id') id: string, @Body() data: any) {
        return this.medicoService.updateExamen(+id, data);
    }

    @Post('casos')
    @ApiOperation({ summary: 'Crear un caso clínico nuevo' })
    crearCasoClinico(@Body() data: any) {
        return this.medicoService.crearCasoClinico(data);
    }

    @Get('reporte-atencion/:idAtencion')
    @ApiOperation({ summary: 'Obtener datos completos para reporte imprimible de atención médica' })
    getReporteAtencion(@Param('idAtencion') idAtencion: string) {
        return this.medicoService.getReporteAtencion(+idAtencion);
    }

    @Get('reporte-paciente/:idPaciente')
    @ApiOperation({ summary: 'Obtener historial completo del paciente para reporte' })
    getReportePaciente(@Param('idPaciente') idPaciente: string) {
        return this.medicoService.getReportePaciente(+idPaciente);
    }

    @Get('psicosocial')
    @ApiOperation({ summary: 'Listar registros psicosociales del país' })
    getRegistrosPsicosociales(@Request() req) {
        return this.medicoService.getRegistrosPsicosociales(req.user.pais);
    }

    @Post('psicosocial')
    @ApiOperation({ summary: 'Crear un nuevo registro psicosocial' })
    crearRegistroPsicosocial(@Body() data: any) {
        return this.medicoService.crearRegistroPsicosocial(data);
    }
}
