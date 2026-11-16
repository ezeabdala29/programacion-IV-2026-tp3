const { Router } = require('express');
const authRoutes = require('./auth.routes');
const vehiculoRoutes = require('./vehiculo.routes');
const conductorRoutes = require('./conductor.routes');
const viajeRoutes = require('./viaje.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/vehiculos', vehiculoRoutes);
router.use('/conductores', conductorRoutes);
router.use('/viajes', viajeRoutes);

module.exports = router;
