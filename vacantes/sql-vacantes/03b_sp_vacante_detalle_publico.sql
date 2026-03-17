USE PortalVacantes;
GO

IF OBJECT_ID('dbo.spVac_ObtenerDetallePorSlug', 'P') IS NOT NULL
    DROP PROCEDURE dbo.spVac_ObtenerDetallePorSlug;
GO

CREATE PROCEDURE dbo.spVac_ObtenerDetallePorSlug
    @Slug NVARCHAR(150)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (1) 
        IdVacante, 
        Slug, 
        Titulo, 
        Descripcion, 
        Requisitos, 
        CodigoPais, 
        Modalidad, 
        EstadoActual,
        TipoVacante,
        Ubicacion
    FROM 
        dbo.Vacante
    WHERE 
        Slug = @Slug
        AND Activo = 1
        AND EsPublica = 1
        AND EstadoActual LIKE 'PUBLICADA%';
END;
GO
