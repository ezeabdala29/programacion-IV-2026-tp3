const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('./config/passport');
const rutas = require('./routes');
const { noEncontrado, manejadorErrores } = require('./middlewares/error.middleware');

const app = express();

const origenesPermitidos = (
  process.env.CORS_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173'
)
  .split(',')
  .map((origen) => origen.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: origenesPermitidos,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.use(passport.initialize());

app.get('/api', (req, res) => {
  res.json({
    servicio: 'TP3 Transporte API',
    estado: 'ok',
    rutas: ['/api/salud', '/api/auth', '/api/vehiculos', '/api/conductores', '/api/viajes'],
  });
});

app.get('/api/salud', (req, res) => {
  res.json({
    estado: 'ok',
    servicio: 'TP3 Transporte API',
    fecha: new Date().toISOString(),
  });
});

app.use('/api', rutas);

app.use(noEncontrado);
app.use(manejadorErrores);

module.exports = app;
