USE PortalVacantes;
GO

IF COL_LENGTH('dbo.CandidatoExterno', 'DepartamentoResidencia') IS NULL
BEGIN
    ALTER TABLE dbo.CandidatoExterno
        ADD DepartamentoResidencia NVARCHAR(100) NULL;
END
GO

IF COL_LENGTH('dbo.CandidatoExterno', 'MunicipioResidencia') IS NULL
BEGIN
    ALTER TABLE dbo.CandidatoExterno
        ADD MunicipioResidencia NVARCHAR(100) NULL;
END
GO

IF COL_LENGTH('dbo.CandidatoExterno', 'CategoriaInteres') IS NULL
BEGIN
    ALTER TABLE dbo.CandidatoExterno
        ADD CategoriaInteres NVARCHAR(80) NULL;
END
GO

IF COL_LENGTH('dbo.CandidatoExterno', 'ModalidadPreferida') IS NULL
BEGIN
    ALTER TABLE dbo.CandidatoExterno
        ADD ModalidadPreferida NVARCHAR(40) NULL;
END
GO

IF COL_LENGTH('dbo.CandidatoExterno', 'NivelAcademico') IS NULL
BEGIN
    ALTER TABLE dbo.CandidatoExterno
        ADD NivelAcademico NVARCHAR(80) NULL;
END
GO

IF COL_LENGTH('dbo.CandidatoExterno', 'LinkedinUrl') IS NULL
BEGIN
    ALTER TABLE dbo.CandidatoExterno
        ADD LinkedinUrl NVARCHAR(255) NULL;
END
GO

IF COL_LENGTH('dbo.CandidatoExterno', 'ResumenProfesional') IS NULL
BEGIN
    ALTER TABLE dbo.CandidatoExterno
        ADD ResumenProfesional NVARCHAR(1200) NULL;
END
GO

IF COL_LENGTH('dbo.CandidatoExterno', 'DisponibilidadViajar') IS NULL
BEGIN
    ALTER TABLE dbo.CandidatoExterno
        ADD DisponibilidadViajar BIT NOT NULL
            CONSTRAINT DF_CandidatoExterno_DisponibilidadViajar DEFAULT 0 WITH VALUES;
END
GO

IF COL_LENGTH('dbo.CandidatoExterno', 'DisponibilidadHorarioRotativo') IS NULL
BEGIN
    ALTER TABLE dbo.CandidatoExterno
        ADD DisponibilidadHorarioRotativo BIT NOT NULL
            CONSTRAINT DF_CandidatoExterno_DisponibilidadHorarioRotativo DEFAULT 0 WITH VALUES;
END
GO

IF COL_LENGTH('dbo.CandidatoExterno', 'TieneLicenciaConducir') IS NULL
BEGIN
    ALTER TABLE dbo.CandidatoExterno
        ADD TieneLicenciaConducir BIT NOT NULL
            CONSTRAINT DF_CandidatoExterno_TieneLicenciaConducir DEFAULT 0 WITH VALUES;
END
GO

IF COL_LENGTH('dbo.CandidatoExterno', 'TipoLicencia') IS NULL
BEGIN
    ALTER TABLE dbo.CandidatoExterno
        ADD TipoLicencia NVARCHAR(40) NULL;
END
GO

IF COL_LENGTH('dbo.CandidatoExterno', 'TieneVehiculoPropio') IS NULL
BEGIN
    ALTER TABLE dbo.CandidatoExterno
        ADD TieneVehiculoPropio BIT NOT NULL
            CONSTRAINT DF_CandidatoExterno_TieneVehiculoPropio DEFAULT 0 WITH VALUES;
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE object_id = OBJECT_ID('dbo.CandidatoExterno')
      AND name = 'IX_CandidatoExterno_PerfilBusqueda'
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_CandidatoExterno_PerfilBusqueda
        ON dbo.CandidatoExterno (
            CategoriaInteres,
            DepartamentoResidencia,
            TieneLicenciaConducir,
            TieneVehiculoPropio
        )
        INCLUDE (
            MunicipioResidencia,
            ModalidadPreferida,
            NivelAcademico,
            DisponibilidadViajar,
            DisponibilidadHorarioRotativo
        );
END
GO

CREATE OR ALTER PROCEDURE dbo.spCand_ObtenerPerfil
    @IdCandidato BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (1)
        IdCandidato,
        Correo,
        Nombres,
        Apellidos,
        Telefono,
        DepartamentoResidencia,
        MunicipioResidencia,
        CategoriaInteres,
        ModalidadPreferida,
        NivelAcademico,
        LinkedinUrl,
        ResumenProfesional,
        DisponibilidadViajar,
        DisponibilidadHorarioRotativo,
        TieneLicenciaConducir,
        TipoLicencia,
        TieneVehiculoPropio,
        CONVERT(varchar(19), FechaRegistro, 120) AS FechaRegistro
    FROM dbo.CandidatoExterno
    WHERE IdCandidato = @IdCandidato
      AND Activo = 1;
