# 🛠️ Detalles Técnicos Críticos - Planer V2 + SSO Portal

Esta es la implementación técnica final que realizamos en el Backend de Planer para que el SSO funcione de manera robusta y con auto-registro (JIT).

---

## 1. Validación SSO en `AuthService.ts`
Localización: `D:\portal\planer\v2backend\src\auth\auth.service.ts`

```typescript
async validateSSOToken(token: string, req: any) {
    try {
        // 1. Verificación del Token (Shared Secret)
        const payload = this.jwtService.verify(token, {
            secret: process.env.JWT_SSO_SECRET || 'fallback-secret',
        });

        // 2. Validación Extra de Seguridad (Fingerprint)
        const userAgent = req.headers['user-agent'];
        const remoteIp = req.ip || req.headers['x-forwarded-for'];

        if (payload.ua && payload.ua !== userAgent) {
            throw new UnauthorizedException('Ticket origin mismatch (UA)');
        }

        // 3. Just-In-Time (JIT) Provisioning
        let user = await this.authRepo.obtenerUsuarioPorIdentificador(payload.correo);

        if (!user) {
            console.log(`[SSO] Creando usuario JIT: ${payload.correo}`);
            const newUserId = await this.authRepo.crearUsuario({
                nombre: payload.nombre || payload.correo,
                correo: payload.correo,
                carnet: payload.carnet || payload.sub,
                idRolGlobal: payload.idRol || 3, // Default: Empleado
                pais: payload.pais || 'NI',
                activo: true
            });
            user = await this.authRepo.obtenerUsuarioPorId(newUserId);
        }

        return user;
    } catch (e) {
        throw new UnauthorizedException('Token SSO inválido o expirado');
    }
}
```

---

## 2. Inserción JIT en `AuthRepo.ts`
Localización: `D:\portal\planer\v2backend\src\auth\auth.repo.ts`

```typescript
export async function crearUsuario(data: any): Promise<number> {
  const request = await crearRequest();
  request.input('nombre', NVarChar, data.nombre);
  request.input('correo', NVarChar, data.correo);
  request.input('carnet', NVarChar, data.carnet);
  request.input('idRol', Int, data.idRolGlobal || 3);

  const result = await request.query<{ id: number }>(`
        INSERT INTO p_Usuarios (nombre, correo, carnet, idRol, activo, fechaCreacion)
        VALUES (@nombre, @correo, @carnet, @idRol, 1, GETDATE());
        SELECT SCOPE_IDENTITY() as id;
    `);

  const idUsuario = result.recordset[0]?.id;
  
  if (idUsuario) {
    // Inicializar credenciales vacías para estructura de DB
    const credRequest = await crearRequest();
    credRequest.input('idUsuario', Int, idUsuario);
    await credRequest.query(`
            INSERT INTO p_UsuariosCredenciales (idUsuario, passwordHash, fechaCreacion)
            VALUES (@idUsuario, '', GETDATE())
        `);
  }

  return idUsuario;
}
```

---

## 3. Configuración CORS y Cookies en `main.ts`
Localización: `D:\portal\planer\v2backend\src\main.ts`

```typescript
// Soporte de Cookies para SSO
await app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET || 'clarity-v2-secret-cookie-key',
});

// CORS permitido para los dominios del Portal Central
adapter.enableCors({
    origin: ['https://www.rhclaroni.com', 'http://localhost:5173', 'http://localhost:5175'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
});
```

---

*Información guardada para transferencia de sesión entre chats.*
