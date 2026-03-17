import { IsString, IsNotEmpty, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AgendarCitaDto {
    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    idCaso: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    idMedico: number;

    @ApiProperty({ example: '2024-12-01' })
    @IsDateString()
    @IsNotEmpty()
    fechaCita: string;

    @ApiProperty({ example: '10:00' })
    @IsString()
    @IsNotEmpty()
    horaCita: string;
}
