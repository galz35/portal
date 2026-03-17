# Fase 3 - Vacantes publico y candidato

## Objetivo

Cerrar el dominio publico y candidato de `Vacantes` sin mezclarlo con la identidad interna del portal.

## Resultado esperado

- publico puede ver vacantes publicadas
- candidato externo puede registrarse, iniciar sesion, editar perfil, cargar CV y aplicar
- empleado interno sigue usando el portal; no se mezcla con la cuenta candidato

## Base de datos

### Tablas actuales a conservar

- `Vacante`
- `Postulacion`
- `ArchivoPersona`
- `CvTextoExtraido`
- `AnalisisCvIa`
- `PerfilCvNormalizado`

### Tablas nuevas obligatorias

- `Candidato`
- `CuentaCandidato`
- `CandidatoSesion`
- `CandidatoVerificacionCorreo`
- `CandidatoPasswordReset`
- `CandidatoPreferencia`

### Ajustes recomendados

- evolucionar `Postulacion` para soportar:
  - `IdCandidato`
  - `IdCuentaPortalInterna`
  - `TipoOrigenPersona`

## Stored procedures

### Publico

- `spVac_Listar_Publicas`
- `spVac_Obtener_Detalle`
- `spVac_Buscar_Publicas`

### Candidato

- `spCand_RegistrarCuenta`
- `spCand_VerificarCorreo`
- `spCand_Login`
- `spCand_Sesion_Crear`
- `spCand_Sesion_Validar`
- `spCand_Sesion_Cerrar`
- `spCand_Perfil_Obtener`
- `spCand_Perfil_Actualizar`
- `spCand_PasswordReset_Solicitar`
- `spCand_PasswordReset_Consumir`

### Postulacion

- `spPost_Postular`
- `spPost_ListarPorPersona`
- `spPost_RetirarPorCandidato`
- `spPost_ValidarElegibilidad`

## Backend

- crear auth separado de candidato
- no permitir que un usuario aplique a vacantes con `id_persona` libre enviado desde el frontend
- resolver identidad del candidato desde sesion propia
- validar estado de vacante antes de postular
- impedir duplicados y postular sobre vacantes cerradas o no publicadas

## Frontend

- home publico
- lista de vacantes
- detalle de vacante
- registro candidato
- login candidato
- perfil candidato
- subida de CV
- mis postulaciones

## Seguridad

- proteger subida de archivos
- validar extension, MIME, tamano, hash
- opcional: integrar antivirus/escaneo de archivos
- usar CSRF tambien para auth de candidato si es web basada en cookies

## Pruebas

- ver vacantes sin login
- registro candidato
- verificacion de correo
- login candidato
- subir CV
- postular
- retirar postulacion
- intento de aplicar dos veces a la misma vacante

## Criterio de salida

- lado publico y candidato de vacantes es funcional sin depender del portal interno

