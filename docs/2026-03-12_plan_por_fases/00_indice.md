# Indice - Plan por fases Portal + Vacantes

Fecha base: 2026-03-12  
Documento maestro relacionado: `D:\portal\docs\2026-03-12_plan_maestro_portal_y_vacantes.md`

## Orden de lectura recomendado

1. `01_fase_0_contencion_y_saneamiento.md`
2. `02_fase_1_core_identidad_y_sesion.md`
3. `03_fase_2_portal_web_y_catalogo_apps.md`
4. `04_fase_3_vacantes_publico_y_candidato.md`
5. `05_fase_4_vacantes_rh_y_aprobaciones.md`
6. `06_fase_5_ia_cv_observabilidad_y_automatizacion.md`
7. `07_fase_6_multipais_y_nuevos_dominios.md`
8. `08_apendice_tablas_y_sp.md`
9. `09_diccionario_terminos_y_siglas.txt`
10. `10_mapa_subfases.md`

## Regla de ejecucion

No avanzar de fase hasta cerrar el criterio de salida de la anterior.

## Regla de arquitectura

- `PortalCore` es identidad interna.
- `PortalVacantes` es dominio de negocio.
- `Planer` queda fuera del alcance funcional de estas fases.
- `Rust` es la linea oficial de backend.
- `Nest` solo queda como transicion o referencia.

## Regla de lectura para negocio

Si algun termino tecnico no se entiende, revisar primero:

- `09_diccionario_terminos_y_siglas.txt`
- `10_mapa_subfases.md`
