const { body, param, query } = require('express-validator');

const validarId = [
  param('id').isInt({ min: 1 }).withMessage('El id debe ser un número entero positivo'),
];

const validarListado = [
  query('nombre').optional().trim().isLength({ max: 50 }),
  query('apellido').optional().trim().isLength({ max: 50 }),
  query('documento').optional().trim().isLength({ max: 15 }),
  query('nro_licencia').optional().trim().isLength({ max: 30 }),
];

const reglasConductor = [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),
  body('apellido')
    .trim()
    .notEmpty()
    .withMessage('El apellido es obligatorio')
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres')
    .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/)
    .withMessage('El apellido solo puede contener letras y espacios'),
  body('documento')
    .trim()
    .notEmpty()
    .withMessage('El número de documento es obligatorio')
    .matches(/^\d{7,10}$/)
    .withMessage('El documento debe tener entre 7 y 10 dígitos numéricos'),
  body('nro_licencia')
    .trim()
    .notEmpty()
    .withMessage('El número de licencia es obligatorio')
    .isLength({ min: 5, max: 30 })
    .withMessage('La licencia debe tener entre 5 y 30 caracteres')
    .matches(/^[A-Za-z0-9-]+$/)
    .withMessage('La licencia solo puede contener letras, números y guiones'),
  body('fecha_alta_licencia')
    .notEmpty()
    .withMessage('La fecha de alta de la licencia es obligatoria')
    .isISO8601()
    .withMessage('La fecha de alta no es válida')
    .custom((valor) => {
      const fecha = new Date(valor);
      const hoy = new Date();
      hoy.setHours(23, 59, 59, 999);
      if (fecha < new Date('1990-01-01')) {
        throw new Error('La fecha de alta no puede ser anterior al año 1990');
      }
      if (fecha > hoy) {
        throw new Error('La fecha de alta de la licencia no puede ser futura');
      }
      return true;
    }),
  body('fecha_vencimiento_licencia')
    .notEmpty()
    .withMessage('La fecha de vencimiento de la licencia es obligatoria')
    .isISO8601()
    .withMessage('La fecha de vencimiento no es válida')
    .custom((valor, { req }) => {
      const fechaVenc = new Date(valor);
      if (fechaVenc < new Date('1990-01-01')) {
        throw new Error('La fecha de vencimiento no puede ser anterior al año 1990');
      }
      if (!req.body.fecha_alta_licencia) return true;
      if (fechaVenc <= new Date(req.body.fecha_alta_licencia)) {
        throw new Error('El vencimiento debe ser posterior al alta de la licencia');
      }
      return true;
    }),
];

const validarCrear = reglasConductor;
const validarActualizar = reglasConductor;

module.exports = { validarId, validarListado, validarCrear, validarActualizar };
