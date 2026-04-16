-- ParkNidus Supabase Schema (PostgreSQL)
-- Execute in Supabase SQL Editor

-- Enable RLS later for security

-- Roles Table
CREATE TABLE roles (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users Table
CREATE TABLE usuarios (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  rol_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicle Types
CREATE TABLE tipos_vehiculo (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spaces
CREATE TABLE espacios (
  id BIGSERIAL PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  tipo_vehiculo_id BIGINT NOT NULL REFERENCES tipos_vehiculo(id) ON DELETE RESTRICT,
  disponible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tariffs
CREATE TABLE tarifas (
  id BIGSERIAL PRIMARY KEY,
  tipo_vehiculo_id BIGINT NOT NULL REFERENCES tipos_vehiculo(id) ON DELETE RESTRICT,
  nombre TEXT NOT NULL,
  tipo_cobro TEXT CHECK (tipo_cobro IN ('POR_MINUTO', 'POR_HORA', 'POR_DIA', 'FRACCION')) NOT NULL,
  valor NUMERIC(12,2) NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Records (Entries/Exits)
CREATE TABLE registros (
  id BIGSERIAL PRIMARY KEY,
  placa TEXT NOT NULL,
  tipo_vehiculo_id BIGINT NOT NULL REFERENCES tipos_vehiculo(id) ON DELETE RESTRICT,
  espacio_id BIGINT NOT NULL REFERENCES espacios(id) ON DELETE RESTRICT,
  fecha_hora_entrada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_hora_salida TIMESTAMPTZ,
  minutos_totales INTEGER,
  tarifa_id BIGINT NOT NULL REFERENCES tarifas(id) ON DELETE RESTRICT,
  valor_calculado NUMERIC(12,2),
  estado TEXT CHECK (estado IN ('EN_CURSO', 'FINALIZADO')) DEFAULT 'EN_CURSO',
  usuario_entrada_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
  usuario_salida_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
  descuento NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tickets
CREATE TABLE tickets (
  id BIGSERIAL PRIMARY KEY,
  registro_id BIGINT NOT NULL REFERENCES registros(id) ON DELETE CASCADE,
  codigo_ticket TEXT NOT NULL UNIQUE,
  email_cliente TEXT,
  enviado_email BOOLEAN DEFAULT FALSE,
  fecha_emision TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions
CREATE TABLE sesiones (
  id TEXT PRIMARY KEY,
  usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initial Data
INSERT INTO roles (nombre, descripcion) VALUES
('Administrador', 'Configurar tarifas, gestionar usuarios, ver reportes'),
('Operario', 'Registrar entradas y salidas, generar tickets');

INSERT INTO usuarios (nombre, email, password_hash, rol_id) VALUES
('Admin Principal', 'admin@parking.com', '$2b$10$N2QvG6iZ0kZ1x2y3w4v5u6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1', 1),
('Operario 1', 'operario@parking.com', '$2b$10$O2PqR3sT4uV5wX6yZ7aB8cD9eF0gH1i2J3k4L5m6N7oP8qR9sT0u', 2);

INSERT INTO tipos_vehiculo (nombre, descripcion) VALUES
('Sedan', 'Vehiculo tipo sedan'),
('Camioneta', 'Vehiculo tipo camioneta/SUV'),
('Moto', 'Motocicleta');

-- Auto spaces (30)
INSERT INTO espacios (codigo, tipo_vehiculo_id) SELECT 
  'A-' || LPAD(id::TEXT, 2, '0'), 
  CASE WHEN id <= 15 THEN 1 ELSE 2 END 
FROM generate_series(1,30) id;

-- Moto spaces (15)
INSERT INTO espacios (codigo, tipo_vehiculo_id) SELECT 
  'M-' || LPAD(id::TEXT, 2, '0'), 3 
FROM generate_series(1,15) id;

INSERT INTO tarifas (tipo_vehiculo_id, nombre, tipo_cobro, valor, activo, fecha_inicio) VALUES
(1, 'Tarifa Sedan por Hora', 'POR_HORA', 5000.00, true, '2025-01-01'),
(2, 'Tarifa Camioneta por Hora', 'POR_HORA', 7000.00, true, '2025-01-01'),
(3, 'Tarifa Moto por Hora', 'POR_HORA', 3000.00, true, '2025-01-01');

-- RPC Functions for Views
CREATE OR REPLACE FUNCTION v_vehiculos_en_curso()
RETURNS TABLE (
  id BIGINT, placa TEXT, tipo_vehiculo TEXT, espacio TEXT,
  fecha_hora_entrada TIMESTAMPTZ, minutos_transcurridos INTEGER,
  tarifa_aplicada TEXT, operario_entrada TEXT
) LANGUAGE SQL AS $$
  SELECT r.id, r.placa, tv.nombre, e.codigo, r.fecha_hora_entrada,
    EXTRACT(EPOCH FROM (NOW() - r.fecha_hora_entrada))/60::INTEGER,
    t.nombre, u.nombre
  FROM registros r JOIN tipos_vehiculo tv ON r.tipo_vehiculo_id = tv.id
  JOIN espacios e ON r.espacio_id = e.id
  JOIN tarifas t ON r.tarifa_id = t.id
  JOIN usuarios u ON r.usuario_entrada_id = u.id
  WHERE r.estado = 'EN_CURSO';
$$;

CREATE OR REPLACE FUNCTION v_disponibilidad()
RETURNS TABLE (tipo_vehiculo TEXT, total_espacios INTEGER, disponibles INTEGER, ocupados INTEGER)
LANGUAGE SQL AS $$
  SELECT tv.nombre, COUNT(*), SUM(CASE WHEN e.disponible THEN 1 ELSE 0 END),
    COUNT(*) - SUM(CASE WHEN e.disponible THEN 1 ELSE 0 END)
  FROM espacios e JOIN tipos_vehiculo tv ON e.tipo_vehiculo_id = tv.id
  GROUP BY tv.nombre;
$$;

