# Documentación de Rutas y Puertos - Vacantes (16/03/2026)

Este documento detalla la configuración final establecida para resolver los conflictos de puertos y rutas entre las aplicaciones del ecosistema Claro Portal, específicamente para el módulo de **Vacantes**.

## 🔌 Configuración de Puertos

A partir de hoy, los puertos oficiales para el entorno de desarrollo son:

| Componente | Puerto | URL de Desarrollo |
| :--- | :---: | :--- |
| **Vacantes Frontend** | **5177** | `http://localhost:5177` |
| **Vacantes Backend (NestJS)** | **3300** | `http://localhost:3300` |

---

## 🗺️ Mapa de Rutas de Vacantes

Se han definido rutas específicas según el tipo de usuario para evitar confusiones entre la página pública y el área administrativa:

### 1. Área Pública (Candidatos Externos)
No requiere autenticación del Portal Central.
- **Ruta Principal:** `http://localhost:5177/empleos`
- **Redirección:** Si se accede a `http://localhost:5177/`, el sistema redirige automáticamente a `/empleos`.
- **Propósito:** Búsqueda de plazas, registro de candidatos externos y visualización de detalles de vacantes.

### 2. Área Administrativa (RRHH / Interno)
Requiere autenticación Single Sign-On (SSO) a través del Portal Central.
- **Ruta de Acceso:** `http://localhost:5177/app/vacantes/rh/dashboard`
- **Flujo SSO:** El Portal Central (`localhost:5173`) ahora apunta directamente a esta ruta para el acceso de empleados autorizados.

---

## 🛠️ Archivos de Configuración Críticos

Si en el futuro se presentan problemas de "cruces" de aplicaciones, verificar los siguientes archivos:

1.  **Frontend Config:** `d:\portal\vacantes\vacantes-web\vite.config.ts` (Debe tener `port: 5177`).
2.  **Router Config:** `d:\portal\vacantes\vacantes-web\src\app\router.tsx` (Define las rutas `/empleos` y `/app/vacantes/rh/*`).
3.  **Base de Datos Portal:** La tabla `AplicacionSistema` en `PortalCore` debe tener la ruta: `http://localhost:5177/app/vacantes/rh/dashboard` para el código `vacantes`.
4.  **Backend Env:** `d:\portal\vacantes\vacantes-api-nest\.env` (Debe tener `PORT=3300`).

---

## 🚀 Notas de Estabilidad
- Se ha corregido la confusión previa donde Vacantes y Clínica compartían puertos erróneos en la base de datos.
- Se ha verificado que el usuario de prueba tiene los permisos correctos en la tabla `UsuarioAplicacion` para ver todos los módulos en "Mis Aplicaciones".

---
*Documentado por: Antigravity AI*
*Fecha: 16 de Marzo, 2026*
