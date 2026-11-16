const { Router } = require('express');
const controlador = require('../controllers/auth.controller');
const { validarRegistro, validarLogin } = require('../validators/auth.validator');
const { validar } = require('../middlewares/validate.middleware');
const { autenticar } = require('../middlewares/auth.middleware');

const router = Router();

router.post('/register', validarRegistro, validar, controlador.registrar);
router.post('/login', validarLogin, validar, controlador.login);
router.get('/me', autenticar, controlador.perfil);

module.exports = router;
