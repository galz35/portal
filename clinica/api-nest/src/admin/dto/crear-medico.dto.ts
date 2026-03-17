import { IsString, IsNotEmpty, IsEmail, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearMedicoDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    nombreCompleto: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    especialidad?: string;

    @ApiProperty({ enum: ['INTERNO', 'EXTERNO'] })
    @IsEnum(['INTERNO', 'EXTERNO'])
    tipoMedico: string;

    @ApiProperty()
    @IsEmail()
    @IsOptional()
    correo?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    telefono?: string;

    @ApiProperty({ description: 'Carnet del usuario asociado (solo para médicos internos)' })
    @IsString()
    @IsOptional()
    carnet?: string;
}
