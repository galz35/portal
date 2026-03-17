# MANUAL DE USUARIO: ECOSISTEMA CLARO (Portal & Vacantes)

**Versión:** 1.0  
**Fecha de Actualización:** 2026-03-14  
**Estado:** Sistema Integrado SSO Operativo  

---

## 1. Introducción
El **Portal de Aplicaciones** es el centro neurálgico para los colaboradores de Claro Nicaragua. Desde aquí podrás acceder a todos los sistemas internos (como el Sistema de Vacantes, Planer, etc.) con una sola identidad digital (Single Sign-On).

---

## 2. Acceso al Sistema

### URLs de Acceso (Ambiente Local/Desarrollo):
*   **Portal Web (Frontend):** `http://localhost:5173`
*   **Sistema de Vacantes:** `http://localhost:5174`
*   **Núcleo de Autenticación (Core-API):** `http://localhost:8082`

### Credenciales de Prueba (Colaborador):
*   **Usuario:** `empleado.portal`
*   **Contraseña:** `Portal123!`

---

## 3. Guía de Inicio de Sesión (Paso a Paso)

1.  **Ingreso al Portal:**
    Navega a `http://localhost:5173/login-empleado`. Verás una interfaz premium con el branding de Claro.
2.  **Identificación:**
    Ingresa tu usuario corporativo o número de carnet y tu contraseña.
3.  **Validación:**
    El sistema verificará tus permisos. Si los datos son correctos, serás redirigido al **Dashboard del Portal**.
4.  **Confirmación de Sesión:**
    En la esquina superior o en el centro verás un mensaje de bienvenida: *"Hola, Empleado"*. Esto indica que tu sesión está activa en todo el ecosistema.

---

## 4. Uso del Sistema de Vacantes

Una vez que hayas iniciado sesión en el Portal, puedes navegar al Sistema de Vacantes:

1.  Accede a `http://localhost:5174`.
2.  El sistema detectará automáticamente tu sesión del portal (tecnología SSO).
3.  **Módulo RH:** Si tienes permisos de Recursos Humanos, podrás gestionar vacantes, ver candidatos y administrar el flujo de reclutamiento sin tener que volver a loguearte.

---

## 5. Gestión del Perfil y Aplicaciones

Dentro del Dashboard del Portal (`/portal`):
*   **Aplicaciones Disponibles:** Verás una lista de logos de las aplicaciones a las que tienes permiso de entrada.
*   **Estado de Seguridad:** El portal gestiona tokens CSRF y cookies seguras para proteger tu información.
*   **Cerrar Sesión:** Al hacer clic en "Salir", la sesión se cerrará automáticamente en todos los sistemas conectados (Portal, Vacantes, etc.).

---

## 6. Solución de Problemas Frecuentes

| Problema | Causa Probable | Solución |
| :--- | :--- | :--- |
| **Error 401 Unauthorized** | Contraseña o usuario incorrecto. | Verifica que el usuario sea `empleado.portal` y la clave `Portal123!`. |
| **Error de Conexión (Refused)** | El servidor central no está corriendo. | Asegúrate de que `core-api` esté corriendo en el puerto `8082`. |
| **Sesión Expirada** | Tiempo de inactividad prolongado. | Refresca la página o vuelve a ingresar desde la pantalla de login. |
| **No veo mis Aplicaciones** | Falta de permisos en la DB. | Contacta al administrador para que tu `id_cuenta_portal` tenga asignadas las apps correspondientes. |

---

## 7. Notas Técnicas para Soporte
*   Las contraseñas se almacenan mediante el algoritmo **Argon2id** (máxima seguridad).
*   La comunicación entre aplicaciones se realiza mediante **HTTP Introspection**, eliminando la necesidad de que cada app lea la base de datos de seguridad directamente.

---
**Dirección de Sistemas - Claro Nicaragua**  
*Impulsando la transformación digital.*
