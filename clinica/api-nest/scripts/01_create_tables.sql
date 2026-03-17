-- 01_CREATE_TABLES.sql

-- TABLA: roles
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='roles' AND xtype='U')
CREATE TABLE roles (
    id_rol      INT IDENTITY(1,1) PRIMARY KEY,
    nombre      VARCHAR(50) UNIQUE NOT NULL,
    descripcion VARCHAR(255) NULL
);

-- TABLA: permisos
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='permisos' AND xtype='U')
CREATE TABLE permisos (
    id_permiso  INT IDENTITY(1,1) PRIMARY KEY,
    clave       VARCHAR(100) UNIQUE NOT NULL,
    descripcion VARCHAR(255) NULL,
    modulo      VARCHAR(50) NOT NULL
);

-- TABLA: roles_permisos
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='roles_permisos' AND xtype='U')
CREATE TABLE roles_permisos (
    id_rol      INT NOT NULL FOREIGN KEY REFERENCES roles(id_rol),
    id_permiso  INT NOT NULL FOREIGN KEY REFERENCES permisos(id_permiso),
    PRIMARY KEY (id_rol, id_permiso)
);

-- TABLA: pacientes
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='pacientes' AND xtype='U')
CREATE TABLE pacientes (
    id_paciente       INT IDENTITY(1,1) PRIMARY KEY,
    carnet            VARCHAR(50) UNIQUE NOT NULL,
    nombre_completo   VARCHAR(255) NOT NULL,
    fecha_nacimiento  DATE NULL,
    sexo              VARCHAR(50) NULL,
    telefono          VARCHAR(20) NULL,
    correo            VARCHAR(100) NULL,
    gerencia          VARCHAR(100) NULL,
    area              VARCHAR(100) NULL,
    estado_paciente   CHAR(1) NOT NULL DEFAULT 'A',
    nivel_semaforo    CHAR(1) NULL CHECK (nivel_semaforo IN ('V','A','R'))
);

-- TABLA: medicos
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='medicos' AND xtype='U')
CREATE TABLE medicos (
    id_medico       INT IDENTITY(1,1) PRIMARY KEY,
    carnet          VARCHAR(50) UNIQUE NULL,
    nombre_completo VARCHAR(255) NOT NULL,
    especialidad    VARCHAR(100) NULL,
    tipo_medico     VARCHAR(20) NOT NULL CHECK (tipo_medico IN ('INTERNO','EXTERNO')),
    correo          VARCHAR(100) NULL,
    telefono        VARCHAR(20) NULL,
    estado_medico   CHAR(1) NOT NULL DEFAULT 'A'
);

-- TABLA: usuarios
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='usuarios' AND xtype='U')
CREATE TABLE usuarios (
    id_usuario      INT IDENTITY(1,1) PRIMARY KEY,
    carnet          VARCHAR(50) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(255) NOT NULL,
    correo          VARCHAR(100) NULL,
    id_rol          INT NOT NULL FOREIGN KEY REFERENCES roles(id_rol),
    pais            VARCHAR(2) NOT NULL CHECK (pais IN ('NI','CR','HN')),
    estado          CHAR(1) NOT NULL DEFAULT 'A' CHECK (estado IN ('A','I')),
    ultimo_acceso   DATETIME2 NULL,
    id_paciente     INT NULL FOREIGN KEY REFERENCES pacientes(id_paciente),
    id_medico       INT NULL FOREIGN KEY REFERENCES medicos(id_medico),
    fecha_creacion  DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- TABLA: empleados
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='empleados' AND xtype='U')
CREATE TABLE empleados (
    id_empleado        INT IDENTITY(1,1) PRIMARY KEY,
    carnet             VARCHAR(50) UNIQUE NOT NULL,
    nombre_completo    VARCHAR(255) NOT NULL,
    correo             VARCHAR(100) NULL,
    cargo              VARCHAR(100) NULL,
    gerencia           VARCHAR(100) NULL,
    subgerencia        VARCHAR(100) NULL,
    area               VARCHAR(100) NULL,
    telefono           VARCHAR(20) NULL,
    nom_jefe           VARCHAR(255) NULL,
    correo_jefe        VARCHAR(100) NULL,
    carnet_jefe        VARCHAR(50) NULL,
    pais               VARCHAR(2) NOT NULL,
    fecha_nacimiento   DATE NULL,
    fecha_contratacion DATE NULL,
    estado             VARCHAR(10) NOT NULL DEFAULT 'ACTIVO'
);

