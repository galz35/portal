# Plan Maestro 2026 - Portal Corporativo + Vacantes

Fecha: 2026-03-12  
Workspace base analizado: `D:\portal`  
Estado del documento: maestro, ejecutable, orientado a humanos y a otra IA  
Alcance: Portal interno corporativo + Vacantes publico/candidato/RH  
Fuera de alcance funcional: `Planer` como producto ya existente; solo se deja capacidad futura de integracion, no se redisenia aqui.

---

## 1. Proposito del documento

Este documento define la arquitectura objetivo, el modelo de seguridad, la base de datos, las tablas, los stored procedures, la estructura de codigo, los contratos de integracion y el roadmap por fases para construir un portal corporativo seguro, confiable, rapido y escalable sobre:

- Frontend: React
- Backend: Rust
- Base de datos: SQL Server
- Primer dominio mixto: Vacantes
- Patron futuro: Inventario, Clinica, y otros sistemas internos

Este documento no es un resumen. Es una base de ejecucion. Debe servir para:

- ordenar el trabajo tecnico
- evitar decisiones contradictorias
- separar lo que ya existe de lo que aun falta
- permitir que otra IA o ingeniero continue el trabajo sin perder contexto

---

## 2. Resumen ejecutivo

La direccion correcta es:

1. `Portal` debe ser la puerta central de empleados internos.
2. `Vacantes` debe ser un sistema mixto:
   - publico para visitantes y candidatos
   - interno para RH y aprobadores usando sesion central del portal
3. `Planer` no debe contaminar el diseno base del portal. Queda fuera del alcance funcional de este plan.
4. La linea oficial recomendada para backend es `Rust + Axum + SQL Server`.
5. La linea Nest actual se puede mantener solo como transicion o referencia, pero no como arquitectura final.
6. Para web corporativa, el estandar recomendado es sesion por cookie segura y token opaco; no `localStorage` como fuente de verdad.
7. `PortalCore` y `PortalVacantes` deben vivir separados por dominio, aunque esten en la misma instancia SQL Server.
8. La seguridad debe implementarse primero en backend y base de datos; el frontend solo refleja estado, no impone seguridad real.

---

## 3. Diagnostico del estado actual del repositorio

### 3.1 Lo bueno que ya existe

- Hay estructura real de `core`, `vacantes`, `infra`, `docs`.
- Hay SQL util y avanzado para:
  - autenticacion
  - sesiones globales
  - seguridad avanzada
  - observabilidad
  - vacantes
  - postulaciones
  - IA CV
  - requisiciones y descriptores
- Hay `portal-web` funcionalmente basico.
- Hay `vacantes-web` con separacion publico/candidato/RH.
- Hay `core-api` y `vacantes-api` en Rust.
- Hay documentacion operativa, runbooks y dashboards.

### 3.2 Riesgos tecnicos actuales

- Hay mezcla de logica real y datos demo en `core-api` y `vacantes-api`.
- La sesion actual de `core-api` usa el `IdSesionPortal` como valor de cookie, lo cual no es el mejor patron para produccion.
- El CSRF en Rust esta declarado pero no implementado.
- Varias rutas sensibles de `vacantes-api` aceptan `id_cuenta_portal` o `id_persona` enviados por el cliente.
- La seguridad de RH en `vacantes-web` hoy depende demasiado del guard de frontend.
- Existe un archivo `conexion.txt` con credenciales SQL en claro dentro del workspace, lo cual obliga a rotacion inmediata.
- El join a `Inventario_RRHH.dbo.EMP2024` a traves de la vista `vwEmpleadoPortal` resuelve negocio, pero es una dependencia fuerte que debe desacoplarse.

### 3.3 Conclusiones del diagnostico

- El repositorio no esta vacio.
- Tampoco esta listo para produccion.
- La base mas valiosa hoy es el SQL y la documentacion.
- El mayor valor del plan es convertir el estado actual en una plataforma productiva, sin rehacer desde cero lo que si sirve.

---

## 4. Decisiones arquitectonicas obligatorias

