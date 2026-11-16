CREATE DATABASE IF NOT EXISTS tp3_transporte
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE tp3_transporte;

-- Usuarios (autenticación con JWT)
CREATE TABLE IF NOT EXISTS usuarios (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  password VARCHAR(255) NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_email (email)
) ENGINE = InnoDB;

-- Vehículos
CREATE TABLE IF NOT EXISTS vehiculos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  marca VARCHAR(50) NOT NULL,
  modelo VARCHAR(50) NOT NULL,
  patente VARCHAR(10) NOT NULL,
  anio SMALLINT UNSIGNED NOT NULL,
  capacidad_carga DECIMAL(10, 2) NOT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_vehiculos_patente (patente),
  CONSTRAINT chk_vehiculos_capacidad CHECK (capacidad_carga > 0),
  CONSTRAINT chk_vehiculos_anio CHECK (anio >= 1950)
) ENGINE = InnoDB;

-- Conductores
CREATE TABLE IF NOT EXISTS conductores (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL,
  apellido VARCHAR(50) NOT NULL,
  documento VARCHAR(15) NOT NULL,
  nro_licencia VARCHAR(30) NOT NULL,
  fecha_alta_licencia DATE NOT NULL,
  fecha_vencimiento_licencia DATE NOT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_conductores_documento (documento),
  UNIQUE KEY uq_conductores_licencia (nro_licencia),
  CONSTRAINT chk_conductores_fechas CHECK (fecha_vencimiento_licencia > fecha_alta_licencia)
) ENGINE = InnoDB;

-- Viajes
CREATE TABLE IF NOT EXISTS viajes (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  vehiculo_id INT UNSIGNED NOT NULL,
  conductor_id INT UNSIGNED NOT NULL,
  fecha_salida DATETIME NOT NULL,
  fecha_llegada DATETIME NOT NULL,
  origen VARCHAR(100) NOT NULL,
  destino VARCHAR(100) NOT NULL,
  kilometros DECIMAL(10, 2) NOT NULL,
  observaciones VARCHAR(500) NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_viajes_vehiculo (vehiculo_id),
  KEY idx_viajes_conductor (conductor_id),
  KEY idx_viajes_fecha_salida (fecha_salida),
  CONSTRAINT fk_viajes_vehiculo FOREIGN KEY (vehiculo_id)
    REFERENCES vehiculos (id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_viajes_conductor FOREIGN KEY (conductor_id)
    REFERENCES conductores (id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_viajes_fechas CHECK (fecha_llegada > fecha_salida),
  CONSTRAINT chk_viajes_km CHECK (kilometros > 0)
) ENGINE = InnoDB;

-- Datos de ejemplo
-- Los usuarios se crean desde /api/auth/register para guardar la
-- contraseña encriptada con bcrypt.
INSERT INTO vehiculos (marca, modelo, patente, anio, capacidad_carga)
VALUES
  ('Volvo', 'FH 460', 'AB123CD', 2021, 25000.00),
  ('Mercedes-Benz', 'Actros 2646', 'AC456DE', 2019, 30000.00),
  ('Scania', 'R 450', 'AD789EF', 2022, 28000.00),
  ('Iveco', 'Stralis 460', 'AE321GH', 2020, 22000.00)
ON DUPLICATE KEY UPDATE patente = VALUES(patente);

INSERT INTO conductores
  (nombre, apellido, documento, nro_licencia, fecha_alta_licencia, fecha_vencimiento_licencia)
VALUES
  ('Esteban', 'Martínez', '30111222', 'LIC-0001', '2022-03-15', '2027-03-15'),
  ('Sofía', 'Romero', '28999888', 'LIC-0002', '2023-08-01', '2028-08-01'),
  ('Ana', 'Navarro', '34555666', 'LIC-0003', '2023-04-10', '2028-04-10'),
  ('Lucas', 'Cortez', '33777888', 'LIC-0004', '2022-09-20', '2027-09-20')
ON DUPLICATE KEY UPDATE documento = VALUES(documento), fecha_vencimiento_licencia = VALUES(fecha_vencimiento_licencia);

INSERT INTO viajes (vehiculo_id, conductor_id, fecha_salida, fecha_llegada, origen, destino, kilometros, observaciones)
VALUES
  (
    (SELECT id FROM vehiculos WHERE patente = 'AB123CD'),
    (SELECT id FROM conductores WHERE nro_licencia = 'LIC-0001'),
    '2026-11-01 07:00:00',
    '2026-11-01 11:30:00',
    'La Rioja',
    'Chilecito',
    200.50,
    'Transporte de insumos agrícolas por RN 38 y RN 74'
  ),
  (
    (SELECT id FROM vehiculos WHERE patente = 'AC456DE'),
    (SELECT id FROM conductores WHERE nro_licencia = 'LIC-0002'),
    '2026-11-03 08:30:00',
    '2026-11-03 11:00:00',
    'La Rioja',
    'Aimogasta',
    115.00,
    'Distribución de mercadería general'
  ),
  (
    (SELECT id FROM vehiculos WHERE patente = 'AD789EF'),
    (SELECT id FROM conductores WHERE nro_licencia = 'LIC-0003'),
    '2026-11-05 06:00:00',
    '2026-11-05 12:45:00',
    'La Rioja',
    'Villa Unión',
    275.20,
    'Carga de materiales de construcción hacia el Valle del Bermejo'
  ),
  (
    (SELECT id FROM vehiculos WHERE patente = 'AE321GH'),
    (SELECT id FROM conductores WHERE nro_licencia = 'LIC-0004'),
    '2026-11-08 07:15:00',
    '2026-11-08 13:00:00',
    'La Rioja',
    'Chepes',
    245.00,
    'Traslado de repuestos mineros y herramientas'
  ),
  (
    (SELECT id FROM vehiculos WHERE patente = 'AB123CD'),
    (SELECT id FROM conductores WHERE nro_licencia = 'LIC-0002'),
    '2026-11-10 09:00:00',
    '2026-11-10 12:30:00',
    'La Rioja',
    'Catamarca',
    155.80,
    'Flete interprovincial por RN 38 sin demoras'
  ),
  (
    (SELECT id FROM vehiculos WHERE patente = 'AC456DE'),
    (SELECT id FROM conductores WHERE nro_licencia = 'LIC-0001'),
    '2026-11-12 05:00:00',
    '2026-11-12 14:00:00',
    'La Rioja',
    'Córdoba',
    435.00,
    'Entrega de productos regionales y aceites'
  );
