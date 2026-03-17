USE PortalVacantes;
GO

IF OBJECT_ID('dbo.spDesc_ListarDescriptores', 'P') IS NOT NULL
    DROP PROCEDURE dbo.spDesc_ListarDescriptores;
GO

CREATE PROCEDURE dbo.spDesc_ListarDescriptores
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        IdDescriptorPuesto, 
        IdPuesto, 
        TituloPuesto,
        TRY_CONVERT(int, VersionDescriptor) AS VersionDescriptorNumero,
        ObjetivoPuesto, 
        FechaVigenciaDesde, 
        Activo
    FROM 
        dbo.DescriptorPuesto
    ORDER BY 
        FechaVigenciaDesde DESC, 
        IdDescriptorPuesto DESC;
END;
GO
