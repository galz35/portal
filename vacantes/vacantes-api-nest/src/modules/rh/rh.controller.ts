import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { RhService } from './rh.service';
import { PortalAuthGuard } from '../../shared/guards/portal-auth.guard';

@Controller('api/vacantes/rh')
@UseGuards(PortalAuthGuard)
export class RhController {
  constructor(private readonly service: RhService) {}

  @Get('dashboard')
  async dashboard() {
    return this.service.getDashboard();
  }

  @Get('vacantes')
  async listarVacantes() {
    const items = await this.service.listarVacantesRH();
    return { items };
  }

  @Post('vacantes')
  async crearVacante(@Body() body: any) {
    return this.service.crearVacante(body);
  }

  @Patch('vacantes/:id/estado')
  async cambiarEstadoVacante(@Param('id', ParseIntPipe) id: number, @Body() body: any, @Req() req: any) {
    const user = req.portalIdentity;
    return this.service.cambiarEstadoVacante(id, body.estado_nuevo, user.idCuentaPortal, body.observacion);
  }

  @Get('requisiciones')
  async listarRequisiciones() {
    const items = await this.service.listarRequisiciones();
    return { items };
  }

  @Post('requisiciones')
  async crearRequisicion(@Body() body: any) {
    return this.service.crearRequisicion(body);
  }

  @Get('requisiciones/pendientes')
  async listarPendientes() {
    const items = await this.service.listarRequisiciones(); // El servicio filtra o el SP
    return { items };
  }

  @Post('requisiciones/:id/aprobar')
  async aprobarRequisicion(@Param('id', ParseIntPipe) id: number, @Body() body: any, @Req() req: any) {
    const user = req.portalIdentity;
    return this.service.aprobarRequisicion(id, user.idCuentaPortal, body.comentario);
  }

  @Post('requisiciones/:id/rechazar')
  async rejectRequisicion(@Param('id', ParseIntPipe) id: number, @Body() body: any, @Req() req: any) {
    const user = req.portalIdentity;
    return this.service.rechazarRequisicion(id, user.idCuentaPortal, body.comentario);
  }

  @Get('descriptores')
  async listarDescriptores() {
    const items = await this.service.listarDescriptores();
    return { items };
  }

  @Post('descriptores')
  async crearDescriptor(@Body() body: any) {
    return this.service.crearDescriptor(body);
  }

  @Get('postulaciones')
  async listarPostulaciones() {
    const items = await this.service.listarPostulacionesRH();
    return { items };
  }

  @Patch('postulaciones/:id/estado')
  async cambiarEstadoPostulacion(@Param('id', ParseIntPipe) id: number, @Body() body: any, @Req() req: any) {
    const user = req.portalIdentity;
    return this.service.cambiarEstadoPostulacion(id, body.estado_nuevo, user.idCuentaPortal, body.observacion);
  }

  @Post('terna')
  async crearTerna(@Body() body: any, @Req() req: any) {
    const user = req.portalIdentity;
    return this.service.crearTerna(body.id_vacante, user.idCuentaPortal);
  }

  @Get('lista-negra')
  async listarListaNegra() {
    return this.service.listarListaNegra();
  }

  @Post('lista-negra')
  async crearListaNegra(@Body() body: any) {
    return this.service.crearListaNegra(body);
  }

  @Get('terna')
  async listarTernas() {
    return this.service.listarTernas();
  }

  @Get('postulaciones/:id/detalle')
  async obtenerDetallePostulacion(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const query = req.query as any;
    return this.service.obtenerDetallePostulacionRH(id, query.origen);
  }

  @Get('vacantes/:id/historial')
  async obtenerHistorialVacante(@Param('id', ParseIntPipe) id: number) {
    return this.service.obtenerHistorialVacante(id);
  }

  @Post('reutilizar-candidato')
  async reutilizarCandidato(@Body() body: any, @Req() req: any) {
    const user = req.portalIdentity;
    return this.service.reutilizarCandidato(body.idVacante, body.origen, body.id, user.idCuentaPortal);
  }
}
