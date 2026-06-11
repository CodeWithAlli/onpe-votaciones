import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stepper } from '../../components/shared/Stepper';
import { PanelAccesibilidad } from '../../components/shared/PanelAccesibilidad';
import { eleccionService } from '../../services/api';
import type { Candidato } from '../../types';

const PASOS = ['Verificación', 'Candidatos', 'Confirmación', 'Comprobante'];

export const CandidatosPage = () => {
  const navigate = useNavigate();
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [seleccionado, setSeleccionado] = useState<Candidato | null>(null);
  const [cargando, setCargando] = useState(true);
  const [confirmando, setConfirmando] = useState(false);

  // Verificar que hay sesión de votante
  useEffect(() => {
    const votante = sessionStorage.getItem('onp_votante');

    if (!votante) {
      navigate('/votar');
      return;
    }

    const cargar = async () => {
      try {
        const lista = await eleccionService.getCandidatos();
        setCandidatos(lista);
      } catch (error) {
        console.error('Error cargando candidatos:', error);
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, [navigate]);

  const handleSeleccionar = (candidato: Candidato) => {
    setSeleccionado(candidato);
    setConfirmando(false);
  };

  const handleContinuar = () => {
    if (!seleccionado) return;

    sessionStorage.setItem(
      'onp_candidato_seleccionado',
      JSON.stringify(seleccionado)
    );

    navigate('/votar/confirmar');
  };

  const votanteData = JSON.parse(
    sessionStorage.getItem('onp_votante') || '{}'
  );

  return (
    <div className="votante-layout">
      <header className="votante-header">
        <div className="votante-header__logo">
          <div className="logo-escudo" aria-hidden="true">🗳</div>
          <div>
            <span className="logo-nombre">ONPE</span>
            <span className="logo-subtitulo">
              Oficina Nacional de Procesos Electorales
            </span>
          </div>
        </div>
        <PanelAccesibilidad />
      </header>

      <main className="votante-main">
        <Stepper pasoActual={2} pasos={PASOS} />

        <div className="bienvenida-votante" aria-live="polite">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>

          <span>
            Identidad verificada:{' '}
            <strong>
              {votanteData.nombre} {votanteData.apellido}
            </strong>
            {' — '}
            {votanteData.distrito}
          </span>
        </div>

        <section aria-labelledby="titulo-candidatos">
          <h1 id="titulo-candidatos" className="seccion-titulo">
            Seleccione un candidato
          </h1>

          <p className="seccion-subtitulo">
            Elija <strong>una sola opción</strong>. Solo puede votar por un
            candidato.
          </p>

          {cargando ? (
            <div
              className="cargando-estado"
              role="status"
              aria-live="polite"
            >
              <span className="spinner spinner--grande" />
              <span>Cargando candidatos...</span>
            </div>
          ) : (
            <div
              className="candidatos-grid"
              role="radiogroup"
              aria-labelledby="titulo-candidatos"
            >
              {candidatos.map((candidato) => {
                const isSelected =
                  seleccionado?.id === candidato.id;

                return (
                  <button
                    key={candidato.id}
                    type="button"
                    className={`candidato-card ${
                      isSelected
                        ? 'candidato-card--seleccionado'
                        : ''
                    }`}
                    onClick={() => handleSeleccionar(candidato)}
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={`Candidato número ${candidato.numero}: ${candidato.nombre} ${candidato.apellido}, partido ${candidato.partido}`}
                  >
                    <div
                      className="candidato-numero"
                      style={{
                        backgroundColor: candidato.colorPartido,
                      }}
                      aria-hidden="true"
                    >
                      {candidato.numero}
                    </div>

                    <div className="candidato-foto" aria-hidden="true">
                      {candidato.foto ? (
                        <img
                          src={candidato.foto}
                          alt=""
                        />
                      ) : (
                        <div
                          className="candidato-foto-placeholder"
                          style={{
                            borderColor:
                              candidato.colorPartido,
                          }}
                        >
                          <span>
                            {candidato.nombre[0]}
                            {candidato.apellido[0]}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="candidato-info">
                      <span className="candidato-nombre">
                        {candidato.nombre} {candidato.apellido}
                      </span>

                      <span
                        className="candidato-partido"
                        style={{
                          color: candidato.colorPartido,
                        }}
                      >
                        {candidato.siglas} — {candidato.partido}
                      </span>
                    </div>

                    {isSelected && (
                      <div
                        className="candidato-check"
                        aria-hidden="true"
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <div className="candidatos-acciones">
          {seleccionado && (
            <div
              className="seleccion-resumen"
              aria-live="polite"
            >
              Ha seleccionado:{' '}
              <strong>
                {seleccionado.nombre} {seleccionado.apellido}
              </strong>{' '}
              ({seleccionado.siglas})
            </div>
          )}

          <button
            className="btn-primario btn-grande"
            onClick={handleContinuar}
            disabled={!seleccionado || confirmando}
          >
            Confirmar selección →
          </button>

          <button
            className="btn-secundario"
            onClick={() => navigate('/votar')}
          >
            ← Regresar
          </button>
        </div>
      </main>

      <footer className="votante-footer">
        <span>Elecciones Generales 2026</span>
        <span>·</span>
        <span>ONPE — República del Perú</span>
      </footer>
    </div>
  );
};