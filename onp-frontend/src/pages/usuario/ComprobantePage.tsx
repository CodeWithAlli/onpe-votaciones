import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stepper } from '../../components/shared/Stepper';
import { PanelAccesibilidad } from '../../components/shared/PanelAccesibilidad';

const PASOS = ['Verificación', 'Candidatos', 'Confirmación', 'Comprobante'];

export const ComprobantePage = () => {
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState('');
  const [hora] = useState(() => new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }));
  const [fecha] = useState(() => new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' }));

  useEffect(() => {
    const c = sessionStorage.getItem('onp_codigo_voto');
    if (!c) {
      navigate('/votar');
      return;
    }
    setCodigo(c);
    // Solo datos del flujo; el código se conserva hasta "Finalizar"
    // (borrarlo aquí rompe la página en React Strict Mode, que ejecuta el efecto dos veces)
    sessionStorage.removeItem('onp_votante');
    sessionStorage.removeItem('onp_candidato_seleccionado');
  }, [navigate]);

  const handleFinalizar = () => {
    sessionStorage.removeItem('onp_codigo_voto');
    navigate('/votar');
  };

  return (
    <div className="votante-layout">
      <header className="votante-header">
        <div className="votante-header__logo">
          <div className="logo-escudo" aria-hidden="true">🗳</div>
          <div>
            <span className="logo-nombre">ONPE</span>
            <span className="logo-subtitulo">Oficina Nacional de Procesos Electorales</span>
          </div>
        </div>
        <PanelAccesibilidad />
      </header>

      <main className="votante-main">
        <Stepper pasoActual={4} pasos={PASOS} />

        <section className="comprobante-card" aria-labelledby="titulo-comprobante">
          <div className="comprobante-icono-exito" aria-hidden="true">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>

          <h1 id="titulo-comprobante" className="comprobante-titulo">
            ¡Su voto fue registrado exitosamente!
          </h1>
          <p className="comprobante-subtitulo">
            Gracias por ejercer su derecho al voto y participar en la democracia del Perú.
          </p>

          <div className="comprobante-box" aria-label="Código de comprobante de voto">
            <span className="comprobante-box-label">Código de verificación</span>
            <span className="comprobante-codigo" aria-live="polite">{codigo}</span>
            <span className="comprobante-box-fecha">{fecha} — {hora}</span>
          </div>

          <div className="comprobante-info">
            <div className="comprobante-info-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Su voto es <strong>secreto</strong>. Nadie puede asociar este código con su candidato.</span>
            </div>
            <div className="comprobante-info-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span>Puede anotar este código para verificar su participación en <strong>resultados.onpe.gob.pe</strong></span>
            </div>
          </div>

          <button
            className="btn-primario btn-grande"
            onClick={handleFinalizar}
          >
            Finalizar
          </button>
        </section>
      </main>

      <footer className="votante-footer">
        <span>Elecciones Generales 2026</span>
        <span>·</span>
        <span>ONPE — República del Perú</span>
      </footer>
    </div>
  );
};
