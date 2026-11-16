/**
 * Convierte una fecha ISO (con o sin zona horaria) al formato
 * DATETIME que espera MySQL: YYYY-MM-DD HH:mm:ss.
 */
function aDatetimeMySQL(valor) {
  if (!valor) return null;

  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return null;

  const pad = (numero) => String(numero).padStart(2, '0');

  const anio = fecha.getFullYear();
  const mes = pad(fecha.getMonth() + 1);
  const dia = pad(fecha.getDate());
  const hora = pad(fecha.getHours());
  const minutos = pad(fecha.getMinutes());
  const segundos = pad(fecha.getSeconds());

  return `${anio}-${mes}-${dia} ${hora}:${minutos}:${segundos}`;
}

module.exports = { aDatetimeMySQL };
