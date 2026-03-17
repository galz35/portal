IF NOT EXISTS (SELECT 1 FROM vacantes_nest.vacante WHERE codigo_vacante = 'VAC-2001')
BEGIN
  INSERT INTO vacantes_nest.vacante
    (codigo_vacante, slug, titulo, descripcion, requisitos, ubicacion, codigo_pais, modalidad, estado_actual, area, prioridad, es_publica, es_excepcion_sin_requisicion, fecha_limite_regularizacion)
  VALUES
    ('VAC-2001', 'ejecutivo-ventas-empresariales', 'Ejecutivo de ventas empresariales', 'Gestiona cartera empresarial y oportunidades consultivas.', 'Ventas consultivas, CRM y negociacion.', 'Managua, Nicaragua', 'NI', 'HIBRIDA', 'PUBLICADA', 'Comercial', 'ALTA', 1, 0, '2026-03-20'),
    ('VAC-2002', 'analista-reclutamiento-digital', 'Analista de reclutamiento digital', 'Opera fuentes, filtros y seguimiento del pipeline de talento.', 'ATS, entrevistas y analitica de reclutamiento.', 'San Jose, Costa Rica', 'CR', 'REMOTA', 'BORRADOR', 'Recursos Humanos', 'MEDIA', 0, 1, '2026-03-18');
END;
GO

IF NOT EXISTS (SELECT 1 FROM vacantes_nest.requisicion WHERE codigo_requisicion = 'REQ-3001')
BEGIN
  INSERT INTO vacantes_nest.requisicion
    (codigo_requisicion, id_puesto, titulo_puesto, area, solicitante, prioridad, estado_actual, tipo_necesidad, fecha_limite_regularizacion, permite_publicacion_sin_completar)
  VALUES
    ('REQ-3001', 6001001, 'Ejecutivo de ventas empresariales', 'Comercial', 'Ana Portal', 'ALTA', 'PENDIENTE_JEFE', 'RENUNCIA', '2026-03-20', 1);
END;
GO

IF NOT EXISTS (SELECT 1 FROM vacantes_nest.descriptor_puesto WHERE id_puesto = 6001001 AND version_descriptor = 1)
BEGIN
  INSERT INTO vacantes_nest.descriptor_puesto
    (id_puesto, titulo_puesto, version_descriptor, objetivo_puesto, competencias_clave, vigencia_desde, estado_actual)
  VALUES
    (6001001, 'Ejecutivo de ventas empresariales', 1, 'Captar y sostener cartera empresarial alineada a objetivos comerciales.', 'Ventas consultivas|CRM|Negociacion', '2026-03-01', 'VIGENTE');
END;
GO

IF NOT EXISTS (SELECT 1 FROM vacantes_nest.postulacion WHERE id_persona = 502 AND id_vacante = 2001)
BEGIN
  INSERT INTO vacantes_nest.postulacion
    (id_vacante, id_persona, nombre_candidato, estado_actual, score_ia, score_rh, tipo_postulacion, codigo_pais)
  VALUES
    (2001, 502, 'Luis Candidato', 'NUEVA', 84, 0, 'INTERNA', 'NI');
END;
GO

CREATE OR ALTER PROCEDURE vacantes_nest.sp_listar_vacantes_publicas
AS
BEGIN
  SET NOCOUNT ON;

  SELECT id_vacante AS idVacante, codigo_vacante AS codigoVacante, slug, titulo, ubicacion, codigo_pais AS codigoPais, modalidad
  FROM vacantes_nest.vacante
  WHERE es_publica = 1
  ORDER BY fecha_creacion DESC;
END;
GO

CREATE OR ALTER PROCEDURE vacantes_nest.sp_detalle_vacante_publica
  @slug NVARCHAR(120)
