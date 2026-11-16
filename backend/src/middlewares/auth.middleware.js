const passport = require('../config/passport');

function mensajeDeError(info) {
  if (!info) return 'No autorizado';
  if (info.message === 'No auth token') return 'No se envió un token de autenticación';
  if (info.name === 'TokenExpiredError') return 'El token expiró, iniciá sesión nuevamente';
  if (info.name === 'JsonWebTokenError') return 'Token inválido';
  return info.message || 'No autorizado';
}

/**
 * Verifica el token JWT con Passport y deja el usuario en req.usuario.
 * - 401: token ausente, inválido o expirado.
 * - 403: token válido pero cuenta deshabilitada.
 */
function autenticar(req, res, next) {
  passport.authenticate('jwt', { session: false }, (error, usuario, info) => {
    if (error) return next(error);

    if (!usuario) {
      return res.status(401).json({
        mensaje: mensajeDeError(info),
      });
    }

    if (!usuario.activo) {
      return res.status(403).json({
        mensaje: 'Acceso denegado: la cuenta está deshabilitada',
      });
    }

    req.usuario = usuario;
    return next();
  })(req, res, next);
}

module.exports = { autenticar };
