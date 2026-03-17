# Mapa de subfases - Portal + Vacantes

## Objetivo

Dividir cada fase grande en bloques pequenos para ejecucion controlada.

## Fase 0

### 0.1 Secretos y credenciales

- rotar usuarios SQL
- eliminar secretos del repo
- documentar variables

### 0.2 Transporte y cookies

- preparar TLS
- endurecer cookies
- validar proxy

### 0.3 Checklist de seguridad

- validar controles minimos
- dejar base operativa

## Fase 1

### 1.1 Modelo de sesion

- redisenar cookie de sesion
- hash de SID
- expiracion y revocacion

### 1.2 Empleado snapshot

- copiar empleados desde vista externa
- desacoplar auth del origen remoto

### 1.3 Permisos y scopes

- apps
- roles
- permisos
- pais y org

### 1.4 MFA y CSRF

- MFA para usuarios privilegiados
- CSRF en mutaciones

## Fase 2

### 2.1 Portal dashboard

- lista de apps
- perfil base
- sin acceso

### 2.2 Sesion de usuario

- logout
- logout-all
- modal de expiracion

### 2.3 Catalogo de apps

- alta
- baja
- asignacion

## Fase 3

### 3.1 Vacantes publicas

- home
- listado
- detalle

### 3.2 Cuenta candidato

- registro
- login
- verificacion
- recuperacion

### 3.3 Perfil y CV

- perfil
- upload CV
- historial

### 3.4 Postulacion

- aplicar
- retirar
- seguimiento

## Fase 4

### 4.1 Dashboard RH

- KPIs
- pendientes

### 4.2 Gestion de vacantes

- crear
- editar
- publicar
- pausar
- cerrar

### 4.3 Requisiciones

- crear
- enviar
- aprobar
- rechazar

### 4.4 Descriptores

- crear
- listar
- vigente

### 4.5 Postulaciones y terna

- revisar postulaciones
- mover estado
- crear terna

### 4.6 Lista negra y reportes

- registrar
- revocar
- reportes

## Fase 5

### 5.1 OCR y texto extraido

- pipeline archivo -> texto

### 5.2 Analisis IA

- scoring
- perfil normalizado
- auditoria

### 5.3 Operacion y metricas

- Prometheus
- Grafana
- incidentes

### 5.4 Automatizacion

- trabajos asincronos
- reproceso
- alertas

## Fase 6

### 6.1 Scopes multinivel

- pais
- empresa
- org

### 6.2 Nuevas apps

- inventario
- clinica
- otras

### 6.3 Seguridad avanzada

- RLS donde aplique
- gobierno de permisos

## Regla final

Cada subfase debe cerrar:

- base de datos
- SP
- backend
- frontend
- pruebas
- criterio de salida

