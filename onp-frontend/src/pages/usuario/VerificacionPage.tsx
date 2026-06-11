import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stepper } from '../../components/shared/Stepper';
import { PanelAccesibilidad } from '../../components/shared/PanelAccesibilidad';
import { votanteService } from '../../services/api';

const PASOS = ['Verificación', 'Candidatos', 'Confirmación', 'Comprobante'];

export const VerificacionPage = () => {
  const navigate = useNavigate();
  const [dni, setDni] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const handleVerificar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dni.length !== 8 || !/^\d+$/.test(dni)) {
      setError('El DNI debe tener exactamente 8 dígitos numéricos.');
      return;
    }

    setCargando(true);
    setError('');

    try {
      const votante = await votanteService.verificarDNI(dni);

      if (votante.yaVoto) {
        setError('Este DNI ya registró su voto en esta elección. Gracias por participar.');
        return;
      }

      sessionStorage.setItem('onp_votante', JSON.stringify(votante));
      navigate('/votar/candidatos');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg || 'DNI no encontrado en el padrón electoral. Verifique el número ingresado.');
    } finally {
      setCargando(false);
    }
  };

  const handleDniChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/\D/g, '').slice(0, 8);
    setDni(valor);
    if (error) setError('');
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
        <Stepper pasoActual={1} pasos={PASOS} />

        <section className="verificacion-card" aria-labelledby="titulo-verificacion">
          <div className="verificacion-icono" aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>

          <h1 id="titulo-verificacion" className="verificacion-titulo">
            Ingrese su número de DNI
          </h1>
          <p className="verificacion-subtitulo">
            Solo ciudadanos peruanos mayores de 18 años habilitados en el padrón electoral pueden votar.
          </p>

          <form onSubmit={handleVerificar} noValidate>
            <div className="dni-input-grupo">
              <label htmlFor="dni-input" className="dni-label">
                Documento Nacional de Identidad
              </label>
              <input
                id="dni-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className={`dni-input ${error ? 'dni-input--error' : ''}`}
                value={dni}
                onChange={handleDniChange}
                placeholder="00000000"
                maxLength={8}
                autoComplete="off"
                autoFocus
                aria-describedby={error ? 'dni-error' : 'dni-hint'}
                aria-invalid={!!error}
              />
              <span id="dni-hint" className="dni-hint">
                {dni.length}/8 dígitos
              </span>
            </div>

            {error && (
              <div id="dni-error" className="alerta-error" role="alert" aria-live="assertive">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn-primario btn-grande"
              disabled={cargando || dni.length !== 8}
              aria-busy={cargando}
            >
              {cargando ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  Verificando...
                </>
              ) : (
                'Continuar →'
              )}
            </button>
          </form>

          <div className="verificacion-aviso">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Su voto es secreto. Nadie puede conocer su elección.</span>
          </div>
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