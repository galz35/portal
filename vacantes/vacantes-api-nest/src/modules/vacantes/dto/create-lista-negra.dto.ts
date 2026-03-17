import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateListaNegraDto {
  @Type(() => Number)
  @IsNumber()
  id_persona!: number;

  @IsString()
  motivo!: string;

  @IsOptional()
  @IsString()
  categoria?: string;

  @IsString()
  fecha_inicio!: string;

  @IsOptional()
  @IsString()
  fecha_fin?: string;

  @IsBoolean()
  permanente!: boolean;

  @Type(() => Number)
  @IsNumber()
  id_cuenta_portal_registro!: number;
}
