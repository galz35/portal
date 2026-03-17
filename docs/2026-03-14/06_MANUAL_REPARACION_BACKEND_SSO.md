# GUÍA TÉCNICA DE REPARACIÓN CRÍTICA (Handoff para ChatGPT/Equipo Backend)

**Fecha:** 2026-03-14
**Estado:** Bloqueo en Autenticación SSO - Fase 2

## 1. Problema de Pantalla Azul (Server Panic) - RESOLVIDO
**Descripción:** El servidor `core-api` se cerraba abruptamente al intentar procesar logins o sesiones.
**Causa Técnica:** Error de conversión de tipos en Tiberius. `row.get::<i64, _>` fallaba porque SQL Server devolvía un `INT` (i32) para resultados de `COUNT` o `SCOPE_IDENTITY()`.
**Acción Realizada:** Se implementó una función robusta `read_i64` en:
- `core-api/src/modules/auth/infra/sql_repository.rs`
- `core-api/src/sql_read_repository.rs`
- `core-api/src/modules/sesiones/infra/sql_repository.rs`

**TODO para ChatGPT:** Asegurarse de que cualquier *nuevo* campo numérico proveniente de SPs use este helper para evitar panics futuros.

## 2. Bloqueo de Autenticación (401 Unauthorized) - PENDIENTE
**Estado Actual:** El servidor ya no se cae, pero devuelve `401 Unauthorized` incluso con credenciales que parecen correctas.

### Hallazgos Críticos:
1. **Migración Argon2id:** Se ha actualizado el usuario `empleado.portal` en la DB con un hash Argon2id (Contraseña: `Portal123!`).
2. **Posible Truncamiento/Espacios:** La columna `ClaveHash` en `CuentaPortal` es de tipo `NVARCHAR(300)`. Si se usa `CHAR` o existe padding de espacios, la librería `argon2` fallará.
3. **Casos de Uso:** El archivo `core-api/src/modules/auth/application/use_cases.rs` tiene lógica que detecta si el hash empieza con `$argon2` o `sha256$`. Hay logs de depuración (usando `eprintln!`) agregados temporalmente para ver la comparación exacta.

**TODO para ChatGPT:** 
- Revisar la función `validar_clave_portal` en `use_cases.rs`.
- Verificar si el hash devuelto por el SP `spSeg_Login` viene completo (sin truncar) y sin espacios extra.
- Confirmar que la contraseña enviada desde el front/curl (`Portal123!`) llega intacta al validador.

## 3. Manejo de Procesos Zombie
**Problema:** El puerto 8080 se queda bloqueado frecuentemente.
**Solución Temporal:** Se está usando `taskkill /F /IM "core-api.exe" /T` antes de cada ejecución.
**TODO para ChatGPT:** Implementar un manejo de señales de apagado (`graceful shutdown`) en `main.rs` de `core-api` para liberar los puertos correctamente al cerrar.

## 4. Instrucciones para Ejecución de Pruebas
Para testear el flujo sin depender de la UI:
1. Usar el archivo `login.json` ubicado en la raíz.
2. Ejecutar: `curl.exe -i -X POST -H "Content-Type: application/json" -d @login.json http://127.0.0.1:8080/api/auth/login-empleado`
3. Revisar la consola de `core-api` para ver los mensajes `DEBUG` añadidos por Antigravity.

---
**Nota de Antigravity:** He dejado el código con logs de error explícitos (`eprintln!`) en la lógica de validación para facilitar la visibilidad inmediata a ChatGPT.
