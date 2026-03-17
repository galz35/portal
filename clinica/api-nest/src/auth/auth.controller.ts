import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Get('session-portal')
    async checkPortalSession(@Request() req) {
        const sid = req.cookies?.portal_sid;
        if (!sid) return { authenticated: false };

        const user = await this.authService.validatePortalSession(sid);
        if (!user) return { authenticated: false };

        const tokenData = await this.authService.createTokenForUser(user);
        return {
            authenticated: true,
            ...tokenData
        };
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Iniciar sesión de usuario' })
    @ApiResponse({ status: 200, description: 'Login exitoso, devuelve JWT.' })
    @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }
    @Post('seed')
    @ApiOperation({ summary: 'Crear usuario ADMIN inicial (Solo si la BD está vacía)' })
    createInitialAdmin() {
        return this.authService.createInitialAdmin();
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
    @ApiResponse({ status: 200, description: 'Perfil del usuario.' })
    @ApiResponse({ status: 401, description: 'No autorizado.' })
    getProfile(@Request() req) {
        return this.authService.getProfile(req.user.idUsuario);
    }

    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Reiniciar contraseña (Primer acceso o recuperación)' })
    async resetPassword(@Body() data: { carnet: string, password: any }) {
        return this.authService.resetPassword(data.carnet, data.password);
    }

    @Post('sso-login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Iniciar sesión vía SSO (Portal Central)' })
    async ssoLogin(@Body('token') token: string) {
        if (!token) throw new UnauthorizedException('Token de SSO requerido');
        try {
            const user = await this.authService.validateSSOToken(token);
            if (!user) {
                console.error('[SSO] Usuario no encontrado o no pudo ser creado para este token');
                throw new UnauthorizedException('No se pudo establecer sesión con este ticket');
            }
            return this.authService.createTokenForUser(user);
        } catch (e) {
            if (e instanceof UnauthorizedException) throw e;
            console.error('[SSO] Error crítico en login:', e.message);
            throw new UnauthorizedException('Error interno en autenticación SSO');
        }
    }
}
