CREATE UNIQUE INDEX IX_DescriptorPuesto_IdPuesto_Version
ON dbo.DescriptorPuesto (IdPuesto, VersionDescriptor);
GO

CREATE UNIQUE INDEX IX_RequisicionPersonal_Codigo
ON dbo.RequisicionPersonal (CodigoRequisicion);
GO

CREATE INDEX IX_RequisicionPersonal_Estado_Fecha
ON dbo.RequisicionPersonal (EstadoRequisicion, FechaSolicitud DESC);
GO

CREATE INDEX IX_RequisicionPersonal_Solicitante
ON dbo.RequisicionPersonal (IdCuentaPortalSolicitante, FechaSolicitud DESC);
GO

CREATE INDEX IX_RequisicionAprobacion_Requisicion_Orden
ON dbo.RequisicionAprobacion (IdRequisicionPersonal, OrdenEtapa);
GO

CREATE INDEX IX_RequisicionAprobacion_Aprobador_Estado
ON dbo.RequisicionAprobacion (IdCuentaPortalAprobador, EstadoAprobacion);
GO

CREATE INDEX IX_RequisicionHistorial_Requisicion_Fecha
ON dbo.RequisicionHistorial (IdRequisicionPersonal, FechaEvento DESC);
GO

CREATE INDEX IX_RequisicionAdjunto_Requisicion
ON dbo.RequisicionAdjunto (IdRequisicionPersonal, FechaCreacion DESC);
GO

CREATE INDEX IX_Vacante_Regularizacion
ON dbo.Vacante (EsExcepcionSinRequisicion, FechaLimiteRegularizacion, EstadoRegularizacion);
GO

CREATE INDEX IX_VacanteRegularizacionHistorial_Vacante
ON dbo.VacanteRegularizacionHistorial (IdVacante, FechaEvento DESC);
GO
