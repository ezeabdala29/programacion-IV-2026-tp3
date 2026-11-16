const Viaje = require('../models/viaje.model');
const Vehiculo = require('../models/vehiculo.model');
const Conductor = require('../models/conductor.model');
const asyncHandler = require('../utils/asyncHandler');
const { aDatetimeMySQL } = require('../utils/fechas');

async function verificarReferencias(vehiculo_id, conductor_id) {
  const [vehiculo, conductor] = await Promise.all([
    Vehiculo.buscarPorId(vehiculo_id),
    Conductor.buscarPorId(conductor_id),
  ]);

  if (!vehiculo) {
    return { error: 'El vehículo indicado no existe', estado: 404 };
  }
  if (!conductor) {
    return { error: 'El conductor indicado no existe', estado: 404 };
  }
  return null;
}

const listar = asyncHandler(async (req, res) => {
  const datos = await Viaje.listar({
    vehiculo_id: req.query.vehiculo_id,
    conductor_id: req.query.conductor_id,
    desde: req.query.desde,
    hasta: req.query.hasta,
  });

  const total_km = datos.reduce((acumulado, viaje) => acumulado + Number(viaje.kilometros), 0);

  res.json({ datos, total: datos.length, total_km });
});

const obtener = asyncHandler(async (req, res) => {
  const viaje = await Viaje.buscarPorId(req.params.id);

  if (!viaje) {
    return res.status(404).json({ mensaje: 'Viaje no encontrado' });
  }

  return res.json({ datos: viaje });
});

const crear = asyncHandler(async (req, res) => {
  const {
    vehiculo_id,
    conductor_id,
    fecha_salida,
    fecha_llegada,
    origen,
    destino,
    kilometros,
    observaciones,
  } = req.body;

  const referenciaInvalida = await verificarReferencias(vehiculo_id, conductor_id);
  if (referenciaInvalida) {
    return res.status(referenciaInvalida.estado).json({ mensaje: referenciaInvalida.error });
  }

  const creado = await Viaje.crear({
    vehiculo_id,
    conductor_id,
    fecha_salida: aDatetimeMySQL(fecha_salida),
    fecha_llegada: aDatetimeMySQL(fecha_llegada),
    origen,
    destino,
    kilometros,
    observaciones: observaciones || null,
  });

  return res.status(201).json({
    mensaje: 'Viaje registrado correctamente',
    datos: creado,
  });
});

const actualizar = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    vehiculo_id,
    conductor_id,
    fecha_salida,
    fecha_llegada,
    origen,
    destino,
    kilometros,
    observaciones,
  } = req.body;

  const viaje = await Viaje.buscarPorId(id);
  if (!viaje) {
    return res.status(404).json({ mensaje: 'Viaje no encontrado' });
  }

  const referenciaInvalida = await verificarReferencias(vehiculo_id, conductor_id);
  if (referenciaInvalida) {
    return res.status(referenciaInvalida.estado).json({ mensaje: referenciaInvalida.error });
  }

  const actualizado = await Viaje.actualizar(id, {
    vehiculo_id,
    conductor_id,
    fecha_salida: aDatetimeMySQL(fecha_salida),
    fecha_llegada: aDatetimeMySQL(fecha_llegada),
    origen,
    destino,
    kilometros,
    observaciones: observaciones || null,
  });

  return res.json({
    mensaje: 'Viaje actualizado correctamente',
    datos: actualizado,
  });
});

const eliminar = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const viaje = await Viaje.buscarPorId(id);
  if (!viaje) {
    return res.status(404).json({ mensaje: 'Viaje no encontrado' });
  }

  await Viaje.eliminar(id);

  return res.json({ mensaje: 'Viaje eliminado correctamente' });
});

const resumen = asyncHandler(async (req, res) => {
  const [vehiculos, conductores] = await Promise.all([
    Viaje.resumenPorVehiculo(),
    Viaje.resumenPorConductor(),
  ]);

  res.json({ datos: { vehiculos, conductores } });
});

module.exports = { listar, obtener, crear, actualizar, eliminar, resumen };
