CREATE OR ALTER PROCEDURE dbo.spRep_VacantesResumen
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        SUM(CASE WHEN EstadoActual IN ('BORRADOR', 'PENDIENTE_APROBACION', 'APROBADA', 'PUBLICADA', 'PAUSADA') THEN 1 ELSE 0 END) AS VacantesActivas,
        SUM(CASE WHEN EstadoActual = 'OCUPADA' THEN 1 ELSE 0 END) AS VacantesOcupadas,
        SUM(CASE WHEN EstadoActual = 'CERRADA' THEN 1 ELSE 0 END) AS VacantesCerradas
    FROM dbo.Vacante
    WHERE Activo = 1;
END;
GO

CREATE OR ALTER PROCEDURE dbo.spRep_PostulacionesResumen
AS
BEGIN
    SET NOCOUNT ON;

    SELECT COUNT(*) AS TotalPostulaciones
    FROM dbo.Postulacion
    WHERE Activo = 1;

    SELECT
        EstadoActual,
        COUNT(*) AS Total
    FROM dbo.Postulacion
    WHERE Activo = 1
    GROUP BY EstadoActual
    ORDER BY EstadoActual;

    SELECT
        v.CodigoPais,
        COUNT(*) AS Total
    FROM dbo.Postulacion p
    INNER JOIN dbo.Vacante v
        ON v.IdVacante = p.IdVacante
    WHERE p.Activo = 1
    GROUP BY v.CodigoPais
    ORDER BY v.CodigoPais;
END;
GO

CREATE OR ALTER PROCEDURE dbo.spRep_TiemposProceso
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        AVG(DATEDIFF(DAY, v.FechaPublicacion, h.FechaCambio) * 1.0) AS PromedioDiasAperturaAOcupada
    FROM dbo.Vacante v
    INNER JOIN dbo.VacanteEstadoHistorial h
        ON h.IdVacante = v.IdVacante
       AND h.EstadoNuevo = 'OCUPADA'
    WHERE v.FechaPublicacion IS NOT NULL;

    SELECT
        AVG(DATEDIFF(DAY, p.FechaPostulacion, h.FechaCambio) * 1.0) AS PromedioDiasPostulacionAContratacion
    FROM dbo.Postulacion p
    INNER JOIN dbo.PostulacionEstadoHistorial h
        ON h.IdPostulacion = p.IdPostulacion
       AND h.EstadoNuevo = 'CONTRATADO';
END;
GO

CREATE OR ALTER PROCEDURE dbo.spRep_InternosVsExternos
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        CASE WHEN EsInterna = 1 THEN 'INTERNA' ELSE 'EXTERNA' END AS TipoPostulacion,
        COUNT(*) AS Total
    FROM dbo.Postulacion
    WHERE Activo = 1
    GROUP BY EsInterna;
END;
GO

CREATE OR ALTER PROCEDURE dbo.spRep_PostulacionesPorPais
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        v.CodigoPais,
        COUNT(*) AS TotalPostulaciones
    FROM dbo.Postulacion p
    INNER JOIN dbo.Vacante v
        ON v.IdVacante = p.IdVacante
    WHERE p.Activo = 1
    GROUP BY v.CodigoPais
    ORDER BY v.CodigoPais;
END;
GO
