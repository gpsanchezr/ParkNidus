-- ============================================================
-- PROJECT: PARKNIDUS - SISTEMA DE GESTIÓN DE PARQUEADEROS
-- VERSION: 1.0 (Dual Schema: Supabase/PostgreSQL & MySQL)
-- AUTHOR: Giseella Sanchez
-- DATE: 2026-04-18
-- ============================================================

/* INSTRUCCIONES:
   1. Si usas Supabase, copia la PARTE A.
   2. Si usas XAMPP/MySQL, copia la PARTE B.
*/

-- ============================================================
-- PARTE A: ESQUEMA PARA SUPABASE (PostgreSQL)
-- ============================================================

-- 1. Limpieza de tablas
DROP VIEW IF EXISTS vista_reporte_ingresos;
DROP VIEW IF EXISTS vista_vehiculos_activos;
DROP VIEW IF EXISTS vista_cupos;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS registros CASCADE;
DROP TABLE IF EXISTS espacios CASCADE;
DROP TABLE IF EXISTS tarifas CASCADE;
DROP TABLE IF EXISTS tipos_vehiculo CASCADE;
DROP TABLE IF EXISTS sesiones CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- 2. Creación de Estructuras
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE CHECK (nombre IN ('Administrador', 'Operario')),
    descripcion TEXT
);

