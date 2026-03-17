# Plan Maestro de Arquitectura y Fases — Portal Claro (2026)
## Fecha: 13 de marzo de 2026
## Autor: Revisión profunda por Antigravity (Gemini)

Este documento reemplaza los planes anteriores y establece la **hoja de ruta definitiva** tras la última auditoría de código, diseño y bases de datos. Detalla los procesos exactos para estandarizar el backend, finalizar el rediseño y prepararnos para producción.

---

## 🛑 ESTADO ACTUAL (Auditoría Profunda)

### ✅ Logros Completados
1.  **Frontend Público ("Estilo Tecoloco"):** El portal de vacantes público y el registro de candidatos han sido rediseñados usando componentes modernos, filtros laterales funcionales y la paleta de colores corporativa (Claro).
2.  **Lógica del Filtro en Vivo:** El backend ahora soporta filtros combinados (país, modalidad, búsqueda de texto) alimentando las tarjetas de trabajo en tiempo real con contadores precisos.
3.  **Seguridad Base:** Sin credenciales quemadas, los endpoints de Rust validan parámetros correctamente sin causar cierres abruptos de la aplicación (`panic!`). Las inyecciones SQL están mitigadas gracias al uso de bindings (`@P1`).

### ⚠️ Deuda Técnica Encontrada (Lo que está "mal" o "incompleto")
1.  **Consultas "Quemadas" en Rust:** Existen aún más de 15 consultas SQL (`SELECT`, `INSERT`, `UPDATE`) escritas directamente dentro de los archivos `sql_read_repository.rs`, `sql_write_repository.rs` y `portal_auth.rs`. Esto rompe el patrón de "Toda la lógica de datos en Stored Procedures".
2.  **Monolito de Handlers:** El archivo `main.rs` en la API de vacantes (o los repositorios) está concentrando demasiada lógica.
3.  **Falta de Connection Pooling:** Actualmente la API abre una conexión TCP a MSSQL por cada instrucción, lo cual bajo carga pesada saturará el servidor de base de datos.
4.  **Dashboard de RRHH Obsoleto:** El panel interno para administradores y reclutadores aún conserva el esquema básico/plantilla, desentonando con la tremenda calidad del nuevo portal público.

---

## 🗺️ PLAN PROFUNDO POR FASES Y PROCESOS

### FASE 1 — LIMPIEZA ARQUITECTÓNICA (BACKEND CORE)
* **Objetivo:** Estandarizar el acceso a datos y asegurar la estabilidad a largo plazo.
* **Actor Principal:** 🔷 Gemini (SQL) y 🤖 ChatGPT (Rust).

| Proceso / Tarea | Acción Detallada | Responsable |
| :--- | :--- | :--- |
| **1.1 Auditoría de Queries Crudos** | Extraer cada `SELECT` crudo de `sql_read_repository.rs`. | 🔷 Gemini |
| **1.2 Generación de SPs** | Crear Procedimientos Almacenados (ej. `spVac_ObtenerDetallePorSlug`, `spPost_ListarPorPersona`) encapsulando estos SELECTs en la base de datos `PortalVacantes`. | 🔷 Gemini |
| **1.3 Refactor de Rust a SPs** | Remplazar los textos SQL en Rust por llamadas directas: `EXEC dbo.MiProcedimiento @Param = @P1`. | 🤖 ChatGPT / Gemini |
| **1.4 Generación de SPs (Core)** | Repetir el paso 1.2 para las consultas de autenticación y autorización y crearlos en `PortalCore`. | 🔷 Gemini |

### FASE 2 — REDISEÑO DEL PORTAL INTERNO (HR DASHBOARD)
* **Objetivo:** Equiparar la calidad visual del portal de Empleados / Administradores con el estándar recién logrado en la Fase Pública.
* **Actor Principal:** 🤖 ChatGPT (React/CSS).

| Proceso / Tarea | Acción Detallada | Responsable |
| :--- | :--- | :--- |
| **2.1 Layout Dinámico Dark-Mode** | Implementar un "Sidebar" lateral retráctil oscuro (Sidebar Navigation) para módulos internos (Panel, Vacantes, Candidatos). | 🤖 ChatGPT |
| **2.2 Tarjetas de KPIs Reales** | Convertir las estadísticas duras del panel principal en tarjetas tipo Widget con números provenientes de un endpoint (ej. "Nuevos CVs", "Postulaciones Hoy"). | 🤖 ChatGPT |
| **2.3 Tabla de Gestión de Vacantes** | Rediseñar la tabla donde RH ve sus vacantes publicadas, agregando paginación, "Status Badges" estilo chips, y un botón claro de "Nueva Vacante". | 🤖 ChatGPT |

### FASE 3 — ESCALABILIDAD Y OPTIMIZACIÓN EN RUST
* **Objetivo:** Que el backend soporte ráfagas altas de tráfico sin caer o tirar timeouts de base de datos.
* **Actor Principal:** 🤖 ChatGPT (Rust).

| Proceso / Tarea | Acción Detallada | Responsable |
| :--- | :--- | :--- |
| **3.1 Connection Pooling (`bb8`)** | Implementar `bb8` con `tiberius` para mantener un pool de unas 10-20 conexiones vivas a MSSQL en lugar de crearlas por request. | 🤖 ChatGPT |
| **3.2 Refactor de Repositorios** | Pasar el manejador del pool (`Pool<ConnectionManager>`) como Estado Compartido (`State`) a Axum, y que cada capa de repositorio tome conexiones del pool. | 🤖 ChatGPT |
| **3.3 Modulación de Archivos** | Mover rutas específicas desde `main.rs` (si es gigante) hacia subcarpetas independientes (`/http/routes/`). | 🤖 ChatGPT |

### FASE 4 — MÓDULO INTELIGENTE (IA PARA CVs)
* **Objetivo:** Aprovechar la infraestructura de las tablas ya creadas (`AnalisisCvIa`) para dar valor real y ahorrar tiempo a Recursos Humanos.
* **Actor Principal:** 🔷 Gemini / 🤖 ChatGPT.

| Proceso / Tarea | Acción Detallada | Responsable |
| :--- | :--- | :--- |
| **4.1 Integración IA API** | Configurar el cliente en Rust (`gemini_client.rs` u OpenAI) para enviar el texto extraído del CV del candidato. | 🤖 ChatGPT |
| **4.2 Carga de Scripts SQL IA** | Asegurarse que `11_sp_ia_cv.sql` funcione y almacenar el Response JSON extraído por la IA directamente en la BD. | 🔷 Gemini |
| **4.3 UI de Resultados (ATS)** | Añadir al Portal Interno de RH una vista que muestre el "% de Encaje" (Score) que la IA le dio al candidato comparado con los requisitos de la vacante. | 🤖 ChatGPT |

---

## 🎯 PRÓXIMO PASO SUGERIDO (Inmediato)
Recomiendo iniciar atacando la **FASE 1**.

Hay consultas de Rust muy importantes (como recuperar el usuario al hacer login, o el detalle de una vacante pública) que aún son código SQL en bruto (`SELECT ... FROM ... WHERE`). Si me autorizas, puedo empezar a interceptar una por una, crear sus respectivos archivos `.sql` (Procedimientos Almacenados) y actualizando el backend Rust inmediatamente.

O si prefieres, podemos saltar a la **FASE 2** y primero dejar la cara del portal de RH espectacular. ¿Cuál prefieres detonar primero?
