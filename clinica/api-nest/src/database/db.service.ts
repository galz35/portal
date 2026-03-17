import { Injectable, OnApplicationBootstrap, OnApplicationShutdown, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sql from 'mssql';

@Injectable()
export class DbService implements OnApplicationBootstrap, OnApplicationShutdown {
    private pool: sql.ConnectionPool;
    private readonly logger = new Logger(DbService.name);

    constructor(private configService: ConfigService) { }

    async onApplicationBootstrap() {
        try {
            this.pool = await new sql.ConnectionPool({
                user: this.configService.get<string>('MSSQL_USER'),
                password: this.configService.get<string>('MSSQL_PASSWORD'),
                server: this.configService.get<string>('MSSQL_HOST') || '',
                port: parseInt(this.configService.get<string>('MSSQL_PORT') || '1433', 10),
                database: this.configService.get<string>('MSSQL_DATABASE'),
                options: {
                    encrypt: this.configService.get<string>('MSSQL_ENCRYPT') === 'true',
                    trustServerCertificate: this.configService.get<string>('MSSQL_TRUST_CERT') === 'true',
                },
            }).connect();
            this.logger.log('✅ SQL Server pool conectado exitosamente a ' + this.configService.get<string>('MSSQL_DATABASE'));
        } catch (err) {
            this.logger.error('❌ Error al conectar al pool de SQL Server:', err);
            throw err;
        }
    }

    async onApplicationShutdown() {
        if (this.pool) {
            await this.pool.close();
            this.logger.log('✅ SQL Server pool cerrado');
        }
    }

    async execute<T>(procedure: string, params: Record<string, any> = {}): Promise<T[]> {
        try {
            const request = this.pool.request();
            for (const [key, value] of Object.entries(params)) {
                request.input(key, value);
            }
            const result = await request.execute(procedure);
            return result.recordset as T[];
        } catch (err) {
            this.logger.error(`Error ejecutando SP ${procedure}:`, err);
            throw err;
        }
    }

    async executeOne<T>(procedure: string, params: Record<string, any> = {}): Promise<T | null> {
        const rows = await this.execute<T>(procedure, params);
        return rows.length > 0 ? rows[0] : null;
    }

    async executeNonQuery(procedure: string, params: Record<string, any> = {}): Promise<void> {
        try {
            const request = this.pool.request();
            for (const [key, value] of Object.entries(params)) {
                request.input(key, value);
            }
            await request.execute(procedure);
        } catch (err) {
            this.logger.error(`Error ejecutando SP (NonQuery) ${procedure}:`, err);
            throw err;
        }
    }

    async query<T>(sqlString: string, params: Record<string, any> = {}): Promise<T[]> {
        try {
            const request = this.pool.request();
            for (const [key, value] of Object.entries(params)) {
                request.input(key, value);
            }
            const result = await request.query(sqlString);
            return result.recordset as T[];
        } catch (err) {
            this.logger.error(`Error ejecutando Query:`, err);
            throw err;
        }
    }
}
