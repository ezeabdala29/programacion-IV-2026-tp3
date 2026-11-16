import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Alerta } from '../components/Alerta.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { esEmail } from '../utils/validaciones.js';

const FORM_INICIAL = { nombre: '', email: '', password: '', confirmar: '' };

export default function Registro() {
  const { usuario, registrarse } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(FORM_INICIAL);
  const [errores, setErrores] = useState({});
  const [errorApi, setErrorApi] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (usuario) {
    return <Navigate to="/" replace />;
  }

  function cambiar(evento) {
    const { name, value } = evento.target;
    setForm((actual) => ({ ...actual, [name]: value }));
    setErrores((actual) => ({ ...actual, [name]: '' }));
    setErrorApi('');
  }

  async function enviar(evento) {
    evento.preventDefault();

    const nuevosErrores = {};
    if (form.nombre.trim().length < 2) nuevosErrores.nombre = 'Ingresá tu nombre completo';
    if (!esEmail(form.email)) nuevosErrores.email = 'Ingresá un email válido';
    if (form.password.length < 6) nuevosErrores.password = 'Mínimo 6 caracteres';
    if (form.confirmar !== form.password) nuevosErrores.confirmar = 'Las contraseñas no coinciden';

    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    setEnviando(true);

    try {
      await registrarse({
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      navigate('/', { replace: true });
    } catch (error) {
      setErrorApi(error.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="pagina-auth">
      <div className="tarjeta-auth">
        <span className="etiqueta">Nueva cuenta</span>
        <h1>Crear cuenta</h1>
        <p className="texto-suave">
          Registrate para acceder a la gestión de vehículos, conductores y viajes.
        </p>

        <Alerta tipo="error" onClose={() => setErrorApi('')}>
          {errorApi}
        </Alerta>

        <form className="formulario" onSubmit={enviar} noValidate>
          <div className="campo">
            <label htmlFor="nombre">Nombre completo</label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              className={`input ${errores.nombre ? 'input-error' : ''}`}
              value={form.nombre}
              onChange={cambiar}
              autoComplete="name"
              placeholder="Juan Pérez"
            />
            {errores.nombre && <span className="error-campo">{errores.nombre}</span>}
          </div>

          <div className="campo">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className={`input ${errores.email ? 'input-error' : ''}`}
              value={form.email}
              onChange={cambiar}
              autoComplete="email"
              placeholder="usuario@ejemplo.com"
            />
            {errores.email && <span className="error-campo">{errores.email}</span>}
          </div>

          <div className="campo">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              className={`input ${errores.password ? 'input-error' : ''}`}
              value={form.password}
              onChange={cambiar}
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
            />
            {errores.password && <span className="error-campo">{errores.password}</span>}
          </div>

          <div className="campo">
            <label htmlFor="confirmar">Repetir contraseña</label>
            <input
              id="confirmar"
              name="confirmar"
              type="password"
              className={`input ${errores.confirmar ? 'input-error' : ''}`}
              value={form.confirmar}
              onChange={cambiar}
              autoComplete="new-password"
              placeholder="••••••••"
            />
            {errores.confirmar && <span className="error-campo">{errores.confirmar}</span>}
          </div>

          <button type="submit" className="btn btn-primario btn-bloque" disabled={enviando}>
            {enviando ? 'Creando cuenta...' : 'Registrarme'}
          </button>
        </form>

        <p className="pie-auth">
          ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
        </p>
      </div>
    </section>
  );
}