Estas decisiones deben considerarse base del proyecto.

### 4.1 Portal solo para empleados internos

`Portal` no debe ser login universal de candidatos.  
`Portal` es el acceso secreto/interno de empleados y personal autorizado.

### 4.2 Vacantes publica e interna a la vez

`Vacantes` debe tener tres mundos bien separados:

- publico anonimo
- candidato externo con cuenta propia del dominio vacantes
- RH y aprobadores internos mediante sesion central del portal

### 4.3 Candidato no debe vivir en la misma identidad central del empleado

No conviene mezclar cuentas de empleados y candidatos en la misma capa de autenticacion principal.  
La identidad del empleado es corporativa.  
La identidad del candidato es de negocio de vacantes.

### 4.4 Rust es la linea oficial de backend

Se recomienda:

- `core-api` en Rust
- `vacantes-api` en Rust
- librerias Rust compartidas para auth, observabilidad, validacion y acceso SQL

Nest puede quedar como:

- scaffolding historico
- prototipo
- comparador funcional
- fallback temporal si un modulo Rust aun no llega a paridad

Pero la arquitectura final no debe depender de dos stacks principales.

### 4.5 Cookie de sesion segura para web

Para navegadores:

- `HttpOnly`
- `Secure`
- `SameSite=Lax` o `Strict` segun flujo
- token opaco aleatorio
- validacion server-side
- CSRF real

No usar:

- bearer token en `localStorage` como fuente principal
- IDs secuenciales de sesion como cookie final
- permisos decididos solo en React

### 4.6 Separacion por dominios y bases

Base recomendada:

- `PortalCore` para identidad, sesiones, permisos, auditoria, observabilidad base
- `PortalVacantes` para negocio de vacantes

Futuro:

- `PortalInventario`
- `PortalClinica`
- `PortalX`

Cada dominio con sus tablas y SP propios.  
`PortalCore` no debe terminar siendo una base gigantesca con toda la empresa adentro.

### 4.7 Autorizacion en dos capas

Se recomienda:

- RBAC: roles y permisos
- ABAC: atributos de pais, empresa, unidad organizativa, tipo de usuario, sistema, recurso

Mas adelante:

- RLS en SQL Server para reportes y acceso filtrado por pais/org usando `SESSION_CONTEXT`

---

## 5. Objetivos no funcionales

### 5.1 Seguridad

- cero secretos en repo
- MFA para accesos internos privilegiados
- auditoria obligatoria en login, logout, cambios de estado y acciones RH
- proteccion CSRF
- bloqueo temporal por abuso
- rotacion de sesiones
- trazabilidad de archivos CV y acciones IA

### 5.2 Rendimiento

Objetivos iniciales:

- `/api/auth/me` p95 < 150 ms
- `/api/core/apps` p95 < 150 ms
- `/api/vacantes/publicas` p95 < 250 ms
- `/api/vacantes/publicas/:slug` p95 < 250 ms
- `/api/vacantes/rh/dashboard` p95 < 500 ms
- login empleado p95 < 300 ms

### 5.3 Confiabilidad

- health checks reales
- readiness real con SQL
- logs estructurados
- correlation id extremo a extremo
- alertas
- backup y restore probados

### 5.4 Escalabilidad

- crecer de Nicaragua a otros paises
- soportar mas dominios internos
- soportar mas usuarios internos y externos
- soportar colas de IA y procesamiento de CV sin bloquear UX

### 5.5 Gobernanza

- nombres consistentes
- contratos API versionados
- SP con responsabilidad clara
- decisiones documentadas

---

## 6. Tecnologia recomendada en 2026

### 6.1 Recomendacion principal

