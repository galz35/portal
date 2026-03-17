CREATE TABLE dbo.Vacante (
    IdVacante                INT IDENTITY(1,1) PRIMARY KEY,
    CodigoVacante            NVARCHAR(30) NOT NULL,
    Slug                     NVARCHAR(200) NOT NULL,
    Titulo                   NVARCHAR(200) NOT NULL,
    Descripcion              NVARCHAR(MAX) NOT NULL,
    Requisitos               NVARCHAR(MAX) NULL,
    Area                     NVARCHAR(100) NULL,
    Gerencia                 NVARCHAR(100) NULL,
    Departamento             NVARCHAR(100) NULL,
    TipoVacante              NVARCHAR(30) NOT NULL,
    Modalidad                NVARCHAR(30) NULL,
    Ubicacion                NVARCHAR(150) NULL,
    CodigoPais               NVARCHAR(5) NOT NULL,
    NivelExperiencia         NVARCHAR(50) NULL,
    SalarioMin               DECIMAL(18,2) NULL,
    SalarioMax               DECIMAL(18,2) NULL,
    AceptaInternos           BIT NOT NULL DEFAULT 0,
    EsPublica                BIT NOT NULL DEFAULT 1,
    CantidadPlazas           INT NOT NULL DEFAULT 1,
    FechaPublicacion         DATETIME2 NULL,
    FechaCierre              DATETIME2 NULL,
    EstadoActual             NVARCHAR(40) NOT NULL DEFAULT 'BORRADOR',
    Prioridad                NVARCHAR(30) NULL,
    IdSolicitante            INT NULL,
    IdResponsableRH          INT NULL,
    Activo                   BIT NOT NULL DEFAULT 1,
    FechaCreacion            DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    FechaModificacion        DATETIME2 NULL
);
GO

