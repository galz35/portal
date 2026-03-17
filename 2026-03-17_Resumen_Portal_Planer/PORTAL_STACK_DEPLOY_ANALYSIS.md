# 🏰 Análisis Técnico: Despliegue de Portal Stack en Producción

Este documento analiza la estrategia del script `install_portal_stack.sh` diseñado para desplegar el ecosistema completo del Portal en el mismo VPS donde reside **Planer EF**, garantizando aislamiento total.

---

## 🛡️ Estrategia de Coexistencia (Aislamiento)

La clave de este script es que opera en paralelo a la instalación actual de "Planer EF", evitando colisiones mediante:

1.  **Directorios Separados:**
    -   Planer EF: `/opt/apps/EF`
    -   Portal Stack: `/opt/apps/portalstack`
2.  **Gestión de Procesos (PM2) Independiente:**
    -   Usa nombres de proceso únicos (ej. `portal-api`, `portal-planer-api`) para no interferir con `planer-api-v2`.
3.  **Rutas de Nginx Distintas:**
    -   Planer EF: Probablemente usa la raíz `/` o rutas específicas pre-existentes.
    -   Portal Stack: Se agrupa bajo `/portal/` y sus derivados.

---

## 🌐 Mapeo de Puertos y Endpoints

El script organiza el tráfico interno mediante una escala de puertos del **3020 al 3024**:

| Módulo | Puerto Interno | URL Frontend (Pública) | URL API (Pública) |
| :--- | :--- | :--- | :--- |
| **Portal Core** | 3020 | `/portal` | `/api-portal` |
| **Planer (Stack)**| 3021 | `/portal/planer` | `/api-portal-planer` |
| **Clínica** | 3022 | `/portal/clinica` | `/api-portal-clinica` |
| **Inventario** | 3023 | `/portal/inventario` | `/api-portal-inventario` |
| **Vacantes** | 3024 | `/portal/vacante` | `/api-portal-vacante` |

---

## ⚙️ Automatización de Configuraciones (`.env`)

El script elimina la necesidad de subir archivos `.env` manualmente al servidor, generándolos dinámicamente:

-   **Backend:** Crea archivos `.env` con credenciales de SQL Server (Host `190.56.16.85`), secretos JWT y configuración SMTP.
-   **Frontend:** Genera `.env.production` inyectando las URLs de las APIs correspondientes a cada módulo durante el proceso de build de Vite.

---

## 🛰️ Integración con Nginx (Snippet Strategy)

En lugar de modificar directamente el archivo de configuración principal de `rhclaroni.com`, el script usa una técnica de "Snippet":

1.  **`portal_stack_routes.conf`:** Crea un archivo independiente en `/etc/nginx/snippets/` con todas las reglas `location`.
2.  **`include` Seguro:** Inserta una única línea `include /etc/nginx/snippets/portal_stack_routes.conf;` en el bloque `server` del dominio, justo debajo de `server_name`.
3.  **Reverse Proxy:** Redirige el tráfico de las rutas `/api-portal-*` hacia los puertos internos de PM2, manteniendo las cabeceras de seguridad necesarias para WebSockets y Cookies.

---

## 🚀 Ciclo de Vida del Despliegue

El script soporta dos modos de ejecución:
-   **`fresh`:** Borra la instalación previa de Portal Stack y clona desde cero. Útil para limpiezas profundas.
-   **`update`:** Realiza un `git pull`, instala dependencias solo si es necesario, reconstruye y reinicia los procesos en PM2 con `--update-env`.

---

## ⚠️ Recomendaciones Post-Implementación

1.  **Rotación de Credenciales:** Una vez verificado el funcionamiento, se recomienda cambiar las contraseñas de MSSQL y SMTP que están hardcodeadas en el script.
2.  **Almacenamiento de Vacantes:** La ruta `/opt/portal_storage/candidatos/cv` debe ser creada con los permisos correctos (`chown www-data:www-data`).
3.  **Firewall:** Asegurarse de que los puertos 3020-3024 no estén expuestos directamente al mundo, sino solo accesibles por Nginx (localhost).

---
*Documento de análisis generado para la transición de servicios del Portal Central.*
