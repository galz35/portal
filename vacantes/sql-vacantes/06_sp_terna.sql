CREATE OR ALTER PROCEDURE dbo.spTerna_Crear
    @IdVacante INT,
    @IdCuentaPortalCreador INT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.Terna (IdVacante, IdCuentaPortalCreador)
    VALUES (@IdVacante, @IdCuentaPortalCreador);

    SELECT SCOPE_IDENTITY() AS IdTerna;
END;
GO

CREATE OR ALTER PROCEDURE dbo.spTerna_AgregarDetalle
    @IdTerna INT,
    @IdPostulacion INT,
    @Posicion INT,
    @Justificacion NVARCHAR(500) = NULL,
    @ScoreFinal DECIMAL(5,2) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.TernaDetalle (
        IdTerna, IdPostulacion, Posicion, Justificacion, ScoreFinal
    )
    VALUES (
        @IdTerna, @IdPostulacion, @Posicion, @Justificacion, @ScoreFinal
    );

    UPDATE dbo.Postulacion
    SET EstadoActual = 'TERNA',
        FechaModificacion = SYSDATETIME()
    WHERE IdPostulacion = @IdPostulacion;
END;
GO

CREATE OR ALTER PROCEDURE dbo.spTerna_ListarPorVacante
    @IdVacante INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        t.IdTerna,
        t.Estado,
        t.FechaCreacion,
        td.IdTernaDetalle,
        td.IdPostulacion,
        td.Posicion,
        td.Justificacion,
        td.ScoreFinal
    FROM dbo.Terna t
    LEFT JOIN dbo.TernaDetalle td
        ON td.IdTerna = t.IdTerna
    WHERE t.IdVacante = @IdVacante
    ORDER BY t.FechaCreacion DESC, td.Posicion ASC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.spTerna_Cerrar
    @IdTerna INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Terna
    SET Estado = 'CERRADA'
    WHERE IdTerna = @IdTerna;

    SELECT @@ROWCOUNT AS RegistrosAfectados;
END;
GO
