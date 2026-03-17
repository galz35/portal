CREATE UNIQUE INDEX IX_Vacante_CodigoVacante
ON dbo.Vacante (CodigoVacante);
GO

CREATE UNIQUE INDEX IX_Vacante_Slug
ON dbo.Vacante (Slug);
GO

CREATE INDEX IX_Vacante_Publicas
ON dbo.Vacante (EsPublica, EstadoActual, CodigoPais, FechaPublicacion DESC);
GO

CREATE INDEX IX_Vacante_RH
ON dbo.Vacante (EstadoActual, FechaCreacion DESC);
GO

CREATE INDEX IX_Postulacion_Vacante
ON dbo.Postulacion (IdVacante, EstadoActual, FechaPostulacion DESC);
GO

CREATE INDEX IX_Postulacion_Persona
ON dbo.Postulacion (IdPersona, FechaPostulacion DESC);
GO

CREATE INDEX IX_Postulacion_ScoreIA
ON dbo.Postulacion (ScoreIA DESC);
GO

CREATE INDEX IX_ArchivoPersona_Persona
ON dbo.ArchivoPersona (IdPersona, FechaCreacion DESC);
GO

CREATE INDEX IX_AnalisisCvIa_Persona
ON dbo.AnalisisCvIa (IdPersona, FechaAnalisis DESC);
GO

CREATE INDEX IX_AnalisisCvIa_Vacante
ON dbo.AnalisisCvIa (IdVacante, FechaAnalisis DESC);
GO

CREATE INDEX IX_ListaNegra_Persona
ON dbo.ListaNegra (IdPersona, Activo);
GO

CREATE INDEX IX_Notificacion_Persona
ON dbo.Notificacion (IdPersona, Leida, FechaCreacion DESC);
GO
