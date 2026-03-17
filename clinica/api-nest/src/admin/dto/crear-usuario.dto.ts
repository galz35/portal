import { IsString, IsNotEmpty, IsEmail, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum Rol {
    PACIENTE = 'PACIENTE',
    MEDICO = 'MEDICO',
    ADMIN = 'ADMIN',
}

export enum Pais {
    NI = 'NI',
    CR = 'CR',
    HN = 'HN',
}

export class CrearUsuarioDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    carnet: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    nombreCompleto: string;

    @ApiProperty()
    @IsEmail()
    @IsOptional()
    correo?: string;

    @ApiProperty({ enum: Rol })
    @IsEnum(Rol)
    rol: Rol;

    @ApiProperty({ enum: Pais })
    @IsEnum(Pais)
    pais: Pais;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    password: string;
}
