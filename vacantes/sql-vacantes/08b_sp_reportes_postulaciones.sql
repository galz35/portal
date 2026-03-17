USE PortalVacantes;
GO

IF OBJECT_ID('dbo.spRep_PostulacionesResumen', 'P') IS NOT NULL
    DROP PROCEDURE dbo.spRep_PostulacionesResumen;
GO
CREATE PROCEDURE dbo.spRep_PostulacionesResumen
AS
BEGIN
    SET NOCOUNT ON;

    SELECT COUNT(*) AS TotalPostulaciones,
           SUM(CASE WHEN TipoPostulacion = 'INTERNA' THEN 1 ELSE 0 END) AS Internas,
           SUM(CASE WHEN TipoPostulacion = 'EXTERNA' THEN 1 ELSE 0 END) AS Externas
    FROM (
        SELECT CASE WHEN EsInterna = 1 THEN 'INTERNA' ELSE 'EXTERNA' END AS TipoPostulacion
        FROM dbo.Postulacion
        WHERE Activo = 1

        UNION ALL

        SELECT 'EXTERNA' AS TipoPostulacion
        FROM dbo.PostulacionCandidatoExterno
        WHERE Activo = 1
    ) x;
END;
GO

IF OBJECT_ID('dbo.spRep_PostulacionesPorPais', 'P') IS NOT NULL
    DROP PROCEDURE dbo.spRep_PostulacionesPorPais;
GO
CREATE PROCEDURE dbo.spRep_PostulacionesPorPais
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        v.CodigoPais,
        COUNT(*) AS TotalPostulaciones
    FROM (
        SELECT IdVacante
        FROM dbo.Postulacion
        WHERE Activo = 1

        UNION ALL

        SELECT IdVacante
        FROM dbo.PostulacionCandidatoExterno
        WHERE Activo = 1
    ) p
    INNER JOIN dbo.Vacante v ON v.IdVacante = p.IdVacante
    GROUP BY v.CodigoPais
    ORDER BY v.CodigoPais;
END;
GO
