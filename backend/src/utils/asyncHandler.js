/**
 * Envuelve un controlador async para que los errores lleguen al
 * middleware de manejo de errores sin usar try/catch en cada ruta.
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
