CREATE OR ALTER PROCEDURE dbo.spVac_SuspenderPorRequisicionVencida
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Afectadas TABLE (
        IdVacante INT
    );

    UPDATE dbo.Vacante
    SET EstadoActual = 'SUSPENDIDA_REQUISICION',
        EstadoRegularizacion = 'VENCIDA',
        FechaModificacion = SYSDATETIME()
    OUTPUT inserted.IdVacante INTO @Afectadas(IdVacante)
    WHERE EsExcepcionSinRequisicion = 1
      AND EstadoActual IN ('PUBLICADA', 'APROBADA', 'PAUSADA')
      AND FechaLimiteRegularizacion IS NOT NULL
      AND FechaLimiteRegularizacion < CAST(SYSDATETIME() AS DATE);

    INSERT INTO dbo.VacanteRegularizacionHistorial (
        IdVacante, EstadoAnterior, EstadoNuevo, Motivo
    )
    SELECT
        a.IdVacante,
        NULL,
        'SUSPENDIDA_REQUISICION',
        'Suspension automatica por no procesar requisicion en tiempo'
    FROM @Afectadas a;

    SELECT COUNT(*) AS VacantesSuspendidas
    FROM @Afectadas;
END;
GO
