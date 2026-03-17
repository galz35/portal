IF OBJECT_ID('dbo.IntentoOperacionCandidato', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.IntentoOperacionCandidato (
        IdIntentoOperacionCandidato BIGINT IDENTITY(1,1) CONSTRAINT PK_IntentoOperacionCandidato PRIMARY KEY,
        IdCandidato BIGINT NULL CONSTRAINT FK_IntentoOperacionCandidato_Candidato FOREIGN KEY REFERENCES dbo.CandidatoExterno(IdCandidato),
        CorreoNormalizado NVARCHAR(255) NULL,
        IpOrigen NVARCHAR(60) NULL,
        UserAgent NVARCHAR(500) NULL,
        TipoOperacion NVARCHAR(30) NOT NULL,
        Resultado NVARCHAR(50) NOT NULL,
        Detalle NVARCHAR(500) NULL,
        FechaIntento DATETIME2 NOT NULL CONSTRAINT DF_IntentoOperacionCandidato_Fecha DEFAULT SYSDATETIME()
    );

    CREATE NONCLUSTERED INDEX IX_IntentoOperacionCandidato_Correo
        ON dbo.IntentoOperacionCandidato (CorreoNormalizado, TipoOperacion, FechaIntento DESC)
        WHERE CorreoNormalizado IS NOT NULL;

    CREATE NONCLUSTERED INDEX IX_IntentoOperacionCandidato_Ip
        ON dbo.IntentoOperacionCandidato (IpOrigen, TipoOperacion, FechaIntento DESC)
        WHERE IpOrigen IS NOT NULL;

    CREATE NONCLUSTERED INDEX IX_IntentoOperacionCandidato_Candidato
        ON dbo.IntentoOperacionCandidato (IdCandidato, TipoOperacion, FechaIntento DESC)
        WHERE IdCandidato IS NOT NULL;
END
GO

CREATE OR ALTER PROCEDURE dbo.spCand_Seg_RegistrarIntento
    @IdCandidato BIGINT = NULL,
    @CorreoNormalizado NVARCHAR(255) = NULL,
    @IpOrigen NVARCHAR(60) = NULL,
    @UserAgent NVARCHAR(500) = NULL,
    @TipoOperacion NVARCHAR(30),
    @Resultado NVARCHAR(50),
    @Detalle NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.IntentoOperacionCandidato (
        IdCandidato,
        CorreoNormalizado,
        IpOrigen,
        UserAgent,
        TipoOperacion,
        Resultado,
        Detalle
    )
    VALUES (
        @IdCandidato,
        @CorreoNormalizado,
        @IpOrigen,
        @UserAgent,
        UPPER(@TipoOperacion),
        UPPER(@Resultado),
        @Detalle
    );

    SELECT CAST(SCOPE_IDENTITY() AS BIGINT) AS IdIntentoOperacionCandidato;
END
GO

CREATE OR ALTER PROCEDURE dbo.spCand_Seg_ContarIntentosRecientes
    @TipoOperacion NVARCHAR(30),
    @SegundosVentana INT,
    @IdCandidato BIGINT = NULL,
    @CorreoNormalizado NVARCHAR(255) = NULL,
    @IpOrigen NVARCHAR(60) = NULL,
    @SoloFallidos BIT = 0
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        COUNT_BIG(1) AS TotalIntentos
    FROM dbo.IntentoOperacionCandidato
    WHERE FechaIntento >= DATEADD(SECOND, -ABS(@SegundosVentana), SYSDATETIME())
      AND TipoOperacion = UPPER(@TipoOperacion)
      AND (
            (@IdCandidato IS NOT NULL AND IdCandidato = @IdCandidato)
            OR (@CorreoNormalizado IS NOT NULL AND CorreoNormalizado = @CorreoNormalizado)
            OR (@IpOrigen IS NOT NULL AND IpOrigen = @IpOrigen)
          )
      AND (
            @SoloFallidos = 0
            OR Resultado <> N'EXITOSO'
          );
END
GO
