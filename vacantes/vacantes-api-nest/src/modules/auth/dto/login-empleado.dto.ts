import { IsString, MinLength } from 'class-validator';

export class LoginEmpleadoDto {
  @IsString()
  usuario!: string;

  @IsString()
  @MinLength(4)
  clave!: string;
}
