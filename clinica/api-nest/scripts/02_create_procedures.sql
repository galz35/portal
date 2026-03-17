-- =============================================
-- 02_CREATE_PROCEDURES.sql
-- COMPLETE Stored Procedures for Claro Mi Salud
-- Generated: 2026-03-12
-- =============================================

-- =============================================
-- AUTH PROCEDURES
-- =============================================
IF OBJECT_ID('sp_Login', 'P') IS NOT NULL DROP PROCEDURE sp_Login;
GO
CREATE PROCEDURE sp_Login
    @Carnet VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        u.id_usuario,
        u.carnet,
        u.password_hash,
        u.nombre_completo,
        u.correo,
        r.nombre as rol,
        u.pais,
        u.estado,
        u.id_paciente,
        u.id_medico,
        p.nivel_semaforo
    FROM usuarios u
    LEFT JOIN roles r ON u.id_rol = r.id_rol
    LEFT JOIN pacientes p ON u.id_paciente = p.id_paciente
    WHERE u.carnet = @Carnet AND u.estado = 'A';
END;
GO

IF OBJECT_ID('sp_UpdateUltimoAcceso', 'P') IS NOT NULL DROP PROCEDURE sp_UpdateUltimoAcceso;
GO
CREATE PROCEDURE sp_UpdateUltimoAcceso
    @IdUsuario INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE usuarios SET ultimo_acceso = GETDATE() WHERE id_usuario = @IdUsuario;
END;
GO

IF OBJECT_ID('sp_Auth_GetProfile', 'P') IS NOT NULL DROP PROCEDURE sp_Auth_GetProfile;
GO
CREATE PROCEDURE sp_Auth_GetProfile
    @IdUsuario INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        u.id_usuario,
        u.carnet,
        u.password_hash,
        u.nombre_completo,
        u.correo,
        r.nombre as rol,
        u.pais,
        u.estado,
        u.id_paciente,
        u.id_medico,
        u.ultimo_acceso,
        p.nivel_semaforo
    FROM usuarios u
    LEFT JOIN roles r ON u.id_rol = r.id_rol
    LEFT JOIN pacientes p ON u.id_paciente = p.id_paciente
    WHERE u.id_usuario = @IdUsuario AND u.estado = 'A';
END;
GO

-- =============================================
-- ADMIN PROCEDURES
-- =============================================
IF OBJECT_ID('sp_Admin_GetDashboard', 'P') IS NOT NULL DROP PROCEDURE sp_Admin_GetDashboard;
GO
CREATE PROCEDURE sp_Admin_GetDashboard
    @Pais VARCHAR(2)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @totalUsuarios INT, @medicosActivos INT, @pacientesActivos INT;
    
    SELECT @totalUsuarios = COUNT(*) FROM usuarios WHERE pais = @Pais AND estado = 'A';
    
    SELECT @medicosActivos = COUNT(*) 
    FROM usuarios u 
    INNER JOIN medicos m ON u.id_medico = m.id_medico 
    WHERE u.pais = @Pais AND m.estado_medico = 'A';
    
    SELECT @pacientesActivos = COUNT(*) 
    FROM usuarios u 
    INNER JOIN pacientes p ON u.id_paciente = p.id_paciente 
    WHERE u.pais = @Pais AND p.estado_paciente = 'A';
    
    SELECT 
        @totalUsuarios as totalUsuarios,
        @medicosActivos as medicosActivos,
        @pacientesActivos as pacientesActivos;
    
    -- Second recordset: ultimos usuarios (will need to be handled in code or combined)
    -- For simplicity we return everything in one row
END;
GO

IF OBJECT_ID('sp_Admin_GetUsuarios', 'P') IS NOT NULL DROP PROCEDURE sp_Admin_GetUsuarios;
GO
CREATE PROCEDURE sp_Admin_GetUsuarios
    @Pais VARCHAR(2)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT u.id_usuario, u.carnet, u.nombre_completo, u.correo, r.nombre as rol, u.estado, u.ultimo_acceso, u.pais
    FROM usuarios u
    JOIN roles r ON u.id_rol = r.id_rol
    WHERE u.pais = @Pais
    ORDER BY u.fecha_creacion DESC;
END;
GO

IF OBJECT_ID('sp_Admin_CrearUsuario', 'P') IS NOT NULL DROP PROCEDURE sp_Admin_CrearUsuario;
GO
CREATE PROCEDURE sp_Admin_CrearUsuario
    @Carnet VARCHAR(50),
    @PasswordHash VARCHAR(255),
    @NombreCompleto VARCHAR(255),
    @Correo VARCHAR(100),
    @IdRol INT,
    @Pais VARCHAR(2)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        
        DECLARE @IdUsuario INT;
        DECLARE @IdPaciente INT = NULL;
        DECLARE @IdMedico INT = NULL;
        DECLARE @RolNombre VARCHAR(50);
        
        SELECT @RolNombre = nombre FROM roles WHERE id_rol = @IdRol;

        IF @RolNombre = 'PACIENTE'
        BEGIN
            INSERT INTO pacientes (carnet, nombre_completo, correo, estado_paciente, nivel_semaforo)
            VALUES (@Carnet, @NombreCompleto, @Correo, 'A', 'V');
            SET @IdPaciente = SCOPE_IDENTITY();
        END
        
        IF @RolNombre = 'MEDICO'
        BEGIN
            INSERT INTO medicos (carnet, nombre_completo, correo, tipo_medico, estado_medico)
            VALUES (@Carnet, @NombreCompleto, @Correo, 'INTERNO', 'A');
            SET @IdMedico = SCOPE_IDENTITY();
        END

        INSERT INTO usuarios (carnet, password_hash, nombre_completo, correo, id_rol, pais, id_paciente, id_medico)
        VALUES (@Carnet, @PasswordHash, @NombreCompleto, @Correo, @IdRol, @Pais, @IdPaciente, @IdMedico);
        
        SET @IdUsuario = SCOPE_IDENTITY();

        COMMIT TRANSACTION;
        
        SELECT u.*, r.nombre as rol FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol WHERE u.id_usuario = @IdUsuario;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

