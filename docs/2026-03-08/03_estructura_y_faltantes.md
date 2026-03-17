# Estructura y Faltantes

## Portal

### Estructura logica

1. identidad central
2. sesiones globales
3. permisos por aplicacion
4. frontend de acceso y dashboard
5. integracion futura con Planer y Vacantes

### Lo que ya esta

- login empleado
- sesion por cookie
- lectura de apps y permisos
- perfil base
- dashboard visual corporativo rojo, blanco y negro

### Lo que falta

- aplicar SQL de hash real
- prueba operativa final
- build real y smoke test

## Vacantes

### Estructura logica

1. publico
2. candidato
3. RH
4. requisiciones
5. descriptor de puesto
6. terna
7. lista negra
8. reportes

### Lo que ya esta

- publicacion y detalle de vacantes
- postulacion
- mis postulaciones
- tablero RH
- crear vacante
- cambiar estado de vacante
- crear requisicion
- aprobar y rechazar requisicion
- crear descriptor
- consultar descriptor vigente
- listar postulaciones RH
- mover estado de postulacion
- crear terna
- registrar lista negra

### Lo que falta

- validacion operativa real con datos del servidor SQL
- smoke test de frontend RH y publico
- ajuste fino de datos maestros reales
- cierre de QA funcional

## Estado sugerido para Gemini

1. aplicar SQL pendiente de Portal
2. levantar `core-api`
3. levantar `portal-web`
4. validar login y sesion
5. levantar `vacantes-api`
6. levantar `vacantes-web`
7. validar requisiciones, descriptores, vacantes y postulaciones
