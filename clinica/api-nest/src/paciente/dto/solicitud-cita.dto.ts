import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SolicitudCitaDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    ruta: string; // 'consulta', 'chequeo', etc.

    @ApiProperty()
    @IsObject()
    @IsNotEmpty()
    datosCompletos: any; // JSON del wizard

    @ApiProperty()
    @IsString()
    @IsOptional()
    comentarioGeneral?: string;
}
