import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Alerta } from '../components/Alerta.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { esEmail } from '../utils/validaciones.js';

export default function Login() {
  const { usuario, iniciarSesion } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errores, setErrores] = useState({});
  const [errorApi, setErrorApi] = useState('');
  const [enviando, setEnviando] = useState(false);

  const destino = location.state?.desde || '/';

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
    if (!form.email.trim()) nuevosErrores.email = 'El email es obligatorio';
    else if (!esEmail(form.email)) nuevosErrores.email = 'Ingresá un email válido';
    if (!form.password) nuevosErrores.password = 'La contraseña es obligatoria';

    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    setEnviando(true);

    try {
      await iniciarSesion(form.email.trim(), form.password);
      navigate(destino, { replace: true });
    } catch (error) {
      setErrorApi(error.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="pagina-auth">
      <div className="tarjeta-auth">
        <span className="etiqueta">Acceso al sistema</span>
        <h1>Iniciar sesión</h1>
        <p className="texto-suave">
          Ingresá con tu cuenta para administrar vehículos, conductores y viajes.
        </p>

        <Alerta tipo="error" onClose={() => setErrorApi('')}>
          {errorApi}
        </Alerta>

        <form className="formulario" onSubmit={enviar} noValidate>
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
              autoComplete="current-password"
              placeholder="••••••••"
            />
            {errores.password && <span className="error-campo">{errores.password}</span>}
          </div>

          <button type="submit" className="btn btn-primario btn-bloque" disabled={enviando}>
            {enviando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="pie-auth">
          ¿No tenés una cuenta? <Link to="/registro">Registrate</Link>
        </p>
      </div>
    </section>
  );
}
