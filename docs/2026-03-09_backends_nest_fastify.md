# Backends Nest Fastify

## Entregado

- `core/portal-api-nest`: backend NestJS + Fastify para portal central.
- `vacantes/vacantes-api-nest`: backend NestJS + Fastify para vacantes.
- `core/portal-web`: proxy Vite a `http://localhost:3001`.
- `vacantes/vacantes-web`: proxy Vite a `http://localhost:3002`.
- SQL Server para tablas, seeds y stored procedures en ambos servicios.

## Portal

- Auth con cookie de sesion.
- `session-state`, `me`, `logout`, `apps`.
- Datos demo en memoria para levantar rapido.
- Scripts SQL en `core/portal-api-nest/database/sqlserver`.

## Vacantes

- Auth de compatibilidad para frontend actual.
- Publico: vacantes publicas, detalle, postular, mis postulaciones.
- RH: dashboard, vacantes, requisiciones, descriptores, postulaciones, terna, reportes, lista negra.
- Scripts SQL en `vacantes/vacantes-api-nest/database/sqlserver`.

## Seguridad base

- Fastify + Helmet.
- Rate limit.
- Cookies `httpOnly`.
- DTO validation con `ValidationPipe`.

## Siguiente integracion real

- Sustituir servicios en memoria por repositorios SQL Server.
- Conectar cada endpoint con los SP entregados.
- Poner proxy `/api` desde Vite o Nginx hacia cada backend.
- Cambiar claves demo por hash real (`bcrypt` o `argon2`).

## Credenciales demo actuales

- `empleado.portal` / `Portal123*`
- `candidato.demo` / `Portal123*`
