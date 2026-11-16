import { useEffect } from 'react';

export function Modal({ titulo, children, onClose }) {
  useEffect(() => {
    function alPresionar(evento) {
      if (evento.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', alPresionar);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', alPresionar);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="modal-fondo"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-label={titulo}>
        <header className="modal-cabecera">
          <h2>{titulo}</h2>
          <button type="button" className="btn-icono" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </header>
        <div className="modal-cuerpo">{children}</div>
      </div>
    </div>
  );
}
