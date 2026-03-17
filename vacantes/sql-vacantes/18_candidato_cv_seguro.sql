IF OBJECT_ID('dbo.ArchivoCandidatoCv', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ArchivoCandidatoCv (
        IdArchivoCandidatoCv BIGINT IDENTITY(1,1) CONSTRAINT PK_ArchivoCandidatoCv PRIMARY KEY,
        IdCandidato BIGINT NOT NULL CONSTRAINT FK_ArchivoCandidatoCv_Candidato FOREIGN KEY REFERENCES dbo.CandidatoExterno(IdCandidato),
        NombreOriginal NVARCHAR(255) NOT NULL,
        Extension NVARCHAR(20) NOT NULL,
        MimeDeclarado NVARCHAR(100) NULL,
        MimeDetectado NVARCHAR(100) NOT NULL,
        TamanoBytes BIGINT NOT NULL,
        HashSha256 NVARCHAR(64) NOT NULL,
        RutaStorage NVARCHAR(500) NOT NULL,
        OrigenCarga NVARCHAR(50) NOT NULL CONSTRAINT DF_ArchivoCandidatoCv_Origen DEFAULT N'PORTAL_CANDIDATO_WEB',
        EstadoArchivo NVARCHAR(30) NOT NULL CONSTRAINT DF_ArchivoCandidatoCv_Estado DEFAULT N'ACTIVO',
        EsCvPrincipal BIT NOT NULL CONSTRAINT DF_ArchivoCandidatoCv_Principal DEFAULT 1,
        Activo BIT NOT NULL CONSTRAINT DF_ArchivoCandidatoCv_Activo DEFAULT 1,
        FechaCreacion DATETIME2 NOT NULL CONSTRAINT DF_ArchivoCandidatoCv_FechaCreacion DEFAULT SYSDATETIME(),
        FechaDesactivacion DATETIME2 NULL
    );

    CREATE NONCLUSTERED INDEX IX_ArchivoCandidatoCv_Candidato_Fecha
        ON dbo.ArchivoCandidatoCv (IdCandidato, FechaCreacion DESC);

    CREATE UNIQUE NONCLUSTERED INDEX UX_ArchivoCandidatoCv_Candidato_Hash_Activo
        ON dbo.ArchivoCandidatoCv (IdCandidato, HashSha256)
        WHERE Activo = 1 AND EstadoArchivo = N'ACTIVO';
END
GO

IF OBJECT_ID('dbo.IntentoSubidaCvCandidato', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.IntentoSubidaCvCandidato (
        IdIntentoSubidaCvCandidato BIGINT IDENTITY(1,1) CONSTRAINT PK_IntentoSubidaCvCandidato PRIMARY KEY,
        IdCandidato BIGINT NOT NULL CONSTRAINT FK_IntentoSubidaCvCandidato_Candidato FOREIGN KEY REFERENCES dbo.CandidatoExterno(IdCandidato),
        IdSesionCandidato BIGINT NULL CONSTRAINT FK_IntentoSubidaCvCandidato_Sesion FOREIGN KEY REFERENCES dbo.SesionCandidato(IdSesionCandidato),
        IpOrigen NVARCHAR(60) NULL,
        UserAgent NVARCHAR(500) NULL,
        NombreOriginal NVARCHAR(255) NULL,
        Extension NVARCHAR(20) NULL,
        TamanoBytes BIGINT NULL,
        HashSha256 NVARCHAR(64) NULL,
        Resultado NVARCHAR(50) NOT NULL,
        Detalle NVARCHAR(500) NULL,
        FechaIntento DATETIME2 NOT NULL CONSTRAINT DF_IntentoSubidaCvCandidato_Fecha DEFAULT SYSDATETIME()
    );

    CREATE NONCLUSTERED INDEX IX_IntentoSubidaCvCandidato_Candidato_Fecha
        ON dbo.IntentoSubidaCvCandidato (IdCandidato, FechaIntento DESC);

    CREATE NONCLUSTERED INDEX IX_IntentoSubidaCvCandidato_Ip_Fecha
        ON dbo.IntentoSubidaCvCandidato (IpOrigen, FechaIntento DESC)
        WHERE IpOrigen IS NOT NULL;
END
GO

CREATE OR ALTER PROCEDURE dbo.spCand_Cv_RegistrarIntento
    @IdCandidato BIGINT,
    @IdSesionCandidato BIGINT = NULL,
    @IpOrigen NVARCHAR(60) = NULL,
    @UserAgent NVARCHAR(500) = NULL,
    @NombreOriginal NVARCHAR(255) = NULL,
    @Extension NVARCHAR(20) = NULL,
    @TamanoBytes BIGINT = NULL,
    @HashSha256 NVARCHAR(64) = NULL,
    @Resultado NVARCHAR(50),
    @Detalle NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.IntentoSubidaCvCandidato (
        IdCandidato,
        IdSesionCandidato,
        IpOrigen,
        UserAgent,
        NombreOriginal,
        Extension,
        TamanoBytes,
        HashSha256,
        Resultado,
        Detalle
    )
    VALUES (
        @IdCandidato,
        @IdSesionCandidato,
        @IpOrigen,
        @UserAgent,
        @NombreOriginal,
        @Extension,
        @TamanoBytes,
        @HashSha256,
        @Resultado,
        @Detalle
    );

    SELECT CAST(SCOPE_IDENTITY() AS BIGINT) AS IdIntentoSubidaCvCandidato;
END
GO

CREATE OR ALTER PROCEDURE dbo.spCand_Cv_ContarIntentosRecientes
    @IdCandidato BIGINT,
    @SegundosVentana INT,
    @IpOrigen NVARCHAR(60) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        COUNT_BIG(1) AS TotalIntentos
    FROM dbo.IntentoSubidaCvCandidato
    WHERE FechaIntento >= DATEADD(SECOND, -ABS(@SegundosVentana), SYSDATETIME())
      AND IdCandidato = @IdCandidato;
END
GO

CREATE OR ALTER PROCEDURE dbo.spCand_Cv_ExisteHashActivo
    @IdCandidato BIGINT,
    @HashSha256 NVARCHAR(64)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (1)
        IdArchivoCandidatoCv,
        FechaCreacion,
        EstadoArchivo
    FROM dbo.ArchivoCandidatoCv
    WHERE IdCandidato = @IdCandidato
      AND HashSha256 = @HashSha256
      AND Activo = 1
      AND EstadoArchivo = N'ACTIVO'
    ORDER BY FechaCreacion DESC;
END
GO

CREATE OR ALTER PROCEDURE dbo.spCand_Cv_RegistrarArchivo
    @IdCandidato BIGINT,
    @NombreOriginal NVARCHAR(255),
    @Extension NVARCHAR(20),
    @MimeDeclarado NVARCHAR(100) = NULL,
    @MimeDetectado NVARCHAR(100),
    @TamanoBytes BIGINT,
    @HashSha256 NVARCHAR(64),
    @RutaStorage NVARCHAR(500),
    @OrigenCarga NVARCHAR(50) = N'PORTAL_CANDIDATO_WEB'
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRAN;

        UPDATE dbo.ArchivoCandidatoCv
        SET Activo = 0,
            EsCvPrincipal = 0,
            EstadoArchivo = N'HISTORICO',
            FechaDesactivacion = SYSDATETIME()
        WHERE IdCandidato = @IdCandidato
          AND Activo = 1
          AND EsCvPrincipal = 1;

        INSERT INTO dbo.ArchivoCandidatoCv (
            IdCandidato,
            NombreOriginal,
            Extension,
            MimeDeclarado,
            MimeDetectado,
            TamanoBytes,
            HashSha256,
            RutaStorage,
            OrigenCarga,
            EstadoArchivo,
            EsCvPrincipal,
            Activo
        )
        VALUES (
            @IdCandidato,
            @NombreOriginal,
            @Extension,
            @MimeDeclarado,
            @MimeDetectado,
            @TamanoBytes,
            @HashSha256,
            @RutaStorage,
            @OrigenCarga,
            N'ACTIVO',
            1,
            1
        );

        SELECT CAST(SCOPE_IDENTITY() AS BIGINT) AS IdArchivoCandidatoCv;

        COMMIT;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK;
        THROW;
    END CATCH
END
GO

CREATE OR ALTER PROCEDURE dbo.spCand_Cv_ObtenerActual
    @IdCandidato BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (1)
        IdArchivoCandidatoCv,
        NombreOriginal,
        Extension,
        MimeDetectado,
        TamanoBytes,
        EstadoArchivo,
        EsCvPrincipal,
        CONVERT(varchar(19), FechaCreacion, 120) AS FechaCreacion
    FROM dbo.ArchivoCandidatoCv
    WHERE IdCandidato = @IdCandidato
      AND Activo = 1
      AND EstadoArchivo = N'ACTIVO'
      AND EsCvPrincipal = 1
    ORDER BY FechaCreacion DESC;
END
GO

CREATE OR ALTER PROCEDURE dbo.spCand_Cv_ListarHistorial
    @IdCandidato BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        IdArchivoCandidatoCv,
        NombreOriginal,
        Extension,
        MimeDetectado,
        TamanoBytes,
        EstadoArchivo,
        EsCvPrincipal,
        CONVERT(varchar(19), FechaCreacion, 120) AS FechaCreacion,
        CONVERT(varchar(19), FechaDesactivacion, 120) AS FechaDesactivacion
    FROM dbo.ArchivoCandidatoCv
    WHERE IdCandidato = @IdCandidato
    ORDER BY FechaCreacion DESC;
END
GO
