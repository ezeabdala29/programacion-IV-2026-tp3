export const esEmail = (valor) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim());

export const normalizarPatente = (valor) => valor.toUpperCase().replace(/[\s-]/g, '');

export const patenteValida = (valor) => {
  const patente = normalizarPatente(valor);
  return /^[A-Z]{3}\d{3}$/.test(patente) || /^[A-Z]{2}\d{3}[A-Z]{2}$/.test(patente);
};

export const soloLetras = (valor) => /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/.test(valor.trim());

export const soloDigitos = (valor) => /^\d+$/.test(valor.trim());

export const hoyISO = () => {
  const fecha = new Date();
  const desfase = fecha.getTimezoneOffset() * 60000;
  return new Date(fecha.getTime() - desfase).toISOString().slice(0, 10);
};
