CREATE TABLE dbo.DescriptorPuesto (
    IdDescriptorPuesto       INT IDENTITY(1,1) PRIMARY KEY,
    IdPuesto                 BIGINT NOT NULL,
    TituloPuesto             NVARCHAR(200) NOT NULL,
    VersionDescriptor        NVARCHAR(30) NOT NULL,
    ObjetivoPuesto           NVARCHAR(MAX) NULL,
    FuncionesPrincipales     NVARCHAR(MAX) NULL,
    FuncionesSecundarias     NVARCHAR(MAX) NULL,
    CompetenciasTecnicas     NVARCHAR(MAX) NULL,
    CompetenciasBlandas      NVARCHAR(MAX) NULL,
    Escolaridad              NVARCHAR(200) NULL,
    ExperienciaMinima        NVARCHAR(200) NULL,
    Idiomas                  NVARCHAR(MAX) NULL,
    Certificaciones          NVARCHAR(MAX) NULL,
    Jornada                  NVARCHAR(100) NULL,
    Modalidad                NVARCHAR(30) NULL,
    RangoSalarialReferencial NVARCHAR(100) NULL,
    ReportaA                 NVARCHAR(200) NULL,
    IndicadoresExito         NVARCHAR(MAX) NULL,
    Activo                   BIT NOT NULL DEFAULT 1,
    FechaVigenciaDesde       DATE NOT NULL,
    FechaVigenciaHasta       DATE NULL,
    FechaCreacion            DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO

CREATE TABLE dbo.RequisicionPersonal (
    IdRequisicionPersonal    BIGINT IDENTITY(1,1) PRIMARY KEY,
    CodigoRequisicion        NVARCHAR(30) NOT NULL,
    IdPuesto                 BIGINT NOT NULL,
    IdDescriptorPuesto       INT NULL,
    TipoNecesidad            NVARCHAR(40) NOT NULL,
    Justificacion            NVARCHAR(MAX) NOT NULL,
    CantidadPlazas           INT NOT NULL DEFAULT 1,
    CodigoPais               NVARCHAR(5) NOT NULL,
    Gerencia                 NVARCHAR(100) NULL,
    Departamento             NVARCHAR(100) NULL,
    Area                     NVARCHAR(100) NULL,
    CentroCosto              NVARCHAR(50) NULL,
    IdCuentaPortalSolicitante INT NOT NULL,
    IdCuentaPortalJefeAprobador INT NULL,
    IdCuentaPortalReclutamiento INT NULL,
    IdCuentaPortalCompensacion INT NULL,
    FechaSolicitud           DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    FechaNecesariaCobertura  DATE NULL,
    Prioridad                NVARCHAR(30) NULL,
    EstadoRequisicion        NVARCHAR(40) NOT NULL DEFAULT 'BORRADOR',
    PermitePublicacionSinCompletar BIT NOT NULL DEFAULT 0,
    FechaLimiteRegularizacion DATE NULL,
    ObservacionesRH          NVARCHAR(MAX) NULL,
    ObservacionesCompensacion NVARCHAR(MAX) NULL,
    Activa                   BIT NOT NULL DEFAULT 1
);
GO

CREATE TABLE dbo.RequisicionAprobacion (
    IdRequisicionAprobacion  BIGINT IDENTITY(1,1) PRIMARY KEY,
    IdRequisicionPersonal    BIGINT NOT NULL,
    Etapa                    NVARCHAR(40) NOT NULL,
    OrdenEtapa               INT NOT NULL,
    IdCuentaPortalAprobador  INT NOT NULL,
    EstadoAprobacion         NVARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
    Comentario               NVARCHAR(500) NULL,
    FechaDecision            DATETIME2 NULL,
    FechaCreacion            DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO

CREATE TABLE dbo.RequisicionHistorial (
    IdRequisicionHistorial   BIGINT IDENTITY(1,1) PRIMARY KEY,
    IdRequisicionPersonal    BIGINT NOT NULL,
    EstadoAnterior           NVARCHAR(40) NULL,
    EstadoNuevo              NVARCHAR(40) NOT NULL,
    Accion                   NVARCHAR(60) NOT NULL,
    Detalle                  NVARCHAR(1000) NULL,
    IdCuentaPortal           INT NULL,
    FechaEvento              DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO

CREATE TABLE dbo.RequisicionAdjunto (
    IdRequisicionAdjunto     BIGINT IDENTITY(1,1) PRIMARY KEY,
    IdRequisicionPersonal    BIGINT NOT NULL,
    NombreOriginal           NVARCHAR(255) NOT NULL,
    RutaStorage              NVARCHAR(500) NOT NULL,
    MimeType                 NVARCHAR(100) NOT NULL,
    TamanoBytes              BIGINT NOT NULL,
    Activo                   BIT NOT NULL DEFAULT 1,
    FechaCreacion            DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO

ALTER TABLE dbo.Vacante
ADD IdRequisicionPersonal       BIGINT NULL,
    IdDescriptorPuesto         INT NULL,
    EsExcepcionSinRequisicion  BIT NOT NULL DEFAULT 0,
    MotivoExcepcion            NVARCHAR(500) NULL,
    FechaLimiteRegularizacion  DATE NULL,
    EstadoRegularizacion       NVARCHAR(40) NULL;
GO

CREATE TABLE dbo.VacanteRegularizacionHistorial (
    IdVacanteRegularizacionHistorial BIGINT IDENTITY(1,1) PRIMARY KEY,
    IdVacante                INT NOT NULL,
    EstadoAnterior           NVARCHAR(40) NULL,
    EstadoNuevo              NVARCHAR(40) NOT NULL,
    Motivo                   NVARCHAR(500) NULL,
    IdCuentaPortal           INT NULL,
    FechaEvento              DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO
