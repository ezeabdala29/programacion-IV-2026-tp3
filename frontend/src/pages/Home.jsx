import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatearNumero } from '../utils/formato.js';

function PanelResumen() {
  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    api
      .get('/viajes/resumen')
      .then((respuesta) => {
        if (activo) setResumen(respuesta.datos);
      })
      .catch(() => {
        if (activo) setResumen(null);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  if (cargando) {
    return (
      <div className="estado-carga">
        <span className="spinner" aria-hidden="true" />
        <span>Cargando resumen...</span>
      </div>
    );
  }

  if (!resumen) return null;

  const totalVehiculos = resumen.vehiculos.length;
  const totalConductores = resumen.conductores.length;
  const totalViajes = resumen.vehiculos.reduce(
    (acumulado, item) => acumulado + Number(item.total_viajes),
    0
  );
  const totalKm = resumen.vehiculos.reduce(
    (acumulado, item) => acumulado + Number(item.total_km),
    0
  );

  return (
    <section className="contenedor seccion">
      <div className="seccion-cabecera">
        <div>
          <h2>Estado general de la flota</h2>
        </div>
        <Link className="btn btn-primario" to="/viajes">
          Registrar viaje
        </Link>
      </div>

      <div className="grid-estadisticas">
        <article className="tarjeta estadistica">
          <span className="estadistica-valor">{formatearNumero(totalVehiculos)}</span>
          <span className="estadistica-etiqueta">Vehículos</span>
        </article>
        <article className="tarjeta estadistica">
          <span className="estadistica-valor">{formatearNumero(totalConductores)}</span>
          <span className="estadistica-etiqueta">Conductores</span>
        </article>
        <article className="tarjeta estadistica">
          <span className="estadistica-valor">{formatearNumero(totalViajes)}</span>
          <span className="estadistica-etiqueta">Viajes registrados</span>
        </article>
        <article className="tarjeta estadistica">
          <span className="estadistica-valor">{formatearNumero(totalKm, 1)}</span>
          <span className="estadistica-etiqueta">Kilómetros totales</span>
        </article>
      </div>

      <div className="grid-dos">
        <article className="tarjeta">
          <h3>Vehículos con más kilómetros</h3>
          <ul className="lista-ranking">
            {resumen.vehiculos.slice(0, 5).map((vehiculo) => (
              <li key={vehiculo.id}>
                <span>
                  <strong>{vehiculo.patente}</strong> · {vehiculo.descripcion}
                </span>
                <span>{formatearNumero(vehiculo.total_km, 1)} km</span>
              </li>
            ))}
            {resumen.vehiculos.length === 0 && <li>Sin vehículos registrados.</li>}
          </ul>
        </article>

        <article className="tarjeta">
          <h3>Conductores con más kilómetros</h3>
          <ul className="lista-ranking">
            {resumen.conductores.slice(0, 5).map((conductor) => (
              <li key={conductor.id}>
                <span>{conductor.nombre_completo}</span>
                <span>{formatearNumero(conductor.total_km, 1)} km</span>
              </li>
            ))}
            {resumen.conductores.length === 0 && <li>Sin conductores registrados.</li>}
          </ul>
        </article>
      </div>
    </section>
  );
}

export default function Home() {
  const { usuario } = useAuth();

  return (
    <>
      <section className="contenedor seccion">
        <h1>Gestión de vehículos, conductores y viajes</h1>
        <p className="texto-suave">
          Sistema para la administración de flotas de transporte, asignación de conductores y
          registro de viajes.
        </p>

        <div className="acciones acciones-inicio">
          {usuario ? (
            <>
              <Link className="btn btn-primario" to="/viajes">
                Registrar viaje
              </Link>
              <Link className="btn btn-fantasma" to="/historial">
                Ver historial
              </Link>
            </>
          ) : (
            <>
              <Link className="btn btn-primario" to="/login">
                Iniciar sesión
              </Link>
              <Link className="btn btn-fantasma" to="/registro">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </section>

      {usuario && <PanelResumen />}
    </>
  );
}
