# SQL y validacion al 2026-03-13

## 1. SQL a ejecutar

### Si vas a crear o provisionar todo el entorno

Ejecuta:

- `D:\portal\vacantes\sql-vacantes\deploy_portal_vacantes.ps1`

Ese script ya corre, en orden:

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

### Si la base ya existe y solo quieres actualizar lo nuevo

Ejecuta solo:

- `D:\portal\vacantes\sql-vacantes\21_candidato_perfil_claro.sql`
- `D:\portal\vacantes\sql-vacantes\22_rh_postulaciones_filtros_claro.sql`

### Script opcional de demo

- `D:\portal\vacantes\sql-vacantes\20_seed_vacantes_demo.sql`

Usarlo solo si quieres poblar demo o pruebas visuales.

## 2. Que hace cada script nuevo

### `21_candidato_perfil_claro.sql`

Amplia `dbo.CandidatoExterno` con:

- `DepartamentoResidencia`
- `MunicipioResidencia`
- `CategoriaInteres`
- `ModalidadPreferida`
- `NivelAcademico`
- `LinkedinUrl`
- `ResumenProfesional`
- `DisponibilidadViajar`
- `DisponibilidadHorarioRotativo`
- `TieneLicenciaConducir`
- `TipoLicencia`
- `TieneVehiculoPropio`

Tambien actualiza:

- `spCand_ObtenerPerfil`
- `spCand_Me`
- `spCand_ActualizarPerfil`
- `spPost_RH_DetalleExterno`

### `22_rh_postulaciones_filtros_claro.sql`

Actualiza:

- `spPost_RH_ListarTodas`

Y expone en la lista RH:

- residencia
- municipio
- categoria de interes
- modalidad preferida
- nivel academico
- disponibilidad para viajar
- horario rotativo
- licencia
- tipo de licencia
- vehiculo propio

## 3. Validacion tecnica ejecutada

### Frontend

Comandos verificados:

- `npx tsc -b`
- `npm run build`

Resultado:

- ambos pasaron

Nota:

- `npm run build` necesitó ejecutarse fuera del sandbox por restriccion de `esbuild`

### Backend Rust

Comando verificado:

- `cargo check --target-dir D:\Users\gustavo.lira\.codex\memories\vacantes-api-target`

Resultado:

- OK

Nota:

- el `target` normal del proyecto tenia problemas de permisos de escritura

## 4. Recomendacion operacional

Si Gemini o cualquier otro agente va a continuar:

1. Leer primero `D:\portal\vacantes\docs\GEMINI_PORTAL_VACANTES.md`
2. Si hay que tocar DB existente, ejecutar solo `21` y `22`
3. Si hay que levantar todo desde cero, usar `deploy_portal_vacantes.ps1`
4. Validar despues con:
   - `npx tsc -b`
   - `npm run build`
   - `cargo check --target-dir D:\Users\gustavo.lira\.codex\memories\vacantes-api-target`
