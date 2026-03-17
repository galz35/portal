# Plan de Trabajo — Portal Corporativo
## Fecha: 13 de marzo de 2026
## Autor: Revisión técnica completa por Antigravity (Gemini)

### Convención de asignación:
- 🤖 **ChatGPT** — Tareas de código Rust/TypeScript (refactorizar, escribir tests, agregar features)
- 🔷 **Gemini** — Tareas de SQL, ejecución, pruebas de runtime, scripts de infraestructura
- ✅ **Completada** — Ya realizada

---

## Estado Actual del Proyecto

- **4 servicios** compilando sin errores (core-api, vacantes-api, portal-web, vacantes-web)
- **68 archivos** de código fuente real (no esqueletos)
- **21 páginas** funcionales entre ambos frontends
- **30+ endpoints** REST en los backends
- **40 scripts SQL** entre PortalCore y PortalVacantes
- PortalCore: **36 tablas**, **28 SPs** desplegados
- PortalVacantes: **33 tablas**, **65 SPs** desplegados
- Usuario `empleado.portal` con apps (portal, vacantes, planer) y roles (EMPLEADO, RH_VACANTES, ADMIN_GLOBAL) asignados
- **10 permisos** expandidos para el usuario base

---

# FASE 0 — FUNDACIÓN (Hoy, 13 de marzo)
> Objetivo: Que el sistema levante y funcione end-to-end en desarrollo local

## 0.1 — Correcciones Inmediatas

- ✅ **0.1.1** 🔷 Corregir `Portal123*` → `Portal123!` en `LoginEmpleadoPage.tsx:89`
- ✅ **0.1.2** 🔷 Verificar que los SQL seeds estén ejecutados en la BD:
  - `06_seed_usuario_base.sql` — Usuario existe con apps y roles ✅
  - `12_fix_hash_usuario_base.sql` — Hash corregido a SHA256 de `Portal123!` ✅
- ✅ **0.1.3** 🔷 Verificar tablas de `PortalVacantes` — Las 33 tablas existen ✅
- ✅ **0.1.4** 🔷 Verificar SPs:
  - PortalCore: 28 SPs incluyendo `spSeg_Sesion_ValidarPorSidHash` ✅
  - PortalVacantes: 65 SPs incluyendo todos los `spCand_*` ✅
- ✅ **0.1.5** 🔷 Verificar columna `SidHash` en `SesionPortal` (hardening) ✅
- ✅ **0.1.6** 🔷 Verificar permisos expandidos del usuario base — 10 permisos incluyendo `vacantes.rh.ver`, `vacantes.rh.crear`, `vacantes.rh.estado` ✅

## 0.2 — Script de Levantamiento

- ✅ **0.2.1** 🔷 Crear `D:\portal\scripts\run_dev_basico.ps1` — Levanta los 4 servicios como background jobs
- [ ] **0.2.2** 🤖 Crear `D:\portal\scripts\stop_dev.ps1` — Script para detener todos los procesos

## 0.3 — Prueba End-to-End Manual

- [ ] **0.3.1** 🔷 Levantar los 4 servicios y verificar health checks
- [ ] **0.3.2** 🔷 Login empleado en `http://localhost:5173/login-empleado`
- [ ] **0.3.3** 🔷 Verificar dashboard portal con apps visibles
- [ ] **0.3.4** 🔷 Navegar a vacantes públicas en `http://localhost:5174/`
- [ ] **0.3.5** 🔷 Registrar candidato externo en `http://localhost:5174/registro`
- [ ] **0.3.6** 🔷 Login candidato y ver perfil
- [ ] **0.3.7** 🔷 Acceder al dashboard RH

## 0.4 — Smoke Test Automatizado

- [ ] **0.4.1** 🔷 Ejecutar smoke test en modo lectura
- [ ] **0.4.2** 🔷 Ejecutar smoke test con login empleado
- [ ] **0.4.3** 🔷 Documentar cualquier falla encontrada

---

# FASE 1 — DEUDA TÉCNICA CRÍTICA (Semana 1)
> Objetivo: Eliminar riesgos técnicos que podrían afectar estabilidad o mantenibilidad

## 1.1 — Connection Pooling (Prioridad Alta)

**Problema:** Cada query SQL abre una conexión TCP nueva. Bajo carga, esto agota las conexiones del servidor MSSQL.

