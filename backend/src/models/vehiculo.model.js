const { pool } = require('../config/db');

const SELECT_BASE = `
  SELECT
    v.id,
    v.marca,
    v.modelo,
    v.patente,
    v.anio,
    v.capacidad_carga,
    v.creado_en,
    v.actualizado_en,
    COALESCE((
      SELECT SUM(vi.kilometros)
      FROM viajes vi
      WHERE vi.vehiculo_id = v.id
    ), 0) AS total_km,
    COALESCE((
      SELECT COUNT(*)
      FROM viajes vi
      WHERE vi.vehiculo_id = v.id
    ), 0) AS total_viajes
  FROM vehiculos v
`;

async function listar({ marca, patente, modelo } = {}) {
  const condiciones = [];
  const valores = [];

  if (marca) {
    condiciones.push('v.marca LIKE ?');
    valores.push(`%${marca}%`);
  }
  if (modelo) {
    condiciones.push('v.modelo LIKE ?');
    valores.push(`%${modelo}%`);
  }
  if (patente) {
    condiciones.push('v.patente LIKE ?');
    valores.push(`%${patente}%`);
  }

  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
  const [filas] = await pool.query(
    `${SELECT_BASE} ${where} ORDER BY v.id DESC`,
    valores
  );
  return filas;
}

async function buscarPorId(id) {
  const [filas] = await pool.query(`${SELECT_BASE} WHERE v.id = ?`, [id]);
  return filas[0] || null;
}

async function buscarPorPatente(patente, excluirId = null) {
  const valores = [patente];
  let sql = 'SELECT id FROM vehiculos WHERE patente = ?';
  if (excluirId) {
    sql += ' AND id <> ?';
    valores.push(excluirId);
  }
  const [filas] = await pool.query(sql, valores);
  return filas[0] || null;
}

async function crear({ marca, modelo, patente, anio, capacidad_carga }) {
  const [resultado] = await pool.query(
    `INSERT INTO vehiculos (marca, modelo, patente, anio, capacidad_carga)
     VALUES (?, ?, ?, ?, ?)`,
    [marca, modelo, patente, anio, capacidad_carga]
  );
  return buscarPorId(resultado.insertId);
}

async function actualizar(id, { marca, modelo, patente, anio, capacidad_carga }) {
  await pool.query(
    `UPDATE vehiculos
     SET marca = ?, modelo = ?, patente = ?, anio = ?, capacidad_carga = ?
     WHERE id = ?`,
    [marca, modelo, patente, anio, capacidad_carga, id]
  );
  return buscarPorId(id);
}

async function eliminar(id) {
  const [resultado] = await pool.query('DELETE FROM vehiculos WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}

module.exports = {
  listar,
  buscarPorId,
  buscarPorPatente,
  crear,
  actualizar,
  eliminar,
};
