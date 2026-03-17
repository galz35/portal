# Portal Vacantes: guia profunda para Gemini

Fecha de referencia: 2026-03-13

## 1. Objetivo del producto

Este sistema es un portal de vacantes con dos frentes:

1. Publico candidato:
   buscar trabajo, ver detalle, registrarse, subir CV, completar perfil y postularse.
2. RH interno:
   publicar vacantes, revisar postulaciones, ver scoring y filtrar candidatos.

La referencia funcional fuerte es Tecoloco, pero no su estilo visual.

La decision de producto es esta:

- Conservar de Tecoloco la eficiencia de busqueda.
- No copiar la home densa ni el look viejo de Tecoloco.
- Diseñar una home mas moderna, mas clara y con menos ruido visual.
- Priorizar `titulo primero`, filtros opcionales y postulacion sin friccion.

## 2. Principio rector de UX

La home ideal no debe parecer un catalogo pesado. Debe parecer una puerta de entrada rapida.

### Lo que si se toma de Tecoloco

- El buscador es lo primero.
- Los filtros importantes son pocos y entendibles.
- El usuario explora sin registrarse.
- La lista de vacantes se puede escanear rapido.
- Cada card da contexto suficiente para decidir si entrar o no.

### Lo que no se quiere copiar de Tecoloco

- Home sobrecargada de bloques SEO.
- Sensacion visual antigua.
- Demasiadas secciones compitiendo.
- Jerarquia visual plana.
- Densidad excesiva en la parte baja.

### Regla final

`Tomar la eficiencia de Tecoloco, no su apariencia.`

## 3. Como debe verse la home publica

La home publica es la parte mas importante del sistema.

### Meta

Que una persona llegue y en segundos entienda:

- que puede buscar por cargo, empresa o palabra clave
- que el pais por defecto es Nicaragua
- que departamento y categoria son opcionales
- que puede explorar sin crear cuenta
- que puede registrarse y subir CV despues

### Estructura recomendada de la home

1. Hero principal
   - titulo fuerte
   - buscador principal
   - filtros opcionales visibles
   - CTA de buscar trabajo
   - CTA de crear perfil

2. Preview en vivo
   - 3 a 4 vacantes visibles
   - responde al filtro actual
   - hace que el buscador se sienta vivo

3. Bloque de lectura del mercado
   - no copiar testimonios o relleno
   - explicar rapido que perfiles se repiten
   - en este caso: CAC, ventas, PYME, campo, distribucion, telecom

4. Rutas rapidas
   - por categoria
   - por departamento
   - sin obligar a navegar menus complejos

5. Vacantes destacadas
   - cards limpias
   - CTA directo a detalle

### Filtros minimos de la home

- `q`: puesto, empresa o palabra clave
- `country`: por defecto `NI`
- `dept`: opcional
- `cat`: opcional
- `mode`: opcional
- `req`: opcional, multi-tag

### Filosofia visual

- Visual premium, no corporativo aburrido.
- Mucha claridad de jerarquia.
- Hero fuerte, con contraste.
- Cards limpias.
- Pocos elementos, pero con mucho peso visual.
- Nada de home tipo directorio viejo.

## 4. Flujo publico de candidato

Este es el flujo que Gemini debe entender como principal.

### Paso 1. Explorar vacantes sin cuenta

Ruta publica:

- `/`
- `/vacantes`
- `/vacantes/:slug`

El usuario no debe registrarse para explorar.

### Paso 2. Buscar por titulo

La entrada principal es:

- `Ej. ventas`
- `Ej. servicio al cliente`
- `Ej. fibra optica`
- `Ej. ejecutivo pyme`

La busqueda no debe depender solo de match exacto.

Debe encontrar resultados relacionados usando:

- titulo
- area
- descripcion
- requisitos
- aliases de categoria
- tags de requisitos

### Paso 3. Abrir detalle

En la vacante debe ver:

- titulo
- ubicacion
- pais
- modalidad
- descripcion
- requisitos
- area
- departamento
- nivel de experiencia
- salario si existe

### Paso 4. Postularse

Si no tiene cuenta:

- ir a `/registro`

Si tiene cuenta:

- iniciar sesion o postular directo

### Paso 5. Registro

El registro debe ser corto:

- nombres
- apellidos
- correo
- telefono opcional
- contrasena

No pedir de inicio:

- direccion exacta
- foto obligatoria
- cédula
- demasiados pasos

### Paso 6. CV

Modelo recomendado:

- `1 CV activo`
- historial de versiones en segundo plano

El usuario puede:

- subir CV
- reemplazar CV
- ver historial

No se recomienda exponer varias versiones activas para elegir en cada postulacion.

### Paso 7. Perfil progresivo

Despues del registro, el candidato completa informacion valiosa para RH:

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

