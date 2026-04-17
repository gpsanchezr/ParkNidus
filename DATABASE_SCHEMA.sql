-- ============================================================
-- PARKNIDUS — ESQUEMA POSTGRESQL para Supabase
-- Sistema Web de Control de Parqueadero — SENA ADSO-17
-- ============================================================

-- Ejecutar en Supabase SQL Editor (no CREATE DATABASE)

-- 1. ROLES (exact 2 roles)
CREATE TABLE IF NOT EXISTS roles (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE CHECK (nombre IN ('Administrador', 'Operario')),
  descripcion TEXT
);

-- 2. USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  rol_id BIGINT NOT NULL REFERENCES roles(id),
  activo BOOLEAN DEFAULT true,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TIPOS DE VEHÍCULO (exact 3)
CREATE TABLE IF NOT EXISTS tipos_vehiculo (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE CHECK (nombre IN ('Sedan', 'Camioneta', 'Moto')),
  descripcion TEXT
);

-- 4. ESPACIOS (exact 30 autos + 15 motos = 45)
CREATE TABLE IF NOT EXISTS espacios (
  id BIGSERIAL PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  tipo_vehiculo_id BIGINT NOT NULL REFERENCES tipos_vehiculo(id),
  disponible BOOLEAN DEFAULT true
);

-- 5. TARIFAS
CREATE TABLE IF NOT EXISTS tarifas (
  id BIGSERIAL PRIMARY KEY,
  tipo_vehiculo_id BIGINT NOT NULL REFERENCES tipos_vehiculo(id),
  nombre TEXT NOT NULL,
  tipo_cobro TEXT CHECK (tipo_cobro IN ('POR_MINUTO','POR_HORA','POR_DIA','FRACCION')) NOT NULL,
  valor NUMERIC(10,2) NOT NULL,
  activo BOOLEAN DEFAULT true,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE
);

-- 6. REGISTROS
CREATE TABLE IF NOT EXISTS registros (
  id BIGSERIAL PRIMARY KEY,
  placa TEXT NOT NULL,
  tipo_vehiculo_id BIGINT NOT NULL REFERENCES tipos_vehiculo(id),
  espacio_id BIGINT NOT NULL REFERENCES espacios(id),
  fecha_hora_entrada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_hora_salida TIMESTAMPTZ,
  minutos_totales INTEGER,
  tarifa_id BIGINT NOT NULL REFERENCES tarifas(id),
  valor_calculado NUMERIC(10,2),
  descuento NUMERIC(5,2) DEFAULT 0,
  estado TEXT CHECK (estado IN ('EN_CURSO','FINALIZADO')) DEFAULT 'EN_CURSO',
  usuario_entrada_id BIGINT NOT NULL REFERENCES usuarios(id),
  usuario_salida_id BIGINT REFERENCES usuarios(id),
  INDEX idx_placa_estado (placa, estado),
  INDEX idx_espacio (espacio_id),
  INDEX idx_fecha_entrada (fecha_hora_entrada)
);

-- 7. TICKETS
CREATE TABLE IF NOT EXISTS tickets (
  id BIGSERIAL PRIMARY KEY,
  registro_id BIGINT NOT NULL REFERENCES registros(id),
  codigo_ticket TEXT UNIQUE NOT NULL,
  email_cliente TEXT,
  enviado_email BOOLEAN DEFAULT false,
  fecha_emision TIMESTAMPTZ DEFAULT NOW()
);

