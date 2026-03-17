# Fase 0 - Contencion y saneamiento

## Objetivo

Eliminar riesgos graves antes de continuar el desarrollo funcional.

## Problemas que esta fase corrige

- secretos SQL en claro dentro del workspace
- cookies inseguras para produccion
- dependencia fuerte de configuraciones locales fragiles
- base de sesion aun no endurecida

## Entregables

- variables de entorno o secret manager definidos
- rotacion de credenciales SQL actuales
- `conexion.txt` fuera del flujo operativo
- politica de cookies segura lista para produccion
- checklist de seguridad inicial aprobado

## Base de datos

### Cambios

- sin reestructuracion masiva del modelo
- validacion de `SesionPortal`, `TokenCsrf`, `IntentoLogin`, `EventoSeguridad`

### Tablas revisadas

- `SesionPortal`
- `TokenCsrf`
- `IntentoLogin`
- `BloqueoCuenta`
- `EventoSeguridad`

## Stored procedures

### Mantener y revisar

- `spSeg_IntentoLogin_Registrar`
- `spSeg_IntentoLogin_ContarVentana`
- `spSeg_BloqueoCuenta_Activar`
- `spSeg_BloqueoCuenta_Validar`
- `spSeg_EventoSeguridad_Registrar`

### Acciones

- revisar contratos de salida
- revisar uso de `THROW`
- revisar indices
- revisar si estan siendo llamados desde backend real

## Backend

### Core

- quitar lectura de secretos desde archivos en texto plano como mecanismo principal
- endurecer configuracion de cookies para soportar `Secure=true`
- revisar conexion SQL con cifrado real

### Vacantes

- igual criterio de secretos
- revisar que los endpoints no dependan de configuracion demo para operar

## Infraestructura

- definir variables por entorno: `dev`, `qa`, `staging`, `prod`
- documentar rotacion de secretos
- definir politica de certificados
- validar headers de seguridad en proxy

## Pruebas

- prueba de arranque por entorno sin `conexion.txt`
- prueba de login con cookies seguras en entorno TLS
- prueba de error controlado cuando falte secreto

## Riesgos

- seguir desarrollando con credenciales expuestas
- dejar la seguridad para despues y contaminar mas modulos

## Criterio de salida

- no hay secretos operativos versionados
- cookies listas para TLS
- documentacion de secretos y variables cerrada

