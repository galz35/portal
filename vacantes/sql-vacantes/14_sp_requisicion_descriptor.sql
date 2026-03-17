CREATE OR ALTER PROCEDURE dbo.spReq_Crear
    @CodigoRequisicion NVARCHAR(30),
    @IdPuesto BIGINT,
    @IdDescriptorPuesto INT = NULL,
    @TipoNecesidad NVARCHAR(40),
    @Justificacion NVARCHAR(MAX),
    @CantidadPlazas INT = 1,
    @CodigoPais NVARCHAR(5),
    @Gerencia NVARCHAR(100) = NULL,
    @Departamento NVARCHAR(100) = NULL,
    @Area NVARCHAR(100) = NULL,
    @CentroCosto NVARCHAR(50) = NULL,
    @IdCuentaPortalSolicitante INT,
    @IdCuentaPortalJefeAprobador INT = NULL,
    @IdCuentaPortalReclutamiento INT = NULL,
    @IdCuentaPortalCompensacion INT = NULL,
    @FechaNecesariaCobertura DATE = NULL,
    @Prioridad NVARCHAR(30) = NULL,
    @PermitePublicacionSinCompletar BIT = 0,
    @FechaLimiteRegularizacion DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.RequisicionPersonal (
        CodigoRequisicion, IdPuesto, IdDescriptorPuesto, TipoNecesidad, Justificacion, CantidadPlazas,
        CodigoPais, Gerencia, Departamento, Area, CentroCosto, IdCuentaPortalSolicitante,
        IdCuentaPortalJefeAprobador, IdCuentaPortalReclutamiento, IdCuentaPortalCompensacion,
        FechaNecesariaCobertura, Prioridad, EstadoRequisicion, PermitePublicacionSinCompletar,
        FechaLimiteRegularizacion
    )
    VALUES (
        @CodigoRequisicion, @IdPuesto, @IdDescriptorPuesto, @TipoNecesidad, @Justificacion, @CantidadPlazas,
        @CodigoPais, @Gerencia, @Departamento, @Area, @CentroCosto, @IdCuentaPortalSolicitante,
        @IdCuentaPortalJefeAprobador, @IdCuentaPortalReclutamiento, @IdCuentaPortalCompensacion,
        @FechaNecesariaCobertura, @Prioridad, 'BORRADOR', @PermitePublicacionSinCompletar,
        @FechaLimiteRegularizacion
    );

    SELECT SCOPE_IDENTITY() AS IdRequisicionPersonal;
END;
GO

CREATE OR ALTER PROCEDURE dbo.spReq_EnviarAprobacion
    @IdRequisicionPersonal BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.RequisicionPersonal
    SET EstadoRequisicion = 'PENDIENTE_JEFE'
    WHERE IdRequisicionPersonal = @IdRequisicionPersonal;

    INSERT INTO dbo.RequisicionHistorial (
        IdRequisicionPersonal, EstadoAnterior, EstadoNuevo, Accion, Detalle
    )
    VALUES (
        @IdRequisicionPersonal, 'BORRADOR', 'PENDIENTE_JEFE', 'ENVIAR_APROBACION', 'Requisicion enviada al flujo de aprobacion'
    );
END;
GO

CREATE OR ALTER PROCEDURE dbo.spReq_AprobarEtapa
    @IdRequisicionPersonal BIGINT,
    @Etapa NVARCHAR(40),
    @IdCuentaPortal INT,
    @Comentario NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.RequisicionAprobacion
    SET EstadoAprobacion = 'APROBADA',
        Comentario = @Comentario,
        FechaDecision = SYSDATETIME()
    WHERE IdRequisicionPersonal = @IdRequisicionPersonal
      AND Etapa = @Etapa
      AND IdCuentaPortalAprobador = @IdCuentaPortal;

    INSERT INTO dbo.RequisicionHistorial (
        IdRequisicionPersonal, EstadoAnterior, EstadoNuevo, Accion, Detalle, IdCuentaPortal
    )
    VALUES (
        @IdRequisicionPersonal, NULL, NULL, 'APROBAR_ETAPA', @Comentario, @IdCuentaPortal
    );
END;
GO

