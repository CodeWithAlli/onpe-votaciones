interface StepperProps {
  pasoActual: number; // 1-based
  pasos: string[];
}

export const Stepper = ({ pasoActual, pasos }: StepperProps) => {
  return (
    <nav className="stepper" aria-label="Progreso del proceso de votación">
      {pasos.map((paso, index) => {
        const num = index + 1;
        const estado = num < pasoActual ? 'completado' : num === pasoActual ? 'activo' : 'pendiente';
        return (
          <div key={paso} className={`stepper-paso stepper-paso--${estado}`}>
            <div className="stepper-circulo" aria-hidden="true">
              {estado === 'completado' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <span>{num}</span>
              )}
            </div>
            <span className="stepper-label">
              {paso}
              {estado === 'activo' && <span className="sr-only"> (paso actual)</span>}
            </span>
            {index < pasos.length - 1 && (
              <div className={`stepper-linea ${estado === 'completado' ? 'stepper-linea--completada' : ''}`} aria-hidden="true" />
            )}
          </div>
        );
      })}
    </nav>
  );
};
