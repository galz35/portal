# 🚀 Documentación de Despliegue en Producción - Planer EF

Este documento detalla el flujo de despliegue automatizado utilizado para actualizar **Planer V2** en el servidor de producción VPS (Ubuntu 20.04).

---

## 🛠️ Detalles del Entorno
- **URL de Producción:** `https://www.rhclaroni.com`
- **Repositorio:** `https://github.com/galz35/portal`
- **Directorio de la Aplicación en VPS:** `/opt/apps/EF`
- **Directorio Web (Nginx):** `/var/www/planer`
- **Gestor de Procesos:** PM2 (`planer-api-v2`)

---

## 📜 Flujo del Script de Despliegue

El script de bash realiza un proceso de 6 pasos para asegurar que la aplicación esté siempre actualizada y estable.

### 1. Actualización de Código (Git)
Para evitar conflictos con archivos locales o cambios accidentales en el servidor:
- **`git reset --hard`**: Revierte cualquier cambio local para coincidir con el estado del repositorio.
- **`git clean -fd`**: Elimina archivos no rastreados (útil para carpetas temporales o de build fallidas).
- **`git pull origin main`**: Descarga e integra la última versión del código desde la rama principal.

### 2. Construcción del Frontend (Vite/React)
- **Directorio:** `/opt/apps/EF/v2sistema/v2frontend`
- **Instalación:** `npm install --legacy-peer-deps` (Previene errores de resolución de dependencias por versiones antiguas de React/Vite).
- **Build:** `npm run build` genera la carpeta `dist/` con los activos optimizados.

### 3. Publicación del Frontend
- Elimina el contenido previo de `/var/www/planer/`.
- Copia los nuevos archivos de la carpeta `dist/` al directorio que sirve Nginx.
- **Permisos:** Cambia el propietario a `www-data:www-data` para asegurar que el servidor web tenga acceso de lectura.

### 4. Construcción del Backend (NestJS)
- **Directorio:** `/opt/apps/EF/v2sistema/v2backend`
- **Instalación:** `npm install --legacy-peer-deps`.
- **Build:** Transpila el código TypeScript a JavaScript en el directorio `dist/`.

### 5. Gestión del Proceso (PM2)
- El script verifica si el proceso `planer-api-v2` ya está en ejecución.
- **Si existe:** Ejecuta `pm2 restart` para cargar el nuevo código sin perder la configuración del proceso.
- **Si no existe:** Inicia el proceso por primera vez usando `dist/src/main.js` (o `dist/main.js`).
- **Persistencia:** Ejecuta `pm2 save` para que PM2 recuerde este proceso tras un reinicio del sistema operativo.

### 6. Recarga de Servidor Web (Nginx)
- **`sudo nginx -t`**: Verifica que los archivos de configuración no tengan errores.
- **`sudo systemctl reload nginx`**: Aplica los cambios sin desconectar a los usuarios actuales.

---

## ⚠️ Puntos Críticos de Mantenimiento
1. **Configuración de Fastify:** El backend usa Fastify; asegúrate de que Nginx esté pasando correctamente el `host` y el `X-Forwarded-For` para que las validaciones de IP en el SSO funcionen.
2. **Entorno `.env`:** El script de despliegue **no** actualiza el archivo `.env`. Este debe gestionarse manualmente en el servidor para proteger secretos como el `JWT_SSO_SECRET`.
3. **Monitoreo:** Puedes usar `pm2 monit` o `pm2 logs planer-api-v2` para ver el tráfico y errores en tiempo real en producción.

---
*Documento generado para referencia técnica de mantenimiento del portal.*
