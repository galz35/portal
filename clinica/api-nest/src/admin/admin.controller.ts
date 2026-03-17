import { Controller, Get, Post, Patch, Body, UseGuards, Request, Param, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CrearUsuarioDto, Rol } from './dto/crear-usuario.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('dashboard')
    @ApiOperation({ summary: 'Obtener KPIs del dashboard de admin' })
    getDashboard(@Request() req) {
        return this.adminService.getDashboardStats(req.user.pais);
    }

    @Post('usuarios')
    @ApiOperation({ summary: 'Crear un nuevo usuario' })
    crearUsuario(@Request() req, @Body() crearUsuarioDto: CrearUsuarioDto) {
        // Forzamos el país del admin
        crearUsuarioDto.pais = req.user.pais;
        return this.adminService.crearUsuario(crearUsuarioDto);
    }

    @Get('usuarios')
    @ApiOperation({ summary: 'Listar usuarios del país' })
    getUsuarios(@Request() req) {
        return this.adminService.getUsuarios(req.user.pais);
    }

    @Patch('usuarios/:id')
    @ApiOperation({ summary: 'Actualizar usuario' })
    updateUsuario(@Request() req, @Param('id') id: string, @Body() data: any) {
        return this.adminService.updateUsuario(+id, data, req.user.pais);
    }

    @Get('medicos')
    @ApiOperation({ summary: 'Listar médicos del país' })
    getMedicos(@Request() req) {
        return this.adminService.getMedicos(req.user.pais);
    }

    @Post('medicos')
    @ApiOperation({ summary: 'Crear un nuevo médico' })
    crearMedico(@Request() req, @Body() data: any) {
        data.pais = req.user.pais;
        return this.adminService.crearMedico(data);
    }

    @Get('empleados')
    @ApiOperation({ summary: 'Listar empleados' })
    getEmpleados(@Request() req, @Query('carnet') carnet?: string) {
        return this.adminService.getEmpleados(req.user.pais, carnet);
    }

    @Get('roles-permisos')
    @ApiOperation({ summary: 'Obtener catálogo de roles y permisos' })
    getRolesPermisos() {
        return this.adminService.getRolesPermisos();
    }

    @Get('reportes/atenciones')
    @ApiOperation({ summary: 'Obtener reporte de atenciones' })
    getReportesAtenciones(@Request() req, @Query() filters: any) {
        return this.adminService.getReportesAtenciones(req.user.pais, filters);
    }
}
