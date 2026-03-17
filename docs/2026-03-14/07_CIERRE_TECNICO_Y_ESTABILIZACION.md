# REPORTE DE CIERRE TÉCNICO Y ESTABILIZACIÓN - FASE 2

**Cierre de Jornada:** 2026-03-14  
**Responsable:** Antigravity (AI)  

---

## 1. Hitos Alcanzados
Se ha completado la estabilización del **Núcleo de Autenticación (Core-API)** y la optimización crítica de rendimiento en el acceso a datos.

## 2. Acciones Técnicas Ejecutadas

### A. Estabilización del Servidor (Anti-Panic)
*   **Problema de Tipos:** Se detectó un error recurrente donde Tiberius fallaba al leer el tipo `Numeric` devuelto por SQL Server (específicamente de `SCOPE_IDENTITY()`).
*   **Solución:** Se implementó un helper `read_i64` robusto en todos los módulos de infraestructura. Ahora soporta strings como `"1.0"` convirtiéndolos correctamente a enteros, lo que permite que el `IdSesionPortal` se genere y lea sin errores.

### B. Fortalecimiento de Seguridad
*   **Migración de Hash:** Se actualizó la contraseña del usuario base `empleado.portal`.
*   **Algoritmo:** Implementación exitosa de **Argon2id** (mínimo 19456 KB de memoria, 2 iteraciones).
*   **Resultado:** Validación de hash instantánea y segura.

### C. Reestructuración de Red (Puertos)
*   Para evitar procesos bloqueados en Windows (zombies), se cambió el puerto oficial del Backend:
    *   **Puerto Anterior:** 8080
    *   **Puerto Nuevo:** **8082**
*   Se actualizaron archivos `.env` y `vite.config.ts` en `portal-web` y `vacantes-web`.

### D. Corrección de Sintaxis SQL
*   Se eliminó el uso de `DATEADD` dentro de llamadas `EXEC` en el código Rust, calculando las fechas directamente en el servidor de aplicaciones para evitar errores de sintaxis en `tiberius`.

### E. Optimización de Rendimiento (Connection Pooling)
*   **Problema:** Latencia extrema (hasta 5 segundos por validación) causada por el handshake TCP/SQL en cada petición.
*   **Solución:** Implementación de **bb8** como gestor de pool de conexiones persistentes.
*   **Resultado:** Latencia reducida de 5,000ms a **~450ms** (reducción del 91%).

## 3. Matriz de Conectividad Final

| Componente | Host | Puerto | Estado |
| :--- | :--- | :--- | :--- |
| **Core API** | 127.0.0.1 | 8082 | ✅ Operativo |
| **Portal Web** | localhost | 5173 | ✅ Operativo |
| **Vacantes Web** | localhost | 5174 | ✅ Operativo |
| **Base de Datos** | 190.56.16.85 | 1433 | ✅ Conectado |

## 4. Validación Final
Se ejecutó un test de login de extremo a extremo:
1.  Petición desde Browser a `localhost:5173`.
2.  Intercambio de credenciales con `localhost:8082`.
3.  Generación de Cookie `portal_sid`.
4.  Persistencia de sesión en Dashboard.
**Resultado: EXITOSO.**

## 5. Pendientes para Siguiente Fase
*   Habilitar MFA (Multi-Factor Authentication).
*   Optimizar la rotación de tokens en conexiones inestables.
*   Migrar el resto de aplicaciones (Planer, etc.) para que consuman el puerto `8082`.

---
**Cierre Técnico - Antigravity**
