USE PortalVacantes;
GO

IF OBJECT_ID('dbo.spPost_RH_ListarTodas', 'P') IS NOT NULL
    DROP PROCEDURE dbo.spPost_RH_ListarTodas;
GO

CREATE PROCEDURE dbo.spPost_RH_ListarTodas
AS
BEGIN
    SET NOCOUNT ON;

    SELECT *
    FROM (
        SELECT 
            CAST(p.IdPostulacion AS bigint) AS IdPostulacion, 
            p.IdVacante, 
            v.Titulo, 
            p.IdPersona, 
            CAST(NULL AS bigint) AS IdCandidato, 
            p.EsInterna, 
            p.EstadoActual, 
            CAST(ISNULL(p.ScoreIA, 0) AS float) AS ScoreIA, 
            CAST(ISNULL(p.ScoreRH, 0) AS float) AS ScoreRH, 
            v.CodigoPais, 
            CONVERT(varchar(10), p.FechaPostulacion, 23) AS FechaPostulacion, 
            CAST('EMPLEADO_INTERNO' AS nvarchar(40)) AS OrigenPostulacion, 
            CAST(CONCAT('Empleado interno #', p.IdPersona) AS nvarchar(250)) AS NombreCandidato
        FROM dbo.Postulacion p
        INNER JOIN dbo.Vacante v ON v.IdVacante = p.IdVacante
        WHERE p.Activo = 1

        UNION ALL

        SELECT 
            p.IdPostulacionCandidato AS IdPostulacion, 
            p.IdVacante, 
            v.Titulo, 
            CAST(NULL AS int) AS IdPersona, 
            p.IdCandidato, 
            CAST(0 AS bit) AS EsInterna, 
            p.EstadoActual, 
            CAST(ISNULL(p.ScoreIA, 0) AS float) AS ScoreIA, 
            CAST(ISNULL(p.ScoreRH, 0) AS float) AS ScoreRH, 
            v.CodigoPais, 
            CONVERT(varchar(10), p.FechaPostulacion, 23) AS FechaPostulacion, 
            CAST('CANDIDATO_EXTERNO' AS nvarchar(40)) AS OrigenPostulacion, 
            CAST(CONCAT(c.Nombres, ' ', c.Apellidos) AS nvarchar(250)) AS NombreCandidato
        FROM dbo.PostulacionCandidatoExterno p
        INNER JOIN dbo.Vacante v ON v.IdVacante = p.IdVacante
        INNER JOIN dbo.CandidatoExterno c ON c.IdCandidato = p.IdCandidato
        WHERE p.Activo = 1
    ) x
    ORDER BY FechaPostulacion DESC, IdPostulacion DESC;
END;
GO
