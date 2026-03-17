CREATE OR ALTER PROCEDURE dbo.spCv_RegistrarArchivo
    @IdPersona INT,
    @TipoArchivo NVARCHAR(50),
    @NombreOriginal NVARCHAR(255),
    @RutaStorage NVARCHAR(500),
    @MimeType NVARCHAR(100),
    @TamanoBytes BIGINT,
    @HashArchivo NVARCHAR(128) = NULL,
    @Extension NVARCHAR(20) = NULL,
    @EsCvPrincipal BIT = 1,
    @Origen NVARCHAR(50) = NULL,
    @EstadoArchivo NVARCHAR(30) = N'ACTIVO'
AS
BEGIN
    SET NOCOUNT ON;

    IF @EsCvPrincipal = 1
    BEGIN
        UPDATE dbo.ArchivoPersona
        SET EsCvPrincipal = 0
        WHERE IdPersona = @IdPersona
          AND TipoArchivo = @TipoArchivo;
    END;

    INSERT INTO dbo.ArchivoPersona (
        IdPersona, TipoArchivo, NombreOriginal, RutaStorage, MimeType, TamanoBytes,
        HashArchivo, Extension, EsCvPrincipal, Origen, EstadoArchivo
    )
    VALUES (
        @IdPersona, @TipoArchivo, @NombreOriginal, @RutaStorage, @MimeType, @TamanoBytes,
        @HashArchivo, @Extension, @EsCvPrincipal, @Origen, @EstadoArchivo
    );

    SELECT SCOPE_IDENTITY() AS IdArchivoPersona;
END;
GO

CREATE OR ALTER PROCEDURE dbo.spCv_GuardarTextoExtraido
    @IdArchivoPersona INT,
    @TextoExtraido NVARCHAR(MAX),
    @MetodoExtraccion NVARCHAR(50),
    @VersionExtractor NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.CvTextoExtraido (
        IdArchivoPersona, TextoExtraido, MetodoExtraccion, VersionExtractor
    )
    VALUES (
        @IdArchivoPersona, @TextoExtraido, @MetodoExtraccion, @VersionExtractor
    );

    SELECT SCOPE_IDENTITY() AS IdCvTextoExtraido;
END;
GO

CREATE OR ALTER PROCEDURE dbo.spCv_ObtenerCvPrincipalPorPersona
    @IdPersona INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (1)
        ap.*
    FROM dbo.ArchivoPersona ap
    WHERE ap.IdPersona = @IdPersona
      AND ap.TipoArchivo = 'CV'
      AND ap.Activo = 1
      AND ap.EsCvPrincipal = 1
    ORDER BY ap.FechaCreacion DESC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.spCv_ListarArchivosPersona
    @IdPersona INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        ap.IdArchivoPersona,
        ap.TipoArchivo,
        ap.NombreOriginal,
        ap.RutaStorage,
        ap.MimeType,
        ap.TamanoBytes,
        ap.Extension,
        ap.EsCvPrincipal,
        ap.Origen,
        ap.EstadoArchivo,
        ap.FechaCreacion
    FROM dbo.ArchivoPersona ap
    WHERE ap.IdPersona = @IdPersona
      AND ap.Activo = 1
    ORDER BY ap.FechaCreacion DESC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.spIA_GuardarAnalisisCv
    @IdPersona INT,
    @IdVacante INT = NULL,
    @IdArchivoPersona INT,
    @IdCvTextoExtraido INT = NULL,
    @MotorIA NVARCHAR(80),
    @VersionModelo NVARCHAR(80) = NULL,
    @VersionPrompt NVARCHAR(80) = NULL,
    @JsonExtraido NVARCHAR(MAX) = NULL,
    @ResumenCandidato NVARCHAR(MAX) = NULL,
    @Fortalezas NVARCHAR(MAX) = NULL,
    @Debilidades NVARCHAR(MAX) = NULL,
    @Alertas NVARCHAR(MAX) = NULL,
    @ScoreCalculado DECIMAL(5,2) = NULL,
    @ScoreHabilidades DECIMAL(5,2) = NULL,
    @ScoreExperiencia DECIMAL(5,2) = NULL,
    @ScoreEducacion DECIMAL(5,2) = NULL,
    @ScoreContexto DECIMAL(5,2) = NULL,
    @FueExitoso BIT = 1,
    @ErrorTecnico NVARCHAR(MAX) = NULL,
    @EsVigente BIT = 1
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.AnalisisCvIa (
        IdPersona, IdVacante, IdArchivoPersona, IdCvTextoExtraido, MotorIA, VersionModelo,
        VersionPrompt, JsonExtraido, ResumenCandidato, Fortalezas, Debilidades, Alertas,
        ScoreCalculado, ScoreHabilidades, ScoreExperiencia, ScoreEducacion, ScoreContexto,
        FueExitoso, ErrorTecnico, EsVigente
    )
    VALUES (
        @IdPersona, @IdVacante, @IdArchivoPersona, @IdCvTextoExtraido, @MotorIA, @VersionModelo,
        @VersionPrompt, @JsonExtraido, @ResumenCandidato, @Fortalezas, @Debilidades, @Alertas,
        @ScoreCalculado, @ScoreHabilidades, @ScoreExperiencia, @ScoreEducacion, @ScoreContexto,
        @FueExitoso, @ErrorTecnico, @EsVigente
    );

    SELECT SCOPE_IDENTITY() AS IdAnalisisCvIa;
