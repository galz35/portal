USE PortalVacantes;
GO

SET NOCOUNT ON;

IF NOT EXISTS (SELECT 1 FROM dbo.Vacante)
BEGIN
    PRINT 'Insertando vacantes de demostración...'

    INSERT INTO dbo.Vacante (
        CodigoVacante, Slug, Titulo, Descripcion, Requisitos, Area, TipoVacante, Modalidad, 
        Ubicacion, CodigoPais, NivelExperiencia, SalarioMin, SalarioMax, AceptaInternos, EsPublica, 
        CantidadPlazas, FechaPublicacion, FechaCierre, EstadoActual, Prioridad, IdSolicitante, IdResponsableRH, Activo
    ) VALUES 
    (
        'V-IT-2601', 'senior-developer-rust', 'Senior Developer Rust & React', 
        'Buscamos un desarrollador full stack con experiencia en Rust (axum) y React para sumarse al equipo de core de Portal.', 
        'Experiencia de 3+ años en Rust. Conocimiento de MSSQL. BDD, TDD. Trabajo en equipo.', 
        'Tecnología', 'Permanente', 'REMOTO', 'Managua', 'NI', 'Senior', 1500, 2500, 1, 1, 
        2, SYSDATETIME(), DATEADD(MONTH, 1, SYSDATETIME()), 'PUBLICADA_ACTIVA', 'ALTA', 1, 1, 1
    ),
    (
        'V-IT-2602', 'arquitecto-azure', 'Arquitecto Cloud Azure', 
        'Liderar la migración a nube y mantener la infraestructura actual de alta disponibilidad.', 
        'Certificación Azure Architect. 5+ años en rol similar. Dominio de Kubernetes y CI/CD.', 
        'Tecnología', 'Permanente', 'HIBRIDA', 'Ciudad de Guatemala', 'GT', 'Expert', 2500, 3500, 1, 1, 
        1, DATEADD(DAY, -2, SYSDATETIME()), DATEADD(MONTH, 1, SYSDATETIME()), 'PUBLICADA_ACTIVA', 'CRITICA', 1, 1, 1
    ),
    (
        'V-VN-2603', 'ejecutivo-ventas-b2b', 'Ejecutivo de Ventas Corp', 
        'Atención de cuentas corporativas. Venta de soluciones TIC a empresas grandes.', 
        'Experiencia en ventas B2B. Cartera de clientes. Vehículo propio. Orientación a resultados.', 
        'Ventas', 'Permanente', 'PRESENCIAL', 'Tegucigalpa', 'HN', 'Mid', 800, 1500, 1, 1, 
        5, DATEADD(DAY, -5, SYSDATETIME()), DATEADD(MONTH, 2, SYSDATETIME()), 'PUBLICADA_ACTIVA', 'MEDIA', 1, 1, 1
    ),
    (
        'V-RH-2604', 'analista-reclutamiento', 'Analista de Reclutamiento IT', 
        'Búsqueda y selección de talento IT. Uso de LinkedIn Recruiter y otras herramientas.', 
        'Experiencia reclutando perfiles Tech. Psicología o carreras afines. Inglés avanzado.', 
        'RH', 'Contract', 'HIBRIDA', 'Managua', 'NI', 'Junior', 600, 900, 1, 1, 
        1, DATEADD(DAY, -1, SYSDATETIME()), DATEADD(DAY, 15, SYSDATETIME()), 'PUBLICADA_ACTIVA', 'MEDIA', 1, 1, 1
    ),
    (
        'V-FN-2605', 'auditor-sr', 'Auditor Financiero Sr', 
        'Auditoría interna de procesos. Revisión de controles SOX.', 
        'CPA deseable. 4 años en firmas de auditoría. Dominio de SAP.', 
        'Finanzas', 'Permanente', 'PRESENCIAL', 'San Salvador', 'SV', 'Senior', 1200, 1800, 1, 1, 
        1, SYSDATETIME(), DATEADD(MONTH, 1, SYSDATETIME()), 'PUBLICADA_ACTIVA', 'BAJA', 1, 1, 1
    );

    PRINT '5 Vacantes creadas exitosamente.'
END
ELSE
BEGIN
    PRINT 'Ya existen vacantes, omitiendo seed.'
END
GO
