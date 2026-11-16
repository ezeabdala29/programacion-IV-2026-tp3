function aFecha(valor) {
  if (!valor) return null;

  if (valor instanceof Date) return valor;

  // MySQL devuelve "YYYY-MM-DD HH:mm:ss"; se normaliza para Safari.
  const normalizado = typeof valor === 'string' ? valor.replace(' ', 'T') : valor;
  const fecha = new Date(normalizado);

  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

export function formatearFecha(valor) {
  const fecha = aFecha(valor);
  if (!fecha) return '—';
  return fecha.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatearFechaHora(valor) {
  const fecha = aFecha(valor);
  if (!fecha) return '—';
  return fecha.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatearNumero(valor, decimales = 0) {
  const numero = Number(valor);
  if (Number.isNaN(numero)) return '0';
  return numero.toLocaleString('es-AR', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });
}