La foto sigue siendo opcional.

## 5. Entendimiento de Claro Nicaragua

La home nueva y los filtros se alinean a una lectura de mercado basada en:

- vacantes observadas en Tecoloco
- lenguaje de Claro Nicaragua
- necesidades frecuentes en canal comercial, CAC, cobertura y tecnologia

### Patron general

Claro Nicaragua no solo necesita perfiles de oficina. Mezcla:

- servicio al cliente
- ventas retail y PYME
- distribucion
- campo
- telecom / red / fibra
- soporte corporativo

### Lo que se repite en vacantes asociadas a Claro

- comunicacion y trato al cliente
- cumplimiento de metas
- manejo de Office
- movilidad
- licencia segun rol
- orientacion comercial
- seguimiento y presentacion
- trabajo con cobertura territorial

### Lo que debe entender Gemini

No disenar el sistema solo para puestos administrativos.

Debe servir para:

- CAC
- ventas comerciales
- canales PYME
- campo y distribucion
- telecom y soporte tecnico
- reclutamiento y back office

## 6. Arquitectura actual del sistema

### Frontend

Base:

- React
- TypeScript
- Vite

Carpeta principal:

- `D:\portal\vacantes\vacantes-web`

### Backend

Base:

- Rust
- Axum
- SQL Server

Carpeta principal:

- `D:\portal\vacantes\vacantes-api`

### SQL

Carpeta:

- `D:\portal\vacantes\sql-vacantes`

## 7. Archivos clave ya importantes

### Home y busqueda publica

- `vacantes-web/src/modules/publico/pages/LandingVacantesImpactPage.tsx`
- `vacantes-web/src/modules/publico/pages/VacantesSearchPage.tsx`
- `vacantes-web/src/modules/publico/components/BusquedaAvanzadaVacantes.tsx`
- `vacantes-web/src/modules/publico/components/VacanteSearchCard.tsx`
- `vacantes-web/src/modules/publico/lib/vacantesCatalogo.ts`

### Registro y candidato

- `vacantes-web/src/modules/auth/pages/RegistroCandidatoImpactPage.tsx`
- `vacantes-web/src/modules/candidato/pages/MiPerfilPage.tsx`
- `vacantes-web/src/modules/candidato/pages/MiCvPage.tsx`
- `vacantes-web/src/shared/api/candidateApi.ts`

### RH

- `vacantes-web/src/modules/rh/pages/RhPostulacionesPage.tsx`
- `vacantes-web/src/modules/rh/pages/RhCandidatoDetallePage.tsx`
- `vacantes-web/src/shared/api/vacantesApi.ts`

### Router

- `vacantes-web/src/app/router.tsx`

### Backend de vacantes y candidato

- `vacantes-api/src/main.rs`
- `vacantes-api/src/sql_read_repository.rs`
- `vacantes-api/src/candidate_sql_repository.rs`
- `vacantes-api/src/modules/cv/http/handlers.rs`

## 8. Modelo funcional actual

### Vacantes publicas

La API publica ya expone campos enriquecidos:

- descripcion
- requisitos
- area
- departamento
- tipoVacante
- nivelExperiencia
- salarioMin
- salarioMax
- fechaPublicacion

Esto permite busqueda semantica basica y no solo texto literal.

### Perfil candidato

El candidato externo ya soporta:

- datos base
- residencia
- categoria de interes
- modalidad
- nivel academico
- LinkedIn
- resumen profesional
- disponibilidad
- licencia
- vehiculo

### RH

El detalle RH ya permite ver mejor el perfil del candidato.

Ademas, el listado RH ahora debe poder filtrar por:

- estado
- origen
- departamento
- categoria
- licencia
- vehiculo
- disponibilidad para viajar

## 9. Reglas de producto que Gemini no debe romper

1. No obligar registro para explorar vacantes.
2. No obligar foto para postular.
3. No pedir demasiados campos en registro.
4. Mantener un solo CV activo.
5. Los filtros principales deben seguir siendo faciles de entender.
6. `Pais` debe quedar por defecto en `Nicaragua`.
7. `Departamento o region` y `Categoria` siguen siendo opcionales.
8. RH debe poder filtrar candidatos sin abrir detalle por detalle.

## 10. Reglas visuales para Gemini

### Si toca la home

- No hacer una home tipo Tecoloco.
- No llenarla de bloques de SEO.
- No hacer un directorio gris o plano.
- No usar una UI genérica de dashboard.
- Mantener hero fuerte con buscador visible.
- Mantener live preview de resultados.
- Mantener rutas rapidas.

### Si toca cards

- Deben dejar escanear titulo, contexto y CTA rapido.
- No sobrecargar con texto.
- Mostrar badges utiles, no decorativos.

