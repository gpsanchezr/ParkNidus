-- ============================================================
-- ParkControl - Sistema de Control de Parqueadero
-- Script de creacion de base de datos para MySQL Workbench
-- ============================================================

CREATE DATABASE IF NOT EXISTS parkcontrol;
USE parkcontrol;

-- Tabla de Roles
CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(255)
) ENGINE=InnoDB;

-- Tabla de Usuarios
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol_id INT NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Tabla de Tipos de Vehiculo
CREATE TABLE tipos_vehiculo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(255)
) ENGINE=InnoDB;

-- Tabla de Espacios
CREATE TABLE espacios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(10) NOT NULL UNIQUE,
  tipo_vehiculo_id INT NOT NULL,
  disponible BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (tipo_vehiculo_id) REFERENCES tipos_vehiculo(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Tabla de Tarifas
CREATE TABLE tarifas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo_vehiculo_id INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  tipo_cobro ENUM('POR_MINUTO', 'POR_HORA', 'POR_DIA', 'FRACCION') NOT NULL,
  valor DECIMAL(12,2) NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NULL,
  FOREIGN KEY (tipo_vehiculo_id) REFERENCES tipos_vehiculo(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Tabla de Registros (Entradas/Salidas)
CREATE TABLE registros (
  id INT AUTO_INCREMENT PRIMARY KEY,
  placa VARCHAR(10) NOT NULL,
  tipo_vehiculo_id INT NOT NULL,
  espacio_id INT NOT NULL,
  fecha_hora_entrada DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_hora_salida DATETIME NULL,
  minutos_totales INT NULL,
  tarifa_id INT NOT NULL,
  valor_calculado DECIMAL(12,2) NULL,
  estado ENUM('EN_CURSO', 'FINALIZADO') DEFAULT 'EN_CURSO',
  usuario_entrada_id INT NOT NULL,
  usuario_salida_id INT NULL,
  descuento DECIMAL(5,2) NULL DEFAULT 0,
  FOREIGN KEY (tipo_vehiculo_id) REFERENCES tipos_vehiculo(id) ON DELETE RESTRICT,
  FOREIGN KEY (espacio_id) REFERENCES espacios(id) ON DELETE RESTRICT,
  FOREIGN KEY (tarifa_id) REFERENCES tarifas(id) ON DELETE RESTRICT,
  FOREIGN KEY (usuario_entrada_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
  FOREIGN KEY (usuario_salida_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Tabla de Tickets
CREATE TABLE tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  registro_id INT NOT NULL,
  codigo_ticket VARCHAR(50) NOT NULL UNIQUE,
  email_cliente VARCHAR(150) NULL,
  enviado_email BOOLEAN DEFAULT FALSE,
  fecha_emision DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (registro_id) REFERENCES registros(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabla de Sesiones
CREATE TABLE sesiones (
  id VARCHAR(100) PRIMARY KEY,
  usuario_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- Datos iniciales
-- ============================================================

-- Roles
INSERT INTO roles (nombre, descripcion) VALUES
('Administrador', 'Configurar tarifas, gestionar usuarios, ver reportes'),
('Operario', 'Registrar entradas y salidas, generar tickets');

-- Usuarios (contrasenas: admin123 y oper123)
-- NOTA: En produccion, usar bcrypt. Estos son hashes de ejemplo.
INSERT INTO usuarios (nombre, email, password_hash, rol_id, activo) VALUES
('Admin Principal', 'admin@parking.com', '$2b$10$admin_hash_placeholder', 1, TRUE),
('Operario 1', 'operario@parking.com', '$2b$10$oper_hash_placeholder', 2, TRUE);

-- Tipos de Vehiculo
INSERT INTO tipos_vehiculo (nombre, descripcion) VALUES
('Sedan', 'Vehiculo tipo sedan'),
('Camioneta', 'Vehiculo tipo camioneta/SUV'),
('Moto', 'Motocicleta');

-- Espacios para Autos (30 espacios: 15 sedan + 15 camioneta)
INSERT INTO espacios (codigo, tipo_vehiculo_id, disponible)
SELECT CONCAT('A-', LPAD(seq, 2, '0')), IF(seq <= 15, 1, 2), TRUE
FROM (
  SELECT @rownum := @rownum + 1 AS seq
  FROM information_schema.columns a, (SELECT @rownum := 0) r
  LIMIT 30
) t;

-- Espacios para Motos (15 espacios)
INSERT INTO espacios (codigo, tipo_vehiculo_id, disponible)
SELECT CONCAT('M-', LPAD(seq, 2, '0')), 3, TRUE
FROM (
  SELECT @rownum2 := @rownum2 + 1 AS seq
  FROM information_schema.columns a, (SELECT @rownum2 := 0) r
  LIMIT 15
) t;

-- Tarifas iniciales
INSERT INTO tarifas (tipo_vehiculo_id, nombre, tipo_cobro, valor, activo, fecha_inicio) VALUES
(1, 'Tarifa Sedan por Hora', 'POR_HORA', 5000.00, TRUE, '2025-01-01'),
(2, 'Tarifa Camioneta por Hora', 'POR_HORA', 7000.00, TRUE, '2025-01-01'),
(3, 'Tarifa Moto por Hora', 'POR_HORA', 3000.00, TRUE, '2025-01-01');

-- ============================================================
-- Vistas utiles
-- ============================================================

-- Vista: Vehiculos actualmente en el parqueadero
CREATE VIEW v_vehiculos_en_curso AS
SELECT
  r.id,
  r.placa,
  tv.nombre AS tipo_vehiculo,
  e.codigo AS espacio,
  r.fecha_hora_entrada,
  TIMESTAMPDIFF(MINUTE, r.fecha_hora_entrada, NOW()) AS minutos_transcurridos,
  t.nombre AS tarifa_aplicada,
  u.nombre AS operario_entrada
FROM registros r
JOIN tipos_vehiculo tv ON r.tipo_vehiculo_id = tv.id
JOIN espacios e ON r.espacio_id = e.id
JOIN tarifas t ON r.tarifa_id = t.id
JOIN usuarios u ON r.usuario_entrada_id = u.id
WHERE r.estado = 'EN_CURSO';

-- Vista: Reporte de ingresos por dia
CREATE VIEW v_ingresos_diarios AS
SELECT
  DATE(r.fecha_hora_salida) AS fecha,
  tv.nombre AS tipo_vehiculo,
  COUNT(*) AS cantidad,
  SUM(r.valor_calculado) AS total_ingresos
FROM registros r
JOIN tipos_vehiculo tv ON r.tipo_vehiculo_id = tv.id
WHERE r.estado = 'FINALIZADO'
GROUP BY DATE(r.fecha_hora_salida), tv.nombre
ORDER BY fecha DESC;

-- Vista: Disponibilidad de espacios
CREATE VIEW v_disponibilidad AS
SELECT
  tv.nombre AS tipo_vehiculo,
  COUNT(*) AS total_espacios,
  SUM(e.disponible) AS disponibles,
  COUNT(*) - SUM(e.disponible) AS ocupados
FROM espacios e
JOIN tipos_vehiculo tv ON e.tipo_vehiculo_id = tv.id
GROUP BY tv.nombre;
