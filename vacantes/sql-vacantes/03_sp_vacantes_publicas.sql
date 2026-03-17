USE PortalVacantes;
GO

IF OBJECT_ID('dbo.spVac_ListarPublicas', 'P') IS NOT NULL
    DROP PROCEDURE dbo.spVac_ListarPublicas;
GO

CREATE PROCEDURE dbo.spVac_ListarPublicas
    @Busqueda NVARCHAR(100) = NULL,
    @Modalidad NVARCHAR(50) = NULL,
    @CodigoPais VARCHAR(10) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        IdVacante,
        CodigoVacante,
        Slug,
        Titulo,
        Ubicacion,
        CodigoPais,
        Modalidad
    FROM 
        dbo.Vacante
    WHERE 
        Activo = 1 
        AND EsPublica = 1 
        AND EstadoActual LIKE 'PUBLICADA%'
        AND (@Busqueda IS NULL OR 
             Titulo LIKE '%' + @Busqueda + '%' OR 
             Ubicacion LIKE '%' + @Busqueda + '%' OR 
             CodigoVacante LIKE '%' + @Busqueda + '%')
        AND (@Modalidad IS NULL OR @Modalidad = '' OR Modalidad = @Modalidad)
        AND (@CodigoPais IS NULL OR @CodigoPais = '' OR CodigoPais = @CodigoPais)
    ORDER BY 
        FechaPublicacion DESC, 
        FechaCreacion DESC;
END;
GO
