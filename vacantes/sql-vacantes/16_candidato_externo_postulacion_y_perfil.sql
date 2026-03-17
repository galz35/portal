-- =========================================================
-- Extension de candidato externo: postulacion y perfil
-- Base de Datos: PortalVacantes
-- =========================================================

IF OBJECT_ID('dbo.PostulacionCandidatoExterno', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.PostulacionCandidatoExterno (
        IdPostulacionCandidato BIGINT IDENTITY(1,1) CONSTRAINT PK_PostulacionCandidatoExterno PRIMARY KEY,
        IdVacante INT NOT NULL CONSTRAINT FK_PostCand_Vacante FOREIGN KEY REFERENCES dbo.Vacante(IdVacante),
        IdCandidato BIGINT NOT NULL CONSTRAINT FK_PostCand_Candidato FOREIGN KEY REFERENCES dbo.CandidatoExterno(IdCandidato),
        FechaPostulacion DATETIME2 NOT NULL CONSTRAINT DF_PostCand_FechaPostulacion DEFAULT SYSDATETIME(),
        EstadoActual NVARCHAR(40) NOT NULL CONSTRAINT DF_PostCand_EstadoActual DEFAULT 'APLICADA',
        ScoreIA DECIMAL(5,2) NULL,
        ScoreRH DECIMAL(5,2) NULL,
        ScoreJefe DECIMAL(5,2) NULL,
        RankingFinal INT NULL,
        FuentePostulacion NVARCHAR(50) NULL,
        MotivoRechazo NVARCHAR(500) NULL,
        RetiradaPorCandidato BIT NOT NULL CONSTRAINT DF_PostCand_Retirada DEFAULT 0,
        Activo BIT NOT NULL CONSTRAINT DF_PostCand_Activo DEFAULT 1,
        FechaCreacion DATETIME2 NOT NULL CONSTRAINT DF_PostCand_FechaCreacion DEFAULT SYSDATETIME(),
        FechaModificacion DATETIME2 NULL,
        CONSTRAINT UQ_PostCand_Vacante_Candidato UNIQUE (IdVacante, IdCandidato)
    );
END
GO

IF OBJECT_ID('dbo.PostulacionCandidatoEstadoHistorial', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.PostulacionCandidatoEstadoHistorial (
        IdPostulacionCandidatoEstadoHistorial BIGINT IDENTITY(1,1)
            CONSTRAINT PK_PostCandEstadoHistorial PRIMARY KEY,
        IdPostulacionCandidato BIGINT NOT NULL
            CONSTRAINT FK_PostCandEstadoHistorial_Postulacion FOREIGN KEY REFERENCES dbo.PostulacionCandidatoExterno(IdPostulacionCandidato),
        EstadoAnterior NVARCHAR(40) NULL,
        EstadoNuevo NVARCHAR(40) NOT NULL,
        Observacion NVARCHAR(500) NULL,
        IdCuentaPortal INT NULL,
        FechaCambio DATETIME2 NOT NULL CONSTRAINT DF_PostCandEstadoHistorial_FechaCambio DEFAULT SYSDATETIME()
    );
END
GO

IF COL_LENGTH('dbo.CandidatoExterno', 'Telefono') IS NULL
BEGIN
    ALTER TABLE dbo.CandidatoExterno ADD Telefono NVARCHAR(50) NULL;
END
GO

CREATE OR ALTER PROCEDURE dbo.spCand_Login
    @Correo NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    EXEC dbo.spCand_VerificarCredencial @Correo = @Correo;
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
        c.Telefono,
        cr.PasswordHash,
        c.Activo
    FROM dbo.CandidatoExterno c
    INNER JOIN dbo.CredencialCandidato cr ON c.IdCandidato = cr.IdCandidato
    WHERE c.Correo = @Correo
      AND c.Activo = 1
    ORDER BY cr.FechaActualizacion DESC;
END
GO

CREATE OR ALTER PROCEDURE dbo.spCand_Registrar
    @Correo NVARCHAR(255),
    @Nombres NVARCHAR(100),
    @Apellidos NVARCHAR(100),
    @Telefono NVARCHAR(50) = NULL,
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

        INSERT INTO dbo.CandidatoExterno (Correo, Nombres, Apellidos, Telefono, Activo)
        VALUES (@Correo, @Nombres, @Apellidos, @Telefono, 1);

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

CREATE OR ALTER PROCEDURE dbo.spCand_ActualizarPerfil
    @IdCandidato BIGINT,
    @Nombres NVARCHAR(100),
    @Apellidos NVARCHAR(100),
    @Telefono NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.CandidatoExterno
    SET Nombres = @Nombres,
        Apellidos = @Apellidos,
        Telefono = @Telefono
    WHERE IdCandidato = @IdCandidato
      AND Activo = 1;

    SELECT @@ROWCOUNT AS RegistrosAfectados;
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
        Telefono,
        CONVERT(varchar(19), FechaRegistro, 120) AS FechaRegistro
    FROM dbo.CandidatoExterno
    WHERE IdCandidato = @IdCandidato
      AND Activo = 1;
END
GO

CREATE OR ALTER PROCEDURE dbo.spCand_Postular
    @IdCandidato BIGINT,
    @IdVacante INT,
    @FuentePostulacion NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (
        SELECT 1
        FROM dbo.CandidatoExterno
        WHERE IdCandidato = @IdCandidato
          AND Activo = 1
    )
    BEGIN
        RAISERROR('Candidato no encontrado.', 16, 1);
        RETURN;
    END;

    IF EXISTS (
        SELECT 1
        FROM dbo.PostulacionCandidatoExterno
        WHERE IdVacante = @IdVacante
          AND IdCandidato = @IdCandidato
    )
    BEGIN
        RAISERROR('El candidato ya se postulo a esta vacante.', 16, 1);
        RETURN;
    END;

    IF NOT EXISTS (
        SELECT 1
        FROM dbo.Vacante
        WHERE IdVacante = @IdVacante
          AND Activo = 1
          AND EsPublica = 1
          AND EstadoActual = 'PUBLICADA'
          AND (FechaCierre IS NULL OR FechaCierre >= CAST(SYSDATETIME() AS DATE))
    )
    BEGIN
        RAISERROR('La vacante no esta disponible para postulacion.', 16, 1);
        RETURN;
    END;

    INSERT INTO dbo.PostulacionCandidatoExterno (
        IdVacante,
        IdCandidato,
        EstadoActual,
        FuentePostulacion
    )
    VALUES (
        @IdVacante,
        @IdCandidato,
        'APLICADA',
        COALESCE(@FuentePostulacion, 'PORTAL_CANDIDATO_WEB')
    );

    SELECT SCOPE_IDENTITY() AS IdPostulacionCandidato;
END
GO

CREATE OR ALTER PROCEDURE dbo.spCand_Postulaciones_Listar
    @IdCandidato BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        p.IdPostulacionCandidato,
        p.IdVacante,
        v.Titulo,
        v.CodigoVacante,
        p.EstadoActual,
        p.ScoreIA,
        p.ScoreRH,
        p.ScoreJefe,
        p.FechaPostulacion
    FROM dbo.PostulacionCandidatoExterno p
    INNER JOIN dbo.Vacante v ON v.IdVacante = p.IdVacante
    WHERE p.IdCandidato = @IdCandidato
      AND p.Activo = 1
    ORDER BY p.FechaPostulacion DESC;
END
GO
