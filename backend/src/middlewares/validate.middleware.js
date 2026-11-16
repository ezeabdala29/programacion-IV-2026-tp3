const { validationResult } = require('express-validator');

/**
 * Toma los resultados de express-validator y responde 400 si hay errores.
 */
function validar(req, res, next) {
  const resultado = validationResult(req);

  if (!resultado.isEmpty()) {
    const errores = resultado.array({ onlyFirstError: true }).map((error) => ({
      campo: error.path,
      mensaje: error.msg,
    }));

    return res.status(400).json({
      mensaje: 'Los datos enviados no son válidos',
      errores,
    });
  }

  return next();
}

module.exports = { validar };