-- TABLA: casos_clinicos
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='casos_clinicos' AND xtype='U')
CREATE TABLE casos_clinicos (
    id_caso                  INT IDENTITY(1,1) PRIMARY KEY,
    codigo_caso              VARCHAR(20) UNIQUE NOT NULL,
    id_paciente              INT NOT NULL FOREIGN KEY REFERENCES pacientes(id_paciente),
    fecha_creacion           DATETIME2 NOT NULL DEFAULT GETDATE(),
    estado_caso              VARCHAR(50) NOT NULL DEFAULT 'Abierto',
    nivel_semaforo           CHAR(1) NOT NULL CHECK (nivel_semaforo IN ('V','A','R')),
    motivo_consulta          NVARCHAR(MAX) NOT NULL,
    resumen_clinico_usuario  NVARCHAR(MAX) NULL,
    diagnostico_usuario      NVARCHAR(MAX) NULL,
    datos_extra              NVARCHAR(MAX) NULL,  
    id_cita_principal        INT NULL
);

-- TABLA: citas_medicas
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='citas_medicas' AND xtype='U')
CREATE TABLE citas_medicas (
    id_cita                  INT IDENTITY(1,1) PRIMARY KEY,
    id_paciente              INT NOT NULL FOREIGN KEY REFERENCES pacientes(id_paciente),
    id_medico                INT NOT NULL FOREIGN KEY REFERENCES medicos(id_medico),
    id_caso                  INT NULL FOREIGN KEY REFERENCES casos_clinicos(id_caso),
    fecha_cita               DATE NOT NULL,
    hora_cita                VARCHAR(8) NOT NULL,
    canal_origen             VARCHAR(100) NOT NULL,
    estado_cita              VARCHAR(50) NOT NULL DEFAULT 'PROGRAMADA',
    motivo_resumen           NVARCHAR(MAX) NOT NULL,
    nivel_semaforo_paciente  CHAR(1) NOT NULL
);

-- UPDATE FK de citas principal en casos (se hace despues de crear citas_medicas)
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_casos_cita_principal')
ALTER TABLE casos_clinicos ADD CONSTRAINT FK_casos_cita_principal 
    FOREIGN KEY (id_cita_principal) REFERENCES citas_medicas(id_cita);

-- TABLA: atenciones_medicas
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='atenciones_medicas' AND xtype='U')
CREATE TABLE atenciones_medicas (
    id_atencion              INT IDENTITY(1,1) PRIMARY KEY,
    id_cita                  INT NOT NULL UNIQUE FOREIGN KEY REFERENCES citas_medicas(id_cita),
    id_medico                INT NOT NULL FOREIGN KEY REFERENCES medicos(id_medico),
    fecha_atencion           DATETIME2 NOT NULL DEFAULT GETDATE(),
    diagnostico_principal    NVARCHAR(MAX) NOT NULL,
    plan_tratamiento         NVARCHAR(MAX) NULL,
    recomendaciones          NVARCHAR(MAX) NULL,
    requiere_seguimiento     BIT NOT NULL DEFAULT 0,
    fecha_siguiente_cita     DATE NULL,
    tipo_siguiente_cita      VARCHAR(50) NULL,
    notas_seguimiento_medico NVARCHAR(MAX) NULL,
    peso_kg                  DECIMAL(5,2) NULL,
    altura_m                 DECIMAL(3,2) NULL,
    presion_arterial         VARCHAR(10) NULL,
    frecuencia_cardiaca      INT NULL,
    temperatura_c            DECIMAL(4,1) NULL
);

