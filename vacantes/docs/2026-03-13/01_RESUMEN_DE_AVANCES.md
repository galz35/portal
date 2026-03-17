# Resumen de avances al 2026-03-13

## 1. Enfoque general

El trabajo se enfocó en transformar el portal hacia una experiencia mas eficiente para candidato externo, inspirada en la eficiencia de Tecoloco pero con una presentacion mas moderna y mas clara.

Tambien se aterrizó el sistema al mercado de Nicaragua y a patrones de vacantes observados alrededor de Claro Nicaragua.

## 2. Avances principales

### Home publica y buscador

Se rediseñó la experiencia pública para que la entrada principal sea:

- titulo o palabra clave
- departamento o region opcional
- categoria opcional
- pais por defecto `NI`

Se agregaron:

- landing publica moderna
- preview en vivo de vacantes
- rutas rapidas por categoria y departamento
- buscador con filtros avanzados
- ranking semantico simple, no solo coincidencia exacta

Archivos clave:

- `vacantes-web/src/modules/publico/pages/LandingVacantesImpactPage.tsx`
- `vacantes-web/src/modules/publico/pages/VacantesSearchPage.tsx`
- `vacantes-web/src/modules/publico/components/BusquedaAvanzadaVacantes.tsx`
- `vacantes-web/src/modules/publico/components/VacanteSearchCard.tsx`
- `vacantes-web/src/modules/publico/lib/vacantesCatalogo.ts`

### Registro candidato

Se creó una nueva pantalla de registro con enfoque de friccion baja:

- registro corto
- explicacion de perfil progresivo
- mensaje claro de que el CV y los datos mas completos vienen despues

Archivo nuevo:

- `vacantes-web/src/modules/auth/pages/RegistroCandidatoImpactPage.tsx`

Y el router ahora apunta a esa vista.

### Perfil candidato

Se extendió el perfil del candidato externo para capturar datos útiles para RH sin volver pesado el registro:

- departamento de residencia
- municipio
- categoria de interes
- modalidad preferida
- nivel academico
- LinkedIn
- resumen profesional
- disponibilidad para viajar
- horario rotativo
- licencia
- tipo de licencia
- vehiculo propio

Archivo principal:

- `vacantes-web/src/modules/candidato/pages/MiPerfilPage.tsx`

### CV candidato

Se mantuvo el enfoque correcto:

- un solo CV activo
- historial de versiones en segundo plano

Esto se conserva porque reduce confusión para candidato y simplifica postulacion.

### RH y filtrado de postulaciones

Se fortaleció RH para que no dependa solo de abrir detalle por detalle.

Ahora el frente RH se movió hacia filtros utiles por:

- estado
- origen
- departamento
- categoria
- licencia
- vehiculo
- disponibilidad para viajar

Archivos principales:

- `vacantes-web/src/modules/rh/pages/RhPostulacionesPage.tsx`
- `vacantes-web/src/modules/rh/pages/RhCandidatoDetallePage.tsx`

### Backend Rust

Se amplió la data expuesta por el backend para soportar el nuevo buscador y el mejor perfil candidato:

- mas campos en vacantes publicas
- mas campos en perfil candidato
- mas campos en detalle RH
- mas campos en listado RH

Archivos clave:

- `vacantes-api/src/main.rs`
- `vacantes-api/src/sql_read_repository.rs`
- `vacantes-api/src/candidate_sql_repository.rs`

### SQL

Se agregaron dos scripts relevantes:

- `21_candidato_perfil_claro.sql`
- `22_rh_postulaciones_filtros_claro.sql`

El primero expande el modelo del candidato externo.
El segundo expande la lista RH para exponer datos de filtro útiles.

## 3. Lo aprendido durante el trabajo

### Producto

- La fuerza de Tecoloco no es la belleza visual; es la velocidad de decision.
- La mejor home para este portal no debe copiar Tecoloco visualmente.
- El registro debe ser corto.
- El CV no debe manejarse con muchas versiones visibles para el usuario.
- La foto no debe ser obligatoria.

### Mercado Nicaragua

- El filtro correcto no es solo `departamento`; debe ser `departamento o region`.
- Nicaragua debe tratarse con 15 departamentos y 2 regiones autonomas.
- Pais por defecto: Nicaragua.

### Claro Nicaragua

Hay una mezcla fuerte de necesidades en:

- CAC y servicio
- ventas
- PYME
- distribucion
- campo
- telecom / fibra / soporte

Esto hizo necesario enriquecer:

- aliases de busqueda
- tags de requisitos
- copy de la landing
- perfil de movilidad y licencia

## 4. Limitaciones encontradas

- `D:\portal\vacantes` no está inicializado como repositorio git en esta sesión, así que no hubo baseline de diff por `git status`.
- `vite build` requirió salir del sandbox porque `esbuild` necesitó crear procesos hijos.
- `cargo check` requirió usar un `target-dir` en una ruta escribible fuera de `target` normal por permisos.
- Existe un archivo viejo de registro con problemas de codificación, pero el router ya apunta al archivo nuevo.

## 5. Estado general del avance

Estado al cierre de esta iteración:

- experiencia publica: fuerte y funcional
- registro nuevo: listo
- perfil candidato: mucho mejor
- CV: base correcta
- RH: mejor filtrado disponible
- SQL: scripts nuevos preparados
- documentacion para Gemini: lista