CREATE TABLE usuarios (
    id BIGSERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    rol_id BIGINT NOT NULL REFERENCES roles(id),
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tipos_vehiculo (
    id BIGSERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE CHECK (nombre IN ('Sedan', 'Camioneta', 'Moto')),
    descripcion TEXT
);

CREATE TABLE espacios (
    id BIGSERIAL PRIMARY KEY,
    codigo TEXT NOT NULL UNIQUE,
    tipo_vehiculo_id BIGINT NOT NULL REFERENCES tipos_vehiculo(id),
    disponible BOOLEAN DEFAULT true
);

CREATE TABLE tarifas (
    id BIGSERIAL PRIMARY KEY,
    tipo_vehiculo_id BIGINT NOT NULL REFERENCES tipos_vehiculo(id),
    nombre TEXT NOT NULL,
    tipo_cobro TEXT CHECK (tipo_cobro IN ('POR_HORA','POR_DIA','FRACCION')) NOT NULL,
    valor NUMERIC(10,2) NOT NULL,
    activo BOOLEAN DEFAULT true
);

CREATE TABLE registros (
    id BIGSERIAL PRIMARY KEY,
    placa TEXT NOT NULL,
    tipo_vehiculo_id BIGINT NOT NULL REFERENCES tipos_vehiculo(id),
    espacio_id BIGINT NOT NULL REFERENCES espacios(id),
    fecha_hora_entrada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_hora_salida TIMESTAMPTZ,
    minutos_totales INTEGER,
    tarifa_id BIGINT NOT NULL REFERENCES tarifas(id),
    valor_calculado NUMERIC(10,2),
    estado TEXT CHECK (estado IN ('EN_CURSO','FINALIZADO')) DEFAULT 'EN_CURSO',
    usuario_entrada_id BIGINT NOT NULL REFERENCES usuarios(id),
    usuario_salida_id BIGINT REFERENCES usuarios(id)
);

CREATE TABLE tickets (
    id BIGSERIAL PRIMARY KEY,
    registro_id BIGINT NOT NULL REFERENCES registros(id),
    codigo_ticket TEXT UNIQUE NOT NULL,
    fecha_emision TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Lógica de Negocio (Triggers PostgreSQL)
CREATE OR REPLACE FUNCTION actualizar_espacio_disponibilidad()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE espacios SET disponible = false WHERE id = NEW.espacio_id;
    ELSIF (NEW.estado = 'FINALIZADO') THEN
        UPDATE espacios SET disponible = true WHERE id = NEW.espacio_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_gestion_cupos
AFTER INSERT OR UPDATE ON registros
FOR EACH ROW EXECUTE FUNCTION actualizar_espacio_disponibilidad();

-- 4. Datos Maestros y 45 Espacios
INSERT INTO roles (id, nombre) VALUES (1, 'Administrador'), (2, 'Operario');
INSERT INTO tipos_vehiculo (id, nombre) VALUES (1, 'Sedan'), (2, 'Camioneta'), (3, 'Moto');

-- Generación automática de 30 espacios para Autos y 15 para Motos
DO $$
BEGIN
    FOR i IN 1..30 LOOP
        INSERT INTO espacios (codigo, tipo_vehiculo_id) VALUES ('A-' || LPAD(i::text, 2, '0'), CASE WHEN i <= 15 THEN 1 ELSE 2 END);
    END LOOP;
    FOR i IN 1..15 LOOP
        INSERT INTO espacios (codigo, tipo_vehiculo_id) VALUES ('M-' || LPAD(i::text, 2, '0'), 3);
    END LOOP;
END $$;

INSERT INTO tarifas (tipo_vehiculo_id, nombre, tipo_cobro, valor) VALUES
(1, 'Tarifa Sedan', 'POR_HORA', 5000),
(2, 'Tarifa Camioneta', 'POR_HORA', 7000),
(3, 'Tarifa Moto', 'POR_HORA', 3000);

-- ============================================================
-- PARTE B: ESQUEMA PARA MYSQL (XAMPP / Workbench)
-- ============================================================

/*
CREATE DATABASE IF NOT EXISTS parknidus_db;
USE parknidus_db;

CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre ENUM('Administrador', 'Operario') NOT NULL UNIQUE
);

CREATE TABLE usuarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol_id BIGINT,
    FOREIGN KEY (rol_id) REFERENCES roles(id)
);

CREATE TABLE tipos_vehiculo (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre ENUM('Sedan', 'Camioneta', 'Moto') NOT NULL UNIQUE
);

CREATE TABLE espacios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(10) UNIQUE NOT NULL,
    tipo_vehiculo_id BIGINT,
    disponible BOOLEAN DEFAULT true,
    FOREIGN KEY (tipo_vehiculo_id) REFERENCES tipos_vehiculo(id)
);

CREATE TABLE tarifas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tipo_vehiculo_id BIGINT,
    nombre VARCHAR(100) NOT NULL,
    tipo_cobro ENUM('POR_HORA', 'FRACCION') NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (tipo_vehiculo_id) REFERENCES tipos_vehiculo(id)
);

CREATE TABLE registros (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    placa VARCHAR(10) NOT NULL,
    tipo_vehiculo_id BIGINT,
    espacio_id BIGINT,
    tarifa_id BIGINT,
    fecha_hora_entrada DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_hora_salida DATETIME,
    minutos_totales INT,
    valor_calculado DECIMAL(10,2),
    estado VARCHAR(20) DEFAULT 'EN_CURSO',
    usuario_entrada_id BIGINT,
    usuario_salida_id BIGINT,
    FOREIGN KEY (espacio_id) REFERENCES espacios(id),
    FOREIGN KEY (tarifa_id) REFERENCES tarifas(id)
);

-- Triggers MySQL
DELIMITER //
CREATE TRIGGER trg_ocupar_espacio AFTER INSERT ON registros
FOR EACH ROW BEGIN
    UPDATE espacios SET disponible = false WHERE id = NEW.espacio_id;
END //

CREATE TRIGGER trg_liberar_espacio AFTER UPDATE ON registros
FOR EACH ROW BEGIN
    IF NEW.estado = 'FINALIZADO' THEN
        UPDATE espacios SET disponible = true WHERE id = NEW.espacio_id;
    END IF;
END //
DELIMITER ;

-- Datos Iniciales MySQL
INSERT INTO roles (nombre) VALUES ('Administrador'), ('Operario');
INSERT INTO tipos_vehiculo (nombre) VALUES ('Sedan'), ('Camioneta'), ('Moto');
INSERT INTO tarifas (tipo_vehiculo_id, nombre, tipo_cobro, valor) VALUES (1, 'Sedan', 'POR_HORA', 5000), (2, 'Camioneta', 'POR_HORA', 7000), (3, 'Moto', 'POR_HORA', 3000);

-- Procedimiento para generar cupos
DELIMITER //
CREATE PROCEDURE SetupEspacios()
BEGIN
    DECLARE i INT DEFAULT 1;
    WHILE i <= 30 DO INSERT INTO espacios (codigo, tipo_vehiculo_id) VALUES (CONCAT('A-', LPAD(i,2,'0')), IF(i<=15, 1, 2)); SET i = i + 1; END WHILE;
    SET i = 1;
    WHILE i <= 15 DO INSERT INTO espacios (codigo, tipo_vehiculo_id) VALUES (CONCAT('M-', LPAD(i,2,'0')), 3); SET i = i + 1; END WHILE;
END //
DELIMITER ;
CALL SetupEspacios();
*/