IF OBJECT_ID('sp_Admin_UpdateUsuario', 'P') IS NOT NULL DROP PROCEDURE sp_Admin_UpdateUsuario;
GO
CREATE PROCEDURE sp_Admin_UpdateUsuario
    @Id INT,
    @Estado CHAR(1) = NULL,
    @Rol VARCHAR(50) = NULL,
    @Correo VARCHAR(100) = NULL,
    @NombreCompleto VARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @Estado IS NOT NULL
        UPDATE usuarios SET estado = @Estado WHERE id_usuario = @Id;
    
    IF @Correo IS NOT NULL
        UPDATE usuarios SET correo = @Correo WHERE id_usuario = @Id;
    
    IF @NombreCompleto IS NOT NULL
        UPDATE usuarios SET nombre_completo = @NombreCompleto WHERE id_usuario = @Id;
    
    IF @Rol IS NOT NULL
    BEGIN
        DECLARE @IdRol INT;
        SELECT @IdRol = id_rol FROM roles WHERE nombre = @Rol;
        IF @IdRol IS NOT NULL
            UPDATE usuarios SET id_rol = @IdRol WHERE id_usuario = @Id;
    END
    
    SELECT u.*, r.nombre as rol FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol WHERE u.id_usuario = @Id;
END;
GO

IF OBJECT_ID('sp_Admin_GetMedicos', 'P') IS NOT NULL DROP PROCEDURE sp_Admin_GetMedicos;
GO
CREATE PROCEDURE sp_Admin_GetMedicos
    @Pais VARCHAR(2)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT m.*, u.estado as estado_usuario, u.pais 
    FROM medicos m 
    LEFT JOIN usuarios u ON m.id_medico = u.id_medico 
    WHERE u.pais = @Pais OR m.tipo_medico = 'EXTERNO'
    ORDER BY m.nombre_completo;
END;
GO

IF OBJECT_ID('sp_Admin_CrearMedico', 'P') IS NOT NULL DROP PROCEDURE sp_Admin_CrearMedico;
GO
CREATE PROCEDURE sp_Admin_CrearMedico
    @Carnet VARCHAR(50) = NULL,
    @Nombre VARCHAR(255),
    @Especialidad VARCHAR(100) = NULL,
    @Tipo VARCHAR(20) = 'EXTERNO',
    @Correo VARCHAR(100) = NULL,
    @Telefono VARCHAR(20) = NULL,
    @Estado CHAR(1) = 'A',
    @Pais VARCHAR(2) = 'NI'
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO medicos (carnet, nombre_completo, especialidad, tipo_medico, correo, telefono, estado_medico) 
    OUTPUT INSERTED.*
    VALUES (@Carnet, @Nombre, @Especialidad, @Tipo, @Correo, @Telefono, @Estado);
END;
GO

IF OBJECT_ID('sp_Admin_GetEmpleados', 'P') IS NOT NULL DROP PROCEDURE sp_Admin_GetEmpleados;
GO
CREATE PROCEDURE sp_Admin_GetEmpleados
    @Pais VARCHAR(2),
    @Carnet VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF @Carnet IS NOT NULL 
        SELECT * FROM empleados WHERE pais = @Pais AND carnet = @Carnet;
    ELSE
        SELECT * FROM empleados WHERE pais = @Pais ORDER BY nombre_completo;
END;
GO

IF OBJECT_ID('sp_Admin_GetReportesAtenciones', 'P') IS NOT NULL DROP PROCEDURE sp_Admin_GetReportesAtenciones;
GO
CREATE PROCEDURE sp_Admin_GetReportesAtenciones
    @Pais VARCHAR(2),
    @FechaDesde DATE = NULL,
    @FechaHasta DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT a.id_atencion, a.fecha_atencion, a.diagnostico_principal, a.plan_tratamiento,
           c.fecha_cita, c.hora_cita,
           m.nombre_completo as medico_nombre, m.especialidad as medico_especialidad,
           p.nombre_completo as paciente_nombre, p.carnet as paciente_carnet,
           p.sexo as paciente_sexo, p.fecha_nacimiento as paciente_nacimiento,
           e.gerencia, e.area
    FROM atenciones_medicas a
    JOIN citas_medicas c ON a.id_cita = c.id_cita
    JOIN medicos m ON c.id_medico = m.id_medico
    JOIN pacientes p ON c.id_paciente = p.id_paciente
    JOIN usuarios u ON p.id_paciente = u.id_paciente
    LEFT JOIN empleados e ON p.carnet = e.carnet
    WHERE u.pais = @Pais
      AND (@FechaDesde IS NULL OR CAST(a.fecha_atencion AS DATE) >= @FechaDesde)
      AND (@FechaHasta IS NULL OR CAST(a.fecha_atencion AS DATE) <= @FechaHasta)
    ORDER BY a.fecha_atencion DESC;
END;
GO

-- =============================================
-- MEDICO PROCEDURES
-- =============================================
IF OBJECT_ID('sp_Medico_GetPacientes', 'P') IS NOT NULL DROP PROCEDURE sp_Medico_GetPacientes;
GO
CREATE PROCEDURE sp_Medico_GetPacientes
    @Pais VARCHAR(2)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT p.*, u.pais, u.correo as correo_usuario
    FROM pacientes p
    INNER JOIN usuarios u ON p.id_paciente = u.id_paciente
    WHERE u.pais = @Pais AND p.estado_paciente = 'A'
    ORDER BY p.nombre_completo;
END;
GO

IF OBJECT_ID('sp_Medico_GetChequeosPorPaciente', 'P') IS NOT NULL DROP PROCEDURE sp_Medico_GetChequeosPorPaciente;
GO
CREATE PROCEDURE sp_Medico_GetChequeosPorPaciente
    @IdPaciente INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM chequeos_bienestar 
    WHERE id_paciente = @IdPaciente 
    ORDER BY fecha_registro DESC;
END;
GO

