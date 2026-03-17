-- Semilla de datos para Vacantes Claro
USE PortalVacantes;
GO

DECLARE @IdRH INT = 25; -- Gustavo como responsable por defecto

-- 1. Vacante de Sistemas en RRHH (Managua)
INSERT INTO Vacante (
    CodigoVacante, Slug, Titulo, Descripcion, Requisitos, 
    Area, Gerencia, Departamento, Ubicacion, 
    IdResponsableRH, EstadoActual, FechaPublicacion, EsPublica, CantidadPlazas, TipoVacante, CodigoPais
) VALUES (
    'SIS-RRHH-001', 'analista-sistemas-rrhh-managua', 
    'Analista de Sistemas RRHH', 
    'Responsable de mantener y optimizar las plataformas de gestión de talento y nómina en la sede central.',
    'Ingeniero en Sistemas, Experiencia en SQL Server, .NET y procesos de RRHH.',
    'Sistemas', 'Recursos Humanos', 'RRHH Nicaragua', 'Managua',
    @IdRH, 'PUBLICADA', GETDATE(), 1, 1, 'FIJO', 'NI'
);

-- 2. Vacantes por cada departamento de Nicaragua
INSERT INTO Vacante (CodigoVacante, Slug, Titulo, Descripcion, Requisitos, Area, Gerencia, Departamento, Ubicacion, IdResponsableRH, EstadoActual, FechaPublicacion, EsPublica, CantidadPlazas, TipoVacante, CodigoPais)
VALUES 
('V-LEON-01', 'ejecutivo-ventas-leon', 'Ejecutivo de Ventas Residencial', 'Atención a clientes y prospección en zona urbana.', 'Bachiller, experiencia en ventas.', 'Ventas', 'Comercial', 'Canal Presencial', 'León', @IdRH, 'PUBLICADA', GETDATE(), 1, 3, 'FIJO', 'NI'),
('V-CHIN-01', 'tecnico-redes-chinandega', 'Técnico de Redes Externas', 'Mantenimiento preventivo de fibra óptica.', 'Técnico en telecomunicaciones.', 'Operaciones', 'Tecnología', 'Mantenimiento', 'Chinandega', @IdRH, 'PUBLICADA', GETDATE(), 1, 2, 'FIJO', 'NI'),
('V-MASA-01', 'gestor-cobros-masaya', 'Gestor de Cobranza', 'Recuperación de cartera mora temprana.', 'Secundaria completa, moto propia.', 'Finanzas', 'Administración', 'Cobros', 'Masaya', @IdRH, 'PUBLICADA', GETDATE(), 1, 1, 'FIJO', 'NI'),
('V-GRAN-01', 'anfitrion-atencion-granada', 'Anfitrión de Atención al Cliente', 'Recibir clientes en Centro de Atención.', 'Excelente presentación, fluidez verbal.', 'Atención al Cliente', 'Comercial', 'Tiendas', 'Granada', @IdRH, 'PUBLICADA', GETDATE(), 1, 1, 'FIJO', 'NI'),
('V-CARA-01', 'supervisor-ventas-carazo', 'Supervisor de Ventas D2D', 'Liderazgo de cuadrillas de ventas puerta a puerta.', 'Experiencia en manejo de personal.', 'Ventas', 'Comercial', 'Ventas Externas', 'Carazo', @IdRH, 'PUBLICADA', GETDATE(), 1, 1, 'FIJO', 'NI'),
('V-RIVA-01', 'auxiliar-bodega-rivas', 'Auxiliar de Bodega', 'Control de inventario de equipos terminales.', 'Conocimiento de Excel básico.', 'Logística', 'Administración', 'Bodegas', 'Rivas', @IdRH, 'PUBLICADA', GETDATE(), 1, 1, 'FIJO', 'NI'),
('V-CHON-01', 'vendedor-itinerante-chontales', 'Vendedor Itinerante', 'Venta de recargas y chips en comunidades.', 'Disponibilidad para viajar.', 'Ventas', 'Comercial', 'Venta Móvil', 'Chontales', @IdRH, 'PUBLICADA', GETDATE(), 1, 4, 'FIJO', 'NI'),
('V-BOAC-01', 'tecnico-soporte-boaco', 'Técnico de Soporte Nivel 1', 'Soporte técnico a usuarios internos.', 'Estudiante de sistemas.', 'Tecnología', 'Operaciones', 'IT Support', 'Boaco', @IdRH, 'PUBLICADA', GETDATE(), 1, 1, 'FIJO', 'NI'),
('V-MATA-01', 'jefe-tienda-matagalpa', 'Jefe de Tienda Matagalpa', 'Administración integral de sucursal.', 'Licenciatura terminada, experiencia 3 años.', 'Tiendas', 'Comercial', 'Ventas Retail', 'Matagalpa', @IdRH, 'PUBLICADA', GETDATE(), 1, 1, 'FIJO', 'NI'),
('V-JINO-01', 'promotor-marca-jinotega', 'Promotor de Marca', 'Impulsación de promociones en eventos.', 'Extrovertido, dinámico.', 'Marketing', 'Comercial', 'Trade Marketing', 'Jinotega', @IdRH, 'PUBLICADA', GETDATE(), 1, 2, 'FIJO', 'NI'),
('V-ESTE-01', 'analista-credito-esteli', 'Analista de Crédito', 'Evaluación de perfiles para contratos postpago.', 'Contabilidad o Finanzas.', 'Finanzas', 'Administración', 'Crédito', 'Estelí', @IdRH, 'PUBLICADA', GETDATE(), 1, 1, 'FIJO', 'NI'),
('V-MADR-01', 'cajero-somoto', 'Cajero Integral - Somoto', 'Manejo de caja y cobro de facturas.', 'Experiencia en arqueos.', 'Atención al Cliente', 'Finanzas', 'Cajas', 'Madriz', @IdRH, 'PUBLICADA', GETDATE(), 1, 1, 'FIJO', 'NI'),
('V-NSEG-01', 'tecnico-instalador-ocotal', 'Técnico Instalador HFC', 'Instalación de servicios de internet y TV.', 'Licencia de conducir.', 'Operaciones', 'Tecnología', 'Instalaciones', 'Nueva Segovia', @IdRH, 'PUBLICADA', GETDATE(), 1, 3, 'FIJO', 'NI'),
('V-RSJU-01', 'delegado-comercial-sancarlo', 'Delegado Comercial Rio San Juan', 'Representante de la marca en la zona.', 'Residente en San Carlos.', 'Ventas', 'Comercial', 'Regional Sur', 'Río San Juan', @IdRH, 'PUBLICADA', GETDATE(), 1, 1, 'FIJO', 'NI'),
('V-BLUF-01', 'agente-ventas-bluefields', 'Agente de Ventas - Bluefields', 'Ventas en zona costera.', 'Bilingüe (Inglés/Español) deseable.', 'Ventas', 'Comercial', 'Regional Caribe', 'Zelaya Central', @IdRH, 'PUBLICADA', GETDATE(), 1, 2, 'FIJO', 'NI'),
('V-BILW-01', 'soporte-redes-bilwi', 'Soporte de Redes - Bilwi', 'Mantenimiento de radiobases.', 'Ingeniería eléctrica o electrónica.', 'Operaciones', 'Tecnología', 'Mantenimiento', 'RAAN', @IdRH, 'PUBLICADA', GETDATE(), 1, 1, 'FIJO', 'NI');

GO
