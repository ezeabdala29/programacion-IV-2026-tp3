const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');

export const TOKEN_KEY = 'tp3_token';

export class ApiError extends Error {
  constructor(mensaje, estado = 0, errores = []) {
    super(mensaje);
    this.name = 'ApiError';
    this.estado = estado;
    this.errores = errores;
  }
}

async function solicitar(ruta, { method = 'GET', body, auth = true } = {}) {
  const headers = {};

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  let respuesta;

  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      'No se pudo conectar con el servidor. Verificá que el backend esté en ejecución.',
      0
    );
  }

  const texto = await respuesta.text();
  let datos = null;

  if (texto) {
    try {
      datos = JSON.parse(texto);
    } catch {
      datos = null;
    }
  }

  if (!respuesta.ok) {
    if (respuesta.status === 401 && auth) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event('auth:expirada'));
    }

    throw new ApiError(
      datos?.mensaje || 'Ocurrió un error inesperado',
      respuesta.status,
      datos?.errores || []
    );
  }

  return datos;
}

export const api = {
  get: (ruta, opciones = {}) => solicitar(ruta, { ...opciones, method: 'GET' }),
  post: (ruta, body, opciones = {}) => solicitar(ruta, { ...opciones, method: 'POST', body }),
  put: (ruta, body, opciones = {}) => solicitar(ruta, { ...opciones, method: 'PUT', body }),
  del: (ruta, opciones = {}) => solicitar(ruta, { ...opciones, method: 'DELETE' }),
};
