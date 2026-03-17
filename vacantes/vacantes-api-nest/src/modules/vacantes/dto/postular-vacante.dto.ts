import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class PostularVacanteDto {
  @Type(() => Number)
  @IsNumber()
  id_vacante!: number;

  @Type(() => Number)
  @IsNumber()
  id_persona!: number;

  @IsBoolean()
  es_interna!: boolean;

  @IsString()
  fuente_postulacion!: string;
}
