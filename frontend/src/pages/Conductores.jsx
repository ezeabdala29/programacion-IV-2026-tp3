import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';
import { Alerta } from '../components/Alerta.jsx';
import { Modal } from '../components/Modal.jsx';
import { formatearFecha, formatearNumero } from '../utils/formato.js';
import { hoyISO, soloDigitos, soloLetras } from '../utils/validaciones.js';

const FORM_INICIAL = {
  nombre: '',
  apellido: '',
  documento: '',
  nro_licencia: '',
  fecha_alta_licencia: '',
  fecha_vencimiento_licencia: '',
};

function licenciaVencida(fecha) {
  if (!fecha) return false;
  return new Date(`${fecha}T23:59:59`) < new Date();
}

export default function Conductores() {
  const [conductores, setConductores] = useState([]);
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
      const respuesta = await api.get('/conductores');
      setConductores(respuesta.datos);
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
    if (!texto) return conductores;

    return conductores.filter((conductor) =>
      `${conductor.nombre} ${conductor.apellido} ${conductor.documento} ${conductor.nro_licencia}`
        .toLowerCase()
        .includes(texto)
    );
  }, [conductores, busqueda]);

  const totalKm = useMemo(
    () => filtrados.reduce((acumulado, conductor) => acumulado + Number(conductor.total_km), 0),
    [filtrados]
  );

  function abrirCrear() {
    setEditando(null);
    setForm(FORM_INICIAL);
    setErrores({});
    setModalAbierto(true);
  }

  function abrirEditar(conductor) {
    setEditando(conductor);
    setForm({
      nombre: conductor.nombre,
      apellido: conductor.apellido,
      documento: conductor.documento,
      nro_licencia: conductor.nro_licencia,
      fecha_alta_licencia: conductor.fecha_alta_licencia?.slice(0, 10) || '',
      fecha_vencimiento_licencia: conductor.fecha_vencimiento_licencia?.slice(0, 10) || '',
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

    if (name === 'nombre' || name === 'apellido') {
      // Solo letras (con acentos, diéresis y eñes) y espacios
      valorProcesado = value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]/g, '');
    } else if (name === 'documento') {
      // Solo dígitos numéricos, máximo 10
      valorProcesado = value.replace(/\D/g, '').slice(0, 10);
    }

    setForm((actual) => ({ ...actual, [name]: valorProcesado }));
    setErrores((actual) => ({ ...actual, [name]: '' }));
  }

  function validar() {
    const nuevos = {};
    const FECHA_MINIMA = '1990-01-01';

    if (form.nombre.trim().length < 2) {
      nuevos.nombre = 'Ingresá el nombre (mínimo 2 caracteres)';
    } else if (!soloLetras(form.nombre)) {
      nuevos.nombre = 'El nombre solo puede contener letras y acentos';
    }

    if (form.apellido.trim().length < 2) {
      nuevos.apellido = 'Ingresá el apellido (mínimo 2 caracteres)';
    } else if (!soloLetras(form.apellido)) {
      nuevos.apellido = 'El apellido solo puede contener letras y acentos';
    }

    if (!form.documento.trim()) {
      nuevos.documento = 'El documento es obligatorio';
    } else if (!soloDigitos(form.documento) || form.documento.length < 7 || form.documento.length > 10) {
      nuevos.documento = 'El documento debe tener entre 7 y 10 dígitos numéricos';
    }

    if (form.nro_licencia.trim().length < 5) {
      nuevos.nro_licencia = 'La licencia debe tener al menos 5 caracteres';
    } else if (!/^[A-Za-z0-9-]+$/.test(form.nro_licencia.trim())) {
      nuevos.nro_licencia = 'Solo letras, números y guiones';
    }

    if (!form.fecha_alta_licencia) {
      nuevos.fecha_alta_licencia = 'La fecha de alta es obligatoria';
    } else if (form.fecha_alta_licencia < FECHA_MINIMA) {
      nuevos.fecha_alta_licencia = 'La fecha de alta no puede ser anterior al año 1990';
    } else if (form.fecha_alta_licencia > hoyISO()) {
      nuevos.fecha_alta_licencia = 'La fecha de alta no puede ser futura';
    }

    if (!form.fecha_vencimiento_licencia) {
      nuevos.fecha_vencimiento_licencia = 'La fecha de vencimiento es obligatoria';
    } else if (form.fecha_vencimiento_licencia < FECHA_MINIMA) {
      nuevos.fecha_vencimiento_licencia = 'La fecha de vencimiento no puede ser anterior al año 1990';
    } else if (
      form.fecha_alta_licencia &&
      form.fecha_vencimiento_licencia <= form.fecha_alta_licencia
    ) {
      nuevos.fecha_vencimiento_licencia = 'Debe ser posterior a la fecha de alta';
    }

    return nuevos;
  }

  async function enviar(evento) {
    evento.preventDefault();

    const nuevosErrores = validar();
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    const cuerpo = {
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      documento: form.documento.trim(),
      nro_licencia: form.nro_licencia.trim().toUpperCase(),
      fecha_alta_licencia: form.fecha_alta_licencia,
      fecha_vencimiento_licencia: form.fecha_vencimiento_licencia,
    };

    setGuardando(true);

    try {
      if (editando) {
        await api.put(`/conductores/${editando.id}`, cuerpo);
        setMensaje('Conductor actualizado correctamente.');
      } else {
        await api.post('/conductores', cuerpo);
        setMensaje('Conductor creado correctamente.');
      }

      cerrarModal();
      await cargar();
    } catch (fallo) {
      setErrores({ general: fallo.message });
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(conductor) {
    const confirmado = window.confirm(
      `¿Eliminar al conductor ${conductor.nombre} ${conductor.apellido}?`
    );
    if (!confirmado) return;

    try {
      await api.del(`/conductores/${conductor.id}`);
      setMensaje('Conductor eliminado correctamente.');
      await cargar();
    } catch (fallo) {
      setError(fallo.message);
    }
  }

  return (
    <section className="contenedor seccion">
      <header className="seccion-cabecera">
        <div>
          <span className="etiqueta">Personal</span>
          <h1>Conductores</h1>
          <p className="texto-suave">
            Administrá los datos personales y la vigencia de las licencias.
          </p>
        </div>
        <button type="button" className="btn btn-primario" onClick={abrirCrear}>
          + Nuevo conductor
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
            placeholder="Buscar por nombre, apellido, documento o licencia..."
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            aria-label="Buscar conductores"
          />
          <div className="resumen-inline">
            <span>
              <strong>{filtrados.length}</strong> conductores
            </span>
            <span>
              <strong>{formatearNumero(totalKm, 1)}</strong> km recorridos
            </span>
          </div>
        </div>

        {cargando ? (
          <div className="estado-carga">
            <span className="spinner" aria-hidden="true" />
            <span>Cargando conductores...</span>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="estado-vacio">
            <span className="estado-vacio-icono" aria-hidden="true">🪪</span>
            <p>
              {conductores.length === 0
                ? 'Todavía no hay conductores registrados.'
                : 'No se encontraron conductores con ese criterio.'}
            </p>
            {conductores.length === 0 && (
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
                  <th>Conductor</th>
                  <th>Documento</th>
                  <th>Licencia</th>
                  <th>Vencimiento</th>
                  <th className="numerico">Km totales</th>
                  <th className="numerico">Viajes</th>
                  <th className="acciones-col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((conductor) => {
                  const vencida = licenciaVencida(conductor.fecha_vencimiento_licencia);

                  return (
                    <tr key={conductor.id}>
                      <td>
                        <strong>
                          {conductor.apellido}, {conductor.nombre}
                        </strong>
                      </td>
                      <td>{conductor.documento}</td>
                      <td>{conductor.nro_licencia}</td>
                      <td>
                        <div className="celda-fecha">
                          <span>{formatearFecha(conductor.fecha_vencimiento_licencia)}</span>
                          <span className={`badge ${vencida ? 'badge-peligro' : 'badge-exito'}`}>
                            {vencida ? 'Vencida' : 'Vigente'}
                          </span>
                        </div>
                      </td>
                      <td className="numerico">{formatearNumero(conductor.total_km, 1)}</td>
                      <td className="numerico">{formatearNumero(conductor.total_viajes)}</td>
                      <td className="acciones-col">
                        <div className="acciones">
                          <button
                            type="button"
                            className="btn btn-fantasma btn-sm"
                            onClick={() => abrirEditar(conductor)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="btn btn-peligro btn-sm"
                            onClick={() => eliminar(conductor)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalAbierto && (
        <Modal
          titulo={editando ? 'Editar conductor' : 'Nuevo conductor'}
          onClose={cerrarModal}
        >
          <form className="formulario" onSubmit={enviar} noValidate>
            <Alerta tipo="error">{errores.general}</Alerta>

            <div className="form-grid">
              <div className="campo">
                <label htmlFor="nombre">Nombre *</label>
                <input
                  id="nombre"
                  name="nombre"
                  className={`input ${errores.nombre ? 'input-error' : ''}`}
                  value={form.nombre}
                  onChange={cambiar}
                  placeholder="Juan"
                />
                {errores.nombre && <span className="error-campo">{errores.nombre}</span>}
              </div>

              <div className="campo">
                <label htmlFor="apellido">Apellido *</label>
                <input
                  id="apellido"
                  name="apellido"
                  className={`input ${errores.apellido ? 'input-error' : ''}`}
                  value={form.apellido}
                  onChange={cambiar}
                  placeholder="Pérez"
                />
                {errores.apellido && <span className="error-campo">{errores.apellido}</span>}
              </div>

              <div className="campo">
                <label htmlFor="documento">Número de documento *</label>
                <input
                  id="documento"
                  name="documento"
                  className={`input ${errores.documento ? 'input-error' : ''}`}
                  value={form.documento}
                  onChange={cambiar}
                  placeholder="30111222"
                  maxLength={10}
                  inputMode="numeric"
                />
                {errores.documento && <span className="error-campo">{errores.documento}</span>}
              </div>

              <div className="campo">
                <label htmlFor="nro_licencia">Número de licencia *</label>
                <input
                  id="nro_licencia"
                  name="nro_licencia"
                  className={`input ${errores.nro_licencia ? 'input-error' : ''}`}
                  value={form.nro_licencia}
                  onChange={cambiar}
                  placeholder="LIC-0001"
                  maxLength={30}
                />
                {errores.nro_licencia && (
                  <span className="error-campo">{errores.nro_licencia}</span>
                )}
              </div>

              <div className="campo">
                <label htmlFor="fecha_alta_licencia">Alta de licencia *</label>
                <input
                  id="fecha_alta_licencia"
                  name="fecha_alta_licencia"
                  type="date"
                  className={`input ${errores.fecha_alta_licencia ? 'input-error' : ''}`}
                  value={form.fecha_alta_licencia}
                  onChange={cambiar}
                  min="1990-01-01"
                  max={hoyISO()}
                />
                {errores.fecha_alta_licencia && (
                  <span className="error-campo">{errores.fecha_alta_licencia}</span>
                )}
              </div>

              <div className="campo">
                <label htmlFor="fecha_vencimiento_licencia">Vencimiento *</label>
                <input
                  id="fecha_vencimiento_licencia"
                  name="fecha_vencimiento_licencia"
                  type="date"
                  className={`input ${errores.fecha_vencimiento_licencia ? 'input-error' : ''}`}
                  value={form.fecha_vencimiento_licencia}
                  onChange={cambiar}
                  min={form.fecha_alta_licencia || '1990-01-01'}
                  max="2045-12-31"
                />
                {errores.fecha_vencimiento_licencia && (
                  <span className="error-campo">{errores.fecha_vencimiento_licencia}</span>
                )}
              </div>
            </div>

            <div className="modal-acciones">
              <button type="button" className="btn btn-fantasma" onClick={cerrarModal}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primario" disabled={guardando}>
                {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear conductor'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}
