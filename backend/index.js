require('dotenv').config({ override: true });

const app = require('./src/app');
const { pool } = require('./src/config/db');

const PORT = process.env.PORT || 3000;

async function iniciar() {
  try {
    const conexion = await pool.getConnection();
    await conexion.ping();
    conexion.release();
    console.log(`Conexión a MySQL establecida (${process.env.DB_NAME || 'tp3_transporte'})`);
  } catch (error) {
    console.error('No se pudo conectar a MySQL:', error.message);
    console.error('Revisá el archivo .env y que el servidor MySQL esté en ejecución.');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`API escuchando en http://localhost:${PORT}/api`);
  });
}

iniciar();
