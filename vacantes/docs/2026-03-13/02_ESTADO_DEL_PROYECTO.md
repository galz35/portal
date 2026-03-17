# Estado del proyecto al 2026-03-13

## 1. Estructura general

El proyecto tiene estos bloques:

- `vacantes-web`: frontend React + TypeScript + Vite
- `vacantes-api`: backend principal en Rust + Axum + SQL Server
- `sql-vacantes`: scripts SQL y script de despliegue
- `docs`: documentacion operativa
- `vacantes-api-nest`: backend alterno/secundario presente en el repo, no tratado como backend principal en esta iteracion

## 2. Estado por modulo

### Frontend publico

Estado: `funcional y mucho mejor encaminado`

Fortalezas actuales:

- home con identidad propia
- buscador claro
- filtros opcionales
- pais por defecto
- preview de resultados
- rutas rapidas
- cards mas legibles

Riesgos o deuda:

- aun se puede pulir mas el detalle de vacante
- faltaria una capa mas fuerte de consistencia visual global
- faltaria analitica de conversion si se quiere optimizar de verdad

### Registro y onboarding candidato

Estado: `bien encaminado`

Fortalezas:

- registro corto
- buena explicacion de flujo progresivo
- mejor alineado a baja friccion

Riesgos:

- hay un archivo viejo de registro con codificacion mala que no es la ruta activa
- podria limpiarse mas adelante para evitar deuda

### Perfil candidato

Estado: `sólido para siguiente fase`

Fortalezas:

- residencia
- categoria
- modalidad
- nivel academico
- resumen profesional
- movilidad
- licencia
- vehiculo

Riesgos:

- aun no hay autocompletado real desde IA
- faltaria soporte de foto opcional si se quiere ampliar el perfil

### CV y postulacion

Estado: `modelo correcto, evolucion parcial`

Fortalezas:

- 1 CV activo
- historial de versiones
- validacion de archivos
- controles de duplicado y rate limit

Riesgos:

- confirmacion/autollenado por IA aun no esta implementado completamente
- podria faltarle mejor UX en el momento exacto de primera postulacion

### RH

Estado: `operativo, pero todavia en crecimiento`

Fortalezas:

- lista de postulaciones
- detalle de postulacion
- cambio de estados
- detalle candidato mas rico
- filtros nuevos utiles para externos

Riesgos:

- aun no existe un modulo RH completamente dedicado a sourcing o buscador avanzado de candidatos
- todavia depende de la calidad del dato que complete el candidato

### Backend Rust

Estado: `principal y consistente`

Fortalezas:

- cubre vacantes publicas
- cubre candidato externo
- cubre RH
- cubre CV y hardening operativo
- cubre observabilidad basica

Riesgos:

- el archivo `main.rs` concentra bastante responsabilidad y puede crecer demasiado
- convendria modularizar mas handlers con el tiempo

### SQL Server

Estado: `bien estructurado por scripts, con evolución incremental`

Fortalezas:

- scripts numerados
- script de despliegue
- modelo incremental claro

Riesgos:

- algunos procedimientos viejos y nuevos conviven por sobreescritura incremental
- si alguien ejecuta scripts aislados sin respetar orden, puede desalinear entorno

### `vacantes-api-nest`

Estado: `presente, pero secundario`

Observacion:

- existe estructura Nest separada
- no fue la base usada para los cambios de esta iteracion
- no debe asumirse como backend principal actual sin confirmar despliegue real

## 3. Estado funcional del producto

### Ya cubierto

- home publica
- busqueda de vacantes
- detalle publico
- registro candidato
- login candidato
- perfil candidato
- CV candidato
- postulacion externa
- lista RH
- detalle RH
- scripts SQL de soporte

### Cubierto parcialmente

- ranking semantico de vacantes
- perfilado de candidato
- filtrado RH
- documentacion para handoff

### Pendiente fuerte

- IA para autollenado real desde CV
- sourcing RH mas profundo
- consolidacion visual completa de todo el frontend
- limpieza de archivos legacy no activos
- estrategia de pruebas mas amplia que `build/check`

## 4. Estado tecnico real de validacion

Validaciones confirmadas:

- `npx tsc -b` en `vacantes-web`: OK
- `npm run build` en `vacantes-web`: OK
- `cargo check --target-dir D:\Users\gustavo.lira\.codex\memories\vacantes-api-target`: OK

Observaciones:

- `vite build` dentro del sandbox falló por `spawn EPERM`
- `cargo check` con `target` local normal falló por permisos de escritura
- ambos problemas fueron operativos de entorno, no errores funcionales del codigo final

## 5. Diagnostico de madurez

Madurez actual por capas:

- UX publica: `media-alta`
- RH operativo: `media`
- backend principal: `media-alta`
- base SQL: `media-alta`
- IA aplicada al candidato: `media-baja`
- limpieza/estandarizacion del repo: `media`

## 6. Lo mas importante a no romper

1. Explorar sin registro.
2. Buscar por titulo antes que por formularios.
3. Mantener `Nicaragua` como pais por defecto.
4. No pedir demasiados datos al inicio.
5. Mantener un solo CV activo.
6. Seguir ampliando RH sin castigar UX del candidato.

## 7. Proximos pasos mas valiosos

1. Mejorar el detalle publico de vacante con CTA y jerarquia mas fuerte.
2. Crear un buscador RH de candidatos aun mas profundo.
3. Conectar IA de CV a autollenado real.
4. Limpiar o retirar archivos legacy ya no usados.
5. Añadir pruebas funcionales o smoke tests repetibles.