IF OBJECT_ID('sp_Medico_GetCitasPorPaciente', 'P') IS NOT NULL DROP PROCEDURE sp_Medico_GetCitasPorPaciente;
GO
CREATE PROCEDURE sp_Medico_GetCitasPorPaciente
    @IdPaciente INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT c.*, m.nombre_completo as medico_nombre, cc.codigo_caso
    FROM citas_medicas c
    LEFT JOIN medicos m ON c.id_medico = m.id_medico
    LEFT JOIN casos_clinicos cc ON c.id_caso = cc.id_caso
    WHERE c.id_paciente = @IdPaciente
    ORDER BY c.fecha_cita DESC;
END;
GO

IF OBJECT_ID('sp_Medico_GetExamenesPorPaciente', 'P') IS NOT NULL DROP PROCEDURE sp_Medico_GetExamenesPorPaciente;
GO
CREATE PROCEDURE sp_Medico_GetExamenesPorPaciente
    @IdPaciente INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM examenes_medicos 
    WHERE id_paciente = @IdPaciente 
    ORDER BY fecha_solicitud DESC;
END;
GO

IF OBJECT_ID('sp_Medico_GetVacunasPorPaciente', 'P') IS NOT NULL DROP PROCEDURE sp_Medico_GetVacunasPorPaciente;
GO
CREATE PROCEDURE sp_Medico_GetVacunasPorPaciente
    @IdPaciente INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT v.*, m.nombre_completo as medico_nombre
    FROM vacunas_aplicadas v
    LEFT JOIN medicos m ON v.id_medico = m.id_medico
    WHERE v.id_paciente = @IdPaciente
    ORDER BY v.fecha_aplicacion DESC;
END;
GO

IF OBJECT_ID('sp_Medico_GetCitasHoy', 'P') IS NOT NULL DROP PROCEDURE sp_Medico_GetCitasHoy;
GO
CREATE PROCEDURE sp_Medico_GetCitasHoy
    @IdMedico INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT c.*, p.nombre_completo as paciente_nombre, p.nivel_semaforo,
           cc.codigo_caso, cc.motivo_consulta
    FROM citas_medicas c
    INNER JOIN pacientes p ON c.id_paciente = p.id_paciente
    LEFT JOIN casos_clinicos cc ON c.id_caso = cc.id_caso
    WHERE c.id_medico = @IdMedico 
      AND CAST(c.fecha_cita AS DATE) = CAST(GETDATE() AS DATE)
      AND c.estado_cita = 'PROGRAMADA'
    ORDER BY c.hora_cita ASC;
END;
GO

IF OBJECT_ID('sp_Medico_GetPacientesRojo', 'P') IS NOT NULL DROP PROCEDURE sp_Medico_GetPacientesRojo;
GO
CREATE PROCEDURE sp_Medico_GetPacientesRojo
    @Pais VARCHAR(2)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT TOP 5 p.*, u.pais
    FROM pacientes p
    INNER JOIN usuarios u ON p.id_paciente = u.id_paciente
    WHERE p.nivel_semaforo = 'R' AND u.pais = @Pais;
END;
GO

IF OBJECT_ID('sp_Medico_CountCasosAbiertos', 'P') IS NOT NULL DROP PROCEDURE sp_Medico_CountCasosAbiertos;
GO
CREATE PROCEDURE sp_Medico_CountCasosAbiertos
    @Pais VARCHAR(2)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT COUNT(*) as total 
    FROM casos_clinicos cc
    INNER JOIN pacientes p ON cc.id_paciente = p.id_paciente
    INNER JOIN usuarios u ON p.id_paciente = u.id_paciente
    WHERE cc.estado_caso = 'Abierto' AND u.pais = @Pais;
END;
GO

IF OBJECT_ID('sp_Medico_GetAgendaCitas', 'P') IS NOT NULL DROP PROCEDURE sp_Medico_GetAgendaCitas;
GO
CREATE PROCEDURE sp_Medico_GetAgendaCitas
    @Pais VARCHAR(2)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT cc.*, p.nombre_completo as paciente_nombre, p.nivel_semaforo as paciente_semaforo,
           p.carnet as paciente_carnet
    FROM casos_clinicos cc
    INNER JOIN pacientes p ON cc.id_paciente = p.id_paciente
    INNER JOIN usuarios u ON p.id_paciente = u.id_paciente
    WHERE cc.estado_caso = 'Abierto' AND u.pais = @Pais
    ORDER BY cc.fecha_creacion ASC;
END;
GO

IF OBJECT_ID('sp_Medico_GetCasosClinicos', 'P') IS NOT NULL DROP PROCEDURE sp_Medico_GetCasosClinicos;
GO
CREATE PROCEDURE sp_Medico_GetCasosClinicos
    @Pais VARCHAR(2),
    @Estado VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT cc.*, p.nombre_completo as paciente_nombre, p.carnet as paciente_carnet
    FROM casos_clinicos cc
    INNER JOIN pacientes p ON cc.id_paciente = p.id_paciente
    INNER JOIN usuarios u ON p.id_paciente = u.id_paciente
    WHERE u.pais = @Pais
      AND (@Estado IS NULL OR cc.estado_caso = @Estado)
    ORDER BY cc.fecha_creacion DESC;
END;
GO

IF OBJECT_ID('sp_Medico_GetCasoById', 'P') IS NOT NULL DROP PROCEDURE sp_Medico_GetCasoById;
GO
CREATE PROCEDURE sp_Medico_GetCasoById
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;
    -- Main case data
    SELECT cc.*, p.nombre_completo as paciente_nombre, p.carnet as paciente_carnet,
           p.nivel_semaforo as paciente_semaforo, p.fecha_nacimiento
    FROM casos_clinicos cc
    INNER JOIN pacientes p ON cc.id_paciente = p.id_paciente
    WHERE cc.id_caso = @Id;
END;
GO

