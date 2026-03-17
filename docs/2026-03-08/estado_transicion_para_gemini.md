# Estado de Transición para Gemini

## Objetivo de este documento

Dejar claro:

- qué se ha construido en `D:\portal`
- qué representa el sistema
- qué partes ya están avanzadas
- qué falta para cerrar Portal
- qué sigue para Vacantes
- cómo retomar desde aquí sin perder contexto

## Qué es este sistema

El ecosistema en `D:\portal` está pensado como una plataforma compuesta por:

1. `Portal`
   - login central
   - sesión compartida
   - selector de apps
   - perfil base
   - logout global

2. `Vacantes`
   - portal público
   - candidato
   - RH
   - postulaciones
   - terna
   - blacklist
   - reportes
   - IA CV

3. `Planer`
   - sistema existente y ya funcional fuera de este workspace
   - a futuro debe consumir autenticación central del Portal
   - no debe reescribirse su negocio

## Qué se ha construido hasta ahora

### SQL Server / PortalCore

Ya quedaron provisionados en `PortalCore`:

- Core inicial
- Vacantes
- IA CV
- sesión global
- seguridad avanzada
- observabilidad

En términos prácticos, la base SQL está mucho más adelantada que el backend y frontend.

### core-api

Estado actual:

- tiene estructura de módulos para auth, sesiones y observabilidad
- ya no responde solo strings
- ya devuelve JSON base coherente
- ya tiene:
  - `AppConfig`
  - `AppState`
  - `db.rs`
  - repositorio y casos de uso básicos de auth y sesiones
- ya lee parámetros SQL desde `conexion.txt` como fallback

Limitación actual:

- todavía usa estado demo en memoria
- todavía no ejecuta consultas reales a `PortalCore`
- login, refresh, logout y `/me` no están conectados de verdad a SQL Server

### portal-web

Estado actual:

- ya existe como app React/Vite mínima
- ya tiene:
  - `package.json`
  - `vite.config.ts`
  - `index.html`
  - `main.tsx`
  - `App.tsx`
  - router
  - login general
  - login empleado
  - dashboard portal
  - perfil base
  - sin acceso
  - guards básicos
- ya tiene una dirección visual corporativa rojo, blanco y negro

Limitación actual:

- todavía depende de respuestas demo del `core-api`
- no está pegado a auth real contra SQL

### Vacantes

Estado actual:

- SQL muy adelantado
- API y web existen como scaffold fuerte
- `vacantes-api` ya devuelve JSON mínimo base
- no está implementado todavía el flujo real extremo a extremo

Limitación actual:

- aún falta conectar SQL real, casos de uso reales, RH real y frontend real

### Planer

Estado actual:

- dentro de `D:\portal` solo existe shell de integración
- el sistema real está fuera de este workspace
- ya quedó documentada la estrategia de integración con Portal

Limitación actual:

- no se ha implementado aún la API puente o la validación central real

## Porcentaje de avance estimado

### Portal

Avance real aproximado: `81%`

Ya tiene:

- SQL fuerte
- contratos backend
- frontend base utilizable
- estructura clara

Le falta:

- conectar backend real a SQL Server
- login real
- refresh real
- logout real
- `/me` real
- cookies/sesión real

### Ecosistema global

Avance real aproximado: `80%`

Esto no significa “listo para publicar”.
Significa “la arquitectura y el scaffold fuerte ya están muy avanzados”.

## Qué falta exactamente para Portal 100%

1. `core-api` real contra `PortalCore`
   - usar procedimientos:
     - `spSeg_Login`
     - `spSeg_UsuarioApps`
     - `spSeg_UsuarioPermisos`
     - `spSeg_Me`
     - `spSeg_Refresh_*`
     - `spSeg_Sesion_*`

2. Login real
   - validar usuario/clave
   - crear sesión portal
   - generar access/refresh
   - responder con cookies correctas

3. Refresh real
   - validar refresh
   - validar sesión activa
   - rotar refresh
   - renovar access

4. Logout real
   - revocar sesión
   - revocar refresh
   - invalidar JTI access si aplica

5. `/me` real
   - perfil base
   - apps visibles
   - permisos
   - sesión

6. portal-web real
   - consumir esos endpoints reales
   - manejar 401/403 reales
   - sesión expirada y logout global real

## Qué sigue para Vacantes

El usuario pidió que Gemini trabaje fuerte en Vacantes desde aquí.

Prioridad recomendada en Vacantes:

1. `vacantes-api` real contra SQL Server
   - vacantes públicas
   - detalle
   - postular
   - mis postulaciones
   - RH vacantes
   - cambio de estado
   - terna
   - blacklist

2. `vacantes-web` mínimo funcional
   - listado público
   - detalle
   - login/flujo candidato
   - mis postulaciones
   - RH básico

3. luego IA CV real
   - no antes

## Restricción importante

No dispersarse otra vez en:

- más paquetes nuevos
- más scaffolding de otros sistemas
- integrar Planer ya

Primero:

- cerrar Portal real
- dejar Vacantes básico funcional

## Documentos relevantes ya creados

En `D:\portal\docs\2026-03-08` ya existen:

- `estado_general.md`
- `plan_portal_planer_vacantes.md`
- `plan_integracion_planer.md`
- `direccion_ui_portal.md`
- `estado_transicion_para_gemini.md`

## Instrucción práctica para Gemini

Trabajar a partir de este estado con este orden:

1. terminar `core-api` real
2. terminar `portal-web` real
3. trabajar fuerte `vacantes-api`
4. dejar `vacantes-web` funcional básico
5. dejar Planer para integración posterior
