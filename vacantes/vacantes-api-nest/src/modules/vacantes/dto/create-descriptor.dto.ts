import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDescriptorDto {
  @Type(() => Number)
  @IsNumber()
  id_puesto!: number;

  @IsString()
  titulo_puesto!: string;

  @IsString()
  version_descriptor!: string;

  @IsOptional()
  @IsString()
  objetivo_puesto?: string;

  @IsOptional()
  @IsString()
  funciones_principales?: string;

  @IsOptional()
  @IsString()
  funciones_secundarias?: string;

  @IsOptional()
  @IsString()
  competencias_tecnicas?: string;

  @IsOptional()
  @IsString()
  competencias_blandas?: string;

  @IsOptional()
  @IsString()
  escolaridad?: string;

  @IsOptional()
  @IsString()
  experiencia_minima?: string;

  @IsOptional()
  @IsString()
  idiomas?: string;

  @IsOptional()
  @IsString()
  certificaciones?: string;

  @IsOptional()
  @IsString()
  jornada?: string;

  @IsOptional()
  @IsString()
  modalidad?: string;

  @IsOptional()
  @IsString()
  rango_salarial_referencial?: string;

  @IsOptional()
  @IsString()
  reporta_a?: string;

  @IsOptional()
  @IsString()
  indicadores_exito?: string;

  @IsString()
  fecha_vigencia_desde!: string;

  @IsOptional()
  @IsString()
  fecha_vigencia_hasta?: string;
}
