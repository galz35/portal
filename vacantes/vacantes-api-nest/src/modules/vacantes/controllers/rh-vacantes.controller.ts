import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';

import { CambiarEstadoPostulacionDto } from '../dto/cambiar-estado-postulacion.dto';
import { CambiarEstadoVacanteDto } from '../dto/cambiar-estado-vacante.dto';
import { CreateDescriptorDto } from '../dto/create-descriptor.dto';
import { CreateListaNegraDto } from '../dto/create-lista-negra.dto';
import { CreateRequisicionDto } from '../dto/create-requisicion.dto';
import { CreateTernaDto } from '../dto/create-terna.dto';
import { CreateVacanteDto } from '../dto/create-vacante.dto';
import { RequisicionDecisionDto } from '../dto/requisicion-decision.dto';
import { VacantesService } from '../vacantes.service';

@Controller('api/vacantes/rh')
export class RhVacantesController {
  constructor(private readonly vacantesService: VacantesService) {}

  @Get('dashboard')
  dashboard() {
    return this.vacantesService.getDashboard();
  }

  @Get('vacantes')
  listVacantes() {
    return this.vacantesService.listRhVacantes();
  }

  @Post('vacantes')
  createVacante(@Body() payload: CreateVacanteDto) {
    return this.vacantesService.createVacante(payload);
  }

  @Patch('vacantes/:idVacante/estado')
  changeVacanteState(
    @Param('idVacante', ParseIntPipe) idVacante: number,
    @Body() payload: CambiarEstadoVacanteDto,
  ) {
    return this.vacantesService.changeVacanteState(idVacante, payload.estado_nuevo);
  }

  @Get('requisiciones')
  listRequisiciones() {
    return this.vacantesService.listRequisiciones();
  }

  @Post('requisiciones')
  createRequisicion(@Body() payload: CreateRequisicionDto) {
    return this.vacantesService.createRequisicion(payload);
  }

  @Get('requisiciones/pendientes')
  listPendientes() {
    return this.vacantesService.listPendientesRequisicion();
  }

  @Post('requisiciones/:idRequisicion/aprobar')
  approveRequisicion(
    @Param('idRequisicion', ParseIntPipe) idRequisicion: number,
    @Body() _payload: RequisicionDecisionDto,
  ) {
    return this.vacantesService.approveRequisicion(idRequisicion);
  }

  @Post('requisiciones/:idRequisicion/rechazar')
  rejectRequisicion(
    @Param('idRequisicion', ParseIntPipe) idRequisicion: number,
    @Body() _payload: RequisicionDecisionDto,
  ) {
    return this.vacantesService.rejectRequisicion(idRequisicion);
  }

  @Get('descriptores')
  listDescriptores() {
    return this.vacantesService.listDescriptores();
  }

  @Post('descriptores')
  createDescriptor(@Body() payload: CreateDescriptorDto) {
    return this.vacantesService.createDescriptor(payload);
  }

  @Get('postulaciones')
  listPostulaciones() {
    return this.vacantesService.listPostulaciones();
  }

  @Patch('postulaciones/:idPostulacion/estado')
  changePostulacionState(
    @Param('idPostulacion', ParseIntPipe) idPostulacion: number,
    @Body() payload: CambiarEstadoPostulacionDto,
  ) {
    return this.vacantesService.changePostulacionState(idPostulacion, payload.estado_nuevo);
  }

  @Post('terna')
  createTerna(@Body() payload: CreateTernaDto) {
    return this.vacantesService.createTerna(payload);
  }

  @Get('reportes')
  getReportes() {
    return this.vacantesService.getReportes();
  }

  @Post('lista-negra')
  createListaNegra(@Body() payload: CreateListaNegraDto) {
    return this.vacantesService.createListaNegra(payload);
  }
}
