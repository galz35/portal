CREATE OR ALTER PROCEDURE dbo.spPost_Postular
    @IdVacante INT,
    @IdPersona INT,
    @EsInterna BIT = 0,
    @FuentePostulacion NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM dbo.Postulacion
        WHERE IdVacante = @IdVacante
          AND IdPersona = @IdPersona
    )
    BEGIN
        RAISERROR('La persona ya se postulo a esta vacante.', 16, 1);
        RETURN;
    END;

    IF NOT EXISTS (
        SELECT 1
        FROM dbo.Vacante
        WHERE IdVacante = @IdVacante
          AND Activo = 1
          AND EstadoActual = 'PUBLICADA'
          AND (FechaCierre IS NULL OR FechaCierre >= CAST(SYSDATETIME() AS DATE))
    )
    BEGIN
        RAISERROR('La vacante no esta disponible para postulacion.', 16, 1);
        RETURN;
    END;

    INSERT INTO dbo.Postulacion (
        IdVacante,
        IdPersona,
        EsInterna,
        EstadoActual,
        FuentePostulacion
    )
    VALUES (
        @IdVacante,
        @IdPersona,
        @EsInterna,
        'APLICADA',
        @FuentePostulacion
    );

    SELECT SCOPE_IDENTITY() AS IdPostulacion;
END;
GO

CREATE OR ALTER PROCEDURE dbo.spPost_ListarPorPersona
    @IdPersona INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        p.IdPostulacion,
        p.IdVacante,
        v.Titulo,
        v.CodigoVacante,
        p.EstadoActual,
        p.ScoreIA,
        p.ScoreRH,
        p.ScoreJefe,
        p.FechaPostulacion
    FROM dbo.Postulacion p
    INNER JOIN dbo.Vacante v
        ON v.IdVacante = p.IdVacante
    WHERE p.IdPersona = @IdPersona
    ORDER BY p.FechaPostulacion DESC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.spPost_ListarPorVacante
    @IdVacante INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        p.IdPostulacion,
        p.IdPersona,
        p.EsInterna,
        p.EstadoActual,
        p.ScoreIA,
        p.ScoreRH,
        p.ScoreJefe,
        p.RankingFinal,
        p.FuentePostulacion,
        p.FechaPostulacion
    FROM dbo.Postulacion p
    WHERE p.IdVacante = @IdVacante
    ORDER BY p.FechaPostulacion DESC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.spPost_ObtenerDetalle
    @IdPostulacion INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (1)
        p.*,
        v.Titulo,
        v.CodigoVacante,
        v.EstadoActual AS EstadoVacante
    FROM dbo.Postulacion p
    INNER JOIN dbo.Vacante v
        ON v.IdVacante = p.IdVacante
    WHERE p.IdPostulacion = @IdPostulacion;
END;
GO

CREATE OR ALTER PROCEDURE dbo.spPost_CambiarEstado
    @IdPostulacion INT,
    @EstadoNuevo NVARCHAR(40),
    @Observacion NVARCHAR(500) = NULL,
    @IdCuentaPortal INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @EstadoAnterior NVARCHAR(40);
    SELECT @EstadoAnterior = EstadoActual
    FROM dbo.Postulacion
    WHERE IdPostulacion = @IdPostulacion;

    IF @EstadoAnterior IS NULL
    BEGIN
        RAISERROR('Postulacion no encontrada.', 16, 1);
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
        RAISERROR('Transicion de estado no permitida.', 16, 1);
        RETURN;
    END;

    UPDATE dbo.Postulacion
    SET EstadoActual = @EstadoNuevo,
        RetiradaPorCandidato = CASE WHEN @EstadoNuevo = 'RETIRADA_CANDIDATO' THEN 1 ELSE RetiradaPorCandidato END,
        FechaModificacion = SYSDATETIME()
    WHERE IdPostulacion = @IdPostulacion;

    INSERT INTO dbo.PostulacionEstadoHistorial (
        IdPostulacion, EstadoAnterior, EstadoNuevo, Observacion, IdCuentaPortal
    )
    VALUES (
        @IdPostulacion, @EstadoAnterior, @EstadoNuevo, @Observacion, @IdCuentaPortal
    );
END;
GO

CREATE OR ALTER PROCEDURE dbo.spPost_GuardarScoreIA
    @IdPostulacion INT,
    @ScoreIA DECIMAL(5,2)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Postulacion
    SET ScoreIA = @ScoreIA,
        FechaModificacion = SYSDATETIME()
    WHERE IdPostulacion = @IdPostulacion;
END;
GO

CREATE OR ALTER PROCEDURE dbo.spPost_GuardarScoreRH
    @IdPostulacion INT,
    @ScoreRH DECIMAL(5,2)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Postulacion
    SET ScoreRH = @ScoreRH,
        FechaModificacion = SYSDATETIME()
    WHERE IdPostulacion = @IdPostulacion;
END;
GO

CREATE OR ALTER PROCEDURE dbo.spPost_GuardarScoreJefe
    @IdPostulacion INT,
    @ScoreJefe DECIMAL(5,2)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Postulacion
    SET ScoreJefe = @ScoreJefe,
        FechaModificacion = SYSDATETIME()
    WHERE IdPostulacion = @IdPostulacion;
END;
GO
