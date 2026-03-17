CREATE OR ALTER PROCEDURE dbo.spVac_Listar_Publicas
    @CodigoPais NVARCHAR(5) = NULL,
    @Area NVARCHAR(100) = NULL,
    @Modalidad NVARCHAR(30) = NULL,
    @Texto NVARCHAR(200) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        v.IdVacante,
        v.CodigoVacante,
        v.Slug,
        v.Titulo,
        v.Area,
        v.Modalidad,
        v.Ubicacion,
        v.CodigoPais,
        v.FechaPublicacion,
        v.FechaCierre
    FROM dbo.Vacante v
    WHERE v.Activo = 1
      AND v.EsPublica = 1
      AND v.EstadoActual = 'PUBLICADA'
      AND (@CodigoPais IS NULL OR v.CodigoPais = @CodigoPais)
      AND (@Area IS NULL OR v.Area = @Area)
      AND (@Modalidad IS NULL OR v.Modalidad = @Modalidad)
      AND (
            @Texto IS NULL
            OR v.Titulo LIKE '%' + @Texto + '%'
            OR v.Descripcion LIKE '%' + @Texto + '%'
            OR v.Requisitos LIKE '%' + @Texto + '%'
          )
    ORDER BY v.FechaPublicacion DESC, v.FechaCreacion DESC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.spVac_Obtener_Detalle
    @IdVacante INT = NULL,
    @Slug NVARCHAR(200) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (1)
        v.*
    FROM dbo.Vacante v
    WHERE (@IdVacante IS NOT NULL AND v.IdVacante = @IdVacante)
       OR (@Slug IS NOT NULL AND v.Slug = @Slug);
END;
GO

CREATE OR ALTER PROCEDURE dbo.spVac_Insertar
    @CodigoVacante NVARCHAR(30),
    @Slug NVARCHAR(200),
    @Titulo NVARCHAR(200),
    @Descripcion NVARCHAR(MAX),
    @Requisitos NVARCHAR(MAX) = NULL,
    @Area NVARCHAR(100) = NULL,
    @Gerencia NVARCHAR(100) = NULL,
    @Departamento NVARCHAR(100) = NULL,
    @TipoVacante NVARCHAR(30),
    @Modalidad NVARCHAR(30) = NULL,
    @Ubicacion NVARCHAR(150) = NULL,
    @CodigoPais NVARCHAR(5),
    @NivelExperiencia NVARCHAR(50) = NULL,
    @SalarioMin DECIMAL(18,2) = NULL,
    @SalarioMax DECIMAL(18,2) = NULL,
    @AceptaInternos BIT = 0,
    @EsPublica BIT = 1,
    @CantidadPlazas INT = 1,
    @Prioridad NVARCHAR(30) = NULL,
    @IdSolicitante INT = NULL,
    @IdResponsableRH INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.Vacante (
        CodigoVacante, Slug, Titulo, Descripcion, Requisitos, Area, Gerencia, Departamento,
        TipoVacante, Modalidad, Ubicacion, CodigoPais, NivelExperiencia, SalarioMin, SalarioMax,
        AceptaInternos, EsPublica, CantidadPlazas, EstadoActual, Prioridad, IdSolicitante, IdResponsableRH
    )
    VALUES (
        @CodigoVacante, @Slug, @Titulo, @Descripcion, @Requisitos, @Area, @Gerencia, @Departamento,
        @TipoVacante, @Modalidad, @Ubicacion, @CodigoPais, @NivelExperiencia, @SalarioMin, @SalarioMax,
        @AceptaInternos, @EsPublica, @CantidadPlazas, 'BORRADOR', @Prioridad, @IdSolicitante, @IdResponsableRH
    );

    SELECT SCOPE_IDENTITY() AS IdVacante;
END;
GO