IF OBJECT_ID('sp_Medico_UpdateCaso', 'P') IS NOT NULL DROP PROCEDURE sp_Medico_UpdateCaso;
GO
CREATE PROCEDURE sp_Medico_UpdateCaso
    @Id INT,
    @EstadoCaso VARCHAR(50) = NULL,
    @Semaforo CHAR(1) = NULL,
    @Motivo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @EstadoCaso IS NOT NULL
        UPDATE casos_clinicos SET estado_caso = @EstadoCaso WHERE id_caso = @Id;
    IF @Semaforo IS NOT NULL
        UPDATE casos_clinicos SET nivel_semaforo = @Semaforo WHERE id_caso = @Id;
    IF @Motivo IS NOT NULL
        UPDATE casos_clinicos SET motivo_consulta = @Motivo WHERE id_caso = @Id;
    
    SELECT cc.*, p.nombre_completo as paciente_nombre, p.carnet as paciente_carnet,
           p.nivel_semaforo as paciente_semaforo
    FROM casos_clinicos cc
    INNER JOIN pacientes p ON cc.id_paciente = p.id_paciente
    WHERE cc.id_caso = @Id;
END;
GO

IF OBJECT_ID('sp_Medico_GetCitaById', 'P') IS NOT NULL DROP PROCEDURE sp_Medico_GetCitaById;
GO
CREATE PROCEDURE sp_Medico_GetCitaById
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT c.*, 
           p.nombre_completo as paciente_nombre, p.carnet as paciente_carnet, p.nivel_semaforo as paciente_semaforo,
           m.nombre_completo as medico_nombre, m.especialidad as medico_especialidad,
           cc.codigo_caso, cc.motivo_consulta, cc.estado_caso,
           a.id_atencion, a.diagnostico_principal, a.plan_tratamiento
    FROM citas_medicas c
    INNER JOIN pacientes p ON c.id_paciente = p.id_paciente
    INNER JOIN medicos m ON c.id_medico = m.id_medico
    LEFT JOIN casos_clinicos cc ON c.id_caso = cc.id_caso
    LEFT JOIN atenciones_medicas a ON a.id_cita = c.id_cita
    WHERE c.id_cita = @Id;
END;
GO

IF OBJECT_ID('sp_Medico_AgendarCita', 'P') IS NOT NULL DROP PROCEDURE sp_Medico_AgendarCita;
GO
CREATE PROCEDURE sp_Medico_AgendarCita
    @IdCaso INT,
    @IdMedico INT,
    @FechaCita DATE,
    @HoraCita VARCHAR(8)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        
        DECLARE @IdPaciente INT, @Motivo NVARCHAR(MAX), @Semaforo CHAR(1);
        
        SELECT @IdPaciente = id_paciente, @Motivo = motivo_consulta, @Semaforo = nivel_semaforo
        FROM casos_clinicos WHERE id_caso = @IdCaso;
        
        IF @IdPaciente IS NULL
        BEGIN
            RAISERROR('Caso clínico no encontrado', 16, 1);
            RETURN;
        END
        
        IF NOT EXISTS (SELECT 1 FROM medicos WHERE id_medico = @IdMedico)
        BEGIN
            RAISERROR('Médico no encontrado', 16, 1);
            RETURN;
        END
        
        INSERT INTO citas_medicas (id_paciente, id_medico, id_caso, fecha_cita, hora_cita, canal_origen, estado_cita, motivo_resumen, nivel_semaforo_paciente)
        VALUES (@IdPaciente, @IdMedico, @IdCaso, @FechaCita, @HoraCita, 'AGENDADA_POR_MEDICO', 'PROGRAMADA', @Motivo, @Semaforo);
        
        DECLARE @NuevaCita INT = SCOPE_IDENTITY();
        
        UPDATE casos_clinicos SET estado_caso = 'Agendado', id_cita_principal = @NuevaCita WHERE id_caso = @IdCaso;
        
        COMMIT TRANSACTION;
        
        SELECT * FROM citas_medicas WHERE id_cita = @NuevaCita;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

IF OBJECT_ID('sp_Medico_CrearAtencion', 'P') IS NOT NULL DROP PROCEDURE sp_Medico_CrearAtencion;
GO
CREATE PROCEDURE sp_Medico_CrearAtencion
    @IdCita INT,
    @IdMedico INT,
    @Diagnostico NVARCHAR(MAX),
    @Plan NVARCHAR(MAX) = NULL,
    @Recomendaciones NVARCHAR(MAX) = NULL,
    @RequiereSeg BIT = 0,
    @FechaSig DATE = NULL,
    @Peso DECIMAL(5,2) = NULL,
    @Altura DECIMAL(3,2) = NULL,
    @Presion VARCHAR(10) = NULL,
    @FC INT = NULL,
    @Temp DECIMAL(4,1) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        
        DECLARE @IdCaso INT;
        SELECT @IdCaso = id_caso FROM citas_medicas WHERE id_cita = @IdCita;
        
        INSERT INTO atenciones_medicas (id_cita, id_medico, diagnostico_principal, plan_tratamiento, recomendaciones, requiere_seguimiento, fecha_siguiente_cita, peso_kg, altura_m, presion_arterial, frecuencia_cardiaca, temperatura_c)
        VALUES (@IdCita, @IdMedico, @Diagnostico, @Plan, @Recomendaciones, @RequiereSeg, @FechaSig, @Peso, @Altura, @Presion, @FC, @Temp);
        
        UPDATE citas_medicas SET estado_cita = 'FINALIZADA' WHERE id_cita = @IdCita;
        
        IF @IdCaso IS NOT NULL
            UPDATE casos_clinicos SET estado_caso = 'Cerrado' WHERE id_caso = @IdCaso;
        
        COMMIT TRANSACTION;
        
        SELECT * FROM atenciones_medicas WHERE id_cita = @IdCita;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

IF OBJECT_ID('sp_Medico_GetExamenes', 'P') IS NOT NULL DROP PROCEDURE sp_Medico_GetExamenes;
GO
CREATE PROCEDURE sp_Medico_GetExamenes
    @Pais VARCHAR(2)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT e.*, p.nombre_completo as paciente_nombre, p.carnet as paciente_carnet
    FROM examenes_medicos e
    INNER JOIN pacientes p ON e.id_paciente = p.id_paciente
    INNER JOIN usuarios u ON p.id_paciente = u.id_paciente
    WHERE u.pais = @Pais
    ORDER BY e.fecha_solicitud DESC;
