-- =====================================================
-- MindfulTrack Database
-- Base de Datos Normalizada (3FN)
-- =====================================================

DROP TABLE IF EXISTS habit_logs;
DROP TABLE IF EXISTS habits;
DROP TABLE IF EXISTS mood_logs;
DROP TABLE IF EXISTS pomodoros;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS roles;

-- =========================
-- TABLA ROLES
-- =========================

CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL UNIQUE
);

INSERT INTO roles(nombre)
VALUES
('Administrador'),
('Usuario');

-- =========================
-- TABLA USUARIOS
-- =========================

CREATE TABLE usuarios (

    id INT AUTO_INCREMENT PRIMARY KEY,

    nombre VARCHAR(80) NOT NULL,

    apellido VARCHAR(80) NOT NULL,

    correo VARCHAR(120) UNIQUE NOT NULL,

    password VARCHAR(255) NOT NULL,

    rol_id INT NOT NULL DEFAULT 2,

    activo BOOLEAN DEFAULT TRUE,

    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_usuario_rol
        FOREIGN KEY (rol_id)
        REFERENCES roles(id)

);

-- =========================
-- POMODOROS
-- =========================

CREATE TABLE pomodoros (

    id INT AUTO_INCREMENT PRIMARY KEY,

    usuario_id INT NOT NULL,

    duracion INT NOT NULL,

    completado BOOLEAN DEFAULT FALSE,

    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_pomodoro_usuario
        FOREIGN KEY(usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE

);

-- =========================
-- ESTADO DE ANIMO
-- =========================

CREATE TABLE mood_logs (

    id INT AUTO_INCREMENT PRIMARY KEY,

    usuario_id INT NOT NULL,

    estado ENUM(
        'Excelente',
        'Bueno',
        'Normal',
        'Triste',
        'Estresado'
    ) NOT NULL,

    nivel_estres TINYINT NOT NULL,

    comentario TEXT,

    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_mood_usuario
        FOREIGN KEY(usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE

);

-- =========================
-- HABITOS
-- =========================

CREATE TABLE habits (

    id INT AUTO_INCREMENT PRIMARY KEY,

    usuario_id INT NOT NULL,

    nombre VARCHAR(100) NOT NULL,

    descripcion TEXT,

    objetivo_diario INT DEFAULT 1,

    activo BOOLEAN DEFAULT TRUE,

    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_habito_usuario
        FOREIGN KEY(usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE

);

-- =========================
-- REGISTRO DE HABITOS
-- =========================

CREATE TABLE habit_logs (

    id INT AUTO_INCREMENT PRIMARY KEY,

    habit_id INT NOT NULL,

    fecha DATE NOT NULL,

    completado BOOLEAN DEFAULT FALSE,

    CONSTRAINT fk_log_habito
        FOREIGN KEY(habit_id)
        REFERENCES habits(id)
        ON DELETE CASCADE

);

-- =========================
-- INDICES
-- =========================

CREATE INDEX idx_usuario_correo
ON usuarios(correo);

CREATE INDEX idx_pomodoro_usuario
ON pomodoros(usuario_id);

CREATE INDEX idx_mood_usuario
ON mood_logs(usuario_id);

CREATE INDEX idx_habit_usuario
ON habits(usuario_id);