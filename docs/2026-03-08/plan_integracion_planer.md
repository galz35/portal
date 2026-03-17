# Integracion Planer con Portal

## Como funciona hoy Planer

- `planer-web` guarda `clarity_token`, `clarity_refresh_token` y `clarity_user` en `localStorage`.
- `planer-api` emite JWT propio.
- `planer-api` usa `idUsuario` de `p_Usuarios` como identificador interno principal.

## Como debe funcionar despues

- Portal autentica.
- Planer no muestra login propio como flujo principal.
- `planer-web` consulta `/api/auth/me`.
- Si no hay sesion: redirige a `/login-empleado?returnUrl=/app/planer`.
- Si hay sesion y tiene `app.planer`: continua.
- `planer-api` resuelve `idUsuario` usando `carnet` o `correo`.

## Fase puente sugerida

Antes de migrar a confianza plena en token central:

1. Portal autentica y mantiene cookies seguras.
2. Planer consulta identidad central.
3. Planer crea contexto local resolviendo `idUsuario`.
4. Se elimina dependencia de `localStorage` como fuente de verdad.

## Lo que se necesita mas adelante

- contrato final de `/api/auth/me`
- middleware de `planer-api` que valide sesion central
- bootstrap de sesion en `planer-web`
- logout global delegando a Portal
