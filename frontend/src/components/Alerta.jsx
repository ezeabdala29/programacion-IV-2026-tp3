export function Alerta({ tipo = 'info', children, onClose }) {
  if (!children) return null;

  return (
    <div className={`alerta alerta-${tipo}`} role="alert">
      <span>{children}</span>
      {onClose && (
        <button type="button" className="alerta-cerrar" onClick={onClose} aria-label="Cerrar aviso">
          ×
        </button>
      )}
    </div>
  );
}
