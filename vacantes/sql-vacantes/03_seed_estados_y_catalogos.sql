INSERT INTO dbo.CatalogoTipoVacante (CodigoTipoVacante, Nombre)
VALUES
('FIJO', 'Fijo'),
('TEMPORAL', 'Temporal'),
('PRACTICA', 'Practica'),
('INTERNA', 'Vacante Interna');
GO

INSERT INTO dbo.CatalogoModalidad (CodigoModalidad, Nombre)
VALUES
('PRESENCIAL', 'Presencial'),
('HIBRIDA', 'Hibrida'),
('REMOTA', 'Remota');
GO

INSERT INTO dbo.CatalogoMotivoRechazo (CodigoMotivoRechazo, Nombre)
VALUES
('NO_PERFIL', 'No cumple perfil'),
('SALARIO', 'No acorde a expectativa salarial'),
('RETIRADO', 'Retirado por candidato'),
('DESCARTADO_RH', 'Descartado por RH'),
('DESCARTADO_JEFE', 'Descartado por jefe');
GO

INSERT INTO dbo.CatalogoFuentePostulacion (CodigoFuentePostulacion, Nombre)
VALUES
('WEB', 'Portal Web'),
('INTERNA', 'Vacante Interna'),
('REFERIDO', 'Referido'),
('BASE_CV', 'Banco CV');
GO
