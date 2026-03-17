CREATE OR ALTER PROCEDURE dbo.spListaNegra_Insertar
    @IdPersona INT,
    @Motivo NVARCHAR(500),
    @Categoria NVARCHAR(50) = NULL,
    @FechaInicio DATE,
    @FechaFin DATE = NULL,
    @Permanente BIT = 0,
    @IdCuentaPortalRegistro INT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.ListaNegra (
        IdPersona, Motivo, Categoria, FechaInicio, FechaFin, Permanente, IdCuentaPortalRegistro
    )
    VALUES (
        @IdPersona, @Motivo, @Categoria, @FechaInicio, @FechaFin, @Permanente, @IdCuentaPortalRegistro
    );

    INSERT INTO dbo.AuditoriaAcceso (
        IdCuentaPortal, Usuario, Evento, Modulo, Exitoso, Detalle
    )
    VALUES (
        @IdCuentaPortalRegistro, NULL, 'LISTA_NEGRA_ALTA', 'vacantes', 1, @Motivo
    );

    SELECT SCOPE_IDENTITY() AS IdListaNegra;
END;
GO

CREATE OR ALTER PROCEDURE dbo.spListaNegra_ConsultarPersona
    @IdPersona INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        IdListaNegra,
        IdPersona,
        Motivo,
        Categoria,
        FechaInicio,
        FechaFin,
        Permanente,
        Activo,
        FechaCreacion
    FROM dbo.ListaNegra
    WHERE IdPersona = @IdPersona
      AND Activo = 1
      AND (
            Permanente = 1
            OR FechaFin IS NULL
            OR FechaFin >= CAST(SYSDATETIME() AS DATE)
          )
    ORDER BY FechaCreacion DESC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.spListaNegra_Revocar
    @IdListaNegra INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.ListaNegra
    SET Activo = 0
    WHERE IdListaNegra = @IdListaNegra;

    SELECT @@ROWCOUNT AS RegistrosAfectados;
END;
GO
