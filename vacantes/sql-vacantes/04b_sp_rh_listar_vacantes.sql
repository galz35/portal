USE PortalVacantes;
GO

IF OBJECT_ID('dbo.spVac_RH_ListarVacantes', 'P') IS NOT NULL
    DROP PROCEDURE dbo.spVac_RH_ListarVacantes;
GO

CREATE PROCEDURE dbo.spVac_RH_ListarVacantes
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        IdVacante, 
        CodigoVacante, 
        Titulo, 
        EstadoActual
    FROM 
        dbo.Vacante
    WHERE 
        Activo = 1
    ORDER BY 
        FechaCreacion DESC;
END;
GO