AS
BEGIN
  SET NOCOUNT ON;

  SELECT TOP 1
    id_vacante AS idVacante,
    codigo_vacante AS codigoVacante,
    slug,
    titulo,
    descripcion,
    requisitos,
    ubicacion,
    codigo_pais AS codigoPais,
    modalidad,
    estado_actual AS estadoActual
  FROM vacantes_nest.vacante
  WHERE slug = @slug
    AND es_publica = 1;
END;
GO

CREATE OR ALTER PROCEDURE vacantes_nest.sp_crear_vacante
  @codigo_vacante NVARCHAR(50),
  @slug NVARCHAR(120),
  @titulo NVARCHAR(180),
  @descripcion NVARCHAR(MAX),
  @requisitos NVARCHAR(MAX) = NULL,
  @ubicacion NVARCHAR(180) = NULL,
  @codigo_pais CHAR(2),
  @modalidad NVARCHAR(30),
  @area NVARCHAR(120) = NULL,
  @prioridad NVARCHAR(30) = NULL,
  @es_publica BIT,
  @es_excepcion_sin_requisicion BIT,
  @fecha_limite_regularizacion DATE = NULL
AS
BEGIN
  SET NOCOUNT ON;

  INSERT INTO vacantes_nest.vacante
    (codigo_vacante, slug, titulo, descripcion, requisitos, ubicacion, codigo_pais, modalidad, estado_actual, area, prioridad, es_publica, es_excepcion_sin_requisicion, fecha_limite_regularizacion)
  VALUES
    (@codigo_vacante, @slug, @titulo, @descripcion, @requisitos, @ubicacion, @codigo_pais, @modalidad, CASE WHEN @es_publica = 1 THEN 'PUBLICADA' ELSE 'BORRADOR' END, @area, @prioridad, @es_publica, @es_excepcion_sin_requisicion, @fecha_limite_regularizacion);

  SELECT SCOPE_IDENTITY() AS idVacante, @codigo_vacante AS codigoVacante;
END;
GO

CREATE OR ALTER PROCEDURE vacantes_nest.sp_cambiar_estado_vacante
  @id_vacante BIGINT,
  @estado_nuevo NVARCHAR(40)
AS
BEGIN
  SET NOCOUNT ON;

  UPDATE vacantes_nest.vacante
  SET estado_actual = @estado_nuevo,
      es_publica = CASE WHEN @estado_nuevo = 'PUBLICADA' THEN 1 ELSE es_publica END
  WHERE id_vacante = @id_vacante;
END;
GO

CREATE OR ALTER PROCEDURE vacantes_nest.sp_crear_requisicion
  @codigo_requisicion NVARCHAR(50),
  @id_puesto BIGINT,
  @titulo_puesto NVARCHAR(180),
  @area NVARCHAR(120),
  @solicitante NVARCHAR(180),
  @prioridad NVARCHAR(30),
  @tipo_necesidad NVARCHAR(40),
  @fecha_limite_regularizacion DATE = NULL,
  @permite_publicacion_sin_completar BIT
AS
BEGIN
  SET NOCOUNT ON;

  INSERT INTO vacantes_nest.requisicion
    (codigo_requisicion, id_puesto, titulo_puesto, area, solicitante, prioridad, estado_actual, tipo_necesidad, fecha_limite_regularizacion, permite_publicacion_sin_completar)
  VALUES
    (@codigo_requisicion, @id_puesto, @titulo_puesto, @area, @solicitante, @prioridad, 'PENDIENTE_JEFE', @tipo_necesidad, @fecha_limite_regularizacion, @permite_publicacion_sin_completar);

  SELECT SCOPE_IDENTITY() AS idRequisicion, @codigo_requisicion AS codigoRequisicion;
END;
GO

CREATE OR ALTER PROCEDURE vacantes_nest.sp_aprobar_requisicion
  @id_requisicion BIGINT
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE vacantes_nest.requisicion SET estado_actual = 'APROBADA' WHERE id_requisicion = @id_requisicion;
END;
GO

