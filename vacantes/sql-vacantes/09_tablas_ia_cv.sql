CREATE TABLE dbo.CvTextoExtraido (
    IdCvTextoExtraido        INT IDENTITY(1,1) PRIMARY KEY,
    IdArchivoPersona         INT NOT NULL,
    TextoExtraido            NVARCHAR(MAX) NOT NULL,
    MetodoExtraccion         NVARCHAR(50) NOT NULL,
    VersionExtractor         NVARCHAR(50) NULL,
    FechaExtraccion          DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    Activo                   BIT NOT NULL DEFAULT 1
);
GO

ALTER TABLE dbo.ArchivoPersona
ADD Extension                NVARCHAR(20) NULL,
    EsCvPrincipal            BIT NOT NULL DEFAULT 0,
    Origen                   NVARCHAR(50) NULL,
    EstadoArchivo            NVARCHAR(30) NULL;
GO

ALTER TABLE dbo.AnalisisCvIa
ADD IdCvTextoExtraido       INT NULL,
    VersionPrompt           NVARCHAR(80) NULL,
    JsonExtraido            NVARCHAR(MAX) NULL,
    ResumenCandidato        NVARCHAR(MAX) NULL,
    Fortalezas              NVARCHAR(MAX) NULL,
    Debilidades             NVARCHAR(MAX) NULL,
    Alertas                 NVARCHAR(MAX) NULL,
    ScoreHabilidades        DECIMAL(5,2) NULL,
    ScoreExperiencia        DECIMAL(5,2) NULL,
    ScoreEducacion          DECIMAL(5,2) NULL,
    ScoreContexto           DECIMAL(5,2) NULL,
    FueExitoso              BIT NOT NULL DEFAULT 1,
    ErrorTecnico            NVARCHAR(MAX) NULL,
    EsVigente               BIT NOT NULL DEFAULT 1;
GO

CREATE TABLE dbo.PerfilCvNormalizado (
    IdPerfilCvNormalizado    INT IDENTITY(1,1) PRIMARY KEY,
    IdPersona                INT NOT NULL,
    IdAnalisisCvIa           INT NOT NULL,
    NombreCompletoInferido   NVARCHAR(200) NULL,
    CorreoInferido           NVARCHAR(150) NULL,
    TelefonoInferido         NVARCHAR(50) NULL,
    CodigoPaisResidencia     NVARCHAR(5) NULL,
    LinkedInUrl              NVARCHAR(300) NULL,
    PortafolioUrl            NVARCHAR(300) NULL,
    ResumenProfesional       NVARCHAR(MAX) NULL,
    ExperienciaAnios         DECIMAL(5,2) NULL,
    NivelAcademico           NVARCHAR(100) NULL,
    HabilidadesJson          NVARCHAR(MAX) NULL,
    IdiomasJson              NVARCHAR(MAX) NULL,
    ExperienciasJson         NVARCHAR(MAX) NULL,
    EducacionJson            NVARCHAR(MAX) NULL,
    CertificacionesJson      NVARCHAR(MAX) NULL,
    FechaCreacion            DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    Activo                   BIT NOT NULL DEFAULT 1
);
GO

CREATE TABLE dbo.AnalisisCvIaAuditoria (
    IdAnalisisCvIaAuditoria  BIGINT IDENTITY(1,1) PRIMARY KEY,
    IdAnalisisCvIa           INT NOT NULL,
    Evento                   NVARCHAR(50) NOT NULL,
    Detalle                  NVARCHAR(500) NULL,
    IdCuentaPortal           INT NULL,
    FechaEvento              DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO
