import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccesibilidad } from '../../context/AccesibilidadContext';
import type { AccesibilidadModo } from '../../types';

const modos: { id: AccesibilidadModo; icono: string; label: string; desc: string }[] = [
  { id: 'estandar', icono: '⚪', label: 'Estándar', desc: 'Vista normal' },
  { id: 'altoContraste', icono: '🌙', label: 'Alto contraste', desc: 'Fondo oscuro, texto claro' },
  { id: 'textoGrande', icono: '🔤', label: 'Texto grande', desc: 'Fuente aumentada 125%' },
  { id: 'daltonismo', icono: '🔵', label: 'Daltonismo', desc: 'Paleta sin rojo/verde' },
];

export const PanelAccesibilidad = () => {
  const { modo, setModo } = useAccesibilidad();
  const [abierto, setAbierto] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="accesibilidad-panel">

      {/* Botón Admin */}
      <button
        className="admin-login-btn"
        onClick={() => navigate('/admin/login')}
        title="Ingresar como administrador"
      >
        🔐 Admin
      </button>

      {/* Botón Accesibilidad */}
      <button
        className="accesibilidad-trigger"
        onClick={() => setAbierto(!abierto)}
        aria-label="Opciones de accesibilidad visual"
        aria-expanded={abierto}
        title="Accesibilidad"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
        </svg>
      </button>

      {abierto && (
        <div
          className="accesibilidad-dropdown"
          role="dialog"
          aria-label="Panel de accesibilidad"
        >
          <p className="accesibilidad-titulo">Adaptar visualización</p>

          <div className="accesibilidad-opciones">
            {modos.map((m) => (
              <button
                key={m.id}
                className={`accesibilidad-opcion ${modo === m.id ? 'activo' : ''}`}
                onClick={() => {
                  setModo(m.id);
                  setAbierto(false);
                }}
              >
                <span className="accesibilidad-icono">{m.icono}</span>

                <span className="accesibilidad-texto">
                  <strong>{m.label}</strong>
                  <small>{m.desc}</small>
                </span>

                {modo === m.id && (
                  <span className="accesibilidad-check">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};