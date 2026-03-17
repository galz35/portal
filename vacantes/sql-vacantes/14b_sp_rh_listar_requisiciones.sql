USE PortalVacantes;
GO

IF OBJECT_ID('dbo.spReq_RH_ListarRequisiciones', 'P') IS NOT NULL
    DROP PROCEDURE dbo.spReq_RH_ListarRequisiciones;
GO

CREATE PROCEDURE dbo.spReq_RH_ListarRequisiciones
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        IdRequisicionPersonal, 
        CodigoRequisicion, 
        IdPuesto, 
        TipoNecesidad, 
        Area, 
        Prioridad,
        EstadoRequisicion, 
        FechaSolicitud, 
        FechaLimiteRegularizacion, 
        PermitePublicacionSinCompletar
    FROM 
        dbo.RequisicionPersonal
    ORDER BY 
        FechaSolicitud DESC;
END;
GO