- [ ] **1.1.1** 🤖 Implementar pool de conexiones con `bb8` + `bb8-tiberius` en `core-api`
  - Crear `SqlPool` type alias en `db.rs`
  - Reemplazar `connect()` por pool en `sql_read_repository.rs`
  - Configurar `max_size`, `min_idle`, `connection_timeout` desde env vars
- [ ] **1.1.2** 🤖 Implementar pool de conexiones en `vacantes-api`
  - Pool para `sql` (PortalVacantes)
  - Pool para `core_sql` (PortalCore)
  - Reemplazar `connect()` en los 4 archivos que la usan
- [ ] **1.1.3** 🤖 Agregar métricas de pool a `/health/ready` (pool activo = ready, pool agotado = not ready)
- [ ] **1.1.4** 🔷 Verificar que los servicios levantan y smoke test pasa con pooling

## 1.2 — Eliminar Código Duplicado

**Problema:** `connect()` copiada en 4 archivos. Utilidades duplicadas en 3-4 archivos.

- [ ] **1.2.1** 🤖 Extraer `connect()` a `db.rs` como método de `SqlServerSettings`
- [ ] **1.2.2** 🤖 Crear módulo `shared/sql_helpers.rs` con `text()`, `read_i64()`, `nullable_text()`, etc.
- [ ] **1.2.3** 🤖 Eliminar copias duplicadas de los 4 repositorios
- [ ] **1.2.4** 🔷 Verificar que compila y smoke test pasa

## 1.3 — Refactorizar Monolito de vacantes-api

**Problema:** `main.rs` tiene 2,632 líneas con todos los handlers inline.

- [ ] **1.3.1** 🤖 Crear estructura de módulos:
  ```
  src/handlers/    → publico.rs, portal.rs, candidato.rs, rh_vacantes.rs,
                     rh_postulaciones.rs, rh_requisiciones.rs, rh_descriptores.rs,
                     rh_otros.rs, helpers.rs
  src/validation/  → vacancy.rs, requisition.rs, descriptor.rs, postulation.rs, blacklist.rs
  ```
- [ ] **1.3.2** 🤖 Mover handlers uno por uno, verificando compilación
- [ ] **1.3.3** 🤖 Mover funciones de validación a `validation/`
- [ ] **1.3.4** 🤖 `main.rs` debe quedar en ~150 líneas (solo router + startup)
- [ ] **1.3.5** 🔷 Verificar que compila y smoke test pasa

## 1.4 — Carga Automática de .env

**Problema:** Los backends no leen `.env` automáticamente.

- [ ] **1.4.1** 🤖 Agregar `dotenvy = "0.15"` a `Cargo.toml` de ambos servicios
- [ ] **1.4.2** 🤖 Agregar `let _ = dotenvy::dotenv();` al inicio de `main()` en ambos
- [ ] **1.4.3** 🤖 Actualizar documentación (handoff, runbook)
- [ ] **1.4.4** 🔷 Verificar que los servicios levantan sin el bloque manual de PowerShell

## 1.5 — Corregir Query Ineficiente

**Problema:** `listar_pendientes_aprobacion` trae todas las requisiciones y filtra en Rust.

- [ ] **1.5.1** 🤖 Modificar handler para usar query SQL directa con `WHERE EstadoRequisicion LIKE 'PENDIENTE%'`
- [ ] **1.5.2** 🔷 Alternativa: El SP `spReq_ListarPendientesAprobacion` ya existe en la BD. Solo hay que usarlo desde Rust.

---

# FASE 2 — CALIDAD Y ROBUSTEZ (Semana 2-3)
> Objetivo: Agregar tests, mejorar DX, y pulir detalles

## 2.1 — Tests Unitarios en Rust

- [ ] **2.1.1** 🤖 Agregar módulo `#[cfg(test)]` en `input_validation.rs`:
  - `validate_email_address` — emails válidos e inválidos
  - `validate_person_name` — nombres con acentos, guiones, espacios
  - `validate_phone` — formatos internacionales
  - `validate_password_strength` — combinaciones de clases
  - `validate_country_code` — códigos ISO
  - `validate_money_range` — rangos invertidos
  - `parse_iso_date` — fechas válidas e inválidas
