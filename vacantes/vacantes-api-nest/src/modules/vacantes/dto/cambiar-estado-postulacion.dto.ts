import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CambiarEstadoPostulacionDto {
  @IsString()
  estado_nuevo!: string;

  @IsOptional()
  @IsString()
  observacion?: string;

  @Type(() => Number)
  @IsNumber()
  id_cuenta_portal!: number;
}
