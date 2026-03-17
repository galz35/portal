IF OBJECT_ID('dbo.AuditoriaAcceso', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.AuditoriaAcceso (
        IdAuditoriaAcceso BIGINT IDENTITY(1,1) PRIMARY KEY,
        IdCuentaPortal INT NULL,
        Usuario NVARCHAR(100) NULL,
        Evento NVARCHAR(50) NOT NULL,
        Modulo NVARCHAR(80) NULL,
        Exitoso BIT NOT NULL,
        Detalle NVARCHAR(500) NULL,
        Ip NVARCHAR(60) NULL,
        UserAgent NVARCHAR(300) NULL,
        FechaEvento DATETIME2 NOT NULL DEFAULT SYSDATETIME()
    );
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_AuditoriaAcceso_Fecha'
      AND object_id = OBJECT_ID('dbo.AuditoriaAcceso')
)
BEGIN
    CREATE INDEX IX_AuditoriaAcceso_Fecha
    ON dbo.AuditoriaAcceso (FechaEvento DESC);
END;
GO
