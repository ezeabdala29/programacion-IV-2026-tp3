const bcrypt = require('bcrypt');
const Usuario = require('../models/usuario.model');
const { firmarToken } = require('../utils/jwt');

const SALT_ROUNDS = 10;

async function registrar(req, res) {
  const { nombre, email, password } = req.body;

  const existente = await Usuario.buscarPorEmail(email);
  if (existente) {
    return res.status(409).json({
      mensaje: 'Ya existe un usuario registrado con ese email',
    });
  }

  const passwordEncriptada = await bcrypt.hash(password, SALT_ROUNDS);
  const usuario = await Usuario.crear({
    nombre,
    email,
    password: passwordEncriptada,
  });

  const token = firmarToken(usuario);

  return res.status(201).json({
    mensaje: 'Usuario registrado correctamente',
    token,
    usuario,
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  const usuario = await Usuario.buscarPorEmail(email);

  if (!usuario) {
    return res.status(401).json({ mensaje: 'Email o contraseña incorrectos' });
  }

  if (!usuario.activo) {
    return res.status(403).json({ mensaje: 'La cuenta está deshabilitada' });
  }

  const passwordValida = await bcrypt.compare(password, usuario.password);

  if (!passwordValida) {
    return res.status(401).json({ mensaje: 'Email o contraseña incorrectos' });
  }

  const token = firmarToken(usuario);
  const { password: _password, ...datosPublicos } = usuario;

  return res.json({
    mensaje: 'Inicio de sesión exitoso',
    token,
    usuario: datosPublicos,
  });
}

async function perfil(req, res) {
  return res.json({ usuario: req.usuario });
}

module.exports = { registrar, login, perfil };