CREATE OR ALTER PROCEDURE vacantes_nest.sp_rechazar_requisicion
  @id_requisicion BIGINT
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE vacantes_nest.requisicion SET estado_actual = 'RECHAZADA' WHERE id_requisicion = @id_requisicion;
END;
GO

CREATE OR ALTER PROCEDURE vacantes_nest.sp_crear_descriptor
  @id_puesto BIGINT,
  @titulo_puesto NVARCHAR(180),
  @version_descriptor INT,
  @objetivo_puesto NVARCHAR(MAX),
  @competencias_clave NVARCHAR(MAX),
  @vigencia_desde DATE
AS
BEGIN
  SET NOCOUNT ON;

  INSERT INTO vacantes_nest.descriptor_puesto
    (id_puesto, titulo_puesto, version_descriptor, objetivo_puesto, competencias_clave, vigencia_desde, estado_actual)
  VALUES
    (@id_puesto, @titulo_puesto, @version_descriptor, @objetivo_puesto, @competencias_clave, @vigencia_desde, 'VIGENTE');

  SELECT SCOPE_IDENTITY() AS idDescriptorPuesto;
END;
GO

CREATE OR ALTER PROCEDURE vacantes_nest.sp_postular_vacante
  @id_vacante BIGINT,
  @id_persona BIGINT,
  @nombre_candidato NVARCHAR(180),
  @tipo_postulacion NVARCHAR(30),
  @codigo_pais CHAR(2)
AS
BEGIN
  SET NOCOUNT ON;

  INSERT INTO vacantes_nest.postulacion
    (id_vacante, id_persona, nombre_candidato, estado_actual, score_ia, score_rh, tipo_postulacion, codigo_pais)
  VALUES
    (@id_vacante, @id_persona, @nombre_candidato, 'NUEVA', 75, 0, @tipo_postulacion, @codigo_pais);

  SELECT SCOPE_IDENTITY() AS idPostulacion;
END;
GO

CREATE OR ALTER PROCEDURE vacantes_nest.sp_cambiar_estado_postulacion
  @id_postulacion BIGINT,
  @estado_nuevo NVARCHAR(40)
AS
BEGIN
  SET NOCOUNT ON;

  UPDATE vacantes_nest.postulacion
  SET estado_actual = @estado_nuevo,
      score_rh = CASE WHEN @estado_nuevo = 'REVISION_RH' THEN 65 WHEN @estado_nuevo = 'PRESELECCIONADA' THEN 88 ELSE score_rh END
  WHERE id_postulacion = @id_postulacion;
END;
GO

CREATE OR ALTER PROCEDURE vacantes_nest.sp_crear_terna
  @id_vacante BIGINT,
  @id_cuenta_portal_creador BIGINT
AS
BEGIN
  SET NOCOUNT ON;

  INSERT INTO vacantes_nest.terna (id_vacante, id_cuenta_portal_creador)
  VALUES (@id_vacante, @id_cuenta_portal_creador);

  SELECT SCOPE_IDENTITY() AS idTerna;
END;
GO

CREATE OR ALTER PROCEDURE vacantes_nest.sp_registrar_lista_negra
  @id_persona BIGINT,
  @motivo NVARCHAR(MAX),
  @categoria NVARCHAR(80) = NULL,
  @fecha_inicio DATE,
  @fecha_fin DATE = NULL,
  @permanente BIT,
  @id_cuenta_portal_registro BIGINT
AS
BEGIN
  SET NOCOUNT ON;

  INSERT INTO vacantes_nest.lista_negra
    (id_persona, motivo, categoria, fecha_inicio, fecha_fin, permanente, id_cuenta_portal_registro)
  VALUES
    (@id_persona, @motivo, @categoria, @fecha_inicio, @fecha_fin, @permanente, @id_cuenta_portal_registro);

  SELECT SCOPE_IDENTITY() AS idListaNegra;
END;
GO
