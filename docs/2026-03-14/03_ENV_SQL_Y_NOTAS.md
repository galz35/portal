# Env, SQL y Notas

## Variable nueva

En `vacantes-api`:

```env
CANDIDATE_PASSWORD_RESET_BASE_URL=http://localhost:5173
```

En produccion debe apuntar al frontend real de vacantes.

Ejemplo:

```env
CANDIDATE_PASSWORD_RESET_BASE_URL=https://vacantes.tu-dominio.com
```

## SMTP minimo esperado

```env
SMTP_HOST=smtp.tu-proveedor.com
SMTP_PORT=587
SMTP_USER=usuario
SMTP_PASSWORD=secreto
SMTP_FROM=no-reply@tu-dominio.com
```

## SQL

Para este hardening especifico:

- no hay SQL nuevo
- no hay stored procedure nuevo
- no hay migracion requerida

## SQL util si falla el usuario base del portal

Solo si `empleado.portal` no puede entrar:

1. `D:\portal\core\sql-core\06_seed_usuario_base.sql`
2. `D:\portal\core\sql-core\12_fix_hash_usuario_base.sql`

Base objetivo:

- `PortalCore`

## Nota de compatibilidad

El refresh del portal sigue usando el mismo `sid` como base de compatibilidad. No es el modelo final ideal, pero mejora el comportamiento actual sin romper clientes.

## Nota operacional

Si el backend de vacantes corre fuera de localhost y `CANDIDATE_PASSWORD_RESET_BASE_URL` sigue local, `security_warnings()` ahora lo debe reportar.
