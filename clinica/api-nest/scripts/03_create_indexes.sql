-- =============================================
-- 03_CREATE_INDEXES.sql
-- Performance indexes for Claro Mi Salud
-- =============================================

-- Usuarios
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_usuarios_carnet')
    CREATE UNIQUE INDEX IX_usuarios_carnet ON usuarios(carnet);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_usuarios_pais')
    CREATE INDEX IX_usuarios_pais ON usuarios(pais, estado);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_usuarios_id_paciente')
    CREATE INDEX IX_usuarios_id_paciente ON usuarios(id_paciente);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_usuarios_id_medico')
    CREATE INDEX IX_usuarios_id_medico ON usuarios(id_medico);

-- Citas
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_citas_medico_fecha')
    CREATE INDEX IX_citas_medico_fecha ON citas_medicas(id_medico, fecha_cita);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_citas_paciente')
    CREATE INDEX IX_citas_paciente ON citas_medicas(id_paciente);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_citas_estado')
    CREATE INDEX IX_citas_estado ON citas_medicas(estado_cita);

-- Chequeos
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_chequeos_paciente')
    CREATE INDEX IX_chequeos_paciente ON chequeos_bienestar(id_paciente, fecha_registro DESC);

-- Casos
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_casos_paciente')
    CREATE INDEX IX_casos_paciente ON casos_clinicos(id_paciente);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_casos_estado')
    CREATE INDEX IX_casos_estado ON casos_clinicos(estado_caso);

-- Examenes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_examenes_paciente')
    CREATE INDEX IX_examenes_paciente ON examenes_medicos(id_paciente);

-- Seguimientos
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_seguimientos_paciente')
    CREATE INDEX IX_seguimientos_paciente ON seguimientos(id_paciente);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_seguimientos_estado')
    CREATE INDEX IX_seguimientos_estado ON seguimientos(estado_seguimiento);

-- Vacunas
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_vacunas_paciente')
    CREATE INDEX IX_vacunas_paciente ON vacunas_aplicadas(id_paciente);

-- Atenciones
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_atenciones_cita')
    CREATE INDEX IX_atenciones_cita ON atenciones_medicas(id_cita);

-- Empleados
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_empleados_pais')
    CREATE INDEX IX_empleados_pais ON empleados(pais);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_empleados_carnet')
    CREATE UNIQUE INDEX IX_empleados_carnet ON empleados(carnet);

PRINT '✅ ALL INDEXES CREATED SUCCESSFULLY';
GO
