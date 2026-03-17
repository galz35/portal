IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_CvTextoExtraido_Archivo'
      AND object_id = OBJECT_ID('dbo.CvTextoExtraido')
)
CREATE INDEX IX_CvTextoExtraido_Archivo
ON dbo.CvTextoExtraido (IdArchivoPersona, FechaExtraccion DESC);
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_AnalisisCvIa_PersonaVigente'
      AND object_id = OBJECT_ID('dbo.AnalisisCvIa')
)
CREATE INDEX IX_AnalisisCvIa_PersonaVigente
ON dbo.AnalisisCvIa (IdPersona, EsVigente, FechaAnalisis DESC);
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_AnalisisCvIa_Vacante'
      AND object_id = OBJECT_ID('dbo.AnalisisCvIa')
)
CREATE INDEX IX_AnalisisCvIa_Vacante
ON dbo.AnalisisCvIa (IdVacante, FechaAnalisis DESC);
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_PerfilCvNormalizado_Persona'
      AND object_id = OBJECT_ID('dbo.PerfilCvNormalizado')
)
CREATE INDEX IX_PerfilCvNormalizado_Persona
ON dbo.PerfilCvNormalizado (IdPersona, FechaCreacion DESC);
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_AnalisisCvIaAuditoria_Analisis'
      AND object_id = OBJECT_ID('dbo.AnalisisCvIaAuditoria')
)
CREATE INDEX IX_AnalisisCvIaAuditoria_Analisis
ON dbo.AnalisisCvIaAuditoria (IdAnalisisCvIa, FechaEvento DESC);
GO
