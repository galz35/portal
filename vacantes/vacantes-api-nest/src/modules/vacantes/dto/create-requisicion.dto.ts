import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRequisicionDto {
  @IsString()
  codigo_requisicion!: string;

  @Type(() => Number)
  @IsNumber()
  id_puesto!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  id_descriptor_puesto?: number;

  @IsString()
  tipo_necesidad!: string;

  @IsString()
  justificacion!: string;

  @Type(() => Number)
  @IsNumber()
  cantidad_plazas!: number;

  @IsString()
  codigo_pais!: string;

  @IsOptional()
  @IsString()
  gerencia?: string;

  @IsOptional()
  @IsString()
  departamento?: string;

  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @IsString()
  centro_costo?: string;

  @Type(() => Number)
  @IsNumber()
  id_cuenta_portal_solicitante!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  id_cuenta_portal_jefe_aprobador?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  id_cuenta_portal_reclutamiento?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  id_cuenta_portal_compensacion?: number;

  @IsOptional()
  @IsString()
  fecha_necesaria_cobertura?: string;

  @IsOptional()
  @IsString()
  prioridad?: string;

  @IsBoolean()
  permite_publicacion_sin_completar!: boolean;

  @IsOptional()
  @IsString()
  fecha_limite_regularizacion?: string;
}
