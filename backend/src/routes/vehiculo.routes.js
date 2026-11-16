const { Router } = require('express');
const controlador = require('../controllers/vehiculo.controller');
const {
  validarId,
  validarListado,
  validarCrear,
  validarActualizar,
} = require('../validators/vehiculo.validator');
const { validar } = require('../middlewares/validate.middleware');
const { autenticar } = require('../middlewares/auth.middleware');

const router = Router();

// Todas las operaciones CRUD requieren un JWT válido.
router.use(autenticar);

router.get('/', validarListado, validar, controlador.listar);
router.get('/:id', validarId, validar, controlador.obtener);
router.post('/', validarCrear, validar, controlador.crear);
router.put('/:id', validarId, validarActualizar, validar, controlador.actualizar);
router.delete('/:id', validarId, validar, controlador.eliminar);

module.exports = router;
