const Vehiculo = require('../models/vehiculo.model');
const asyncHandler = require('../utils/asyncHandler');

const listar = asyncHandler(async (req, res) => {
  const datos = await Vehiculo.listar({
    marca: req.query.marca,
    modelo: req.query.modelo,
    patente: req.query.patente?.toUpperCase(),
  });

  res.json({ datos, total: datos.length });
});

const obtener = asyncHandler(async (req, res) => {
  const vehiculo = await Vehiculo.buscarPorId(req.params.id);

  if (!vehiculo) {
    return res.status(404).json({ mensaje: 'Vehículo no encontrado' });
  }

  return res.json({ datos: vehiculo });
});

const crear = asyncHandler(async (req, res) => {
  const { marca, modelo, patente, anio, capacidad_carga } = req.body;

  const existente = await Vehiculo.buscarPorPatente(patente);
  if (existente) {
    return res.status(409).json({ mensaje: 'Ya existe un vehículo con esa patente' });
  }

  const creado = await Vehiculo.crear({
    marca,
    modelo,
    patente,
    anio,
    capacidad_carga,
  });

  return res.status(201).json({
    mensaje: 'Vehículo creado correctamente',
    datos: creado,
  });
});

const actualizar = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { marca, modelo, patente, anio, capacidad_carga } = req.body;

  const vehiculo = await Vehiculo.buscarPorId(id);
  if (!vehiculo) {
    return res.status(404).json({ mensaje: 'Vehículo no encontrado' });
  }

  const existente = await Vehiculo.buscarPorPatente(patente, id);
  if (existente) {
    return res.status(409).json({
      mensaje: 'Ya existe otro vehículo con esa patente',
    });
  }

  const actualizado = await Vehiculo.actualizar(id, {
    marca,
    modelo,
    patente,
    anio,
    capacidad_carga,
  });

  return res.json({
    mensaje: 'Vehículo actualizado correctamente',
    datos: actualizado,
  });
});

const eliminar = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const vehiculo = await Vehiculo.buscarPorId(id);
  if (!vehiculo) {
    return res.status(404).json({ mensaje: 'Vehículo no encontrado' });
  }

  await Vehiculo.eliminar(id);

  return res.json({ mensaje: 'Vehículo eliminado correctamente' });
});

module.exports = { listar, obtener, crear, actualizar, eliminar };
