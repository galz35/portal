USE PortalVacantes;
GO

IF OBJECT_ID('dbo.spCand_ObtenerPerfil', 'P') IS NOT NULL
    DROP PROCEDURE dbo.spCand_ObtenerPerfil;
GO

CREATE PROCEDURE dbo.spCand_ObtenerPerfil
    @IdCandidato BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (1) 
        IdCandidato, 
        Correo, 
        Nombres, 
        Apellidos, 
        Telefono, 
        CONVERT(varchar(19), FechaRegistro, 120) AS FechaRegistro
    FROM 
        dbo.CandidatoExterno
    WHERE 
        IdCandidato = @IdCandidato
        AND Activo = 1;
END;
GO
