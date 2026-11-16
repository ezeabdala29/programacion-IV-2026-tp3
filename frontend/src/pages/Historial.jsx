import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';
import { Alerta } from '../components/Alerta.jsx';
import { formatearFechaHora, formatearNumero } from '../utils/formato.js';

const MODO_VEHICULO = 'vehiculo';
const MODO_CONDUCTOR = 'conductor';

export default function Historial() {
  const [modo, setModo] = useState(MODO_VEHICULO);
  const [seleccionado, setSeleccionado] = useState('');

  const [vehiculos, setVehiculos] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [viajes, setViajes] = useState([]);
  const [totalKm, setTotalKm] = useState(0);

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const cargarCatalogos = useCallback(async () => {
    try {
      const [resVehiculos, resConductores] = await Promise.all([
        api.get('/vehiculos'),
        api.get('/conductores'),
      ]);
      setVehiculos(resVehiculos.datos);
      setConductores(resConductores.datos);
    } catch (fallo) {
      setError(fallo.message);
    }
  }, []);

  useEffect(() => {
    cargarCatalogos();
  }, [cargarCatalogos]);

  const cargarHistorial = useCallback(async () => {
    if (!seleccionado) {
      setViajes([]);
      setTotalKm(0);
      return;
    }

    setCargando(true);
    try {
      const parametro = modo === MODO_VEHICULO ? 'vehiculo_id' : 'conductor_id';
      const respuesta = await api.get(`/viajes?${parametro}=${seleccionado}`);
      setViajes(respuesta.datos);
      setTotalKm(respuesta.total_km);
      setError('');
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setCargando(false);
    }
  }, [modo, seleccionado]);

  useEffect(() => {
    cargarHistorial();
  }, [cargarHistorial]);

  function cambiarModo(nuevoModo) {
    setModo(nuevoModo);
    setSeleccionado('');
    setViajes([]);
    setTotalKm(0);
  }

  const opciones = modo === MODO_VEHICULO ? vehiculos : conductores;

  const entidadSeleccionada = useMemo(() => {
    if (!seleccionado) return null;

    if (modo === MODO_VEHICULO) {
      return vehiculos.find((item) => String(item.id) === String(seleccionado)) || null;
    }
    return conductores.find((item) => String(item.id) === String(seleccionado)) || null;
  }, [modo, seleccionado, vehiculos, conductores]);

  const ultimoViaje = viajes.length > 0 ? viajes[0].fecha_salida : null;

  return (
    <section className="contenedor seccion">
      <header className="seccion-cabecera">
        <div>
          <span className="etiqueta">Consultas</span>
          <h1>Historial de viajes</h1>
          <p className="texto-suave">
            Consultá los viajes y el total de kilómetros recorridos por vehículo o conductor.
          </p>
        </div>
      </header>

      <Alerta tipo="error" onClose={() => setError('')}>
        {error}
      </Alerta>

      <div className="tarjeta">
        <div className="selector-modo" role="tablist" aria-label="Tipo de historial">
          <button
            type="button"
            role="tab"
            aria-selected={modo === MODO_VEHICULO}
            className={`btn ${modo === MODO_VEHICULO ? 'btn-primario' : 'btn-fantasma'}`}
            onClick={() => cambiarModo(MODO_VEHICULO)}
          >
            Por vehículo
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={modo === MODO_CONDUCTOR}
            className={`btn ${modo === MODO_CONDUCTOR ? 'btn-primario' : 'btn-fantasma'}`}
            onClick={() => cambiarModo(MODO_CONDUCTOR)}
          >
            Por conductor
          </button>
        </div>

        <div className="campo campo-selector">
          <label htmlFor="seleccion">
            {modo === MODO_VEHICULO ? 'Seleccioná un vehículo' : 'Seleccioná un conductor'}
          </label>
          <select
            id="seleccion"
            className="input"
            value={seleccionado}
            onChange={(evento) => setSeleccionado(evento.target.value)}
          >
            <option value="">— Elegir —</option>
            {opciones.map((opcion) =>
              modo === MODO_VEHICULO ? (
                <option key={opcion.id} value={opcion.id}>
                  {opcion.patente} · {opcion.marca} {opcion.modelo}
                </option>
              ) : (
                <option key={opcion.id} value={opcion.id}>
                  {opcion.apellido}, {opcion.nombre} · DNI {opcion.documento}
                </option>
              )
            )}
          </select>
        </div>

        {!seleccionado ? (
          <div className="estado-vacio">
            <p>Elegí {modo === MODO_VEHICULO ? 'un vehículo' : 'un conductor'} para ver su historial.</p>
          </div>
        ) : cargando ? (
          <div className="estado-carga">
            <span className="spinner" aria-hidden="true" />
            <span>Cargando historial...</span>
          </div>
        ) : (
          <>
            <div className="grid-estadisticas grid-estadisticas-tres">
              <article className="tarjeta estadistica estadistica-suave">
                <span className="estadistica-etiqueta">Viajes realizados</span>
                <span className="estadistica-valor">{formatearNumero(viajes.length)}</span>
              </article>
              <article className="tarjeta estadistica estadistica-suave">
                <span className="estadistica-etiqueta">Kilómetros totales</span>
                <span className="estadistica-valor">{formatearNumero(totalKm, 1)}</span>
              </article>
              <article className="tarjeta estadistica estadistica-suave">
                <span className="estadistica-etiqueta">Último viaje</span>
                <span className="estadistica-valor estadistica-valor-texto">
                  {ultimoViaje ? formatearFechaHora(ultimoViaje) : '—'}
                </span>
              </article>
            </div>

            {entidadSeleccionada && (
              <p className="texto-suave">
                {modo === MODO_VEHICULO
                  ? `Vehículo: ${entidadSeleccionada.patente} · ${entidadSeleccionada.marca} ${entidadSeleccionada.modelo}`
                  : `Conductor: ${entidadSeleccionada.nombre} ${entidadSeleccionada.apellido} · Licencia ${entidadSeleccionada.nro_licencia}`}
              </p>
            )}

            {viajes.length === 0 ? (
              <div className="estado-vacio">
                <span className="estado-vacio-icono" aria-hidden="true">🧭</span>
                <p>No hay viajes registrados para esta selección.</p>
              </div>
            ) : (
              <div className="tabla-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Salida</th>
                      <th>Llegada</th>
                      <th>Recorrido</th>
                      <th className="numerico">Km</th>
                      <th>Observaciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viajes.map((viaje) => (
                      <tr key={viaje.id}>
                        <td>{formatearFechaHora(viaje.fecha_salida)}</td>
                        <td>{formatearFechaHora(viaje.fecha_llegada)}</td>
                        <td>
                          {viaje.origen} → {viaje.destino}
                        </td>
                        <td className="numerico">{formatearNumero(viaje.kilometros, 1)}</td>
                        <td>{viaje.observaciones || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
