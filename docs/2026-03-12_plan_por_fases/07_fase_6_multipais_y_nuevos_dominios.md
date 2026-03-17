# Fase 6 - Multipais y nuevos dominios

## Objetivo

Preparar la plataforma para crecer de Nicaragua a otros paises y para incorporar nuevos sistemas internos sin romper el modelo base.

## Resultado esperado

- permisos y visibilidad soportan pais, empresa y organizacion
- el patron Portal + dominio se puede repetir para Inventario, Clinica y otros
- existe onboarding tecnico para nuevas apps

## Base de datos

### Tablas nuevas recomendadas en PortalCore

- `Empresa`
- `UnidadOrganizativa`
- `UsuarioScopePais`
- `UsuarioScopeEmpresa`
- `UsuarioScopeOrg`
- `AplicacionIntegracion`

### Reglas

- cada dominio mantiene sus tablas de negocio
- `PortalCore` concentra identidad, sesion y autorizacion
- referencias inter-base se validan por aplicacion, no por FK cross-database

## Stored procedures

- `spSeg_ScopePais_Listar`
- `spSeg_ScopeEmpresa_Listar`
- `spSeg_ScopeOrg_Listar`
- `spApp_Registrar`
- `spApp_AsignarUsuario`
- `spApp_QuitarUsuario`
- procedimientos de bootstrap para nuevas apps

## Seguridad

- introducir RLS solo donde aporte valor real
- usar `SESSION_CONTEXT` para pais y org en reportes o tablas sensibles
- mantener auditoria por sistema y por dominio

## Nuevos dominios futuros

### Inventario

- interno
- login central
- permisos por bodega, empresa, region

### Clinica

- interno y altamente sensible
- auditoria mas fuerte
- posible cifrado extra de campos clinicos

## Onboarding de nueva app

1. registrar app en `AplicacionSistema`
2. definir permisos base
3. definir scopes requeridos
4. crear backend Rust del dominio
5. integrar con middleware auth central
6. crear dashboard card en portal
7. crear runbook y metricas

## Pruebas

- visibilidad por pais
- visibilidad por org
- onboarding controlado de una nueva app ejemplo

## Criterio de salida

- la plataforma ya no depende de reglas ad hoc; puede crecer por patron

