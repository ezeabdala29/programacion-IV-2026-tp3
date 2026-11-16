const { Router } = require('express');
const controlador = require('../controllers/conductor.controller');
const {
  validarId,
  validarListado,
  validarCrear,
  validarActualizar,
} = require('../validators/conductor.validator');
const { validar } = require('../middlewares/validate.middleware');
const { autenticar } = require('../middlewares/auth.middleware');

const router = Router();

router.use(autenticar);

router.get('/', validarListado, validar, controlador.listar);
router.get('/:id', validarId, validar, controlador.obtener);
router.post('/', validarCrear, validar, controlador.crear);
router.put('/:id', validarId, validarActualizar, validar, controlador.actualizar);
router.delete('/:id', validarId, validar, controlador.eliminar);

module.exports = router;