END;
GO

IF OBJECT_ID('sp_Medico_UpdateExamen', 'P') IS NOT NULL DROP PROCEDURE sp_Medico_UpdateExamen;
GO
CREATE PROCEDURE sp_Medico_UpdateExamen
    @Id INT,
    @ResultadoResumen NVARCHAR(MAX) = NULL,
    @EstadoExamen VARCHAR(20) = 'ENTREGADO',
    @FechaResultado DATETIME2 = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE examenes_medicos 
    SET resultado_resumen = ISNULL(@ResultadoResumen, resultado_resumen),
        estado_examen = @EstadoExamen,
        fecha_resultado = ISNULL(@FechaResultado, GETDATE())
    WHERE id_examen = @Id;
    
    SELECT e.*, p.nombre_completo as paciente_nombre, p.carnet as paciente_carnet
    FROM examenes_medicos e
    INNER JOIN pacientes p ON e.id_paciente = p.id_paciente
    WHERE e.id_examen = @Id;
END;
GO

IF OBJECT_ID('sp_Medico_GetSeguimientos', 'P') IS NOT NULL DROP PROCEDURE sp_Medico_GetSeguimientos;
GO
CREATE PROCEDURE sp_Medico_GetSeguimientos
    @Pais VARCHAR(2)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT s.*, p.nombre_completo as paciente_nombre, p.carnet as paciente_carnet
    FROM seguimientos s
    INNER JOIN pacientes p ON s.id_paciente = p.id_paciente
    INNER JOIN usuarios u ON p.id_paciente = u.id_paciente
    WHERE u.pais = @Pais
    ORDER BY s.fecha_programada ASC;
END;
GO

IF OBJECT_ID('sp_Medico_UpdateSeguimiento', 'P') IS NOT NULL DROP PROCEDURE sp_Medico_UpdateSeguimiento;
GO
CREATE PROCEDURE sp_Medico_UpdateSeguimiento
    @Id INT,
    @Estado VARCHAR(20) = NULL,
    @Notas NVARCHAR(MAX) = NULL,
    @FechaReal DATE = NULL,
    @Semaforo CHAR(1) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @Estado IS NOT NULL
        UPDATE seguimientos SET estado_seguimiento = @Estado WHERE id_seguimiento = @Id;
    IF @Notas IS NOT NULL
        UPDATE seguimientos SET notas_seguimiento = @Notas WHERE id_seguimiento = @Id;
    IF @FechaReal IS NOT NULL
        UPDATE seguimientos SET fecha_real = @FechaReal WHERE id_seguimiento = @Id;
    IF @Semaforo IS NOT NULL
        UPDATE seguimientos SET nivel_semaforo = @Semaforo WHERE id_seguimiento = @Id;
    
    SELECT * FROM seguimientos WHERE id_seguimiento = @Id;
END;
GO

IF OBJECT_ID('sp_Medico_GetCitasPorMedico', 'P') IS NOT NULL DROP PROCEDURE sp_Medico_GetCitasPorMedico;
GO
CREATE PROCEDURE sp_Medico_GetCitasPorMedico
    @IdMedico INT,
    @Pais VARCHAR(2)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT c.*, p.nombre_completo as paciente_nombre
    FROM citas_medicas c
    INNER JOIN pacientes p ON c.id_paciente = p.id_paciente
    INNER JOIN usuarios u ON p.id_paciente = u.id_paciente
    WHERE c.id_medico = @IdMedico AND u.pais = @Pais
    ORDER BY c.fecha_cita ASC, c.hora_cita ASC;
END;
GO

IF OBJECT_ID('sp_Medico_RegistrarVacuna', 'P') IS NOT NULL DROP PROCEDURE sp_Medico_RegistrarVacuna;
GO
CREATE PROCEDURE sp_Medico_RegistrarVacuna
    @IdPaciente INT,
    @IdMedico INT,
    @Tipo VARCHAR(100),
    @Dosis VARCHAR(50),
    @Fecha DATE,
    @Obs NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO vacunas_aplicadas (id_paciente, id_medico, tipo_vacuna, dosis, fecha_aplicacion, observaciones)
    OUTPUT INSERTED.*
    VALUES (@IdPaciente, @IdMedico, @Tipo, @Dosis, @Fecha, @Obs);
END;
GO

IF OBJECT_ID('sp_Medico_CrearCaso', 'P') IS NOT NULL DROP PROCEDURE sp_Medico_CrearCaso;
GO
CREATE PROCEDURE sp_Medico_CrearCaso
    @IdPaciente INT,
    @Semaforo CHAR(1) = 'V',
    @Motivo NVARCHAR(MAX),
    @ResumenClinico NVARCHAR(MAX) = NULL,
    @DiagnosticoUsuario NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Count INT;
    SELECT @Count = COUNT(*) FROM casos_clinicos;
    
    DECLARE @Codigo VARCHAR(20);
    SET @Codigo = 'CC-' + CAST(YEAR(GETDATE()) AS VARCHAR) + '-' + RIGHT('00000' + CAST(@Count + 1 AS VARCHAR), 5);
    
    INSERT INTO casos_clinicos (codigo_caso, id_paciente, estado_caso, nivel_semaforo, motivo_consulta, resumen_clinico_usuario, diagnostico_usuario)
    OUTPUT INSERTED.*
    VALUES (@Codigo, @IdPaciente, 'Abierto', @Semaforo, @Motivo, @ResumenClinico, @DiagnosticoUsuario);
END;
GO

