const jwt = require('jsonwebtoken');

const SECRETO = process.env.JWT_SECRET || 'secreto-de-desarrollo';
const EXPIRACION = process.env.JWT_EXPIRES || '4h';

function firmarToken(usuario) {
  return jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
    },
    SECRETO,
    { expiresIn: EXPIRACION }
  );
}

module.exports = { firmarToken };
