import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateVacanteDto {
  @IsString()
  codigo_vacante!: string;

  @IsString()
  titulo!: string;

  @IsString()
  descripcion!: string;

  @IsOptional()
  @IsString()
  requisitos?: string;

  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @IsString()
  gerencia?: string;

  @IsOptional()
  @IsString()
  departamento?: string;

  @IsString()
  tipo_vacante!: string;

  @IsOptional()
  @IsString()
  modalidad?: string;

  @IsOptional()
  @IsString()
  ubicacion?: string;

  @IsString()
  codigo_pais!: string;

  @IsOptional()
  @IsString()
  nivel_experiencia?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  salario_min?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  salario_max?: number;

  @IsBoolean()
  acepta_internos!: boolean;

  @IsBoolean()
  es_publica!: boolean;

  @Type(() => Number)
  @IsNumber()
  cantidad_plazas!: number;

  @IsOptional()
  @IsString()
  prioridad?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  id_solicitante?: number;

  @Type(() => Number)
  @IsNumber()
  id_responsable_rh!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  id_requisicion_personal?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  id_descriptor_puesto?: number;

  @IsBoolean()
  es_excepcion_sin_requisicion!: boolean;

  @IsOptional()
  @IsString()
  motivo_excepcion?: string;

  @IsOptional()
  @IsString()
  fecha_limite_regularizacion?: string;
}
