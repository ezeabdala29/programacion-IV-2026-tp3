const { pool } = require('../config/db');

const SELECT_BASE = `
  SELECT
    c.id,
    c.nombre,
    c.apellido,
    c.documento,
    c.nro_licencia,
    c.fecha_alta_licencia,
    c.fecha_vencimiento_licencia,
    c.creado_en,
    c.actualizado_en,
    COALESCE((
      SELECT SUM(vi.kilometros)
      FROM viajes vi
      WHERE vi.conductor_id = c.id
    ), 0) AS total_km,
    COALESCE((
      SELECT COUNT(*)
      FROM viajes vi
      WHERE vi.conductor_id = c.id
    ), 0) AS total_viajes
  FROM conductores c
`;

async function listar({ nombre, apellido, documento, nro_licencia } = {}) {
  const condiciones = [];
  const valores = [];

  if (nombre) {
    condiciones.push('c.nombre LIKE ?');
    valores.push(`%${nombre}%`);
  }
  if (apellido) {
    condiciones.push('c.apellido LIKE ?');
    valores.push(`%${apellido}%`);
  }
  if (documento) {
    condiciones.push('c.documento LIKE ?');
    valores.push(`%${documento}%`);
  }
  if (nro_licencia) {
    condiciones.push('c.nro_licencia LIKE ?');
    valores.push(`%${nro_licencia}%`);
  }

  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
  const [filas] = await pool.query(
    `${SELECT_BASE} ${where} ORDER BY c.apellido ASC, c.nombre ASC`,
    valores
  );
  return filas;
}

async function buscarPorId(id) {
  const [filas] = await pool.query(`${SELECT_BASE} WHERE c.id = ?`, [id]);
  return filas[0] || null;
}

async function buscarPorDocumento(documento, excluirId = null) {
  const valores = [documento];
  let sql = 'SELECT id FROM conductores WHERE documento = ?';
  if (excluirId) {
    sql += ' AND id <> ?';
    valores.push(excluirId);
  }
  const [filas] = await pool.query(sql, valores);
  return filas[0] || null;
}

async function buscarPorLicencia(nroLicencia, excluirId = null) {
  const valores = [nroLicencia];
  let sql = 'SELECT id FROM conductores WHERE nro_licencia = ?';
  if (excluirId) {
    sql += ' AND id <> ?';
    valores.push(excluirId);
  }
  const [filas] = await pool.query(sql, valores);
  return filas[0] || null;
}

async function crear(datos) {
  const {
    nombre,
    apellido,
    documento,
    nro_licencia,
    fecha_alta_licencia,
    fecha_vencimiento_licencia,
  } = datos;

  const [resultado] = await pool.query(
    `INSERT INTO conductores
      (nombre, apellido, documento, nro_licencia, fecha_alta_licencia, fecha_vencimiento_licencia)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      nombre,
      apellido,
      documento,
      nro_licencia,
      fecha_alta_licencia,
      fecha_vencimiento_licencia,
    ]
  );
  return buscarPorId(resultado.insertId);
}

async function actualizar(id, datos) {
  const {
    nombre,
    apellido,
    documento,
    nro_licencia,
    fecha_alta_licencia,
    fecha_vencimiento_licencia,
  } = datos;

  await pool.query(
    `UPDATE conductores
     SET nombre = ?, apellido = ?, documento = ?, nro_licencia = ?,
         fecha_alta_licencia = ?, fecha_vencimiento_licencia = ?
     WHERE id = ?`,
    [
      nombre,
      apellido,
      documento,
      nro_licencia,
      fecha_alta_licencia,
      fecha_vencimiento_licencia,
      id,
    ]
  );
  return buscarPorId(id);
}

async function eliminar(id) {
  const [resultado] = await pool.query('DELETE FROM conductores WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}

module.exports = {
  listar,
  buscarPorId,
  buscarPorDocumento,
  buscarPorLicencia,
  crear,
  actualizar,
  eliminar,
};
