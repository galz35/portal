import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: 'P001', description: 'Carnet del usuario' })
    @IsString()
    @IsNotEmpty()
    carnet: string;

    @ApiProperty({ example: 'password123', description: 'Contraseña del usuario' })
    @IsString()
    @IsNotEmpty()
    password: string;
}