CREATE OR ALTER PROCEDURE dbo.spVac_Actualizar
    @IdVacante INT,
    @Titulo NVARCHAR(200),
    @Descripcion NVARCHAR(MAX),
    @Requisitos NVARCHAR(MAX) = NULL,
    @Area NVARCHAR(100) = NULL,
    @Gerencia NVARCHAR(100) = NULL,
    @Departamento NVARCHAR(100) = NULL,
    @TipoVacante NVARCHAR(30),
    @Modalidad NVARCHAR(30) = NULL,
    @Ubicacion NVARCHAR(150) = NULL,
    @CodigoPais NVARCHAR(5),
    @NivelExperiencia NVARCHAR(50) = NULL,
    @SalarioMin DECIMAL(18,2) = NULL,
    @SalarioMax DECIMAL(18,2) = NULL,
    @AceptaInternos BIT = 0,
    @EsPublica BIT = 1,
    @CantidadPlazas INT = 1,
    @FechaCierre DATETIME2 = NULL,
    @Prioridad NVARCHAR(30) = NULL,
    @IdSolicitante INT = NULL,
    @IdResponsableRH INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Vacante
    SET Titulo = @Titulo,
        Descripcion = @Descripcion,
        Requisitos = @Requisitos,
        Area = @Area,
        Gerencia = @Gerencia,
        Departamento = @Departamento,
        TipoVacante = @TipoVacante,
        Modalidad = @Modalidad,
        Ubicacion = @Ubicacion,
        CodigoPais = @CodigoPais,
        NivelExperiencia = @NivelExperiencia,
        SalarioMin = @SalarioMin,
        SalarioMax = @SalarioMax,
        AceptaInternos = @AceptaInternos,
        EsPublica = @EsPublica,
        CantidadPlazas = @CantidadPlazas,
        FechaCierre = @FechaCierre,
        Prioridad = @Prioridad,
        IdSolicitante = @IdSolicitante,
        IdResponsableRH = @IdResponsableRH,
        FechaModificacion = SYSDATETIME()
    WHERE IdVacante = @IdVacante;

    SELECT @@ROWCOUNT AS RegistrosAfectados;
END;
GO

CREATE OR ALTER PROCEDURE dbo.spVac_CambiarEstado
    @IdVacante INT,
    @EstadoNuevo NVARCHAR(40),
    @Observacion NVARCHAR(500) = NULL,
    @IdCuentaPortal INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @EstadoAnterior NVARCHAR(40);
    SELECT @EstadoAnterior = EstadoActual
    FROM dbo.Vacante
    WHERE IdVacante = @IdVacante;

    IF @EstadoAnterior IS NULL
    BEGIN
        RAISERROR('Vacante no encontrada.', 16, 1);
        RETURN;
    END;

    IF NOT (
        (@EstadoAnterior = 'BORRADOR' AND @EstadoNuevo IN ('PENDIENTE_APROBACION', 'CANCELADA'))
        OR (@EstadoAnterior = 'PENDIENTE_APROBACION' AND @EstadoNuevo IN ('APROBADA', 'CANCELADA'))
        OR (@EstadoAnterior = 'APROBADA' AND @EstadoNuevo IN ('PUBLICADA', 'PAUSADA', 'CANCELADA'))
        OR (@EstadoAnterior = 'PUBLICADA' AND @EstadoNuevo IN ('PAUSADA', 'CERRADA', 'OCUPADA', 'CANCELADA'))
        OR (@EstadoAnterior = 'PAUSADA' AND @EstadoNuevo IN ('PUBLICADA', 'CERRADA', 'CANCELADA'))
        OR (@EstadoAnterior IN ('CERRADA', 'CANCELADA', 'OCUPADA') AND @EstadoNuevo = @EstadoAnterior)
    )
    BEGIN
        RAISERROR('Transicion de estado no permitida.', 16, 1);
        RETURN;
    END;

    UPDATE dbo.Vacante
    SET EstadoActual = @EstadoNuevo,
        FechaPublicacion = CASE WHEN @EstadoNuevo = 'PUBLICADA' AND FechaPublicacion IS NULL THEN SYSDATETIME() ELSE FechaPublicacion END,
        FechaModificacion = SYSDATETIME()
    WHERE IdVacante = @IdVacante;

    INSERT INTO dbo.VacanteEstadoHistorial (
        IdVacante, EstadoAnterior, EstadoNuevo, Observacion, IdCuentaPortal
    )
    VALUES (
        @IdVacante, @EstadoAnterior, @EstadoNuevo, @Observacion, @IdCuentaPortal
    );
END;
GO

CREATE OR ALTER PROCEDURE dbo.spVac_Listar_RH
    @EstadoActual NVARCHAR(40) = NULL,
    @CodigoPais NVARCHAR(5) = NULL,
    @Texto NVARCHAR(200) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        v.IdVacante,
        v.CodigoVacante,
        v.Titulo,
        v.Area,
        v.Modalidad,
        v.CodigoPais,
        v.EstadoActual,
        v.FechaPublicacion,
        v.FechaCierre,
        v.FechaCreacion
    FROM dbo.Vacante v
    WHERE v.Activo = 1
      AND (@EstadoActual IS NULL OR v.EstadoActual = @EstadoActual)
      AND (@CodigoPais IS NULL OR v.CodigoPais = @CodigoPais)
      AND (
            @Texto IS NULL
            OR v.CodigoVacante LIKE '%' + @Texto + '%'
            OR v.Titulo LIKE '%' + @Texto + '%'
            OR v.Area LIKE '%' + @Texto + '%'
          )
    ORDER BY v.FechaCreacion DESC;
END;
GO
