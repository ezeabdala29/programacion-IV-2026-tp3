const { pool } = require('../config/db');

const SELECT_BASE = `
  SELECT
    vi.id,
    vi.vehiculo_id,
    vi.conductor_id,
    vi.fecha_salida,
    vi.fecha_llegada,
    vi.origen,
    vi.destino,
    vi.kilometros,
    vi.observaciones,
    vi.creado_en,
    vi.actualizado_en,
    v.patente AS vehiculo_patente,
    CONCAT(v.marca, ' ', v.modelo) AS vehiculo_descripcion,
    CONCAT(c.nombre, ' ', c.apellido) AS conductor_nombre,
    c.documento AS conductor_documento
  FROM viajes vi
  INNER JOIN vehiculos v ON v.id = vi.vehiculo_id
  INNER JOIN conductores c ON c.id = vi.conductor_id
`;

async function listar({ vehiculo_id, conductor_id, desde, hasta } = {}) {
  const condiciones = [];
  const valores = [];

  if (vehiculo_id) {
    condiciones.push('vi.vehiculo_id = ?');
    valores.push(vehiculo_id);
  }
  if (conductor_id) {
    condiciones.push('vi.conductor_id = ?');
    valores.push(conductor_id);
  }
  if (desde) {
    condiciones.push('vi.fecha_salida >= ?');
    valores.push(desde);
  }
  if (hasta) {
    condiciones.push('vi.fecha_salida <= ?');
    valores.push(hasta);
  }

  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
  const [filas] = await pool.query(
    `${SELECT_BASE} ${where} ORDER BY vi.fecha_salida DESC, vi.id DESC`,
    valores
  );
  return filas;
}

async function buscarPorId(id) {
  const [filas] = await pool.query(`${SELECT_BASE} WHERE vi.id = ?`, [id]);
  return filas[0] || null;
}

async function crear(datos) {
  const {
    vehiculo_id,
    conductor_id,
    fecha_salida,
    fecha_llegada,
    origen,
    destino,
    kilometros,
    observaciones,
  } = datos;

  const [resultado] = await pool.query(
    `INSERT INTO viajes
      (vehiculo_id, conductor_id, fecha_salida, fecha_llegada, origen, destino, kilometros, observaciones)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      vehiculo_id,
      conductor_id,
      fecha_salida,
      fecha_llegada,
      origen,
      destino,
      kilometros,
      observaciones,
    ]
  );
  return buscarPorId(resultado.insertId);
}

async function actualizar(id, datos) {
  const {
    vehiculo_id,
    conductor_id,
    fecha_salida,
    fecha_llegada,
    origen,
    destino,
    kilometros,
    observaciones,
  } = datos;

  await pool.query(
    `UPDATE viajes
     SET vehiculo_id = ?, conductor_id = ?, fecha_salida = ?, fecha_llegada = ?,
         origen = ?, destino = ?, kilometros = ?, observaciones = ?
     WHERE id = ?`,
    [
      vehiculo_id,
      conductor_id,
      fecha_salida,
      fecha_llegada,
      origen,
      destino,
      kilometros,
      observaciones,
      id,
    ]
  );
  return buscarPorId(id);
}

async function eliminar(id) {
  const [resultado] = await pool.query('DELETE FROM viajes WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}

async function resumenPorVehiculo() {
  const [filas] = await pool.query(`
    SELECT
      v.id,
      v.patente,
      CONCAT(v.marca, ' ', v.modelo) AS descripcion,
      COUNT(vi.id) AS total_viajes,
      COALESCE(SUM(vi.kilometros), 0) AS total_km
    FROM vehiculos v
    LEFT JOIN viajes vi ON vi.vehiculo_id = v.id
    GROUP BY v.id, v.patente, v.marca, v.modelo
    ORDER BY total_km DESC, v.patente ASC
  `);
  return filas;
}

async function resumenPorConductor() {
  const [filas] = await pool.query(`
    SELECT
      c.id,
      CONCAT(c.nombre, ' ', c.apellido) AS nombre_completo,
      c.documento,
      COUNT(vi.id) AS total_viajes,
      COALESCE(SUM(vi.kilometros), 0) AS total_km
    FROM conductores c
    LEFT JOIN viajes vi ON vi.conductor_id = c.id
    GROUP BY c.id, c.nombre, c.apellido, c.documento
    ORDER BY total_km DESC, c.apellido ASC
  `);
  return filas;
}

module.exports = {
  listar,
  buscarPorId,
  crear,
  actualizar,
  eliminar,
  resumenPorVehiculo,
  resumenPorConductor,
};
