const { pool } = require('../config/db');

const CAMPOS_PUBLICOS = 'id, nombre, email, activo, creado_en';

async function buscarPorEmail(email) {
  const [filas] = await pool.query(
    'SELECT id, nombre, email, password, activo, creado_en FROM usuarios WHERE email = ?',
    [email]
  );
  return filas[0] || null;
}

async function buscarPorId(id) {
  const [filas] = await pool.query(
    `SELECT ${CAMPOS_PUBLICOS} FROM usuarios WHERE id = ?`,
    [id]
  );
  return filas[0] || null;
}

async function crear({ nombre, email, password }) {
  const [resultado] = await pool.query(
    'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
    [nombre, email, password]
  );
  return buscarPorId(resultado.insertId);
}

module.exports = {
  buscarPorEmail,
  buscarPorId,
  crear,
};
