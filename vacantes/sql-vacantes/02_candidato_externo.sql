-- =========================================================
-- Tablas para Candidato Externo
-- Base de Datos: PortalVacantes
-- =========================================================

IF OBJECT_ID('dbo.CandidatoExterno', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.CandidatoExterno (
        IdCandidato BIGINT IDENTITY(1,1) CONSTRAINT PK_CandidatoExterno PRIMARY KEY,
        Correo NVARCHAR(255) CONSTRAINT UQ_CandidatoExterno_Correo UNIQUE NOT NULL,
        Nombres NVARCHAR(100) NOT NULL,
        Apellidos NVARCHAR(100) NOT NULL,
        Telefono NVARCHAR(50) NULL,
        FechaRegistro DATETIME2 NOT NULL CONSTRAINT DF_Candidato_FechaRegistro DEFAULT SYSDATETIME(),
        Activo BIT NOT NULL CONSTRAINT DF_Candidato_Activo DEFAULT 1
    );
END
GO

IF OBJECT_ID('dbo.CredencialCandidato', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.CredencialCandidato (
        IdCredencial BIGINT IDENTITY(1,1) CONSTRAINT PK_CredencialCandidato PRIMARY KEY,
        IdCandidato BIGINT NOT NULL CONSTRAINT FK_CredencialCandidato_Candidato FOREIGN KEY REFERENCES dbo.CandidatoExterno(IdCandidato),
        PasswordHash NVARCHAR(255) NOT NULL,
        FechaActualizacion DATETIME2 NOT NULL CONSTRAINT DF_Credencial_FechaActualizacion DEFAULT SYSDATETIME()
    );
END
GO

IF OBJECT_ID('dbo.SesionCandidato', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.SesionCandidato (
        IdSesionCandidato BIGINT IDENTITY(1,1) CONSTRAINT PK_SesionCandidato PRIMARY KEY,
        IdCandidato BIGINT NOT NULL CONSTRAINT FK_SesionCandidato_Candidato FOREIGN KEY REFERENCES dbo.CandidatoExterno(IdCandidato),
        SidHash NVARCHAR(128) NOT NULL,
        EstadoSesion VARCHAR(30) NOT NULL, -- 'ACTIVA', 'REVOCADA', 'EXPIRADA'
        IpCreacion NVARCHAR(60) NULL,
        UserAgent NVARCHAR(500) NULL,
        FechaCreacion DATETIME2 NOT NULL CONSTRAINT DF_SesionCand_FechaCreacion DEFAULT SYSDATETIME(),
        FechaUltimaActividad DATETIME2 NULL,
        FechaExpiracion DATETIME2 NOT NULL,
        FechaRevocacion DATETIME2 NULL
    );

    CREATE NONCLUSTERED INDEX IX_SesionCandidato_SidHash_Activa 
    ON dbo.SesionCandidato (SidHash, EstadoSesion, FechaExpiracion DESC);
END
GO

IF OBJECT_ID('dbo.CsrfCandidato', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.CsrfCandidato (
        IdCsrf BIGINT IDENTITY(1,1) CONSTRAINT PK_CsrfCandidato PRIMARY KEY,
        IdSesionCandidato BIGINT NOT NULL CONSTRAINT FK_CsrfCandidato_Sesion FOREIGN KEY REFERENCES dbo.SesionCandidato(IdSesionCandidato),
        TokenHash NVARCHAR(128) NOT NULL,
        FechaCreacion DATETIME2 NOT NULL CONSTRAINT DF_CsrfCand_FechaCreacion DEFAULT SYSDATETIME(),
        FechaExpiracion DATETIME2 NOT NULL,
        Revocado BIT NOT NULL CONSTRAINT DF_CsrfCand_Revocado DEFAULT 0
    );

    CREATE NONCLUSTERED INDEX IX_CsrfCand_IdSesionCandidato_Activo 
    ON dbo.CsrfCandidato (IdSesionCandidato, Revocado);
END
GO

-- =========================================================
-- SPs para Candidato Externo
-- =========================================================

CREATE OR ALTER PROCEDURE dbo.spCand_Registrar
    @Correo NVARCHAR(255),
    @Nombres NVARCHAR(100),
    @Apellidos NVARCHAR(100),
    @PasswordHash NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRAN;

        IF EXISTS (SELECT 1 FROM dbo.CandidatoExterno WHERE Correo = @Correo)
        BEGIN
            RAISERROR('El correo ya esta registrado.', 16, 1);
            ROLLBACK TRAN;
            RETURN;
        END

        DECLARE @IdCandidato BIGINT;

        INSERT INTO dbo.CandidatoExterno (Correo, Nombres, Apellidos, Activo)
        VALUES (@Correo, @Nombres, @Apellidos, 1);

        SET @IdCandidato = SCOPE_IDENTITY();

        INSERT INTO dbo.CredencialCandidato (IdCandidato, PasswordHash)
        VALUES (@IdCandidato, @PasswordHash);

        SELECT @IdCandidato AS IdCandidato;

        COMMIT;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        THROW;
    END CATCH
END
GO

CREATE OR ALTER PROCEDURE dbo.spCand_VerificarCredencial
    @Correo NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 1
        c.IdCandidato,
        c.Correo,
        c.Nombres,
        c.Apellidos,
        cr.PasswordHash,
        c.Activo
    FROM dbo.CandidatoExterno c
    INNER JOIN dbo.CredencialCandidato cr ON c.IdCandidato = cr.IdCandidato
    WHERE c.Correo = @Correo AND c.Activo = 1
    ORDER BY cr.FechaActualizacion DESC;
END
GO

CREATE OR ALTER PROCEDURE dbo.spCand_Sesion_Crear
    @IdCandidato BIGINT,
    @SidHash NVARCHAR(128),
    @IpCreacion NVARCHAR(60) = NULL,
    @UserAgent NVARCHAR(300) = NULL,
    @FechaExpiracion DATETIME2
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.SesionCandidato (
        IdCandidato,
        SidHash,
        EstadoSesion,
        IpCreacion,
        UserAgent,
        FechaUltimaActividad,
        FechaExpiracion
    )
    VALUES (
        @IdCandidato,
        @SidHash,
        'ACTIVA',
        @IpCreacion,
        @UserAgent,
        SYSDATETIME(),
        @FechaExpiracion
    );

    SELECT SCOPE_IDENTITY() AS IdSesionCandidato;
END
GO

CREATE OR ALTER PROCEDURE dbo.spCand_Sesion_Validar
    @SidHash NVARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 1
        IdSesionCandidato,
        IdCandidato,
        EstadoSesion,
        FechaCreacion,
        FechaExpiracion
    FROM dbo.SesionCandidato
    WHERE SidHash = @SidHash
      AND EstadoSesion = 'ACTIVA'
      AND FechaExpiracion > SYSDATETIME()
    ORDER BY FechaCreacion DESC;
END
GO

CREATE OR ALTER PROCEDURE dbo.spCand_Csrf_Crear
    @IdSesionCandidato BIGINT,
    @TokenHash NVARCHAR(128),
    @FechaExpiracion DATETIME2
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.CsrfCandidato (IdSesionCandidato, TokenHash, FechaExpiracion)
    VALUES (@IdSesionCandidato, @TokenHash, @FechaExpiracion);

    SELECT SCOPE_IDENTITY() AS IdCsrf;
END
GO

CREATE OR ALTER PROCEDURE dbo.spCand_Csrf_Validar
    @IdSesionCandidato BIGINT,
    @TokenHash NVARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 1 IdCsrf, Revocado, FechaExpiracion
    FROM dbo.CsrfCandidato
    WHERE IdSesionCandidato = @IdSesionCandidato
      AND TokenHash = @TokenHash
      AND Revocado = 0
    ORDER BY FechaCreacion DESC;
END
GO

CREATE OR ALTER PROCEDURE dbo.spCand_Csrf_RevocarPorSesion
    @IdSesionCandidato BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.CsrfCandidato
    SET Revocado = 1
    WHERE IdSesionCandidato = @IdSesionCandidato AND Revocado = 0;
END
GO

CREATE OR ALTER PROCEDURE dbo.spCand_Sesion_Revocar
    @IdSesionCandidato BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.SesionCandidato
    SET EstadoSesion = 'REVOCADA', FechaRevocacion = SYSDATETIME()
    WHERE IdSesionCandidato = @IdSesionCandidato;
END
GO

CREATE OR ALTER PROCEDURE dbo.spCand_Me
    @IdCandidato BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        IdCandidato,
        Correo,
        Nombres,
        Apellidos,
        FechaRegistro
    FROM dbo.CandidatoExterno
    WHERE IdCandidato = @IdCandidato AND Activo = 1;
END
GO
