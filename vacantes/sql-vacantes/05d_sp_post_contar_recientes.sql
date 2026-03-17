USE PortalVacantes;
GO

IF OBJECT_ID('dbo.spPost_ContarRecientesPorPersona', 'P') IS NOT NULL
    DROP PROCEDURE dbo.spPost_ContarRecientesPorPersona;
GO

CREATE PROCEDURE dbo.spPost_ContarRecientesPorPersona
    @IdPersona INT,
    @VentanaSegundos INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT COUNT(*) AS Total
    FROM dbo.Postulacion
    WHERE IdPersona = @IdPersona
      AND Activo = 1
      AND FechaPostulacion >= DATEADD(SECOND, -@VentanaSegundos, SYSDATETIME());
END;
GO
