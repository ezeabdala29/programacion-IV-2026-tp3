import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const enlaces = [
  { to: '/', texto: 'Inicio', end: true },
  { to: '/vehiculos', texto: 'Vehículos' },
  { to: '/conductores', texto: 'Conductores' },
  { to: '/viajes', texto: 'Viajes' },
  { to: '/historial', texto: 'Historial' },
];

export function Navbar() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  function salir() {
    cerrarSesion();
    navigate('/');
  }

  return (
    <header className="navbar">
      <div className="contenedor navbar-contenido">
        <Link className="marca" to="/">
          <svg
            className="marca-svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
            <path d="M15 18H9" />
            <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
            <circle cx="17" cy="18" r="2" />
            <circle cx="7" cy="18" r="2" />
          </svg>
          <span className="marca-texto">
            Sistema de gestión de vehículos, conductores y viajes
          </span>
        </Link>

        <nav className="navbar-nav">
          {usuario &&
            enlaces.map((enlace) => (
              <NavLink
                key={enlace.to}
                to={enlace.to}
                end={enlace.end}
                className={({ isActive }) => `nav-enlace ${isActive ? 'activo' : ''}`}
              >
                {enlace.texto}
              </NavLink>
            ))}

          {usuario && (
            <div className="navbar-sesion">
              <span className="usuario-chip" title={usuario.email}>
                {usuario.nombre}
              </span>
              <button type="button" className="btn btn-fantasma btn-sm" onClick={salir}>
                Salir
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
