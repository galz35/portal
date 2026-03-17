import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class CreateTernaDto {
  @Type(() => Number)
  @IsNumber()
  id_vacante!: number;

  @Type(() => Number)
  @IsNumber()
  id_cuenta_portal_creador!: number;
}