CREATE TABLE dbo.VacanteEstadoHistorial (
    IdVacanteEstadoHistorial BIGINT IDENTITY(1,1) PRIMARY KEY,
    IdVacante                INT NOT NULL,
    EstadoAnterior           NVARCHAR(40) NULL,
    EstadoNuevo              NVARCHAR(40) NOT NULL,
    Observacion              NVARCHAR(500) NULL,
    IdCuentaPortal           INT NOT NULL,
    FechaCambio              DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO

CREATE TABLE dbo.Postulacion (
    IdPostulacion            INT IDENTITY(1,1) PRIMARY KEY,
    IdVacante                INT NOT NULL,
    IdPersona                INT NOT NULL,
    EsInterna                BIT NOT NULL DEFAULT 0,
    FechaPostulacion         DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    EstadoActual             NVARCHAR(40) NOT NULL DEFAULT 'APLICADA',
    ScoreIA                  DECIMAL(5,2) NULL,
    ScoreRH                  DECIMAL(5,2) NULL,
    ScoreJefe                DECIMAL(5,2) NULL,
    RankingFinal             INT NULL,
    FuentePostulacion        NVARCHAR(50) NULL,
    MotivoRechazo            NVARCHAR(500) NULL,
    RetiradaPorCandidato     BIT NOT NULL DEFAULT 0,
    Activo                   BIT NOT NULL DEFAULT 1,
    FechaCreacion            DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    FechaModificacion        DATETIME2 NULL,
    CONSTRAINT UQ_Postulacion_Persona_Vacante UNIQUE (IdVacante, IdPersona)
);
GO

CREATE TABLE dbo.PostulacionEstadoHistorial (
    IdPostulacionEstadoHistorial BIGINT IDENTITY(1,1) PRIMARY KEY,
    IdPostulacion            INT NOT NULL,
    EstadoAnterior           NVARCHAR(40) NULL,
    EstadoNuevo              NVARCHAR(40) NOT NULL,
    Observacion              NVARCHAR(500) NULL,
    IdCuentaPortal           INT NOT NULL,
    FechaCambio              DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO

CREATE TABLE dbo.ArchivoPersona (
    IdArchivoPersona         INT IDENTITY(1,1) PRIMARY KEY,
    IdPersona                INT NOT NULL,
    TipoArchivo              NVARCHAR(50) NOT NULL,
    NombreOriginal           NVARCHAR(255) NOT NULL,
    RutaStorage              NVARCHAR(500) NOT NULL,
    MimeType                 NVARCHAR(100) NOT NULL,
    TamanoBytes              BIGINT NOT NULL,
    HashArchivo              NVARCHAR(128) NULL,
    Activo                   BIT NOT NULL DEFAULT 1,
    FechaCreacion            DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO

CREATE TABLE dbo.AnalisisCvIa (
    IdAnalisisCvIa           INT IDENTITY(1,1) PRIMARY KEY,
    IdPersona                INT NOT NULL,
    IdVacante                INT NULL,
    IdArchivoPersona         INT NOT NULL,
    MotorIA                  NVARCHAR(80) NOT NULL,
    VersionModelo            NVARCHAR(80) NULL,
    ResumenJson              NVARCHAR(MAX) NULL,
    ScoreCalculado           DECIMAL(5,2) NULL,
    Observaciones            NVARCHAR(MAX) NULL,
    FechaAnalisis            DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO

CREATE TABLE dbo.Terna (
    IdTerna                  INT IDENTITY(1,1) PRIMARY KEY,
    IdVacante                INT NOT NULL,
    Estado                   NVARCHAR(30) NOT NULL DEFAULT 'ABIERTA',
    FechaCreacion            DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    IdCuentaPortalCreador    INT NOT NULL
);
GO

CREATE TABLE dbo.TernaDetalle (
    IdTernaDetalle           INT IDENTITY(1,1) PRIMARY KEY,
    IdTerna                  INT NOT NULL,
    IdPostulacion            INT NOT NULL,
    Posicion                 INT NOT NULL,
    Justificacion            NVARCHAR(500) NULL,
    ScoreFinal               DECIMAL(5,2) NULL,
    CONSTRAINT UQ_TernaDetalle UNIQUE (IdTerna, IdPostulacion)
);
GO

CREATE TABLE dbo.ListaNegra (
    IdListaNegra             INT IDENTITY(1,1) PRIMARY KEY,
    IdPersona                INT NOT NULL,
    Motivo                   NVARCHAR(500) NOT NULL,
    Categoria                NVARCHAR(50) NULL,
    FechaInicio              DATE NOT NULL,
    FechaFin                 DATE NULL,
    Permanente               BIT NOT NULL DEFAULT 0,
    IdCuentaPortalRegistro   INT NOT NULL,
    Activo                   BIT NOT NULL DEFAULT 1,
    FechaCreacion            DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO

CREATE TABLE dbo.Notificacion (
    IdNotificacion           BIGINT IDENTITY(1,1) PRIMARY KEY,
    IdPersona                INT NOT NULL,
    TipoNotificacion         NVARCHAR(50) NOT NULL,
    Titulo                   NVARCHAR(150) NOT NULL,
    Mensaje                  NVARCHAR(500) NOT NULL,
    Leida                    BIT NOT NULL DEFAULT 0,
    FechaCreacion            DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO

CREATE TABLE dbo.CatalogoTipoVacante (
    CodigoTipoVacante        NVARCHAR(30) PRIMARY KEY,
    Nombre                   NVARCHAR(100) NOT NULL,
    Activo                   BIT NOT NULL DEFAULT 1
);
GO

CREATE TABLE dbo.CatalogoModalidad (
    CodigoModalidad          NVARCHAR(30) PRIMARY KEY,
    Nombre                   NVARCHAR(100) NOT NULL,
    Activo                   BIT NOT NULL DEFAULT 1
);
GO

CREATE TABLE dbo.CatalogoMotivoRechazo (
    CodigoMotivoRechazo      NVARCHAR(30) PRIMARY KEY,
    Nombre                   NVARCHAR(100) NOT NULL,
    Activo                   BIT NOT NULL DEFAULT 1
);
GO

CREATE TABLE dbo.CatalogoFuentePostulacion (
    CodigoFuentePostulacion  NVARCHAR(30) PRIMARY KEY,
    Nombre                   NVARCHAR(100) NOT NULL,
    Activo                   BIT NOT NULL DEFAULT 1
);
GO
