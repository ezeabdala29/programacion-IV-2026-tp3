import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { Alerta } from '../components/Alerta.jsx';
import { formatearFechaHora, formatearNumero } from '../utils/formato.js';

const FORM_INICIAL = {
  vehiculo_id: '',
  conductor_id: '',
  fecha_salida: '',
  fecha_llegada: '',
  origen: '',
  destino: '',
  kilometros: '',
  observaciones: '',
};

// Rango admitido para las fechas de los viajes: desde el año 2000 en adelante.
const FECHA_MINIMA = '2000-01-01T00:00';

function aIso(valor) {
  return valor ? new Date(valor).toISOString() : null;
}

// Convierte una fecha ISO a un valor compatible con <input type="datetime-local">
// respetando la zona horaria del navegador.
function aInputDatetime(valor) {
  if (!valor) return '';
  const fecha = new Date(valor);
  const desfase = fecha.getTimezoneOffset() * 60000;
  return new Date(fecha.getTime() - desfase).toISOString().slice(0, 16);
}

// Devuelve el minuto siguiente a un valor datetime-local (mínimo para la llegada).
function minutoSiguiente(valor) {
  if (!valor) return '';
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return '';
  return aInputDatetime(new Date(fecha.getTime() + 60000).toISOString());
}

export default function Viajes() {
  const formularioRef = useRef(null);

  const [viajes, setViajes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [totalKm, setTotalKm] = useState(0);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const [filtros, setFiltros] = useState({ vehiculo_id: '', conductor_id: '' });
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(FORM_INICIAL);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  const cargarCatalogos = useCallback(async () => {
    const [resVehiculos, resConductores] = await Promise.all([
      api.get('/vehiculos'),
      api.get('/conductores'),
    ]);
    setVehiculos(resVehiculos.datos);
    setConductores(resConductores.datos);
  }, []);

  const cargarViajes = useCallback(async () => {
    setCargando(true);
    try {
      const parametros = new URLSearchParams();
      if (filtros.vehiculo_id) parametros.set('vehiculo_id', filtros.vehiculo_id);
      if (filtros.conductor_id) parametros.set('conductor_id', filtros.conductor_id);

      const consulta = parametros.toString();
      const respuesta = await api.get(`/viajes${consulta ? `?${consulta}` : ''}`);
      setViajes(respuesta.datos);
      setTotalKm(respuesta.total_km);
      setError('');
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setCargando(false);
    }
  }, [filtros]);

  useEffect(() => {
    cargarCatalogos().catch((fallo) => setError(fallo.message));
  }, [cargarCatalogos]);

  useEffect(() => {
    cargarViajes();
  }, [cargarViajes]);

  const viajesFiltrados = useMemo(() => {
    if (!filtros.vehiculo_id && !filtros.conductor_id) return viajes;

    return viajes.filter((viaje) => {
      const coincideVehiculo =
        !filtros.vehiculo_id || String(viaje.vehiculo_id) === String(filtros.vehiculo_id);
      const coincideConductor =
        !filtros.conductor_id || String(viaje.conductor_id) === String(filtros.conductor_id);
      return coincideVehiculo && coincideConductor;
    });
  }, [viajes, filtros]);

  const nombreFiltro = useMemo(() => {
    if (filtros.vehiculo_id) {
      const vehiculo = vehiculos.find((item) => String(item.id) === String(filtros.vehiculo_id));
      return vehiculo ? `${vehiculo.patente} · ${vehiculo.marca} ${vehiculo.modelo}` : '';
    }
    if (filtros.conductor_id) {
      const conductor = conductores.find(
        (item) => String(item.id) === String(filtros.conductor_id)
      );
      return conductor ? `${conductor.nombre} ${conductor.apellido}` : '';
    }
    return '';
  }, [filtros, vehiculos, conductores]);

  function cambiar(evento) {
    const { name, value } = evento.target;
    setForm((actual) => ({ ...actual, [name]: value }));
    setErrores((actual) => {
      const siguientes = { ...actual, [name]: '' };

      if (name === 'fecha_salida' && value && form.fecha_llegada) {
        if (new Date(form.fecha_llegada) <= new Date(value)) {
          siguientes.fecha_llegada = 'La llegada debe ser posterior a la salida';
        }
      }

      return siguientes;
    });
  }

  function cambiarFiltro(evento) {
    const { name, value } = evento.target;
    setFiltros((actual) => ({ ...actual, [name]: value }));
  }

  function limpiarFiltros() {
    setFiltros({ vehiculo_id: '', conductor_id: '' });
  }

  function editar(viaje) {
    setEditando(viaje);
    setErrores({});
    setForm({
      vehiculo_id: String(viaje.vehiculo_id),
      conductor_id: String(viaje.conductor_id),
      fecha_salida: aInputDatetime(viaje.fecha_salida),
      fecha_llegada: aInputDatetime(viaje.fecha_llegada),
      origen: viaje.origen,
      destino: viaje.destino,
      kilometros: String(viaje.kilometros),
      observaciones: viaje.observaciones || '',
    });

    formularioRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function cancelarEdicion() {
    setEditando(null);
    setForm(FORM_INICIAL);
    setErrores({});
  }

  function validar() {
    const nuevos = {};
    const salida = form.fecha_salida ? new Date(form.fecha_salida) : null;
    const llegada = form.fecha_llegada ? new Date(form.fecha_llegada) : null;

    if (!form.vehiculo_id) nuevos.vehiculo_id = 'Seleccioná un vehículo';
    if (!form.conductor_id) nuevos.conductor_id = 'Seleccioná un conductor';

    if (!salida) {
      nuevos.fecha_salida = 'Ingresá la fecha de salida';
    } else if (salida < new Date(FECHA_MINIMA)) {
      nuevos.fecha_salida = 'La salida no puede ser anterior al año 2000';
    }

    if (!llegada) {
      nuevos.fecha_llegada = 'Ingresá la fecha de llegada';
    } else if (llegada < new Date(FECHA_MINIMA)) {
      nuevos.fecha_llegada = 'La llegada no puede ser anterior al año 2000';
    } else if (salida && llegada <= salida) {
      nuevos.fecha_llegada = 'La llegada debe ser posterior a la salida';
    }

    if (form.origen.trim().length < 2) nuevos.origen = 'Ingresá el origen';
    if (form.destino.trim().length < 2) nuevos.destino = 'Ingresá el destino';

    if (!form.kilometros) nuevos.kilometros = 'Ingresá los kilómetros';
    else if (Number(form.kilometros) <= 0) nuevos.kilometros = 'Debe ser mayor a 0';

    if (form.observaciones.length > 500) {
      nuevos.observaciones = 'Máximo 500 caracteres';
    }

    return nuevos;
  }

  async function enviar(evento) {
    evento.preventDefault();

    const nuevosErrores = validar();
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    const cuerpo = {
      vehiculo_id: Number(form.vehiculo_id),
      conductor_id: Number(form.conductor_id),
      fecha_salida: aIso(form.fecha_salida),
      fecha_llegada: aIso(form.fecha_llegada),
      origen: form.origen.trim(),
      destino: form.destino.trim(),
      kilometros: Number(form.kilometros),
      observaciones: form.observaciones.trim() || null,
    };

    setGuardando(true);

    try {
      if (editando) {
        await api.put(`/viajes/${editando.id}`, cuerpo);
        setMensaje('Viaje actualizado correctamente.');
        setEditando(null);
      } else {
        await api.post('/viajes', cuerpo);
        setMensaje('Viaje registrado correctamente.');
      }

      setForm(FORM_INICIAL);
      await cargarViajes();
    } catch (fallo) {
      setErrores({ general: fallo.message });
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(viaje) {
    const confirmado = window.confirm(
      `¿Eliminar el viaje ${viaje.origen} → ${viaje.destino} del ${formatearFechaHora(
        viaje.fecha_salida
      )}?`
    );
    if (!confirmado) return;

    try {
      await api.del(`/viajes/${viaje.id}`);
      setMensaje('Viaje eliminado correctamente.');
      await cargarViajes();
    } catch (fallo) {
      setError(fallo.message);
    }
  }

  return (
    <section className="contenedor seccion">
      <header className="seccion-cabecera">
        <div>
          <span className="etiqueta">Operación</span>
          <h1>Viajes</h1>
          <p className="texto-suave">
            Registrá cada recorrido asociando un vehículo y un conductor.
          </p>
        </div>
        <Link className="btn btn-fantasma" to="/historial">
          Consultar historial
        </Link>
      </header>

      <Alerta tipo="exito" onClose={() => setMensaje('')}>
        {mensaje}
      </Alerta>
      <Alerta tipo="error" onClose={() => setError('')}>
        {error}
      </Alerta>

      <div className="layout-viajes">
        <article className="tarjeta tarjeta-formulario" ref={formularioRef}>
          <h2>{editando ? 'Editar viaje' : 'Registrar viaje'}</h2>
          <p className="texto-suave">
            {editando
              ? 'Modificá los datos y guardá los cambios.'
              : 'Los campos con * son obligatorios.'}
          </p>

          <form className="formulario" onSubmit={enviar} noValidate>
            <Alerta tipo="error">{errores.general}</Alerta>

            <div className="campo">
              <label htmlFor="vehiculo_id">Vehículo *</label>
              <select
                id="vehiculo_id"
                name="vehiculo_id"
                className={`input ${errores.vehiculo_id ? 'input-error' : ''}`}
                value={form.vehiculo_id}
                onChange={cambiar}
              >
                <option value="">Seleccioná un vehículo</option>
                {vehiculos.map((vehiculo) => (
                  <option key={vehiculo.id} value={vehiculo.id}>
                    {vehiculo.patente} · {vehiculo.marca} {vehiculo.modelo}
                  </option>
                ))}
              </select>
              {errores.vehiculo_id && (
                <span className="error-campo">{errores.vehiculo_id}</span>
              )}
            </div>

            <div className="campo">
              <label htmlFor="conductor_id">Conductor *</label>
              <select
                id="conductor_id"
                name="conductor_id"
                className={`input ${errores.conductor_id ? 'input-error' : ''}`}
                value={form.conductor_id}
                onChange={cambiar}
              >
                <option value="">Seleccioná un conductor</option>
                {conductores.map((conductor) => (
                  <option key={conductor.id} value={conductor.id}>
                    {conductor.apellido}, {conductor.nombre} · DNI {conductor.documento}
                  </option>
                ))}
              </select>
              {errores.conductor_id && (
                <span className="error-campo">{errores.conductor_id}</span>
              )}
            </div>

            <div className="form-grid">
              <div className="campo">
                <label htmlFor="fecha_salida">Salida *</label>
                <input
                  id="fecha_salida"
                  name="fecha_salida"
                  type="datetime-local"
                  className={`input ${errores.fecha_salida ? 'input-error' : ''}`}
                  value={form.fecha_salida}
                  onChange={cambiar}
                  min={FECHA_MINIMA}
                />
                {errores.fecha_salida && (
                  <span className="error-campo">{errores.fecha_salida}</span>
                )}
              </div>

              <div className="campo">
                <label htmlFor="fecha_llegada">Llegada *</label>
                <input
                  id="fecha_llegada"
                  name="fecha_llegada"
                  type="datetime-local"
                  className={`input ${errores.fecha_llegada ? 'input-error' : ''}`}
                  value={form.fecha_llegada}
                  onChange={cambiar}
                  min={minutoSiguiente(form.fecha_salida) || FECHA_MINIMA}
                />
                {errores.fecha_llegada && (
                  <span className="error-campo">{errores.fecha_llegada}</span>
                )}
              </div>
            </div>

            <div className="form-grid">
              <div className="campo">
                <label htmlFor="origen">Origen *</label>
                <input
                  id="origen"
                  name="origen"
                  className={`input ${errores.origen ? 'input-error' : ''}`}
                  value={form.origen}
                  onChange={cambiar}
                  placeholder="La Rioja"
                />
                {errores.origen && <span className="error-campo">{errores.origen}</span>}
              </div>

              <div className="campo">
                <label htmlFor="destino">Destino *</label>
                <input
                  id="destino"
                  name="destino"
                  className={`input ${errores.destino ? 'input-error' : ''}`}
                  value={form.destino}
                  onChange={cambiar}
                  placeholder="Córdoba"
                />
                {errores.destino && <span className="error-campo">{errores.destino}</span>}
              </div>
            </div>

            <div className="campo">
              <label htmlFor="kilometros">Kilómetros recorridos *</label>
              <input
                id="kilometros"
                name="kilometros"
                type="number"
                step="0.01"
                min="0"
                className={`input ${errores.kilometros ? 'input-error' : ''}`}
                value={form.kilometros}
                onChange={cambiar}
                placeholder="430.5"
              />
              {errores.kilometros && <span className="error-campo">{errores.kilometros}</span>}
            </div>

            <div className="campo">
              <label htmlFor="observaciones">Observaciones</label>
              <textarea
                id="observaciones"
                name="observaciones"
                className={`input ${errores.observaciones ? 'input-error' : ''}`}
                value={form.observaciones}
                onChange={cambiar}
                rows={3}
                maxLength={500}
                placeholder="Detalles del viaje, carga, novedades..."
              />
              <span className="contador">{form.observaciones.length}/500</span>
              {errores.observaciones && (
                <span className="error-campo">{errores.observaciones}</span>
              )}
            </div>

            <div className="form-acciones">
              {editando && (
                <button
                  type="button"
                  className="btn btn-fantasma btn-bloque"
                  onClick={cancelarEdicion}
                  disabled={guardando}
                >
                  Cancelar edición
                </button>
              )}
              <button type="submit" className="btn btn-primario btn-bloque" disabled={guardando}>
                {guardando
                  ? 'Guardando...'
                  : editando
                    ? 'Guardar cambios'
                    : 'Registrar viaje'}
              </button>
            </div>
          </form>
        </article>

        <article className="tarjeta">
          <div className="barra-herramientas barra-vertical">
            <div>
              <h2>Viajes registrados</h2>
              <p className="texto-suave">
                {nombreFiltro
                  ? `Mostrando viajes de ${nombreFiltro}`
                  : 'Mostrando todos los viajes'}
              </p>
            </div>
            <div className="filtros">
              <select
                name="vehiculo_id"
                className="input"
                value={filtros.vehiculo_id}
                onChange={cambiarFiltro}
                aria-label="Filtrar por vehículo"
              >
                <option value="">Todos los vehículos</option>
                {vehiculos.map((vehiculo) => (
                  <option key={vehiculo.id} value={vehiculo.id}>
                    {vehiculo.patente}
                  </option>
                ))}
              </select>
              <select
                name="conductor_id"
                className="input"
                value={filtros.conductor_id}
                onChange={cambiarFiltro}
                aria-label="Filtrar por conductor"
              >
                <option value="">Todos los conductores</option>
                {conductores.map((conductor) => (
                  <option key={conductor.id} value={conductor.id}>
                    {conductor.apellido}, {conductor.nombre}
                  </option>
                ))}
              </select>
              {(filtros.vehiculo_id || filtros.conductor_id) && (
                <button type="button" className="btn btn-fantasma btn-sm" onClick={limpiarFiltros}>
                  Limpiar
                </button>
              )}
            </div>
            <div className="resumen-inline">
              <span>
                <strong>{viajesFiltrados.length}</strong> viajes
              </span>
              <span>
                <strong>{formatearNumero(totalKm, 1)}</strong> km
              </span>
            </div>
          </div>

          {cargando ? (
            <div className="estado-carga">
              <span className="spinner" aria-hidden="true" />
              <span>Cargando viajes...</span>
            </div>
          ) : viajesFiltrados.length === 0 ? (
            <div className="estado-vacio">
              <span className="estado-vacio-icono" aria-hidden="true">🧭</span>
              <p>No hay viajes registrados para los filtros seleccionados.</p>
            </div>
          ) : (
            <div className="tabla-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Vehículo</th>
                    <th>Conductor</th>
                    <th>Recorrido</th>
                    <th className="numerico">Km</th>
                    <th className="acciones-col">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {viajesFiltrados.map((viaje) => (
                    <tr key={viaje.id}>
                      <td>
                        <div className="celda-fecha">
                          <span>{formatearFechaHora(viaje.fecha_salida)}</span>
                          <span className="texto-mini">
                            → {formatearFechaHora(viaje.fecha_llegada)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="patente">{viaje.vehiculo_patente}</span>
                        <span className="texto-mini"> {viaje.vehiculo_descripcion}</span>
                      </td>
                      <td>{viaje.conductor_nombre}</td>
                      <td>
                        <div className="celda-fecha">
                          <span>{viaje.origen}</span>
                          <span className="texto-mini">→ {viaje.destino}</span>
                          {viaje.observaciones && (
                            <span className="texto-mini" title={viaje.observaciones}>
                              {viaje.observaciones}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="numerico">{formatearNumero(viaje.kilometros, 1)}</td>
                      <td className="acciones-col">
                        <div className="acciones">
                          <button
                            type="button"
                            className="btn btn-fantasma btn-sm"
                            onClick={() => editar(viaje)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="btn btn-peligro btn-sm"
                            onClick={() => eliminar(viaje)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
