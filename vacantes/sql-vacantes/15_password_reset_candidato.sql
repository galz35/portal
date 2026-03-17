-- =========================================================
-- Sistema de Recuperación de Contraseña para Candidatos
-- =========================================================

IF OBJECT_ID('dbo.CandidatoPasswordReset', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.CandidatoPasswordReset (
        IdReset BIGINT IDENTITY(1,1) CONSTRAINT PK_CandidatoPasswordReset PRIMARY KEY,
        IdCandidato BIGINT NOT NULL CONSTRAINT FK_PasswordReset_Candidato FOREIGN KEY REFERENCES dbo.CandidatoExterno(IdCandidato),
        TokenResetHash NVARCHAR(128) NOT NULL,
        FechaExpiracion DATETIME2 NOT NULL,
        Usado BIT NOT NULL CONSTRAINT DF_PasswordReset_Usado DEFAULT 0,
        FechaCreacion DATETIME2 NOT NULL CONSTRAINT DF_PasswordReset_FechaCreacion DEFAULT SYSDATETIME(),
        IpSolicitud NVARCHAR(60) NULL
    );

    CREATE NONCLUSTERED INDEX IX_PasswordReset_TokenHash_Activo 
    ON dbo.CandidatoPasswordReset (TokenResetHash, Usado, FechaExpiracion DESC);
END
GO

-- 1. Solicitar Reset
CREATE OR ALTER PROCEDURE dbo.spCand_PasswordReset_Solicitar
    @Correo NVARCHAR(255),
    @TokenHash NVARCHAR(128),
    @IpSolicitud NVARCHAR(60) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @IdCandidato BIGINT;
    SELECT @IdCandidato = IdCandidato FROM dbo.CandidatoExterno WHERE Correo = @Correo AND Activo = 1;

    IF @IdCandidato IS NULL
    BEGIN
        -- No revelamos si el correo existe por seguridad, pero el backend lo sabrá por el resultado
        SELECT 0 AS Ok, 'Correo no encontrado' AS Msg;
        RETURN;
    END

    -- Invalidar tokens anteriores
    UPDATE dbo.CandidatoPasswordReset SET Usado = 1 WHERE IdCandidato = @IdCandidato AND Usado = 0;

    -- Insertar nuevo token (válido por 1 hora)
    INSERT INTO dbo.CandidatoPasswordReset (IdCandidato, TokenResetHash, FechaExpiracion, IpSolicitud)
    VALUES (@IdCandidato, @TokenHash, DATEADD(HOUR, 1, SYSDATETIME()), @IpSolicitud);

    SELECT 1 AS Ok, @IdCandidato AS IdCandidato, Nombres, Apellidos FROM dbo.CandidatoExterno WHERE IdCandidato = @IdCandidato;
END
GO

-- 2. Validar Token
CREATE OR ALTER PROCEDURE dbo.spCand_PasswordReset_Validar
    @TokenHash NVARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 1 
        IdReset,
        IdCandidato,
        FechaExpiracion
    FROM dbo.CandidatoPasswordReset
    WHERE TokenResetHash = @TokenHash 
      AND Usado = 0 
      AND FechaExpiracion > SYSDATETIME()
    ORDER BY FechaCreacion DESC;
END
GO

-- 3. Completar Reset
CREATE OR ALTER PROCEDURE dbo.spCand_PasswordReset_Completar
    @TokenHash NVARCHAR(128),
    @NewPasswordHash NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @IdCandidato BIGINT;
    DECLARE @IdReset BIGINT;

    SELECT TOP 1 
        @IdCandidato = IdCandidato,
        @IdReset = IdReset
    FROM dbo.CandidatoPasswordReset
    WHERE TokenResetHash = @TokenHash 
      AND Usado = 0 
      AND FechaExpiracion > SYSDATETIME();

    IF @IdCandidato IS NULL
    BEGIN
        RAISERROR('Token invallido o expirado.', 16, 1);
        RETURN;
    END

    BEGIN TRY
        BEGIN TRAN;

        -- Actualizar password
        UPDATE dbo.CredencialCandidato
        SET PasswordHash = @NewPasswordHash, FechaActualizacion = SYSDATETIME()
        WHERE IdCandidato = @IdCandidato;

        -- Marcar token como usado
        UPDATE dbo.CandidatoPasswordReset
        SET Usado = 1
        WHERE IdReset = @IdReset;

        COMMIT;
        SELECT 1 AS Ok;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        THROW;
    END CATCH
END
GO