-- TABLA: chequeos_bienestar
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='chequeos_bienestar' AND xtype='U')
CREATE TABLE chequeos_bienestar (
    id_chequeo      INT IDENTITY(1,1) PRIMARY KEY,
    id_paciente     INT NOT NULL FOREIGN KEY REFERENCES pacientes(id_paciente),
    fecha_registro  DATETIME2 NOT NULL DEFAULT GETDATE(),
    nivel_semaforo  CHAR(1) NOT NULL CHECK (nivel_semaforo IN ('V','A','R')),
    datos_completos NVARCHAR(MAX) NOT NULL  
);

-- TABLA: seguimientos
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='seguimientos' AND xtype='U')
CREATE TABLE seguimientos (
    id_seguimiento      INT IDENTITY(1,1) PRIMARY KEY,
    id_caso             INT NULL FOREIGN KEY REFERENCES casos_clinicos(id_caso),
    id_atencion         INT NULL FOREIGN KEY REFERENCES atenciones_medicas(id_atencion),
    id_paciente         INT NOT NULL FOREIGN KEY REFERENCES pacientes(id_paciente),
    id_usuario_resp     INT NULL FOREIGN KEY REFERENCES usuarios(id_usuario),
    fecha_programada    DATE NOT NULL,
    fecha_real          DATE NULL,
    tipo_seguimiento    VARCHAR(20) NOT NULL DEFAULT 'PRESENCIAL',
    estado_seguimiento  VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    nivel_semaforo      CHAR(1) NOT NULL DEFAULT 'V',
    notas_seguimiento   NVARCHAR(MAX) NULL,
    motivo              NVARCHAR(MAX) NULL
);

-- TABLA: examenes_medicos
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='examenes_medicos' AND xtype='U')
CREATE TABLE examenes_medicos (
    id_examen         INT IDENTITY(1,1) PRIMARY KEY,
    id_paciente       INT NOT NULL FOREIGN KEY REFERENCES pacientes(id_paciente),
    id_caso           INT NULL FOREIGN KEY REFERENCES casos_clinicos(id_caso),
    id_atencion       INT NULL FOREIGN KEY REFERENCES atenciones_medicas(id_atencion),
    tipo_examen       VARCHAR(100) NOT NULL,
    fecha_solicitud   DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_resultado   DATETIME2 NULL,
    laboratorio       VARCHAR(100) NULL,
    resultado_resumen NVARCHAR(MAX) NULL,
    estado_examen     VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE'
);

-- TABLA: vacunas_aplicadas
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='vacunas_aplicadas' AND xtype='U')
CREATE TABLE vacunas_aplicadas (
    id_vacuna_registro INT IDENTITY(1,1) PRIMARY KEY,
    id_paciente        INT NOT NULL FOREIGN KEY REFERENCES pacientes(id_paciente),
    id_medico          INT NULL FOREIGN KEY REFERENCES medicos(id_medico),
    id_atencion        INT NULL FOREIGN KEY REFERENCES atenciones_medicas(id_atencion),
    tipo_vacuna        VARCHAR(100) NOT NULL,
    dosis              VARCHAR(50) NOT NULL,
    fecha_aplicacion   DATE NOT NULL,
    observaciones      NVARCHAR(MAX) NULL
);

-- TABLA: registros_psicosociales
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='registros_psicosociales' AND xtype='U')
CREATE TABLE registros_psicosociales (
    id_registro_psico  INT IDENTITY(1,1) PRIMARY KEY,
    id_paciente        INT NOT NULL FOREIGN KEY REFERENCES pacientes(id_paciente),
    id_medico          INT NULL FOREIGN KEY REFERENCES medicos(id_medico),
    id_atencion        INT NULL FOREIGN KEY REFERENCES atenciones_medicas(id_atencion),
    fecha_registro     DATETIME2 NOT NULL DEFAULT GETDATE(),
    confidencial       BIT NOT NULL DEFAULT 0,
    nivel_estres       VARCHAR(20) NULL,
    sintomas_psico     NVARCHAR(MAX) NULL, 
    estado_animo_gral  NVARCHAR(MAX) NULL,
    analisis_sentiment VARCHAR(20) NULL,
    riesgo_suicida     BIT NULL,
    derivar_a_psico    BIT NULL,
    notas_psico        NVARCHAR(MAX) NULL
);
