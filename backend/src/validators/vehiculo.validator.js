const { body, param, query } = require('express-validator');

const validarId = [
  param('id').isInt({ min: 1 }).withMessage('El id debe ser un número entero positivo'),
];

const validarListado = [
  query('marca').optional().trim().isLength({ max: 50 }),
  query('modelo').optional().trim().isLength({ max: 50 }),
  query('patente').optional().trim().isLength({ max: 10 }),
];

const reglasVehiculo = [
  body('marca')
    .trim()
    .notEmpty()
    .withMessage('La marca es obligatoria')
    .isLength({ min: 2, max: 50 })
    .withMessage('La marca debe tener entre 2 y 50 caracteres'),
  body('modelo')
    .trim()
    .notEmpty()
    .withMessage('El modelo es obligatorio')
    .isLength({ min: 2, max: 50 })
    .withMessage('El modelo debe tener entre 2 y 50 caracteres'),
  body('patente')
    .trim()
    .notEmpty()
    .withMessage('La patente es obligatoria')
    .customSanitizer((valor) => valor.toUpperCase().replace(/[\s-]/g, ''))
    .matches(/^([A-Z]{3}\d{3}|[A-Z]{2}\d{3}[A-Z]{2})$/)
    .withMessage('La patente debe tener el formato AAA123 o AB123CD'),
  body('anio')
    .notEmpty()
    .withMessage('El año es obligatorio')
    .isInt({ min: 1950, max: new Date().getFullYear() + 1 })
    .withMessage(`El año debe estar entre 1950 y ${new Date().getFullYear() + 1}`),
  body('capacidad_carga')
    .notEmpty()
    .withMessage('La capacidad de carga es obligatoria')
    .isFloat({ gt: 0 })
    .withMessage('La capacidad de carga debe ser un número mayor a 0'),
];

const validarCrear = reglasVehiculo;
const validarActualizar = reglasVehiculo;

module.exports = { validarId, validarListado, validarCrear, validarActualizar };
