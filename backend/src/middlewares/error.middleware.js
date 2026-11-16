function noEncontrado(req, res) {
  res.status(404).json({
    mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
}

// eslint-disable-next-line no-unused-vars
function manejadorErrores(error, req, res, next) {
  console.error('[ERROR]', error);

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ mensaje: 'El cuerpo de la petición no es un JSON válido' });
  }

  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ mensaje: 'Ya existe un registro con esos datos' });
  }

  if (error.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(409).json({
      mensaje: 'No se puede eliminar el registro porque tiene viajes asociados',
    });
  }

  if (error.code === 'ECONNREFUSED' || error.code === 'ER_ACCESS_DENIED_ERROR') {
    return res.status(500).json({ mensaje: 'Error de conexión con la base de datos' });
  }

  const estado = error.status || 500;
  return res.status(estado).json({
    mensaje: estado === 500 ? 'Error interno del servidor' : error.message,
  });
}

module.exports = { noEncontrado, manejadorErrores };
