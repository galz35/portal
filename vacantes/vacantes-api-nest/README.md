# Vacantes API Nest

Backend NestJS de transicion para `vacantes-web`, montado sobre Fastify.

## Endpoints cubiertos

- `GET /api/auth/me`
- `GET /api/auth/session-state`
- `POST /api/auth/login-empleado`
- `POST /api/auth/logout`
- `GET /api/vacantes/publicas`
- `GET /api/vacantes/publicas/:slug`
- `GET /api/vacantes/mis-postulaciones`
- `POST /api/vacantes/postular`
- `GET /api/vacantes/rh/dashboard`
- `GET /api/vacantes/rh/vacantes`
- `POST /api/vacantes/rh/vacantes`
- `PATCH /api/vacantes/rh/vacantes/:idVacante/estado`
- `GET /api/vacantes/rh/requisiciones`
- `POST /api/vacantes/rh/requisiciones`
- `GET /api/vacantes/rh/requisiciones/pendientes`
- `POST /api/vacantes/rh/requisiciones/:idRequisicion/aprobar`
- `POST /api/vacantes/rh/requisiciones/:idRequisicion/rechazar`
- `GET /api/vacantes/rh/descriptores`
- `POST /api/vacantes/rh/descriptores`
- `GET /api/vacantes/rh/postulaciones`
- `PATCH /api/vacantes/rh/postulaciones/:idPostulacion/estado`
- `POST /api/vacantes/rh/terna`
- `GET /api/vacantes/rh/reportes`
- `POST /api/vacantes/rh/lista-negra`
- `GET /api/health`

## Seguridad base

- Cookies `httpOnly`
- Helmet en Fastify
- Rate limit por minuto
- Validacion DTO con `ValidationPipe`

## Notas

- Usa datos semilla y almacenamiento en memoria.
- `GET /api/auth/me` requiere cookie de sesion; solo acepta `x-demo-user` si quieres forzar una identidad demo en pruebas manuales.
- Puerto por defecto: `3002`.

## Arranque

```bash
npm install
npm run start:dev
```
