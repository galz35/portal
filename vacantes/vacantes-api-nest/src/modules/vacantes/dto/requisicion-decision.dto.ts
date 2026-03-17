import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class RequisicionDecisionDto {
  @Type(() => Number)
  @IsNumber()
  id_cuenta_portal!: number;

  @IsOptional()
  @IsString()
  etapa?: string;

  @IsOptional()
  @IsString()
  comentario?: string;
}