- [ ] **2.1.2** 🤖 Tests para lógica de permisos (`tiene_app`, `tiene_alguno`)
- [ ] **2.1.3** 🤖 Tests para `slugify()` y `normalize_*` funciones
- [ ] **2.1.4** 🔷 Ejecutar `cargo test` y verificar todo verde

## 2.2 — Mejorar Slugify

**Problema:** `slugify()` convierte acentos (ñ, á, é) a `-`.

- [ ] **2.2.1** 🤖 Implementar transliteración básica de caracteres latinos
- [ ] **2.2.2** 🤖 Agregar tests: `"Diseñador Gráfico"` → `"disenador-grafico"`

## 2.3 — Tests de Frontend

- [ ] **2.3.1** 🤖 Agregar Vitest a `portal-web` y `vacantes-web`
- [ ] **2.3.2** 🤖 Test básico para cada guard (AuthGuard, CandidateGuard, PermisoGuard)
- [ ] **2.3.3** 🤖 Test para funciones de CSRF y cookie handling
- [ ] **2.3.4** 🤖 Test para `formatBytes()` y utilidades de UI

## 2.4 — Mejoras de DX (Developer Experience)

- [ ] **2.4.1** 🤖 Crear `CONTRIBUTING.md` con instrucciones de setup
- [ ] **2.4.2** 🤖 Crear `.vscode/launch.json` para debug de backends Rust
- [ ] **2.4.3** 🤖 Agregar scripts `npm run check` en frontends
- [ ] **2.4.4** 🤖 Crear `.gitignore` unificado si no existe

## 2.5 — Seguridad Preventiva

- [ ] **2.5.1** 🤖 Forzar error si `JWT_SECRET` queda en default en host no local
- [ ] **2.5.2** 🤖 Eliminar funciones duplicadas `is_loopback_bind_host` / `is_local_host`
- [ ] **2.5.3** 🤖 Agregar rate limiting para `/api/auth/me`
- [ ] **2.5.4** 🤖 Plan de migración gradual de SHA256 a Argon2 para empleados
- [ ] **2.5.5** 🤖 Condicionar hint de credenciales en login a modo dev
- [ ] **2.5.6** 🔷 Ejecutar smoke test completo post-cambios de seguridad

---

# FASE 3 — EVOLUCIÓN DEL PORTAL (Semana 4-6)
> Objetivo: Fortalecer el core del portal como plataforma multi-módulo

## 3.1 — Dashboard Dinámico del Portal

**Estado actual:** KPIs hardcodeados (`"2"`, `"Central"`, `"Alta"`).

- [ ] **3.1.1** 🤖 Crear endpoint `/api/core/dashboard` que agregue métricas
- [ ] **3.1.2** 🤖 Mostrar KPIs reales: apps activas, sesiones activas, últimos eventos
- [ ] **3.1.3** 🤖 Widget de "actividad reciente" desde `EventoSeguridad`
- [ ] **3.1.4** 🤖 Dashboard responsive para tablets
- [ ] **3.1.5** 🔷 Crear SP `spSeg_Dashboard_Resumen` en PortalCore

## 3.2 — Gestión de Usuarios desde Portal

**Estado actual:** Usuarios se crean solo vía SQL seeds.

- [ ] **3.2.1** 🔷 Crear SPs: `spSeg_Usuarios_Listar`, `spSeg_Usuarios_Crear`, `spSeg_Usuarios_CambiarEstado`, `spSeg_Usuarios_AsignarRol`
- [ ] **3.2.2** 🤖 Crear página `UsuariosPage.tsx` en portal-web (solo ADMIN_GLOBAL)
- [ ] **3.2.3** 🤖 Endpoints REST: `GET/POST /api/core/usuarios`, `PATCH .../estado`, `PATCH .../roles`
- [ ] **3.2.4** 🔷 Seed de datos de prueba para múltiples usuarios

## 3.3 — Sistema de Notificaciones

- [ ] **3.3.1** 🔷 Crear tabla `NotificacionPortal` y SPs en PortalCore
- [ ] **3.3.2** 🤖 Endpoints: `GET /api/core/notificaciones`, `PATCH .../leer`
- [ ] **3.3.3** 🤖 Componente campana de notificaciones en header del portal
- [ ] **3.3.4** 🤖 Integración: vacantes-api registra notificación al cambiar estado
- [ ] **3.3.5** 🔷 Ejecutar scripts SQL de notificaciones

