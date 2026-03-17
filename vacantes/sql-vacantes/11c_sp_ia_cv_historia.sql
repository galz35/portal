USE PortalVacantes;
GO

IF OBJECT_ID('dbo.spIA_ObtenerAnalisisPersonaVigente', 'P') IS NOT NULL
    DROP PROCEDURE dbo.spIA_ObtenerAnalisisPersonaVigente;
GO
CREATE PROCEDURE dbo.spIA_ObtenerAnalisisPersonaVigente
    @IdPersona INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (1)
        a.IdAnalisisCvIa,
        a.IdVacante,
        a.IdArchivoPersona,
        a.MotorIA,
        a.VersionModelo,
        a.VersionPrompt,
        a.ResumenCandidato,
        a.Fortalezas,
        a.Debilidades,
        a.Alertas,
        CAST(a.ScoreCalculado AS float) AS ScoreCalculado,
        CAST(a.ScoreHabilidades AS float) AS ScoreHabilidades,
        CAST(a.ScoreExperiencia AS float) AS ScoreExperiencia,
        CAST(a.ScoreEducacion AS float) AS ScoreEducacion,
        CAST(a.ScoreContexto AS float) AS ScoreContexto,
        a.FueExitoso,
        a.ErrorTecnico,
        a.EsVigente,
        CONVERT(varchar(19), a.FechaAnalisis, 120) AS FechaAnalisis,
        p.NombreCompletoInferido,
        p.CorreoInferido,
        p.TelefonoInferido,
        p.ExperienciaAnios,
        p.NivelAcademico,
        p.HabilidadesJson,
        p.IdiomasJson,
        p.CertificacionesJson
    FROM dbo.AnalisisCvIa a
    LEFT JOIN dbo.PerfilCvNormalizado p ON p.IdAnalisisCvIa = a.IdAnalisisCvIa
    WHERE a.IdPersona = @IdPersona
      AND a.IdVacante IS NULL
      AND a.EsVigente = 1
    ORDER BY a.FechaAnalisis DESC;
END;
GO

IF OBJECT_ID('dbo.spIA_ListarHistoriaAnalisisPersona', 'P') IS NOT NULL
    DROP PROCEDURE dbo.spIA_ListarHistoriaAnalisisPersona;
GO
CREATE PROCEDURE dbo.spIA_ListarHistoriaAnalisisPersona
    @IdPersona INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (10)
        a.IdAnalisisCvIa,
        a.IdVacante,
        a.IdArchivoPersona,
        a.MotorIA,
        a.VersionModelo,
        a.VersionPrompt,
        a.ResumenCandidato,
        a.Fortalezas,
        a.Debilidades,
        a.Alertas,
        CAST(a.ScoreCalculado AS float) AS ScoreCalculado,
        CAST(a.ScoreHabilidades AS float) AS ScoreHabilidades,
        CAST(a.ScoreExperiencia AS float) AS ScoreExperiencia,
        CAST(a.ScoreEducacion AS float) AS ScoreEducacion,
        CAST(a.ScoreContexto AS float) AS ScoreContexto,
        a.FueExitoso,
        a.ErrorTecnico,
        a.EsVigente,
        CONVERT(varchar(19), a.FechaAnalisis, 120) AS FechaAnalisis,
        p.NombreCompletoInferido,
        p.CorreoInferido,
        p.TelefonoInferido,
        p.ExperienciaAnios,
        p.NivelAcademico,
        p.HabilidadesJson,
        p.IdiomasJson,
        p.CertificacionesJson
    FROM dbo.AnalisisCvIa a
    LEFT JOIN dbo.PerfilCvNormalizado p ON p.IdAnalisisCvIa = a.IdAnalisisCvIa
    WHERE a.IdPersona = @IdPersona
      AND a.IdVacante IS NULL
    ORDER BY a.FechaAnalisis DESC;
END;
GO
