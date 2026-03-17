
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import axios from 'axios';
import { DbService } from '../database/db.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private db: DbService,
        private jwtService: JwtService,
    ) { }

    async validateUser(carnet: string, pass: string): Promise<any> {
        const user = await this.db.executeOne<any>('sp_Login', { Carnet: carnet });

        if (user && user.estado === 'A' && (await bcrypt.compare(pass, user.password_hash))) {
            const { password_hash, ...result } = user;
            return result;
        }
        return null;
    }

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.carnet, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        // Actualizar último acceso
        await this.db.executeNonQuery('sp_UpdateUltimoAcceso', { IdUsuario: user.id_usuario });

        // JWT payload
        const payload = {
            sub: user.id_usuario,
            carnet: user.carnet,
            rol: user.rol,
            pais: user.pais,
            idPaciente: user.id_paciente,
            idMedico: user.id_medico
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: user,
        };
    }

    async createInitialAdmin() {
        return { message: 'Por favor, utiliza el Stored Procedure sp_SeedData directamente en SQL Server para evitar duplicados.' };
    }

    async getProfile(userId: number) {
        const users = await this.db.execute<any>('sp_Auth_GetProfile', { IdUsuario: userId });

        if (users.length === 0) {
            throw new UnauthorizedException('Usuario no encontrado o inactivo');
        }

        const { password_hash, ...result } = users[0];
        return result;
    }

    async resetPassword(carnet: string, newPass: string) {
        const user = await this.db.executeOne<any>('sp_Login', { Carnet: carnet });
        if (!user) {
            throw new UnauthorizedException('Usuario no encontrado');
        }

        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(newPass, salt);

        await this.db.executeNonQuery('sp_Auth_HashPassword', {
            IdUsuario: user.id_usuario,
            NewHash: hash
        });

        return { message: 'Contraseña actualizada con éxito' };
    }

    async validatePortalSession(sid: string) {
        if (!sid) return null;
        
        try {
            const portalUrl = process.env.PORTAL_API_URL || 'http://localhost:3110';
            const response = await axios.post(`${portalUrl}/api/auth/introspect`, {}, {
                headers: {
                    Cookie: `portal_sid=${sid}`
                }
            });

            if (response.data?.authenticated && response.data?.identity) {
                const portalUser = response.data.identity;
                
                const carnetStr = String(portalUser.carnet || '').trim();
                
                // Buscar el usuario en la BD de Clinica por carnet
                const rows = await this.db.query<any>(
                    `SELECT u.*, r.nombre as rol 
                     FROM Usuarios u 
                     JOIN Roles r ON u.id_rol = r.id_rol 
                     WHERE u.carnet = @Carnet`, 
                    { Carnet: carnetStr }
                );
                let user = rows.length > 0 ? rows[0] : null;

                if (!user) {
                    try {
                        this.logger.log(`[PortalSSO] Provisionando JIT: ${carnetStr}`);
                        await this.db.query(
                            `INSERT INTO Usuarios (carnet, password_hash, nombre_completo, correo, id_rol, pais, estado, fecha_creacion) 
                             VALUES (@Carnet, 'PORTAL_SSO', @Nombre, @Correo, 3, @Pais, 'A', GETDATE())`,
                            {
                                Carnet: carnetStr,
                                Nombre: portalUser.nombre || portalUser.usuario,
                                Correo: portalUser.correo || '',
                                Pais: portalUser.esInterno ? 'NI' : 'OT'
                            }
                        );
                        
                        const retryRows = await this.db.query<any>(
                            `SELECT u.*, r.nombre as rol 
                             FROM Usuarios u 
                             JOIN Roles r ON u.id_rol = r.id_rol 
                             WHERE u.carnet = @Carnet`, 
                            { Carnet: carnetStr }
                        );
                        return retryRows.length > 0 ? retryRows[0] : null;
                    } catch (dbErr) {
                        this.logger.error('[PortalSSO] Error JIT:', dbErr.message);
                        return null;
                    }
                }
                return user;
            }
        } catch (err) {
            this.logger.warn('[PortalSSO] Error introspect:', err.message);
        }
        return null;
    }

    async createTokenForUser(user: any) {
        if (!user) return null;

        const payload = {
            sub: user.id_usuario,
            carnet: user.carnet,
            rol: user.rol,
            pais: user.pais,
            idPaciente: user.id_paciente,
            idMedico: user.id_medico
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: user
        };
    }

    async validateSSOToken(token: string) {
        try {
            // Sincronizado exactamente con core/portal-api-nest/src/modules/auth/sso.controller.ts
            const secret = 'ClaroSSO_Shared_Secret_2026_!#';
            this.logger.log(`[SSO] Validando ticket con secreto maestro...`);
            
            let payload: any;
            try {
                payload = await this.jwtService.verifyAsync(token, { 
                    secret, 
                    clockTolerance: 15 
                });
            } catch (err: any) {
                this.logger.error(`[SSO] Fallo en firma/tiempo del ticket: ${err.message}`);
                return null;
            }
            
            if (!payload || !payload.carnet) {
                this.logger.warn('[SSO] Ticket válido pero sin carnet en el payload');
                return null;
            }

            const carnetStr = String(payload.carnet).trim();
            console.log(`[SSO-DEBUG] Ticket válido detectado para carnet: ${carnetStr}`);
            this.logger.log(`[SSO] Ticket válido. Payload: ${JSON.stringify(payload)}`);
            this.logger.log(`[SSO] Procesando carnet: ${carnetStr}`);

            const queryUser = `SELECT u.*, r.nombre as rol 
                 FROM Usuarios u 
                 JOIN Roles r ON u.id_rol = r.id_rol 
                 WHERE u.carnet = @Carnet`;
            
            console.log(`[SSO-DEBUG] Consultando BD para carnet: ${carnetStr}`);
            const rows = await this.db.query<any>(queryUser, { Carnet: carnetStr });
            let user = rows.length > 0 ? rows[0] : null;

            if (!user) {
                console.log(`[SSO-DEBUG] Usuario NO encontrado en BD Clinica. Iniciando auto-registro (JIT)...`);
                this.logger.log(`[SSO] Usuario no encontrado, iniciando JIT para carnet: ${carnetStr}`);
                try {
                    await this.db.query(
                        `INSERT INTO Usuarios (carnet, password_hash, nombre_completo, correo, id_rol, pais, estado, fecha_creacion) 
                         VALUES (@Carnet, 'PORTAL_SSO', @Nombre, @Correo, 3, @Pais, 'A', GETDATE())`,
                        {
                            Carnet: carnetStr,
                            Nombre: payload.name || payload.username || 'Usuario Portal',
                            Correo: payload.correo || `${carnetStr}@claro.com.ni`,
                            Pais: 'NI'
                        }
                    );
                    
                    console.log(`[SSO-DEBUG] Registro JIT exitoso para: ${carnetStr}. Re-consultando...`);
                    const retryRows = await this.db.query<any>(queryUser, { Carnet: carnetStr });
                    user = retryRows.length > 0 ? retryRows[0] : null;
                } catch (dbErr) {
                    console.error(`[SSO-DEBUG] ERROR CRITICO en INSERT JIT:`, dbErr);
                    this.logger.error(`[SSO] Error crítico JIT DB para ${carnetStr}: ${dbErr.message}`);
                    return null;
                }
            }

            console.log(`[SSO-DEBUG] Usuario listo para Login: ${user?.carnet} (ID: ${user?.id_usuario})`);
            return user;
        } catch (e) {
            console.error(`[SSO-DEBUG] FALLO TOTAL EN VALIDACION SSO:`, e);
            this.logger.error(`[SSO] Error CRÍTICO validación ticket: ${e.message}`, e.stack);
            return null;
        }
    }
}
