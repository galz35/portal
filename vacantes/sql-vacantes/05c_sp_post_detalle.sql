USE PortalVacantes;
GO

IF OBJECT_ID('dbo.spPost_RH_DetalleInterno', 'P') IS NOT NULL
    DROP PROCEDURE dbo.spPost_RH_DetalleInterno;
GO
CREATE PROCEDURE dbo.spPost_RH_DetalleInterno
    @IdPostulacion BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (1)
        CAST(p.IdPostulacion AS bigint) AS IdPostulacion,
        p.IdVacante,
        p.IdPersona,
        v.Titulo,
        v.CodigoVacante,
        v.CodigoPais,
        v.Modalidad,
        v.TipoVacante,
        p.EstadoActual,
        CAST(ISNULL(p.ScoreIA, 0) AS float) AS ScoreIA,
        CAST(ISNULL(p.ScoreRH, 0) AS float) AS ScoreRH,
        CAST(ISNULL(p.ScoreJefe, 0) AS float) AS ScoreJefe,
        CONVERT(varchar(19), p.FechaPostulacion, 120) AS FechaPostulacion
    FROM dbo.Postulacion p
    INNER JOIN dbo.Vacante v ON v.IdVacante = p.IdVacante
    WHERE p.IdPostulacion = @IdPostulacion
      AND p.Activo = 1;
END;
GO

IF OBJECT_ID('dbo.spPost_RH_DetalleExterno', 'P') IS NOT NULL
    DROP PROCEDURE dbo.spPost_RH_DetalleExterno;
GO
CREATE PROCEDURE dbo.spPost_RH_DetalleExterno
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
        CONVERT(varchar(19), c.FechaRegistro, 120) AS FechaRegistro
    FROM dbo.PostulacionCandidatoExterno p
    INNER JOIN dbo.Vacante v ON v.IdVacante = p.IdVacante
    INNER JOIN dbo.CandidatoExterno c ON c.IdCandidato = p.IdCandidato
    WHERE p.IdPostulacionCandidato = @IdPostulacion
      AND p.Activo = 1;
END;
GO
