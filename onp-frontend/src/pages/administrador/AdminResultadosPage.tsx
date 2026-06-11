import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/api';
import type { EstadisticasAdmin } from '../../types';
import { AdminSidebar } from './AdminSidebar';

const ELECCION_ID = import.meta.env.VITE_ELECCION_ID;

export const AdminResultadosPage = () => {
  const [stats, setStats] = useState<EstadisticasAdmin | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const data = await adminService.getEstadisticas(ELECCION_ID);
      setStats(data);
    } catch {
      setError('No se pudieron cargar los resultados.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const handleExportar = async () => {
    try {
      const blob = await adminService.exportarResultados(ELECCION_ID);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resultados-eleccion.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('No se pudo exportar el reporte.');
    }
  };

  const maxVotos = stats && stats.resultados.length > 0
    ? Math.max(...stats.resultados.map((r) => r.votos))
    : 1;

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <div className="admin-topbar">
          <div>
            <h1 className="admin-titulo">Resultados Electorales</h1>
            <p className="admin-subtitulo">Estadísticas y consolidado de votos.</p>
          </div>
          <div className="admin-topbar-actions">
            <button className="btn-secundario" onClick={cargar} disabled={cargando}>
              {cargando ? 'Actualizando...' : 'Actualizar'}
            </button>
            <button className="btn-secundario" onClick={handleExportar} disabled={cargando}>
              📥 Exportar CSV
            </button>
          </div>
        </div>

        {error && <div className="alerta-error" role="alert">{error}</div>}

        {cargando ? (
          <div className="admin-card" style={{ textAlign: 'center', padding: '3rem', opacity: 0.6 }}>
            Cargando resultados...
          </div>
        ) : !stats ? (
          <div className="alerta-error">No se encontraron resultados.</div>
        ) : (
          <>
            {/* Métricas */}
            <div className="estadisticas-grid">
              <div className="stat-card">
                <span className="stat-label">Habilitados</span>
                <strong>{stats.totalHabilitados.toLocaleString('es-PE')}</strong>
              </div>
              <div className="stat-card">
                <span className="stat-label">Votos Emitidos</span>
                <strong>{stats.totalVotaron.toLocaleString('es-PE')}</strong>
              </div>
              <div className="stat-card">
                <span className="stat-label">Participación</span>
                <strong>{stats.porcentajeParticipacion.toFixed(1)}%</strong>
              </div>
              <div className="stat-card">
                <span className="stat-label">Pendientes</span>
                <strong>{(stats.totalHabilitados - stats.totalVotaron).toLocaleString('es-PE')}</strong>
              </div>
            </div>

            {stats.resultados.length === 0 ? (
              <div className="admin-card" style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>
                Aún no hay votos emitidos.
              </div>
            ) : (
              <>
                {/* Gráfico de barras */}
                <div className="admin-card">
                  <h2 className="admin-seccion-titulo">Resultados por candidato</h2>
                  <div className="grafico-barras">
                    {stats.resultados.map((r, i) => (
                      <div key={r.candidato.id} className="grafico-barra-item">
                        <div className="grafico-candidato-nombre">
                          <strong>{r.candidato.nombre} {r.candidato.apellido}</strong>
                          <span style={{ color: r.candidato.colorPartido }}>
                            {r.candidato.siglas}
                          </span>
                        </div>
                        <div className="grafico-barra-contenedor">
                          <div
                            className="grafico-barra-fill"
                            style={{
                              width: `${(r.votos / maxVotos) * 100}%`,
                              backgroundColor: r.candidato.colorPartido,
                              animationDelay: `${i * 0.1}s`,
                            }}
                          />
                          <span className="grafico-barra-valor">
                            {r.votos.toLocaleString('es-PE')} votos ({r.porcentaje.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tabla consolidada */}
                <div className="admin-card">
                  <h2 className="admin-seccion-titulo">Tabla consolidada</h2>
                  <div className="tabla-scroll">
                    <table className="tabla-resultados">
                      <thead>
                        <tr>
                          <th>Posición</th>
                          <th>Candidato</th>
                          <th>Partido</th>
                          <th>Votos</th>
                          <th>Porcentaje</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.resultados.map((r, i) => (
                          <tr key={r.candidato.id} className={i === 0 ? 'fila-ganador' : ''}>
                            <td>{i === 0 ? '🏆' : i + 1}</td>
                            <td><strong>{r.candidato.nombre} {r.candidato.apellido}</strong></td>
                            <td style={{ color: r.candidato.colorPartido }}>{r.candidato.partido}</td>
                            <td>{r.votos.toLocaleString('es-PE')}</td>
                            <td><strong>{r.porcentaje.toFixed(1)}%</strong></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};