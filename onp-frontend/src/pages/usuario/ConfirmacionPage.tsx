import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stepper } from '../../components/shared/Stepper';
import { PanelAccesibilidad } from '../../components/shared/PanelAccesibilidad';
import { votanteService } from '../../services/api';
import type { Candidato, VotanteVerificado } from '../../types';

const PASOS = ['Verificación', 'Candidatos', 'Confirmación', 'Comprobante'];
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const ConfirmacionPage = () => {
  const navigate = useNavigate();
  const [candidato, setCandidato] = useState<Candidato | null>(null);
  const [votante, setVotante] = useState<VotanteVerificado | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [confirmado, setConfirmado] = useState(false);

  useEffect(() => {
    const c = sessionStorage.getItem('onp_candidato_seleccionado');
    const v = sessionStorage.getItem('onp_votante');
    if (!c || !v) { navigate('/votar'); return; }
    setCandidato(JSON.parse(c));
    setVotante(JSON.parse(v));
  }, [navigate]);

  const handleEmitirVoto = async () => {
    if (!candidato || !votante || enviando) return;
    setEnviando(true);
    try {
      let codigo: string;
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 1500));
        codigo = `ONP-${Date.now().toString(36).toUpperCase()}`;
      } else {
        const voto = await votanteService.emitirVoto(
          votante.dni,
          candidato.id,
          import.meta.env.VITE_ELECCION_ID
        );
        codigo = voto.codigoVerificacion;
        if (!codigo) {
          throw new Error('Respuesta sin código de verificación');
        }
      }
      sessionStorage.setItem('onp_codigo_voto', codigo);
      // Limpiar datos sensibles
      sessionStorage.removeItem('onp_candidato_seleccionado');
      navigate('/votar/gracias');
    } catch {
      setEnviando(false);
      alert('Error al emitir el voto. Por favor intente nuevamente.');
    }
  };

  if (!candidato || !votante) return null;

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
        <Stepper pasoActual={3} pasos={PASOS} />

        <section className="confirmacion-card" aria-labelledby="titulo-confirmacion">
          <div className="confirmacion-alerta" role="alert">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <strong>Revise con cuidado antes de confirmar. Esta acción no se puede deshacer.</strong>
          </div>

          <h1 id="titulo-confirmacion" className="seccion-titulo">
            Confirme su voto
          </h1>

          <div className="confirmacion-datos">
            <div className="confirmacion-seccion">
              <span className="confirmacion-etiqueta">Votante</span>
              <span className="confirmacion-valor">
                {votante.nombre} {votante.apellido} — DNI {votante.dni}
              </span>
            </div>
            <div className="confirmacion-seccion">
              <span className="confirmacion-etiqueta">Distrito</span>
              <span className="confirmacion-valor">{votante.distrito}</span>
            </div>
          </div>

          <div
            className="candidato-seleccion-final"
            style={{ borderColor: candidato.colorPartido }}
            aria-label={`Candidato seleccionado: ${candidato.nombre} ${candidato.apellido}`}
          >
            <div
              className="candidato-numero candidato-numero--grande"
              style={{ backgroundColor: candidato.colorPartido }}
            >
              {candidato.numero}
            </div>
            <div className="candidato-foto candidato-foto--grande">
              <div className="candidato-foto-placeholder" style={{ borderColor: candidato.colorPartido }}>
                <span>{candidato.nombre[0]}{candidato.apellido[0]}</span>
              </div>
            </div>
            <div className="candidato-info">
              <strong className="candidato-nombre candidato-nombre--grande">
                {candidato.nombre} {candidato.apellido}
              </strong>
              <span className="candidato-partido" style={{ color: candidato.colorPartido }}>
                {candidato.siglas} — {candidato.partido}
              </span>
            </div>
          </div>

          {!confirmado ? (
            <div className="confirmacion-acciones">
              <button
                className="btn-peligro btn-grande"
                onClick={() => setConfirmado(true)}
                disabled={enviando}
              >
                Emitir mi voto definitivamente
              </button>
              <button
                className="btn-secundario"
                onClick={() => navigate('/votar/candidatos')}
                disabled={enviando}
              >
                ← Cambiar candidato
              </button>
            </div>
          ) : (
            <div className="confirmacion-doble">
              <p className="confirmacion-doble-texto">
                ¿Está completamente seguro? <strong>Su voto no podrá modificarse.</strong>
              </p>
              <div className="confirmacion-acciones">
                <button
                  className="btn-peligro btn-grande"
                  onClick={handleEmitirVoto}
                  disabled={enviando}
                  aria-busy={enviando}
                >
                  {enviando ? (
                    <>
                      <span className="spinner" aria-hidden="true" />
                      Registrando voto...
                    </>
                  ) : (
                    'Sí, confirmo mi voto'
                  )}
                </button>
                <button
                  className="btn-secundario"
                  onClick={() => setConfirmado(false)}
                  disabled={enviando}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
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
