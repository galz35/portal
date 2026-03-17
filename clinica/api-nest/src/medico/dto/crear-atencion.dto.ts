import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearAtencionDto {
    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    idCita: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    idMedico: number;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    diagnosticoPrincipal: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    planTratamiento?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    recomendaciones?: string;

    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    requiereSeguimiento?: boolean;

    @ApiProperty()
    @IsDateString()
    @IsOptional()
    fechaSiguienteCita?: string;

    @ApiProperty()
    @IsOptional()
    pesoKg?: number;

    @ApiProperty()
    @IsOptional()
    alturaM?: number;

    @ApiProperty()
    @IsString()
    @IsOptional()
    presionArterial?: string;

    @ApiProperty()
    @IsOptional()
    frecuenciaCardiaca?: number;

    @ApiProperty()
    @IsOptional()
    temperaturaC?: number;
}