IF OBJECT_ID('sp_Medico_GetReporteAtencion', 'P') IS NOT NULL DROP PROCEDURE sp_Medico_GetReporteAtencion;
GO
CREATE PROCEDURE sp_Medico_GetReporteAtencion
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT a.*, 
           c.fecha_cita, c.hora_cita, c.canal_origen, c.motivo_resumen,
           p.nombre_completo as paciente_nombre, p.carnet as paciente_carnet, 
           p.fecha_nacimiento as paciente_nacimiento, p.sexo as paciente_sexo,
           p.telefono as paciente_telefono, p.correo as paciente_correo,
           p.gerencia as paciente_gerencia, p.area as paciente_area,
           m.nombre_completo as medico_nombre, m.especialidad as medico_especialidad,
           m.carnet as medico_carnet,
           cc.codigo_caso, cc.motivo_consulta, cc.nivel_semaforo as caso_semaforo
    FROM atenciones_medicas a
    INNER JOIN citas_medicas c ON a.id_cita = c.id_cita
    INNER JOIN pacientes p ON c.id_paciente = p.id_paciente
    INNER JOIN medicos m ON a.id_medico = m.id_medico
    LEFT JOIN casos_clinicos cc ON c.id_caso = cc.id_caso
    WHERE a.id_atencion = @Id;
END;
GO

IF OBJECT_ID('sp_Medico_GetReportePaciente', 'P') IS NOT NULL DROP PROCEDURE sp_Medico_GetReportePaciente;
GO
CREATE PROCEDURE sp_Medico_GetReportePaciente
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;
    -- Paciente info
    SELECT p.*, u.pais, u.correo as correo_usuario
    FROM pacientes p
    LEFT JOIN usuarios u ON p.id_paciente = u.id_paciente
    WHERE p.id_paciente = @Id;
END;
GO

-- =============================================
-- PACIENTE PROCEDURES
-- =============================================
IF OBJECT_ID('sp_Paciente_GetMisChequeos', 'P') IS NOT NULL DROP PROCEDURE sp_Paciente_GetMisChequeos;
GO
CREATE PROCEDURE sp_Paciente_GetMisChequeos
    @IdPaciente INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM chequeos_bienestar 
    WHERE id_paciente = @IdPaciente 
    ORDER BY fecha_registro DESC;
END;
GO

IF OBJECT_ID('sp_Paciente_GetMisExamenes', 'P') IS NOT NULL DROP PROCEDURE sp_Paciente_GetMisExamenes;
GO
CREATE PROCEDURE sp_Paciente_GetMisExamenes
    @IdPaciente INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM examenes_medicos 
    WHERE id_paciente = @IdPaciente 
    ORDER BY fecha_solicitud DESC;
END;
GO

IF OBJECT_ID('sp_Paciente_GetMisVacunas', 'P') IS NOT NULL DROP PROCEDURE sp_Paciente_GetMisVacunas;
GO
CREATE PROCEDURE sp_Paciente_GetMisVacunas
    @IdPaciente INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT v.*, m.nombre_completo as medico_nombre
    FROM vacunas_aplicadas v
    LEFT JOIN medicos m ON v.id_medico = m.id_medico
    WHERE v.id_paciente = @IdPaciente
    ORDER BY v.fecha_aplicacion DESC;
END;
GO

IF OBJECT_ID('sp_Paciente_GetDashboard', 'P') IS NOT NULL DROP PROCEDURE sp_Paciente_GetDashboard;
GO
CREATE PROCEDURE sp_Paciente_GetDashboard
    @IdPaciente INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Semaforo CHAR(1), @SeguimientosActivos INT;
    DECLARE @UltChequeoId INT, @UltChequeoFecha DATETIME2, @UltChequeoSemaforo CHAR(1), @UltChequeoData NVARCHAR(MAX);
    DECLARE @ProxCitaFecha DATE, @ProxCitaHora VARCHAR(8);
    
    -- Nivel semáforo actual
    SELECT @Semaforo = nivel_semaforo FROM pacientes WHERE id_paciente = @IdPaciente;
    
    -- Último chequeo
    SELECT TOP 1 @UltChequeoId = id_chequeo, @UltChequeoFecha = fecha_registro, 
                 @UltChequeoSemaforo = nivel_semaforo, @UltChequeoData = datos_completos
    FROM chequeos_bienestar WHERE id_paciente = @IdPaciente ORDER BY fecha_registro DESC;
    
    -- Próxima cita
    SELECT TOP 1 @ProxCitaFecha = fecha_cita, @ProxCitaHora = hora_cita
    FROM citas_medicas 
    WHERE id_paciente = @IdPaciente AND estado_cita = 'PROGRAMADA'
    ORDER BY fecha_cita ASC, hora_cita ASC;
    
    -- Seguimientos activos
    SELECT @SeguimientosActivos = COUNT(*) FROM seguimientos 
    WHERE id_paciente = @IdPaciente AND estado_seguimiento IN ('PENDIENTE', 'EN_PROCESO');
    
    SELECT 
        ISNULL(@Semaforo, 'V') as nivel_semaforo,
        @UltChequeoId as ultimo_chequeo_id,
        @UltChequeoFecha as ultimo_chequeo_fecha,
        @UltChequeoSemaforo as ultimo_chequeo_semaforo,
        @UltChequeoData as ultimo_chequeo_datos,
        @ProxCitaFecha as proxima_cita_fecha,
        @ProxCitaHora as proxima_cita_hora,
        @SeguimientosActivos as seguimientos_activos;
END;
GO

IF OBJECT_ID('sp_Paciente_GetTimeline', 'P') IS NOT NULL DROP PROCEDURE sp_Paciente_GetTimeline;
GO
CREATE PROCEDURE sp_Paciente_GetTimeline
    @IdPaciente INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT TOP 5 title, date FROM (
        SELECT TOP 3 'Chequeo de Bienestar' as title, fecha_registro as date 
        FROM chequeos_bienestar WHERE id_paciente = @IdPaciente 
        UNION ALL
        SELECT TOP 3 'Atención: ' + a.diagnostico_principal as title, a.fecha_atencion as date
        FROM atenciones_medicas a
        INNER JOIN citas_medicas c ON a.id_cita = c.id_cita
        WHERE c.id_paciente = @IdPaciente
    ) combined
    ORDER BY date DESC;
END;
GO

