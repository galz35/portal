-- =========================================================
-- RH sobre postulaciones de candidato externo
-- Base de Datos: PortalVacantes
-- =========================================================

CREATE OR ALTER PROCEDURE dbo.spPostCand_CambiarEstado
    @IdPostulacionCandidato BIGINT,
    @EstadoNuevo NVARCHAR(40),
    @Observacion NVARCHAR(500) = NULL,
    @IdCuentaPortal INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @EstadoAnterior NVARCHAR(40);
    SELECT @EstadoAnterior = EstadoActual
    FROM dbo.PostulacionCandidatoExterno
    WHERE IdPostulacionCandidato = @IdPostulacionCandidato;

    IF @EstadoAnterior IS NULL
    BEGIN
        RAISERROR('Postulacion externa no encontrada.', 16, 1);
        RETURN;
    END;

    IF NOT (
        (@EstadoAnterior = 'APLICADA' AND @EstadoNuevo IN ('REVISION_RH', 'RECHAZADA', 'RETIRADA_CANDIDATO', 'LISTA_NEGRA'))
        OR (@EstadoAnterior = 'REVISION_RH' AND @EstadoNuevo IN ('REVISION_JEFE', 'PRESELECCIONADA', 'RECHAZADA', 'BANCO_CV', 'LISTA_NEGRA'))
        OR (@EstadoAnterior = 'REVISION_JEFE' AND @EstadoNuevo IN ('PRESELECCIONADA', 'TERNA', 'RECHAZADA'))
        OR (@EstadoAnterior = 'PRESELECCIONADA' AND @EstadoNuevo IN ('TERNA', 'ENTREVISTA', 'RECHAZADA'))
        OR (@EstadoAnterior = 'TERNA' AND @EstadoNuevo IN ('ENTREVISTA', 'OFERTA', 'RECHAZADA'))
        OR (@EstadoAnterior = 'ENTREVISTA' AND @EstadoNuevo IN ('OFERTA', 'RECHAZADA'))
        OR (@EstadoAnterior = 'OFERTA' AND @EstadoNuevo IN ('CONTRATADO', 'RECHAZADA'))
        OR (@EstadoAnterior IN ('CONTRATADO', 'BANCO_CV', 'RECHAZADA', 'LISTA_NEGRA', 'RETIRADA_CANDIDATO') AND @EstadoNuevo = @EstadoAnterior)
    )
    BEGIN
        RAISERROR('Transicion de estado no permitida para postulacion externa.', 16, 1);
        RETURN;
    END;

    UPDATE dbo.PostulacionCandidatoExterno
    SET EstadoActual = @EstadoNuevo,
        RetiradaPorCandidato = CASE WHEN @EstadoNuevo = 'RETIRADA_CANDIDATO' THEN 1 ELSE RetiradaPorCandidato END,
        FechaModificacion = SYSDATETIME()
    WHERE IdPostulacionCandidato = @IdPostulacionCandidato;

    INSERT INTO dbo.PostulacionCandidatoEstadoHistorial (
        IdPostulacionCandidato, EstadoAnterior, EstadoNuevo, Observacion, IdCuentaPortal
    )
    VALUES (
        @IdPostulacionCandidato, @EstadoAnterior, @EstadoNuevo, @Observacion, @IdCuentaPortal
    );
END
GO
