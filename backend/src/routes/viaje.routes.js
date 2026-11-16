const { Router } = require('express');
const controlador = require('../controllers/viaje.controller');
const {
  validarId,
  validarListado,
  validarCrear,
  validarActualizar,
} = require('../validators/viaje.validator');
const { validar } = require('../middlewares/validate.middleware');
const { autenticar } = require('../middlewares/auth.middleware');

const router = Router();

router.use(autenticar);

// Debe ir antes de /:id para que no lo capture como parámetro.
router.get('/resumen', controlador.resumen);

router.get('/', validarListado, validar, controlador.listar);
router.get('/:id', validarId, validar, controlador.obtener);
router.post('/', validarCrear, validar, controlador.crear);
router.put('/:id', validarId, validarActualizar, validar, controlador.actualizar);
router.delete('/:id', validarId, validar, controlador.eliminar);

module.exports = router;
