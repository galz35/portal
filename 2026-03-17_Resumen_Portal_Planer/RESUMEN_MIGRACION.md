# 🚀 Resumen de Migración y Estado del Proyecto - 17 de Marzo, 2026

Este documento contiene la información esencial del ecosistema **Portal Central** para continuar el desarrollo en un nuevo chat.

---

## 🏗️ Arquitectura General (Monorepo)
El proyecto está organizado en `D:\portal` y contiene los siguientes sistemas:

- **Core (Portal Central):** API NestJS y Frontend Vite. El corazón del SSO.
- **Planer (V2):** Sistema de planificación migrado desde `D:\planificacion\v2sistema`.
- **Vacantes:** Módulo de gestión de vacantes (API NestJS).
- **Inventario:** Control de activos y equipos.
- **Clínica:** Módulo de gestión médica.

---

## 🌐 Mapeo de Puertos (Servicios Activos)

| Aplicación | Backend (Nest.js) | Frontend (Vite) | URL Local Web |
| :--- | :--- | :--- | :--- |
| **Portal Central** | 3110 | 5173 | http://localhost:5173 |
| **Planer (V2)** | 3002 | 5175 | http://localhost:5175 |
| **Clínica** | 3001 | 5174 | http://localhost:5174 |
| **Inventario** | 3003 | 5176 | http://localhost:5176 |
| **Vacantes** | 3300 | 5177 | http://localhost:5177 |

---

## 🔑 Integración de Seguridad (SSO)

La integración entre el **Portal Central** y los sistemas satélite (Planer, Vacantes, etc.) se basa en un flujo de **JWT SSO Shared Secret**.

### Lógica del Backend (Satellite Systems):
1.  Recibe un token JWT desde el portal en el endpoint `/auth/sso-login`.
2.  Valida la firma con el secreto compartido (definido en `.env`).
3.  **Just-In-Time (JIT) Provisioning:** Si el usuario no existe en la base de datos local (ej. Planer), se crea automáticamente tomándolo del token.
4.  Realiza validaciones de seguridad adicionales (User Agent y IP) para prevenir robos de tickets.

### Lógica del Frontend (Satellite Systems):
-   **SSOHandlerPage.tsx:** Página encargada de recibir el `?token=` del portal, hacer el intercambio con el backend y establecer la sesión local.

---

## 📦 Planer V2: Puntos Clave de la Migración
-   **Origen:** `D:\planificacion\v2sistema`
-   **Destino:** `D:\portal\planer`
-   **Base de Datos:** Conecta a SQL Server IP `190.56.16.85` (DB: `Planer_RRHH`).
-   **Archivos Modificados Críticos:**
    -   `v2backend/src/auth/auth.service.ts`: Lógica de validación SSO avanzada.
    -   `v2backend/src/auth/auth.repo.ts`: Implementación de `crearUsuario` (JIT) y manejo de `agendaConfig`.
    -   `v2backend/src/main.ts`: Configuración de Fastify con Cookies y CORS permitidos para `rhclaroni.com`.
    -   `v2frontend/src/pages/SSOHandlerPage.tsx`: Manejo del flujo de entrada desde el portal con logs de depuración.

---

## 🛡️ Repositorio Git
-   **URL:** `https://github.com/galz35/portal.git`
-   **Estructura:** Monorepo gestionado desde la raíz `D:\portal`.
-   **Estado:** `.gitignore` configurado para ignorar `node_modules`, archivos `.env`, logs y carpetas temporales.

---

## 🛠️ Comandos de Lanzamiento
En cada proyecto (Backend y Frontend), se utiliza:
-   `npm run start:dev` (para Nest.js)
-   `npm run dev` (para Vite/React)

Un archivo `detener_todo.bat` y `lanzar_todo.bat` en la raíz de `D:\portal` puede ser utilizado para control masivo.

---

*Documento generado por Antigravity para continuidad del flujo de trabajo.*
