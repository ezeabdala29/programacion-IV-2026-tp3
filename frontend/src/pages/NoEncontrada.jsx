import { Link } from 'react-router-dom';

export default function NoEncontrada() {
  return (
    <section className="contenedor seccion">
      <div className="tarjeta estado-vacio">
        <span className="estado-vacio-icono" aria-hidden="true">
          404
        </span>
        <h1>Página no encontrada</h1>
        <p>La dirección que buscás no existe o fue movida.</p>
        <Link className="btn btn-primario" to="/">
          Volver al inicio
        </Link>
      </div>
    </section>
  );
}
