const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const Usuario = require('../models/usuario.model');

const opcionesEstrategia = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'secreto-de-desarrollo',
  jsonWebTokenOptions: {
    maxAge: process.env.JWT_EXPIRES || '4h',
  },
};

passport.use(
  new JwtStrategy(opcionesEstrategia, async (payload, done) => {
    try {
      const usuario = await Usuario.buscarPorId(payload.id);

      if (!usuario) {
        return done(null, false, { message: 'El usuario del token no existe' });
      }

      return done(null, usuario);
    } catch (error) {
      return done(error, false);
    }
  })
);

module.exports = passport;