END
GO

CREATE OR ALTER PROCEDURE dbo.spCand_Me
    @IdCandidato BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    EXEC dbo.spCand_ObtenerPerfil @IdCandidato = @IdCandidato;
END
GO

CREATE OR ALTER PROCEDURE dbo.spCand_ActualizarPerfil
    @IdCandidato BIGINT,
    @Nombres NVARCHAR(100),
    @Apellidos NVARCHAR(100),
    @Telefono NVARCHAR(50) = NULL,
    @DepartamentoResidencia NVARCHAR(100) = NULL,
    @MunicipioResidencia NVARCHAR(100) = NULL,
    @CategoriaInteres NVARCHAR(80) = NULL,
    @ModalidadPreferida NVARCHAR(40) = NULL,
    @NivelAcademico NVARCHAR(80) = NULL,
    @LinkedinUrl NVARCHAR(255) = NULL,
    @ResumenProfesional NVARCHAR(1200) = NULL,
    @DisponibilidadViajar BIT = 0,
    @DisponibilidadHorarioRotativo BIT = 0,
    @TieneLicenciaConducir BIT = 0,
    @TipoLicencia NVARCHAR(40) = NULL,
    @TieneVehiculoPropio BIT = 0
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.CandidatoExterno
    SET Nombres = @Nombres,
        Apellidos = @Apellidos,
        Telefono = @Telefono,
        DepartamentoResidencia = @DepartamentoResidencia,
        MunicipioResidencia = @MunicipioResidencia,
        CategoriaInteres = @CategoriaInteres,
        ModalidadPreferida = @ModalidadPreferida,
        NivelAcademico = @NivelAcademico,
        LinkedinUrl = @LinkedinUrl,
        ResumenProfesional = @ResumenProfesional,
        DisponibilidadViajar = ISNULL(@DisponibilidadViajar, 0),
        DisponibilidadHorarioRotativo = ISNULL(@DisponibilidadHorarioRotativo, 0),
        TieneLicenciaConducir = ISNULL(@TieneLicenciaConducir, 0),
        TipoLicencia = CASE WHEN ISNULL(@TieneLicenciaConducir, 0) = 1 THEN @TipoLicencia ELSE NULL END,
        TieneVehiculoPropio = ISNULL(@TieneVehiculoPropio, 0)
    WHERE IdCandidato = @IdCandidato
      AND Activo = 1;

    SELECT @@ROWCOUNT AS RegistrosAfectados;
END
GO

CREATE OR ALTER PROCEDURE dbo.spPost_RH_DetalleExterno
    @IdPostulacion BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (1)
        p.IdPostulacionCandidato AS IdPostulacion,
        p.IdVacante,
        p.IdCandidato,
        v.Titulo,
        v.CodigoVacante,
        v.CodigoPais,
        v.Modalidad,
        v.TipoVacante,
        p.EstadoActual,
        CAST(ISNULL(p.ScoreIA, 0) AS float) AS ScoreIA,
        CAST(ISNULL(p.ScoreRH, 0) AS float) AS ScoreRH,
        CAST(ISNULL(p.ScoreJefe, 0) AS float) AS ScoreJefe,
        CONVERT(varchar(19), p.FechaPostulacion, 120) AS FechaPostulacion,
        c.Correo,
        c.Nombres,
        c.Apellidos,
        c.Telefono,
        c.DepartamentoResidencia,
        c.MunicipioResidencia,
        c.CategoriaInteres,
        c.ModalidadPreferida,
        c.NivelAcademico,
        c.LinkedinUrl,
        c.ResumenProfesional,
        c.DisponibilidadViajar,
        c.DisponibilidadHorarioRotativo,
        c.TieneLicenciaConducir,
        c.TipoLicencia,
        c.TieneVehiculoPropio,
        CONVERT(varchar(19), c.FechaRegistro, 120) AS FechaRegistro
    FROM dbo.PostulacionCandidatoExterno p
    INNER JOIN dbo.Vacante v ON v.IdVacante = p.IdVacante
    INNER JOIN dbo.CandidatoExterno c ON c.IdCandidato = p.IdCandidato
    WHERE p.IdPostulacionCandidato = @IdPostulacion
      AND p.Activo = 1;
END
GO
