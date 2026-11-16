const { body, param, query } = require('express-validator');

const validarId = [
  param('id').isInt({ min: 1 }).withMessage('El id debe ser un número entero positivo'),
];

// Rango admitido para las fechas de los viajes: desde el año 2000 en adelante.
const FECHA_MINIMA = new Date('2000-01-01T00:00:00');

function validarRangoFecha(valor) {
  const fecha = new Date(valor);
  if (fecha < FECHA_MINIMA) throw new Error('La fecha no puede ser anterior al año 2000');
  return true;
}

const validarListado = [
  query('vehiculo_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El vehículo debe ser un id válido'),
  query('conductor_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El conductor debe ser un id válido'),
  query('desde').optional().isISO8601().withMessage('La fecha desde no es válida'),
  query('hasta').optional().isISO8601().withMessage('La fecha hasta no es válida'),
];

const reglasViaje = [
  body('vehiculo_id')
    .notEmpty()
    .withMessage('El vehículo es obligatorio')
    .isInt({ min: 1 })
    .withMessage('El vehículo debe ser un id válido')
    .toInt(),
  body('conductor_id')
    .notEmpty()
    .withMessage('El conductor es obligatorio')
    .isInt({ min: 1 })
    .withMessage('El conductor debe ser un id válido')
    .toInt(),
  body('fecha_salida')
    .notEmpty()
    .withMessage('La fecha de salida es obligatoria')
    .isISO8601()
    .withMessage('La fecha de salida no es válida')
    .custom(validarRangoFecha),
  body('fecha_llegada')
    .notEmpty()
    .withMessage('La fecha de llegada es obligatoria')
    .isISO8601()
    .withMessage('La fecha de llegada no es válida')
    .custom(validarRangoFecha)
    .custom((valor, { req }) => {
      if (!req.body.fecha_salida) return true;
      if (new Date(valor) <= new Date(req.body.fecha_salida)) {
        throw new Error('La fecha de llegada debe ser posterior a la de salida');
      }
      return true;
    }),
  body('origen')
    .trim()
    .notEmpty()
    .withMessage('El origen es obligatorio')
    .isLength({ min: 2, max: 100 })
    .withMessage('El origen debe tener entre 2 y 100 caracteres'),
  body('destino')
    .trim()
    .notEmpty()
    .withMessage('El destino es obligatorio')
    .isLength({ min: 2, max: 100 })
    .withMessage('El destino debe tener entre 2 y 100 caracteres'),
  body('kilometros')
    .notEmpty()
    .withMessage('Los kilómetros son obligatorios')
    .isFloat({ gt: 0 })
    .withMessage('Los kilómetros deben ser un número mayor a 0')
    .toFloat(),
  body('observaciones')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Las observaciones no pueden superar los 500 caracteres'),
];

const validarCrear = reglasViaje;
const validarActualizar = reglasViaje;

module.exports = { validarId, validarListado, validarCrear, validarActualizar };