END;
GO

CREATE OR ALTER PROCEDURE dbo.spIA_MarcarAnalisisAnteriorNoVigente
    @IdPersona INT,
    @IdVacante INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.AnalisisCvIa
    SET EsVigente = 0
    WHERE IdPersona = @IdPersona
      AND ((@IdVacante IS NULL AND IdVacante IS NULL) OR IdVacante = @IdVacante)
      AND EsVigente = 1;

    SELECT @@ROWCOUNT AS RegistrosAfectados;
END;
GO

CREATE OR ALTER PROCEDURE dbo.spIA_ObtenerAnalisisVigentePorPersona
    @IdPersona INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (1)
        *
    FROM dbo.AnalisisCvIa
    WHERE IdPersona = @IdPersona
      AND IdVacante IS NULL
      AND EsVigente = 1
    ORDER BY FechaAnalisis DESC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.spIA_ObtenerAnalisisPorPersonaVacante
    @IdPersona INT,
    @IdVacante INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (1)
        *
    FROM dbo.AnalisisCvIa
    WHERE IdPersona = @IdPersona
      AND IdVacante = @IdVacante
      AND EsVigente = 1
    ORDER BY FechaAnalisis DESC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.spIA_GuardarPerfilNormalizado
    @IdPersona INT,
    @IdAnalisisCvIa INT,
    @NombreCompletoInferido NVARCHAR(200) = NULL,
    @CorreoInferido NVARCHAR(150) = NULL,
    @TelefonoInferido NVARCHAR(50) = NULL,
    @CodigoPaisResidencia NVARCHAR(5) = NULL,
    @LinkedInUrl NVARCHAR(300) = NULL,
    @PortafolioUrl NVARCHAR(300) = NULL,
    @ResumenProfesional NVARCHAR(MAX) = NULL,
    @ExperienciaAnios DECIMAL(5,2) = NULL,
    @NivelAcademico NVARCHAR(100) = NULL,
    @HabilidadesJson NVARCHAR(MAX) = NULL,
    @IdiomasJson NVARCHAR(MAX) = NULL,
    @ExperienciasJson NVARCHAR(MAX) = NULL,
    @EducacionJson NVARCHAR(MAX) = NULL,
    @CertificacionesJson NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.PerfilCvNormalizado (
        IdPersona, IdAnalisisCvIa, NombreCompletoInferido, CorreoInferido, TelefonoInferido,
        CodigoPaisResidencia, LinkedInUrl, PortafolioUrl, ResumenProfesional, ExperienciaAnios,
        NivelAcademico, HabilidadesJson, IdiomasJson, ExperienciasJson, EducacionJson, CertificacionesJson
    )
    VALUES (
        @IdPersona, @IdAnalisisCvIa, @NombreCompletoInferido, @CorreoInferido, @TelefonoInferido,
        @CodigoPaisResidencia, @LinkedInUrl, @PortafolioUrl, @ResumenProfesional, @ExperienciaAnios,
        @NivelAcademico, @HabilidadesJson, @IdiomasJson, @ExperienciasJson, @EducacionJson, @CertificacionesJson
    );

    SELECT SCOPE_IDENTITY() AS IdPerfilCvNormalizado;
END;
GO

CREATE OR ALTER PROCEDURE dbo.spIA_RegistrarAuditoriaAnalisis
    @IdAnalisisCvIa INT,
    @Evento NVARCHAR(50),
    @Detalle NVARCHAR(500) = NULL,
    @IdCuentaPortal INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.AnalisisCvIaAuditoria (
        IdAnalisisCvIa, Evento, Detalle, IdCuentaPortal
    )
    VALUES (
        @IdAnalisisCvIa, @Evento, @Detalle, @IdCuentaPortal
    );
END;
GO