CREATE OR ALTER PROCEDURE dbo.spReq_Rechazar
    @IdRequisicionPersonal BIGINT,
    @IdCuentaPortal INT,
    @Comentario NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.RequisicionPersonal
    SET EstadoRequisicion = 'RECHAZADA'
    WHERE IdRequisicionPersonal = @IdRequisicionPersonal;

    INSERT INTO dbo.RequisicionHistorial (
        IdRequisicionPersonal, EstadoAnterior, EstadoNuevo, Accion, Detalle, IdCuentaPortal
    )
    VALUES (
        @IdRequisicionPersonal, NULL, 'RECHAZADA', 'RECHAZAR', @Comentario, @IdCuentaPortal
    );
END;
GO

CREATE OR ALTER PROCEDURE dbo.spReq_ListarPendientesAprobacion
    @IdCuentaPortal INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        rp.IdRequisicionPersonal,
        rp.CodigoRequisicion,
        rp.TipoNecesidad,
        rp.Area,
        rp.Gerencia,
        rp.EstadoRequisicion,
        ra.Etapa,
        ra.EstadoAprobacion
    FROM dbo.RequisicionPersonal rp
    INNER JOIN dbo.RequisicionAprobacion ra
        ON ra.IdRequisicionPersonal = rp.IdRequisicionPersonal
    WHERE ra.IdCuentaPortalAprobador = @IdCuentaPortal
      AND ra.EstadoAprobacion = 'PENDIENTE'
    ORDER BY rp.FechaSolicitud DESC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.spDesc_Crear
    @IdPuesto BIGINT,
    @TituloPuesto NVARCHAR(200),
    @VersionDescriptor NVARCHAR(30),
    @ObjetivoPuesto NVARCHAR(MAX) = NULL,
    @FuncionesPrincipales NVARCHAR(MAX) = NULL,
    @FuncionesSecundarias NVARCHAR(MAX) = NULL,
    @CompetenciasTecnicas NVARCHAR(MAX) = NULL,
    @CompetenciasBlandas NVARCHAR(MAX) = NULL,
    @Escolaridad NVARCHAR(200) = NULL,
    @ExperienciaMinima NVARCHAR(200) = NULL,
    @Idiomas NVARCHAR(MAX) = NULL,
    @Certificaciones NVARCHAR(MAX) = NULL,
    @Jornada NVARCHAR(100) = NULL,
    @Modalidad NVARCHAR(30) = NULL,
    @RangoSalarialReferencial NVARCHAR(100) = NULL,
    @ReportaA NVARCHAR(200) = NULL,
    @IndicadoresExito NVARCHAR(MAX) = NULL,
    @FechaVigenciaDesde DATE,
    @FechaVigenciaHasta DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.DescriptorPuesto (
        IdPuesto, TituloPuesto, VersionDescriptor, ObjetivoPuesto, FuncionesPrincipales,
        FuncionesSecundarias, CompetenciasTecnicas, CompetenciasBlandas, Escolaridad,
        ExperienciaMinima, Idiomas, Certificaciones, Jornada, Modalidad,
        RangoSalarialReferencial, ReportaA, IndicadoresExito, FechaVigenciaDesde, FechaVigenciaHasta
    )
    VALUES (
        @IdPuesto, @TituloPuesto, @VersionDescriptor, @ObjetivoPuesto, @FuncionesPrincipales,
        @FuncionesSecundarias, @CompetenciasTecnicas, @CompetenciasBlandas, @Escolaridad,
        @ExperienciaMinima, @Idiomas, @Certificaciones, @Jornada, @Modalidad,
        @RangoSalarialReferencial, @ReportaA, @IndicadoresExito, @FechaVigenciaDesde, @FechaVigenciaHasta
    );

    SELECT SCOPE_IDENTITY() AS IdDescriptorPuesto;
END;
GO

CREATE OR ALTER PROCEDURE dbo.spDesc_ObtenerVigente
    @IdPuesto BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (1)
        *
    FROM dbo.DescriptorPuesto
    WHERE IdPuesto = @IdPuesto
      AND Activo = 1
      AND FechaVigenciaDesde <= CAST(SYSDATETIME() AS DATE)
      AND (FechaVigenciaHasta IS NULL OR FechaVigenciaHasta >= CAST(SYSDATETIME() AS DATE))
    ORDER BY FechaVigenciaDesde DESC, IdDescriptorPuesto DESC;
END;
GO