### Si toca registro

- Mantenerlo corto.
- Explicar que CV y perfil se completan despues.
- Evitar friccion.

## 11. SQL: que ejecutar

Hay dos formas.

### Opcion A. Provisionar todo el sistema desde cero

Ejecutar:

- `D:\portal\vacantes\sql-vacantes\deploy_portal_vacantes.ps1`

Este script ya ejecuta, en orden:

- `00_crear_portal_vacantes.sql`
- `00_bootstrap_portal_vacantes.sql`
- `01_tablas_vacantes.sql`
- `02_candidato_externo.sql`
- `02_indices_vacantes.sql`
- `03_seed_estados_y_catalogos.sql`
- `04_sp_vacantes.sql`
- `05_sp_postulaciones.sql`
- `06_sp_terna.sql`
- `07_sp_lista_negra.sql`
- `08_sp_reportes.sql`
- `09_tablas_ia_cv.sql`
- `10_indices_ia_cv.sql`
- `11_sp_ia_cv.sql`
- `12_tablas_requisicion_descriptor.sql`
- `13_indices_requisicion_descriptor.sql`
- `14_sp_requisicion_descriptor.sql`
- `15_sp_suspension_automatica.sql`
- `16_candidato_externo_postulacion_y_perfil.sql`
- `17_postulacion_externa_rh.sql`
- `18_candidato_cv_seguro.sql`
- `19_candidato_auth_y_operacion_hardening.sql`
- `21_candidato_perfil_claro.sql`
- `22_rh_postulaciones_filtros_claro.sql`

### Opcion B. Si la base ya existe y solo quieres actualizar lo nuevo

Ejecutar solo estos scripts:

- `D:\portal\vacantes\sql-vacantes\21_candidato_perfil_claro.sql`
- `D:\portal\vacantes\sql-vacantes\22_rh_postulaciones_filtros_claro.sql`

### Script opcional para demo

- `D:\portal\vacantes\sql-vacantes\20_seed_vacantes_demo.sql`

Solo usar si quieres poblar demo o pruebas visuales.

## 12. Que cambia cada script nuevo

### 21_candidato_perfil_claro.sql

Extiende `dbo.CandidatoExterno` con:

- DepartamentoResidencia
- MunicipioResidencia
- CategoriaInteres
- ModalidadPreferida
- NivelAcademico
- LinkedinUrl
- ResumenProfesional
- DisponibilidadViajar
- DisponibilidadHorarioRotativo
- TieneLicenciaConducir
- TipoLicencia
- TieneVehiculoPropio

Tambien altera:

- `spCand_ObtenerPerfil`
- `spCand_Me`
- `spCand_ActualizarPerfil`
- `spPost_RH_DetalleExterno`

### 22_rh_postulaciones_filtros_claro.sql

Altera:

- `spPost_RH_ListarTodas`

Objetivo:

- que RH pueda filtrar postulaciones externas por perfil real desde la lista
- exponer residencia, categoria, modalidad, nivel academico, licencia, vehiculo y disponibilidad

## 13. Endpoints que Gemini debe considerar

### Publicos

- `GET /api/vacantes/publicas`
- `GET /api/vacantes/publicas/:slug`

### Candidato

- `POST /api/candidatos/register`
- `POST /api/candidatos/login`
- `POST /api/candidatos/logout`
- `GET /api/candidatos/me`
- `PUT /api/candidatos/me`
- `GET /api/candidatos/mis-postulaciones`
- `POST /api/candidatos/postular`

### CV

- `GET /api/vacantes/cv`
- `GET /api/vacantes/cv/historial`
- `POST /api/vacantes/cv/subir`

### RH

- `GET /api/vacantes/rh/postulaciones`
- `GET /api/vacantes/rh/postulaciones/:id/detalle`
- `PATCH /api/vacantes/rh/postulaciones/:id/estado`

## 14. Lo pendiente que Gemini puede tomar despues

1. Crear un filtro RH aun mas profundo con conteos por categoria y residencia.
2. Agregar perfilado automatico desde CV cuando se active IA.
3. Mejorar el detalle publico de vacante con CTA mas fuerte.
4. Unificar tipografia y tokens visuales en todo el modulo.
5. Eventualmente crear buscador server-side si el volumen de vacantes crece mucho.

## 15. Instruccion final para Gemini

Si Gemini revisa este sistema, debe asumir esto:

- La prioridad numero uno es la experiencia publica del candidato.
- La home debe ser moderna y fuerte visualmente, pero simple de usar.
- La eficiencia de Tecoloco se conserva en interaccion, no en apariencia.
- El registro y la postulacion deben sentirse cortos.
- RH necesita filtros reales, no solo lista y detalle.
- Los cambios de SQL deben respetar el orden descrito arriba.