| Capa | Estado actual visto | Recomendacion objetivo |
| --- | --- | --- |
| Frontend interno | React 18 + Vite | Mantener estable, luego evaluar React 19 en fase controlada |
| Frontend publico vacantes | React 18 + Vite | Igual criterio; primero estabilizar auth y negocio |
| Routing | React Router | Mantener |
| Backend | Rust + Axum ya presente | Consolidar como linea oficial |
| SQL access | Tiberius ya presente | Mantener inicialmente; extraer libreria comun |
| Observabilidad | Prometheus/Grafana/Loki docs ya presentes | Completar instrumentacion real |
| Proxy | Nginx | Mantener como gateway unificado |
| DB | SQL Server | Mantener, endurecer seguridad, cifrado y politicas |
| IA CV | Base existente + proveedor externo | Proveedor abstracto, no acoplarse a una sola marca |

### 6.2 Criterio 2026 sobre React

`React 19.2` aparece como version estable actual en `react.dev`, pero para este proyecto la recomendacion no es correr a actualizar por moda.  
La prioridad es:

1. cerrar seguridad y sesion
2. estabilizar contratos API
3. despues evaluar upgrade controlado del frontend

### 6.3 Criterio 2026 sobre SQL Server

Se recomienda correr en una version soportada y totalmente parchada, idealmente:

- SQL Server 2022 con CU actual soportado
- o equivalente administrado si la empresa mas adelante mueve parte de la carga

Controles recomendados:

- TDE para cifrado en reposo
- backup encryption
- Always Encrypted solo para columnas realmente sensibles y donde el costo operativo se justifique
- RLS para escenarios multi pais, multi empresa o datos de RH sensibles

### 6.4 Criterio 2026 sobre sesiones web

OWASP sigue favoreciendo:

- identificadores de sesion fuertes
- manejo server-side
- rotacion
- expiracion
- cookie segura
- CSRF real

Por eso este plan recomienda sesion opaca y no pseudo JWT local en browser.

---

## 7. Arquitectura objetivo

### 7.1 Vista macro

```text
                    +-----------------------------+
                    |  Navegador / Empleado       |
                    +--------------+--------------+
                                   |
                                   v
                    +-----------------------------+
                    | portal-web (React)          |
                    | /portal                     |
                    +--------------+--------------+
                                   |
                                   v
                    +-----------------------------+
                    | nginx / gateway             |
                    | /api/auth  -> core-api      |
                    | /api/core  -> core-api      |
                    | /api/vacantes -> vacantes   |
                    +--------------+--------------+
                                   |
             +---------------------+---------------------+
             |                                           |
             v                                           v
  +-------------------------+                +-------------------------+
  | core-api (Rust/Axum)    |                | vacantes-api (Rust)     |
  | identidad y sesion      |                | publico/candidato/RH    |
  +------------+------------+                +------------+------------+
               |                                          |
               v                                          v
     +----------------------+                 +------------------------+
     | PortalCore           |                 | PortalVacantes         |
     +----------------------+                 +------------------------+
```

### 7.2 Vista de vacantes

```text
Publico anonimo ------> vacantes-web publico ------> vacantes-api publico
Candidato externo ----> vacantes-web candidato ----> vacantes-api candidato
Empleado RH ----------> portal-web/login central --> core-api sesion
                                            \
                                             \--> vacantes-web RH --> vacantes-api RH
```

### 7.3 Principio de integracion

- `core-api` autentica empleados
- `vacantes-api` no confia en el frontend para saber si alguien es RH
- `vacantes-api` resuelve identidad interna usando la sesion central validada
- candidatos externos usan auth propia de vacantes

---

## 8. Estructura de repositorio objetivo

### 8.1 Estructura recomendada

```text
D:\portal
  core/
    core-api/
    portal-web/
    sql-core/
  vacantes/
    vacantes-api/
    vacantes-web/
    sql-vacantes/
  shared/
    rust/
      auth/
      observability/
      http/
      sql/
      files/
      testing/
    ts/
      ui/
      api/
      telemetry/
  infra/
    nginx/
    observabilidad/
    docs/
  docs/
```

### 8.2 Reglas de estructura

- El SQL de cada dominio vive en su carpeta.
- Los modulos Rust compartidos no deben duplicarse entre `core-api` y `vacantes-api`.
- Los componentes TS compartidos no deben vivir como copia y pega.
- La configuracion de proxy debe decidir por ruta, no por frontend duplicado.