IF OBJECT_ID('sp_Paciente_SolicitarCita', 'P') IS NOT NULL DROP PROCEDURE sp_Paciente_SolicitarCita;
GO
CREATE PROCEDURE sp_Paciente_SolicitarCita
    @IdPaciente INT,
    @Ruta VARCHAR(50) = 'consulta',
    @ComentarioGeneral NVARCHAR(MAX) = 'Solicitud de consulta',
    @DatosCompletos NVARCHAR(MAX) = '{}'
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        
        DECLARE @Semaforo CHAR(1);
        SELECT @Semaforo = ISNULL(nivel_semaforo, 'V') FROM pacientes WHERE id_paciente = @IdPaciente;
        
        -- Crear chequeo
        INSERT INTO chequeos_bienestar (id_paciente, nivel_semaforo, datos_completos)
        VALUES (@IdPaciente, @Semaforo, @DatosCompletos);
        
        -- Si es consulta, crear caso clínico
        IF @Ruta = 'consulta'
        BEGIN
            DECLARE @Count INT;
            SELECT @Count = COUNT(*) FROM casos_clinicos;
            
            DECLARE @Codigo VARCHAR(20);
            SET @Codigo = 'CC-' + CAST(YEAR(GETDATE()) AS VARCHAR) + '-' + RIGHT('00000' + CAST(@Count + 1 AS VARCHAR), 5);
            
            INSERT INTO casos_clinicos (codigo_caso, id_paciente, estado_caso, nivel_semaforo, motivo_consulta)
            VALUES (@Codigo, @IdPaciente, 'Abierto', @Semaforo, @ComentarioGeneral);
        END
        
        COMMIT TRANSACTION;
        
        SELECT 'Solicitud procesada con éxito' as message;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

IF OBJECT_ID('sp_Paciente_GetMisCitas', 'P') IS NOT NULL DROP PROCEDURE sp_Paciente_GetMisCitas;
GO
CREATE PROCEDURE sp_Paciente_GetMisCitas
    @IdPaciente INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT c.*, m.nombre_completo as medico_nombre
    FROM citas_medicas c
    INNER JOIN medicos m ON c.id_medico = m.id_medico
    WHERE c.id_paciente = @IdPaciente
    ORDER BY c.fecha_cita DESC;
END;
GO

IF OBJECT_ID('sp_Paciente_CrearChequeo', 'P') IS NOT NULL DROP PROCEDURE sp_Paciente_CrearChequeo;
GO
CREATE PROCEDURE sp_Paciente_CrearChequeo
    @IdPaciente INT,
    @NivelRiesgo VARCHAR(20) = 'V',
    @DatosCompletos NVARCHAR(MAX) = '{}'
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Semaforo CHAR(1);
    SET @Semaforo = CASE 
        WHEN @NivelRiesgo = 'Alto' OR @NivelRiesgo = 'R' THEN 'R'
        WHEN @NivelRiesgo = 'Medio' OR @NivelRiesgo = 'A' THEN 'A'
        ELSE 'V'
    END;
    
    -- Update patient semaforo
    UPDATE pacientes SET nivel_semaforo = @Semaforo WHERE id_paciente = @IdPaciente;
    
    -- Insert chequeo
    INSERT INTO chequeos_bienestar (id_paciente, nivel_semaforo, datos_completos)
    OUTPUT INSERTED.*
    VALUES (@IdPaciente, @Semaforo, @DatosCompletos);
END;
GO

-- =============================================
-- SEGUIMIENTO PROCEDURES
-- =============================================
IF OBJECT_ID('sp_Seguimiento_Crear', 'P') IS NOT NULL DROP PROCEDURE sp_Seguimiento_Crear;
GO
CREATE PROCEDURE sp_Seguimiento_Crear
    @IdCaso INT = NULL,
    @IdAtencion INT = NULL,
    @IdPaciente INT,
    @IdUsuarioResp INT = NULL,
    @FechaProg DATE,
    @Tipo VARCHAR(20) = 'PRESENCIAL',
    @Estado VARCHAR(20) = 'PENDIENTE',
    @Semaforo CHAR(1) = 'V',
    @Notas NVARCHAR(MAX) = NULL,
    @Motivo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO seguimientos (id_caso, id_atencion, id_paciente, id_usuario_resp, fecha_programada, tipo_seguimiento, estado_seguimiento, nivel_semaforo, notas_seguimiento, motivo)
    OUTPUT INSERTED.*
    VALUES (@IdCaso, @IdAtencion, @IdPaciente, @IdUsuarioResp, @FechaProg, @Tipo, @Estado, @Semaforo, @Notas, @Motivo);
END;
GO

IF OBJECT_ID('sp_Seguimiento_GetAll', 'P') IS NOT NULL DROP PROCEDURE sp_Seguimiento_GetAll;
GO
CREATE PROCEDURE sp_Seguimiento_GetAll
    @Pais VARCHAR(2) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT s.*, 
           p.nombre_completo as paciente_nombre,
           cc.codigo_caso,
           u2.nombre_completo as responsable_nombre
    FROM seguimientos s
    INNER JOIN pacientes p ON s.id_paciente = p.id_paciente
    INNER JOIN usuarios u ON p.id_paciente = u.id_paciente
    LEFT JOIN casos_clinicos cc ON s.id_caso = cc.id_caso
    LEFT JOIN usuarios u2 ON s.id_usuario_resp = u2.id_usuario
    WHERE (@Pais IS NULL OR u.pais = @Pais)
    ORDER BY s.fecha_programada ASC;
END;
GO

IF OBJECT_ID('sp_Seguimiento_GetById', 'P') IS NOT NULL DROP PROCEDURE sp_Seguimiento_GetById;
GO
CREATE PROCEDURE sp_Seguimiento_GetById
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT s.*, 
           p.nombre_completo as paciente_nombre,
           cc.codigo_caso,
           u.nombre_completo as responsable_nombre
    FROM seguimientos s
    INNER JOIN pacientes p ON s.id_paciente = p.id_paciente
    LEFT JOIN casos_clinicos cc ON s.id_caso = cc.id_caso
    LEFT JOIN usuarios u ON s.id_usuario_resp = u.id_usuario
    WHERE s.id_seguimiento = @Id;
END;
GO

