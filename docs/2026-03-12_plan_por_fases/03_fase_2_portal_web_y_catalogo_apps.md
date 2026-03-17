# Fase 2 - Portal web y catalogo de apps

## Objetivo

Convertir `portal-web` en el dashboard estable del ecosistema interno.

## Resultado esperado

- el empleado entra al portal y ve solo las apps autorizadas
- el portal muestra perfil base y estado de sesion
- existe base tecnica para agregar futuras apps sin redisenar auth

## Base de datos

### Tablas usadas

- `AplicacionSistema`
- `UsuarioAplicacion`
- `UsuarioRolAplicacion`
- `PermisoSistema`
- `RolPermiso`

### Tablas nuevas recomendadas

- `AppIconCatalogo` si luego se quiere catalogo visual central
- `AppClientInterno` para integraciones server-to-server futuras

## Stored procedures

### Reusar

- `spSeg_UsuarioApps`
- `spSeg_UsuarioPermisos`
- `spSeg_Me`

### Crear

- `spApp_Registrar`
- `spApp_Actualizar`
- `spApp_Desactivar`
- `spApp_AsignarUsuario`
- `spApp_QuitarUsuario`
- `spApp_ListarCatalogo`

## Backend

- `GET /api/core/apps` debe resolver la sesion del request
- no debe usar usuario demo ni apps en memoria
- si el usuario no tiene sesion, responde `401` o estado equivalente segun contrato
- agregar cache corto para catalogos de apps, no para permisos del usuario

## Frontend

- dashboard de sistemas
- perfil base
- boton de logout
- estado de sesion
- mensaje de sin acceso real
- manejo de redireccion a login con `returnUrl`

## Seguridad

- el portal no decide permisos reales; solo pinta lo que backend devuelve
- si una app aparece, eso no sustituye la validacion del backend de esa app

## UX recomendada

- listar apps por orden visual
- separar internas y futuras apps publicas si alguna vez conviven
- mostrar sesion expirada claramente

## Pruebas

- usuario sin apps
- usuario con una app
- usuario con multiples apps
- acceso denegado a ruta no autorizada
- sesion expirada en medio de navegacion

## Criterio de salida

- `portal-web` funciona como puerta de entrada real del empleado
- agregar una nueva app al catalogo ya es un proceso controlado

