USE PortalVacantes;
GO

IF OBJECT_ID('dbo.spRep_ObservabilidadVacantes', 'P') IS NOT NULL
    DROP PROCEDURE dbo.spRep_ObservabilidadVacantes;
GO
CREATE PROCEDURE dbo.spRep_ObservabilidadVacantes
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        SUM(CASE WHEN Activo = 1 AND EsPublica = 1 AND EstadoActual LIKE 'PUBLICADA%' THEN 1 ELSE 0 END) AS VacantesPublicas,
        SUM(CASE WHEN Activo = 1 THEN 1 ELSE 0 END) AS VacantesActivas
    FROM dbo.Vacante;
END;
GO

IF OBJECT_ID('dbo.spRep_ObservabilidadPostulaciones', 'P') IS NOT NULL
    DROP PROCEDURE dbo.spRep_ObservabilidadPostulaciones;
GO
CREATE PROCEDURE dbo.spRep_ObservabilidadPostulaciones
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        (SELECT COUNT_BIG(1) FROM dbo.Postulacion WHERE Activo = 1) AS PostulacionesInternas,
        (SELECT COUNT_BIG(1) FROM dbo.PostulacionCandidatoExterno WHERE Activo = 1) AS PostulacionesExternas,
        (SELECT COUNT_BIG(1) FROM dbo.ArchivoCandidatoCv WHERE Activo = 1 AND EstadoArchivo = N'ACTIVO' AND EsCvPrincipal = 1) AS CvsActivos,
        (SELECT COUNT_BIG(1) FROM dbo.IntentoSubidaCvCandidato WHERE FechaIntento >= DATEADD(HOUR, -24, SYSDATETIME()) AND Resultado <> N'EXITOSO') AS IntentosCvRechazados24h,
        (SELECT COUNT_BIG(1) FROM dbo.IntentoOperacionCandidato WHERE FechaIntento >= DATEADD(HOUR, -24, SYSDATETIME()) AND Resultado <> N'EXITOSO') AS IntentosOperacionFallidos24h,
        (SELECT COUNT_BIG(1) FROM dbo.AnalisisCvIa WHERE FechaAnalisis >= DATEADD(HOUR, -24, SYSDATETIME()) AND FueExitoso = 0) AS AnalisisIaFallidos24h;
END;
GO
