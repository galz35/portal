IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'vacantes_nest')
BEGIN
  EXEC('CREATE SCHEMA vacantes_nest');
END;
GO

CREATE TABLE vacantes_nest.vacante (
  id_vacante BIGINT IDENTITY(2001, 1) PRIMARY KEY,
  codigo_vacante NVARCHAR(50) NOT NULL UNIQUE,
  slug NVARCHAR(120) NOT NULL UNIQUE,
  titulo NVARCHAR(180) NOT NULL,
  descripcion NVARCHAR(MAX) NOT NULL,
  requisitos NVARCHAR(MAX) NULL,
  ubicacion NVARCHAR(180) NULL,
  codigo_pais CHAR(2) NOT NULL,
  modalidad NVARCHAR(30) NOT NULL,
  estado_actual NVARCHAR(40) NOT NULL,
  area NVARCHAR(120) NULL,
  prioridad NVARCHAR(30) NULL,
  es_publica BIT NOT NULL CONSTRAINT DF_vacante_es_publica DEFAULT (0),
  es_excepcion_sin_requisicion BIT NOT NULL CONSTRAINT DF_vacante_es_excepcion DEFAULT (0),
  fecha_limite_regularizacion DATE NULL,
  fecha_creacion DATETIME2 NOT NULL CONSTRAINT DF_vacante_fecha_creacion DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE vacantes_nest.requisicion (
  id_requisicion BIGINT IDENTITY(3001, 1) PRIMARY KEY,
  codigo_requisicion NVARCHAR(50) NOT NULL UNIQUE,
  id_puesto BIGINT NOT NULL,
  titulo_puesto NVARCHAR(180) NOT NULL,
  area NVARCHAR(120) NULL,
  solicitante NVARCHAR(180) NOT NULL,
  prioridad NVARCHAR(30) NULL,
  estado_actual NVARCHAR(40) NOT NULL,
  tipo_necesidad NVARCHAR(40) NOT NULL,
  fecha_solicitud DATE NOT NULL CONSTRAINT DF_requisicion_fecha_solicitud DEFAULT CAST(SYSUTCDATETIME() AS DATE),
  fecha_limite_regularizacion DATE NULL,
  permite_publicacion_sin_completar BIT NOT NULL CONSTRAINT DF_requisicion_permite_publicacion DEFAULT (0)
);
GO

CREATE TABLE vacantes_nest.descriptor_puesto (
  id_descriptor_puesto BIGINT IDENTITY(4001, 1) PRIMARY KEY,
  id_puesto BIGINT NOT NULL,
  titulo_puesto NVARCHAR(180) NOT NULL,
  version_descriptor INT NOT NULL,
  objetivo_puesto NVARCHAR(MAX) NULL,
  competencias_clave NVARCHAR(MAX) NULL,
  vigencia_desde DATE NOT NULL,
  estado_actual NVARCHAR(30) NOT NULL
);
GO

CREATE TABLE vacantes_nest.postulacion (
  id_postulacion BIGINT IDENTITY(5001, 1) PRIMARY KEY,
  id_vacante BIGINT NOT NULL,
  id_persona BIGINT NOT NULL,
  nombre_candidato NVARCHAR(180) NOT NULL,
  estado_actual NVARCHAR(40) NOT NULL,
  score_ia DECIMAL(5, 2) NOT NULL CONSTRAINT DF_postulacion_score_ia DEFAULT (0),
  score_rh DECIMAL(5, 2) NOT NULL CONSTRAINT DF_postulacion_score_rh DEFAULT (0),
  tipo_postulacion NVARCHAR(30) NOT NULL,
  codigo_pais CHAR(2) NOT NULL,
  fecha_postulacion DATE NOT NULL CONSTRAINT DF_postulacion_fecha_postulacion DEFAULT CAST(SYSUTCDATETIME() AS DATE),
  CONSTRAINT FK_postulacion_vacante FOREIGN KEY (id_vacante) REFERENCES vacantes_nest.vacante(id_vacante)
);
GO

CREATE TABLE vacantes_nest.terna (
  id_terna BIGINT IDENTITY(6001, 1) PRIMARY KEY,
  id_vacante BIGINT NOT NULL,
  id_cuenta_portal_creador BIGINT NOT NULL,
  fecha_creacion DATETIME2 NOT NULL CONSTRAINT DF_terna_fecha_creacion DEFAULT SYSUTCDATETIME(),
  CONSTRAINT FK_terna_vacante FOREIGN KEY (id_vacante) REFERENCES vacantes_nest.vacante(id_vacante)
);
GO

CREATE TABLE vacantes_nest.lista_negra (
  id_lista_negra BIGINT IDENTITY(7001, 1) PRIMARY KEY,
  id_persona BIGINT NOT NULL,
  motivo NVARCHAR(MAX) NOT NULL,
  categoria NVARCHAR(80) NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NULL,
  permanente BIT NOT NULL CONSTRAINT DF_lista_negra_permanente DEFAULT (0),
  id_cuenta_portal_registro BIGINT NOT NULL,
  fecha_registro DATETIME2 NOT NULL CONSTRAINT DF_lista_negra_fecha_registro DEFAULT SYSUTCDATETIME()
);
GO

CREATE INDEX IX_vacante_publica_slug ON vacantes_nest.vacante (es_publica, slug);
CREATE INDEX IX_postulacion_persona ON vacantes_nest.postulacion (id_persona, fecha_postulacion DESC);
GO
