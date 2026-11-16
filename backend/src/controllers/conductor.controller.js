const Conductor = require('../models/conductor.model');
const asyncHandler = require('../utils/asyncHandler');

const listar = asyncHandler(async (req, res) => {
  const datos = await Conductor.listar({
    nombre: req.query.nombre,
    apellido: req.query.apellido,
    documento: req.query.documento,
    nro_licencia: req.query.nro_licencia,
  });

  res.json({ datos, total: datos.length });
});

const obtener = asyncHandler(async (req, res) => {
  const conductor = await Conductor.buscarPorId(req.params.id);

  if (!conductor) {
    return res.status(404).json({ mensaje: 'Conductor no encontrado' });
  }

  return res.json({ datos: conductor });
});

const crear = asyncHandler(async (req, res) => {
  const {
    nombre,
    apellido,
    documento,
    nro_licencia,
    fecha_alta_licencia,
    fecha_vencimiento_licencia,
  } = req.body;

  if (await Conductor.buscarPorDocumento(documento)) {
    return res.status(409).json({
      mensaje: 'Ya existe un conductor con ese número de documento',
    });
  }

  if (await Conductor.buscarPorLicencia(nro_licencia)) {
    return res.status(409).json({
      mensaje: 'Ya existe un conductor con ese número de licencia',
    });
  }

  const creado = await Conductor.crear({
    nombre,
    apellido,
    documento,
    nro_licencia,
    fecha_alta_licencia,
    fecha_vencimiento_licencia,
  });

  return res.status(201).json({
    mensaje: 'Conductor creado correctamente',
    datos: creado,
  });
});

const actualizar = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    apellido,
    documento,
    nro_licencia,
    fecha_alta_licencia,
    fecha_vencimiento_licencia,
  } = req.body;

  const conductor = await Conductor.buscarPorId(id);
  if (!conductor) {
    return res.status(404).json({ mensaje: 'Conductor no encontrado' });
  }

  if (await Conductor.buscarPorDocumento(documento, id)) {
    return res.status(409).json({
      mensaje: 'Ya existe otro conductor con ese número de documento',
    });
  }

  if (await Conductor.buscarPorLicencia(nro_licencia, id)) {
    return res.status(409).json({
      mensaje: 'Ya existe otro conductor con ese número de licencia',
    });
  }

  const actualizado = await Conductor.actualizar(id, {
    nombre,
    apellido,
    documento,
    nro_licencia,
    fecha_alta_licencia,
    fecha_vencimiento_licencia,
  });

  return res.json({
    mensaje: 'Conductor actualizado correctamente',
    datos: actualizado,
  });
});

const eliminar = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const conductor = await Conductor.buscarPorId(id);
  if (!conductor) {
    return res.status(404).json({ mensaje: 'Conductor no encontrado' });
  }

  await Conductor.eliminar(id);

  return res.json({ mensaje: 'Conductor eliminado correctamente' });
});

module.exports = { listar, obtener, crear, actualizar, eliminar };