## 3.4 — Perfil de Empleado Enriquecido

**Estado actual:** `PerfilBasePage.tsx` existe pero muestra datos mínimos.

- [ ] **3.4.1** 🤖 Mostrar info completa desde `vwEmpleadoPortal`
- [ ] **3.4.2** 🤖 Foto de perfil con storage
- [ ] **3.4.3** 🤖 Historial de sesiones activas con opción de revocar
- [ ] **3.4.4** 🔷 Verificar que la vista `vwEmpleadoPortal` existe y devuelve datos

---

# FASE 4 — NUEVOS MÓDULOS (Mes 2+)
> Objetivo: Expandir el portal con los sistemas planificados

## 4.1 — Módulo Planer

**Estado:** Ya registrado como `AplicacionSistema` código `planer`. Falta implementar.

- [ ] **4.1.1** 🤖 Definir alcance del módulo Planer
- [ ] **4.1.2** 🤖 Crear `planer-api` (Rust/Axum) siguiendo patrón de vacantes-api
- [ ] **4.1.3** 🤖 Crear `planer-web` (React/Vite) siguiendo patrón
- [ ] **4.1.4** 🔷 BD `PortalPlaner` con scripts SQL siguiendo convenciones
- [ ] **4.1.5** 🔷 Seeds y SPs para el módulo
- [ ] **4.1.6** 🤖 Conectar al portal vía `resolver_identidad_portal()`

## 4.2 — IA para CVs

**Estado:** Esquema SQL ya existe. Frontend tiene componentes. Falta servicio.

- [ ] **4.2.1** 🤖 Decidir motor IA (OpenAI, Claude, Gemini)
- [ ] **4.2.2** 🤖 Crear servicio de análisis con rate limiting propio
- [ ] **4.2.3** 🤖 Endpoint de reprocesamiento desde RH
- [ ] **4.2.4** 🤖 Scoring automático (habilidades, experiencia, educación, contexto)
- [ ] **4.2.5** 🔷 Verificar SPs de IA existentes: `spIA_GuardarAnalisisCv`, `spIA_GuardarPerfilNormalizado`, etc.

## 4.3 — CI/CD Pipeline

- [ ] **4.3.1** 🤖 GitHub Actions para `cargo check` + `cargo test` + `tsc --noEmit`
- [ ] **4.3.2** 🤖 Docker images para deploy
- [ ] **4.3.3** 🔷 Deploy automatizado al VPS Ubuntu
- [ ] **4.3.4** 🔷 Configurar smoke test en CI

---

# Resumen de Asignación

| Fase | Total tareas | 🤖 ChatGPT | 🔷 Gemini | ✅ Completadas |
|------|-------------|------------|-----------|---------------|
| Fase 0 | 15 | 1 | 14 | 8 |
| Fase 1 | 18 | 14 | 4 | 0 |
| Fase 2 | 20 | 17 | 3 | 0 |
| Fase 3 | 17 | 11 | 6 | 0 |
| Fase 4 | 14 | 9 | 5 | 0 |
| **Total** | **84** | **52** | **32** | **8** |

---

# Apéndice: Archivos Clave

| Propósito | Archivo |
|-----------|---------|
| Documentación general | `D:\portal\docs\handoff_gemini_revision_basica_2026-03-13.md` |
| Runbook de smoke test | `D:\portal\docs\runbook_smoke_backend.md` |
| Smoke test script | `D:\portal\scripts\smoke_portal_vacantes.ps1` |
| **Script dev (nuevo)** | `D:\portal\scripts\run_dev_basico.ps1` |
| Config core-api | `D:\portal\core\core-api\.env` |
| Config vacantes-api | `D:\portal\vacantes\vacantes-api\.env` |
| Seeds de usuario | `D:\portal\core\sql-core\06_seed_usuario_base.sql` |
| Fix de hash | `D:\portal\core\sql-core\12_fix_hash_usuario_base.sql` |

---

> **Nota:** Este plan es evolutivo. Las fases 0 y 1 son las únicas obligatorias antes de considerar el sistema estable.
> ChatGPT se encarga del código (Rust/TypeScript). Gemini se encarga de SQL, ejecución y pruebas de runtime.