-- SESSIONS (for auth)
CREATE TABLE IF NOT EXISTS sesiones (
  id TEXT PRIMARY KEY,
  usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DATOS INICIALES (exact requirements)
-- ============================================================

-- Roles
DELETE FROM roles;
INSERT INTO roles (id, nombre, descripcion) VALUES
(1, 'Administrador', 'Acceso completo: tarifas, usuarios, reportes'),
(2, 'Operario', 'Registro de entradas, salidas y cupos');

-- Usuarios demo (hash con simpleHash del código)
DELETE FROM usuarios;
INSERT INTO usuarios (nombre, email, password_hash, rol_id) VALUES
('Admin Principal', 'admin@parking.com', 'hashed_1b6r4_10', 1),
('Operario 1', 'operario@parking.com', 'hashed_1bb7x_8', 2);

-- Tipos vehiculo
DELETE FROM tipos_vehiculo;
INSERT INTO tipos_vehiculo VALUES
(1, 'Sedan', 'Vehículo tipo sedán'),
(2, 'Camioneta', 'Vehículo tipo camioneta / SUV'),
(3, 'Moto', 'Motocicleta');

-- Espacios exactos (30 autos A01-30, 15 motos M01-15)
DELETE FROM espacios;
INSERT INTO espacios (codigo, tipo_vehiculo_id) VALUES
('A-01', 1), ('A-02', 1), ('A-03', 1), ('A-04', 1), ('A-05', 1),
('A-06', 1), ('A-07', 1), ('A-08', 1), ('A-09', 1), ('A-10', 1),
('A-11', 1), ('A-12', 1), ('A-13', 1), ('A-14', 1), ('A-15', 1),
('A-16', 2), ('A-17', 2), ('A-18', 2), ('A-19', 2), ('A-20', 2),
('A-21', 2), ('A-22', 2), ('A-23', 2), ('A-24', 2), ('A-25', 2),
('A-26', 2), ('A-27', 2), ('A-28', 2), ('A-29', 2), ('A-30', 2),
('M-01', 3), ('M-02', 3), ('M-03', 3), ('M-04', 3), ('M-05', 3),
('M-06', 3), ('M-07', 3), ('M-08', 3), ('M-09', 3), ('M-10', 3),
('M-11', 3), ('M-12', 3), ('M-13', 3), ('M-14', 3), ('M-15', 3);

-- Tarifas demo diferenciadas
DELETE FROM tarifas;
INSERT INTO tarifas VALUES
(1, 1, 'Tarifa Sedan por Hora', 'POR_HORA', 5000, true, '2024-01-01', null),
(2, 2, 'Tarifa Camioneta por Hora', 'POR_HORA', 7000, true, '2024-01-01', null),
(3, 3, 'Tarifa Moto por Hora', 'POR_HORA', 3000, true, '2024-01-01', null);

-- VISTAS ÚTILES
DROP VIEW IF EXISTS vista_cupos;
CREATE VIEW vista_cupos AS
SELECT tv.nombre AS tipo,
  COUNT(e.id) AS total,
  SUM(CASE WHEN e.disponible THEN 1 ELSE 0 END)::INTEGER AS disponibles,
  COUNT(e.id) - SUM(CASE WHEN e.disponible THEN 1 ELSE 0 END)::INTEGER AS ocupados
FROM espacios e JOIN tipos_vehiculo tv ON e.tipo_vehiculo_id = tv.id
GROUP BY tv.id, tv.nombre;

DROP VIEW IF EXISTS vista_vehiculos_activos;
CREATE VIEW vista_vehiculos_activos AS
SELECT r.id, r.placa, tv.nombre AS tipo, e.codigo AS espacio,
  r.fecha_hora_entrada, r.estado,
  EXTRACT(EPOCH FROM (NOW() - r.fecha_hora_entrada))/60::INTEGER AS minutos_en_parking,
  u.nombre AS operario_entrada
FROM registros r
JOIN tipos_vehiculo tv ON tv.id = r.tipo_vehiculo_id
JOIN espacios e ON e.id = r.espacio_id
JOIN usuarios u ON u.id = r.usuario_entrada_id
WHERE r.estado = 'EN_CURSO';

DROP VIEW IF EXISTS vista_reporte_ingresos;
CREATE VIEW vista_reporte_ingresos AS
SELECT DATE(r.fecha_hora_salida) AS fecha,
  tv.nombre AS tipo_vehiculo,
  COUNT(*) AS cantidad_vehiculos,
  COALESCE(SUM(r.valor_calculado), 0) AS ingresos_totales,
  AVG(r.minutos_totales) AS minutos_promedio
FROM registros r JOIN tipos_vehiculo tv ON tv.id = r.tipo_vehiculo_id
WHERE r.estado = 'FINALIZADO'
GROUP BY fecha, tv.id, tv.nombre
ORDER BY fecha DESC;

-- ============================================================
-- ✅ SCHEMA POSTGRES COMPLETE — 45 ESPACIOS EXACTOS
-- Ready for lib/supabase/database.types.ts regen
-- ============================================================
