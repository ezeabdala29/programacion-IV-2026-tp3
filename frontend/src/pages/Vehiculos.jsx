import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';
import { Alerta } from '../components/Alerta.jsx';
import { Modal } from '../components/Modal.jsx';
import { formatearNumero } from '../utils/formato.js';
import { normalizarPatente, patenteValida } from '../utils/validaciones.js';

const FORM_INICIAL = {
  marca: '',
  modelo: '',
  patente: '',
  anio: '',
  capacidad_carga: '',
};

const ANIO_ACTUAL = new Date().getFullYear();

export default function Vehiculos() {
  const [vehiculos, setVehiculos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(FORM_INICIAL);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const respuesta = await api.get('/vehiculos');
      setVehiculos(respuesta.datos);
      setError('');
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return vehiculos;

    return vehiculos.filter((vehiculo) =>
      `${vehiculo.patente} ${vehiculo.marca} ${vehiculo.modelo}`.toLowerCase().includes(texto)
    );
  }, [vehiculos, busqueda]);

  const totalKm = useMemo(
    () => filtrados.reduce((acumulado, vehiculo) => acumulado + Number(vehiculo.total_km), 0),
    [filtrados]
  );

  function abrirCrear() {
    setEditando(null);
    setForm(FORM_INICIAL);
    setErrores({});
    setModalAbierto(true);
  }

  function abrirEditar(vehiculo) {
    setEditando(vehiculo);
    setForm({
      marca: vehiculo.marca,
      modelo: vehiculo.modelo,
      patente: vehiculo.patente,
      anio: String(vehiculo.anio),
      capacidad_carga: String(vehiculo.capacidad_carga),
    });
    setErrores({});
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    setEditando(null);
    setForm(FORM_INICIAL);
    setErrores({});
  }

  function cambiar(evento) {
    const { name, value } = evento.target;
    let valorProcesado = value;

    if (name === 'capacidad_carga') {
      // Bloquear signos negativos
      if (valorProcesado.includes('-')) {
        valorProcesado = valorProcesado.replace(/-/g, '');
      }
    }

    setForm((actual) => ({ ...actual, [name]: valorProcesado }));
    setErrores((actual) => ({ ...actual, [name]: '' }));
  }

  function validar() {
    const nuevos = {};
    const anio = Number(form.anio);
    const capacidad = Number(form.capacidad_carga);

    if (form.marca.trim().length < 2) nuevos.marca = 'Ingresá la marca (mínimo 2 caracteres)';
    if (form.modelo.trim().length < 2) nuevos.modelo = 'Ingresá el modelo (mínimo 2 caracteres)';

    if (!form.patente.trim()) nuevos.patente = 'La patente es obligatoria';
    else if (!patenteValida(form.patente)) {
      nuevos.patente = 'Formato inválido. Ejemplos: AAA123 o AB123CD';
    }

    if (!form.anio) nuevos.anio = 'El año es obligatorio';
    else if (!Number.isInteger(anio) || anio < 1950 || anio > ANIO_ACTUAL + 1) {
      nuevos.anio = `El año debe estar entre 1950 y ${ANIO_ACTUAL + 1}`;
    }

    if (!form.capacidad_carga) {
      nuevos.capacidad_carga = 'La capacidad de carga es obligatoria';
    } else if (Number.isNaN(capacidad) || capacidad <= 0) {
      nuevos.capacidad_carga = 'La capacidad de carga debe ser un número positivo mayor a 0 kg';
    }

    return nuevos;
  }

  async function enviar(evento) {
    evento.preventDefault();

    const nuevosErrores = validar();
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    const cuerpo = {
      marca: form.marca.trim(),
      modelo: form.modelo.trim(),
      patente: normalizarPatente(form.patente),
      anio: Number(form.anio),
      capacidad_carga: Number(form.capacidad_carga),
    };

    setGuardando(true);

    try {
      if (editando) {
        await api.put(`/vehiculos/${editando.id}`, cuerpo);
        setMensaje('Vehículo actualizado correctamente.');
      } else {
        await api.post('/vehiculos', cuerpo);
        setMensaje('Vehículo creado correctamente.');
      }

      cerrarModal();
      await cargar();
    } catch (fallo) {
      setErrores({ general: fallo.message });
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(vehiculo) {
    const confirmado = window.confirm(
      `¿Eliminar el vehículo ${vehiculo.patente} (${vehiculo.marca} ${vehiculo.modelo})?`
    );
    if (!confirmado) return;

    try {
      await api.del(`/vehiculos/${vehiculo.id}`);
      setMensaje('Vehículo eliminado correctamente.');
      await cargar();
    } catch (fallo) {
      setError(fallo.message);
    }
  }

  return (
    <section className="contenedor seccion">
      <header className="seccion-cabecera">
        <div>
          <span className="etiqueta">Flota</span>
          <h1>Vehículos</h1>
          <p className="texto-suave">
            Alta, modificación y eliminación de los vehículos de la empresa.
          </p>
        </div>
        <button type="button" className="btn btn-primario" onClick={abrirCrear}>
          + Nuevo vehículo
        </button>
      </header>

      <Alerta tipo="exito" onClose={() => setMensaje('')}>
        {mensaje}
      </Alerta>
      <Alerta tipo="error" onClose={() => setError('')}>
        {error}
      </Alerta>

      <div className="tarjeta">
        <div className="barra-herramientas">
          <input
            type="search"
            className="input"
            placeholder="Buscar por patente, marca o modelo..."
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            aria-label="Buscar vehículos"
          />
          <div className="resumen-inline">
            <span>
              <strong>{filtrados.length}</strong> vehículos
            </span>
            <span>
              <strong>{formatearNumero(totalKm, 1)}</strong> km recorridos
            </span>
          </div>
        </div>

        {cargando ? (
          <div className="estado-carga">
            <span className="spinner" aria-hidden="true" />
            <span>Cargando vehículos...</span>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="estado-vacio">
            <span className="estado-vacio-icono" aria-hidden="true">🚚</span>
            <p>
              {vehiculos.length === 0
                ? 'Todavía no hay vehículos registrados.'
                : 'No se encontraron vehículos con ese criterio.'}
            </p>
            {vehiculos.length === 0 && (
              <button type="button" className="btn btn-primario" onClick={abrirCrear}>
                Registrar el primero
              </button>
            )}
          </div>
        ) : (
          <div className="tabla-scroll">
            <table>
              <thead>
                <tr>
                  <th>Patente</th>
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>Año</th>
                  <th className="numerico">Capacidad (kg)</th>
                  <th className="numerico">Km totales</th>
                  <th className="numerico">Viajes</th>
                  <th className="acciones-col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((vehiculo) => (
                  <tr key={vehiculo.id}>
                    <td>
                      <span className="patente">{vehiculo.patente}</span>
                    </td>
                    <td>{vehiculo.marca}</td>
                    <td>{vehiculo.modelo}</td>
                    <td>{vehiculo.anio}</td>
                    <td className="numerico">{formatearNumero(vehiculo.capacidad_carga, 0)}</td>
                    <td className="numerico">{formatearNumero(vehiculo.total_km, 1)}</td>
                    <td className="numerico">{formatearNumero(vehiculo.total_viajes)}</td>
                    <td className="acciones-col">
                      <div className="acciones">
                        <button
                          type="button"
                          className="btn btn-fantasma btn-sm"
                          onClick={() => abrirEditar(vehiculo)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn btn-peligro btn-sm"
                          onClick={() => eliminar(vehiculo)}
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
      </div>

      {modalAbierto && (
        <Modal
          titulo={editando ? 'Editar vehículo' : 'Nuevo vehículo'}
          onClose={cerrarModal}
        >
          <form className="formulario" onSubmit={enviar} noValidate>
            <Alerta tipo="error">{errores.general}</Alerta>

            <div className="form-grid">
              <div className="campo">
                <label htmlFor="marca">Marca *</label>
                <input
                  id="marca"
                  name="marca"
                  className={`input ${errores.marca ? 'input-error' : ''}`}
                  value={form.marca}
                  onChange={cambiar}
                  placeholder="Volvo"
                />
                {errores.marca && <span className="error-campo">{errores.marca}</span>}
              </div>

              <div className="campo">
                <label htmlFor="modelo">Modelo *</label>
                <input
                  id="modelo"
                  name="modelo"
                  className={`input ${errores.modelo ? 'input-error' : ''}`}
                  value={form.modelo}
                  onChange={cambiar}
                  placeholder="FH 460"
                />
                {errores.modelo && <span className="error-campo">{errores.modelo}</span>}
              </div>

              <div className="campo">
                <label htmlFor="patente">Patente *</label>
                <input
                  id="patente"
                  name="patente"
                  className={`input ${errores.patente ? 'input-error' : ''}`}
                  value={form.patente}
                  onChange={cambiar}
                  placeholder="AAA123 o AB123CD"
                  maxLength={7}
                />
                {errores.patente && <span className="error-campo">{errores.patente}</span>}
              </div>

              <div className="campo">
                <label htmlFor="anio">Año *</label>
                <input
                  id="anio"
                  name="anio"
                  type="number"
                  className={`input ${errores.anio ? 'input-error' : ''}`}
                  value={form.anio}
                  onChange={cambiar}
                  min="1950"
                  max={ANIO_ACTUAL + 1}
                  onKeyDown={(e) => {
                    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                      e.preventDefault();
                    }
                  }}
                  placeholder="2022"
                />
                {errores.anio && <span className="error-campo">{errores.anio}</span>}
              </div>

              <div className="campo campo-ancho">
                <label htmlFor="capacidad_carga">Capacidad de carga (kg) *</label>
                <input
                  id="capacidad_carga"
                  name="capacidad_carga"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="100000"
                  onKeyDown={(e) => {
                    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                      e.preventDefault();
                    }
                  }}
                  className={`input ${errores.capacidad_carga ? 'input-error' : ''}`}
                  value={form.capacidad_carga}
                  onChange={cambiar}
                  placeholder="25000"
                />
                {errores.capacidad_carga && (
                  <span className="error-campo">{errores.capacidad_carga}</span>
                )}
              </div>
            </div>

            <div className="modal-acciones">
              <button type="button" className="btn btn-fantasma" onClick={cerrarModal}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primario" disabled={guardando}>
                {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear vehículo'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}