IF OBJECT_ID('sp_Seguimiento_Update', 'P') IS NOT NULL DROP PROCEDURE sp_Seguimiento_Update;
GO
CREATE PROCEDURE sp_Seguimiento_Update
    @Id INT,
    @Estado VARCHAR(20) = NULL,
    @Notas NVARCHAR(MAX) = NULL,
    @FechaReal DATE = NULL,
    @Semaforo CHAR(1) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @Estado IS NOT NULL
        UPDATE seguimientos SET estado_seguimiento = @Estado WHERE id_seguimiento = @Id;
    IF @Notas IS NOT NULL
        UPDATE seguimientos SET notas_seguimiento = @Notas WHERE id_seguimiento = @Id;
    IF @FechaReal IS NOT NULL
        UPDATE seguimientos SET fecha_real = @FechaReal WHERE id_seguimiento = @Id;
    IF @Semaforo IS NOT NULL
        UPDATE seguimientos SET nivel_semaforo = @Semaforo WHERE id_seguimiento = @Id;
    
    SELECT * FROM seguimientos WHERE id_seguimiento = @Id;
END;
GO

IF OBJECT_ID('sp_Seguimiento_Delete', 'P') IS NOT NULL DROP PROCEDURE sp_Seguimiento_Delete;
GO
CREATE PROCEDURE sp_Seguimiento_Delete
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM seguimientos WHERE id_seguimiento = @Id;
END;
GO

-- =============================================
-- ROLES/PERMISOS & SEED
-- =============================================
IF OBJECT_ID('sp_Admin_GetRolesPermisos', 'P') IS NOT NULL DROP PROCEDURE sp_Admin_GetRolesPermisos;
GO
CREATE PROCEDURE sp_Admin_GetRolesPermisos
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM roles;
    SELECT r.id_rol, p.id_permiso, p.clave, p.modulo 
    FROM roles_permisos rp 
    INNER JOIN permisos p ON rp.id_permiso = p.id_permiso
    INNER JOIN roles r ON rp.id_rol = r.id_rol;
END;
GO

IF OBJECT_ID('sp_SeedData', 'P') IS NOT NULL DROP PROCEDURE sp_SeedData;
GO
CREATE PROCEDURE sp_SeedData
AS
BEGIN
    -- Roles
    IF NOT EXISTS (SELECT 1 FROM roles)
    BEGIN
        INSERT INTO roles (nombre, descripcion) VALUES ('ADMIN', 'Administrador Global');
        INSERT INTO roles (nombre, descripcion) VALUES ('MEDICO', 'Personal Medico');
        INSERT INTO roles (nombre, descripcion) VALUES ('PACIENTE', 'Usuario Regular');
        INSERT INTO roles (nombre, descripcion) VALUES ('RRHH', 'Visualizacion de reportes');
    END

    -- Permisos
    IF NOT EXISTS (SELECT 1 FROM permisos)
    BEGIN
        INSERT INTO permisos (clave, modulo) VALUES ('admin.dashboard', 'admin');
        INSERT INTO permisos (clave, modulo) VALUES ('admin.usuarios.gestionar', 'admin');
        INSERT INTO permisos (clave, modulo) VALUES ('medico.atencion', 'medico');
        INSERT INTO permisos (clave, modulo) VALUES ('paciente.solicitar', 'paciente');
    END
    
    -- Mapeo Permisos a Roles
    IF NOT EXISTS (SELECT 1 FROM roles_permisos)
    BEGIN
        INSERT INTO roles_permisos (id_rol, id_permiso)
        SELECT r.id_rol, p.id_permiso
        FROM roles r, permisos p
        WHERE r.nombre = 'ADMIN';
    END
END;
GO

PRINT '✅ ALL STORED PROCEDURES CREATED SUCCESSFULLY';
GO


CREATE OR ALTER PROCEDURE sp_Auth_HashPassword
    @IdUsuario INT,
    @NewHash NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE usuarios 
    SET password_hash = @NewHash,
        estado = 'A'
    WHERE id_usuario = @IdUsuario;
END;
GO


-- =============================================
-- PSICOSOCIAL PROCEDURES
-- =============================================
IF OBJECT_ID('sp_Medico_GetRegistrosPsicosociales', 'P') IS NOT NULL DROP PROCEDURE sp_Medico_GetRegistrosPsicosociales;
GO
CREATE PROCEDURE sp_Medico_GetRegistrosPsicosociales
    @Pais VARCHAR(2)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT r.*, p.nombre_completo as paciente_nombre, p.carnet as paciente_carnet
    FROM registros_psicosociales r
    JOIN pacientes p ON r.id_paciente = p.id_paciente
    JOIN usuarios u ON p.id_paciente = u.id_paciente
    WHERE u.pais = @Pais
    ORDER BY r.fecha_registro DESC;
END;
GO

IF OBJECT_ID('sp_Medico_CrearRegistroPsicosocial', 'P') IS NOT NULL DROP PROCEDURE sp_Medico_CrearRegistroPsicosocial;
GO
CREATE PROCEDURE sp_Medico_CrearRegistroPsicosocial
    @IdPaciente INT,
    @IdMedico INT,
    @IdAtencion INT = NULL,
    @Confidencial BIT = 0,
    @NivelEstres VARCHAR(20) = NULL,
    @SintomasPsico NVARCHAR(MAX) = NULL,
    @EstadoAnimoGral NVARCHAR(MAX) = NULL,
    @AnalisisSentiment VARCHAR(20) = NULL,
    @RiesgoSuicida BIT = 0,
    @DerivarAPsico BIT = 0,
    @NotasPsico NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO registros_psicosociales (id_paciente, id_medico, id_atencion, confidencial, nivel_estres, sintomas_psico, estado_animo_gral, analisis_sentiment, riesgo_suicida, derivar_a_psico, notas_psico)
    OUTPUT INSERTED.*
    VALUES (@IdPaciente, @IdMedico, @IdAtencion, @Confidencial, @NivelEstres, @SintomasPsico, @EstadoAnimoGral, @AnalisisSentiment, @RiesgoSuicida, @DerivarAPsico, @NotasPsico);
END;
GO
