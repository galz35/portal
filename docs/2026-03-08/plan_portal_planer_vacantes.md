# Plan Portal + Planer + Vacantes

## Portal

El portal debe quedar como:

- login central
- sesion compartida
- selector de aplicaciones
- perfil base
- logout global

## Planer

Planer no debe reescribirse.

Se integrara asi:

1. El usuario inicia sesion en Portal.
2. Portal conoce `carnet` y `correo`.
3. Planer valida sesion central y permiso `app.planer`.
4. Planer resuelve su `idUsuario` interno usando `carnet` o `correo`.
5. Planer sigue funcionando con su modelo interno sin tocar negocio.

## Vacantes

Vacantes sera un sistema del ecosistema, no una simple seccion interna del portal.

El flujo esperado es:

1. Usuario entra a Portal.
2. Ve tarjeta de Vacantes si tiene acceso.
3. Entra a `vacantes-web` sin relogin.
4. `vacantes-api` usa sesion central y permisos del core.

## Orden de trabajo recomendado

1. `core-api` real
2. `portal-web` utilizable
3. `vacantes-api` basico funcional
4. `vacantes-web` basico funcional
5. integracion real de Planer
