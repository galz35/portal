# Hardening portal y vacantes - 2026-03-14

## Objetivo

Endurecer el backend sin romper el frontend ya aprobado:

- `core-api` sigue siendo la autoridad central de login y sesion para empleados.
- `vacantes-api` sigue siendo el dominio de negocio de vacantes.
- candidatos externos permanecen aislados en `vacantes-api`.

## Cambios aplicados

### `core-api`

- El endpoint base `/api/auth/login` ya no responde falso positivo.
- Ahora devuelve `400` con instruccion explicita de usar `/api/auth/login/empleado`.
- Se elimino la exposicion innecesaria del nombre de la base de datos.
- El endpoint `/api/auth/refresh` ahora resuelve sesion primero desde `portal_refresh` y solo usa `portal_sid` como compatibilidad.
- Esto permite refrescar sesion aunque la cookie corta haya expirado y la cookie larga siga vigente.

### `vacantes-api`

- `Mailer::new` ya no usa `unwrap()` para SMTP.
- Si SMTP esta mal configurado, el backend responde error controlado en vez de `panic`.
- La URL de reset de candidato ya no queda quemada a `localhost:3000`.
- Se agrega `CANDIDATE_PASSWORD_RESET_BASE_URL` para construir links reales a `/reset-password`.
- `security_warnings()` ahora alerta si:
  - `SMTP_FROM` esta vacio
  - la URL de reset sigue en localhost en un host no local

## Variables nuevas

Para `vacantes-api`:

```env
CANDIDATE_PASSWORD_RESET_BASE_URL=http://localhost:5173
```

En produccion debe apuntar al frontend real de vacantes, por ejemplo:

```env
CANDIDATE_PASSWORD_RESET_BASE_URL=https://vacantes.tu-dominio.com
```

## SQL

No se requiere ejecutar SQL para este hardening.

## Estado resultante

- `core-api` compila
- `vacantes-api` compila
- el flujo actual no cambia para frontend
- mejora la robustez operativa del reset de contrasena
- mejora la semantica real del refresh del portal

## Siguiente fase recomendada

1. Crear un contrato interno en `core-api` para introspeccion de sesion y permisos.
2. Hacer que `vacantes-api` consuma ese contrato y deje de resolver identidad interna leyendo `PortalCore` directamente.
3. Separar refresh token real del `sid` de acceso.
4. Agregar endpoint batch para datos de empleados y evitar consultas N+1 en RH.
