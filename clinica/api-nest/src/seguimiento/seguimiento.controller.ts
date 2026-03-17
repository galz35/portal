import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request } from '@nestjs/common';
import { SeguimientoService } from './seguimiento.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('seguimientos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('seguimientos')
export class SeguimientoController {
    constructor(private readonly seguimientoService: SeguimientoService) { }

    @Post()
    @ApiOperation({ summary: 'Crear seguimiento' })
    create(@Body() createSeguimientoDto: any) {
        return this.seguimientoService.create(createSeguimientoDto);
    }

    @Get()
    @ApiOperation({ summary: 'Listar seguimientos del país' })
    findAll(@Request() req) {
        return this.seguimientoService.findAll(req.user.pais);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener seguimiento por ID' })
    findOne(@Param('id') id: string) {
        return this.seguimientoService.findOne(+id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar seguimiento' })
    update(@Param('id') id: string, @Body() updateSeguimientoDto: any) {
        return this.seguimientoService.update(+id, updateSeguimientoDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar seguimiento' })
    remove(@Param('id') id: string) {
        return this.seguimientoService.remove(+id);
    }
}
