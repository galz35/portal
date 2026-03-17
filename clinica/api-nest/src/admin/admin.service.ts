import { Injectable, ConflictException, InternalServerErrorException, BadRequestException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DbService } from '../database/db.service';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';

// Whitelist of allowed update fields for security
const USUARIO_UPDATE_WHITELIST = ['estado', 'correo', 'nombre_completo'] as const;

@Injectable()
export class AdminService {
    constructor(
        private db: DbService,
    ) { }

    async getDashboardStats(pais: string) {
        return this.db.executeOne<any>('sp_Admin_GetDashboard', { Pais: pais });
    }

    async crearUsuario(crearUsuarioDto: CrearUsuarioDto) {
        try {
            const { password, ...userData } = crearUsuarioDto;
            const passToHash = password || 'Temporal123!';
            const salt = await bcrypt.genSalt();
            const password_hash = await bcrypt.hash(passToHash, salt);

            // Obtener ID del rol
            const roles = await this.db.query<any>('SELECT id_rol FROM roles WHERE nombre = @Nombre', { Nombre: userData.rol });
            if (roles.length === 0) throw new BadRequestException('El rol proporcionado no existe en la BD.');
            const idRol = roles[0].id_rol;

            const user = await this.db.executeOne<any>('sp_Admin_CrearUsuario', {
                Carnet: userData.carnet,
                PasswordHash: password_hash,
                NombreCompleto: userData.nombreCompleto || 'Usuario Creado',
                Correo: userData.correo || null,
                IdRol: idRol,
                Pais: userData.pais
            });

            return { message: 'Usuario creado exitosamente', user: user };

        } catch (err: any) {
            console.error('Error al crear usuario:', err);
            if (err.message && err.message.includes('Violation of UNIQUE KEY constraint')) {
                throw new ConflictException('El carnet o correo ya existe en el sistema.');
            }
            if (err instanceof BadRequestException || err instanceof ConflictException) throw err;
            throw new InternalServerErrorException('Error al crear usuario: ' + err.message);
        }
    }

    async getUsuarios(pais: string) {
        return this.db.execute<any>('sp_Admin_GetUsuarios', { Pais: pais });
    }

    async updateUsuario(id: number, data: any, adminPais: string) {
        // Validación de pertenencia al país antes de actualizar (Seguridad)
        const user = await this.db.executeOne<any>('sp_Auth_GetProfile', { IdUsuario: id });
        if (!user || user.pais !== adminPais) {
            throw new ForbiddenException('No tiene permisos para modificar un usuario de otro país.');
        }

        return this.db.executeOne<any>('sp_Admin_UpdateUsuario', {
            Id: id,
            Estado: data.estado || null,
            Rol: data.rol || null,
            Correo: data.correo || null,
            NombreCompleto: data.nombre_completo || null,
        });
    }

    async getMedicos(pais: string) {
        return this.db.execute<any>('sp_Admin_GetMedicos', { Pais: pais });
    }

    async crearMedico(data: any) {
        return this.db.executeOne<any>('sp_Admin_CrearMedico', {
            Carnet: data.carnet || null,
            Nombre: data.nombreCompleto,
            Especialidad: data.especialidad || null,
            Tipo: data.tipoMedico || 'EXTERNO',
            Correo: data.correo || null,
            Telefono: data.telefono || null,
            Estado: data.estadoMedico || 'A',
            Pais: data.pais || 'NI'
        });
    }

    async getEmpleados(pais: string, carnet?: string) {
        return this.db.execute<any>('sp_Admin_GetEmpleados', { Pais: pais, Carnet: carnet || null });
    }

    async getReportesAtenciones(pais: string, filters?: any) {
        const rows = await this.db.execute<any>('sp_Admin_GetReportesAtenciones', {
            Pais: pais,
            FechaDesde: filters?.fechaDesde || null,
            FechaHasta: filters?.fechaHasta || null,
        });

        // Mapping to nested structure for frontend compatibility
        return rows.map(row => ({
            ...row,
            paciente: {
                nombre_completo: row.paciente_nombre,
                carnet: row.paciente_carnet,
                sexo: row.paciente_sexo,
                fecha_nacimiento: row.paciente_nacimiento
            },
            medico: {
                nombre_completo: row.medico_nombre,
                especialidad: row.medico_especialidad
            },
            empleado: {
                gerencia: row.gerencia,
                area: row.area
            }
        }));
    }

    async getRolesPermisos() {
        const roles = await this.db.query<any>('SELECT * FROM roles');
        const mapeos = await this.db.query<any>('SELECT rp.id_rol, p.id_permiso, p.clave, p.modulo FROM roles_permisos rp JOIN permisos p ON rp.id_permiso = p.id_permiso');
        const permisosCat = await this.db.query<any>('SELECT * FROM permisos');

        return { roles, relaciones: mapeos, catalogoPermisos: permisosCat };
    }
}
