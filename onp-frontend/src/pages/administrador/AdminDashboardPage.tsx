import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/api';
import type { EstadisticasAdmin, Eleccion } from '../../types';
import { AdminSidebar } from './AdminSidebar';
const ELECCION_ID = import.meta.env.VITE_ELECCION_ID;

const eleccionInicial: Eleccion = {
  id: ELECCION_ID,
  titulo: 'Cargando…',
  descripcion: '',
  fechaInicio: '',
  fechaFin: '',
  estado: 'pendiente',
  totalVotantes: 0,
  votosEmitidos: 0,
};

export const AdminDashboardPage = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<EstadisticasAdmin | null>(null);
  const [eleccion, setEleccion] = useState<Eleccion>(eleccionInicial);
  const [cargando, setCargando] = useState(true);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);

  const cargarDatos = useCallback(async () => {
    try {
      const [estadisticas, eleccionData] = await Promise.all([
        adminService.getEstadisticas(ELECCION_ID),
        adminService.getEleccion(),
      ]);
  
      setStats(estadisticas);
      setEleccion(eleccionData);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  }, []);
  
  useEffect(() => {
    cargarDatos();
  
    const intervalo = setInterval(
      cargarDatos,
      30000
    );
  
    return () => clearInterval(intervalo);
  }, [cargarDatos]);
  const handleCambiarEstado = async (nuevoEstado: 'activa' | 'pausada' | 'cerrada') => {
    if (nuevoEstado === 'cerrada') {
      const ok = window.confirm(
        '⚠️ ¿Está seguro de cerrar la elección?\n\nEsta acción es IRREVERSIBLE. No se aceptarán más votos.'
      );
      if (!ok) return;
    }
    setCambiandoEstado(true);
    try {
      const actualizada = await adminService.cambiarEstadoEleccion(ELECCION_ID, nuevoEstado);
      setEleccion((prev) => ({
        ...prev,
        id: actualizada.id,
        titulo: actualizada.titulo,
        estado: actualizada.estado as Eleccion['estado'],
      }));
    } finally {
      setCambiandoEstado(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const estadoBadge = {
    activa: { clase: 'badge-verde', label: '● En curso' },
    pausada: { clase: 'badge-amarillo', label: '⏸ Pausada' },
    cerrada: { clase: 'badge-gris', label: '■ Cerrada' },
    pendiente: { clase: 'badge-azul', label: '○ Pendiente' },
  }[eleccion.estado];

  return (
    <div className="admin-layout">
     
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-topbar">
          <div>
            <h1 className="admin-titulo">Dashboard</h1>
            <p className="admin-subtitulo">{eleccion.titulo}</p>
          </div>
          <div className="admin-topbar-acciones">
            <span className={`badge ${estadoBadge.clase}`}>{estadoBadge.label}</span>
            <span className="admin-usuario">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              {admin?.username}
            </span>
          </div>
        </div>

        {/* Control de estado */}
        <div className="admin-control-estado">
          <span className="admin-control-label">Control de elección:</span>
          <div className="admin-control-botones">
            {eleccion.estado !== 'activa' && eleccion.estado !== 'cerrada' && (
              <button
                className="btn-verde"
                onClick={() => handleCambiarEstado('activa')}
                disabled={cambiandoEstado}
              >
                ▶ Activar votación
              </button>
            )}
            {eleccion.estado === 'activa' && (
              <button
                className="btn-amarillo"
                onClick={() => handleCambiarEstado('pausada')}
                disabled={cambiandoEstado}
              >
                ⏸ Pausar votación
              </button>
            )}
            {eleccion.estado === 'pausada' && (
              <button
                className="btn-verde"
                onClick={() => handleCambiarEstado('activa')}
                disabled={cambiandoEstado}
              >
                ▶ Reanudar votación
              </button>
            )}
            {eleccion.estado !== 'cerrada' && (
              <button
                className="btn-rojo"
                onClick={() => handleCambiarEstado('cerrada')}
                disabled={cambiandoEstado}
              >
                ■ Cerrar elección
              </button>
            )}
          </div>
        </div>

        {/* Métricas principales */}
        {cargando ? (
          <div className="cargando-estado"><span className="spinner spinner--grande" />Cargando estadísticas...</div>
        ) : stats && (
          <>
            <div className="admin-metricas">
              <div className="metrica-card">
                <span className="metrica-valor">{stats.totalVotaron.toLocaleString('es-PE')}</span>
                <span className="metrica-label">Votos emitidos</span>
              </div>
              <div className="metrica-card">
                <span className="metrica-valor">{stats.totalHabilitados.toLocaleString('es-PE')}</span>
                <span className="metrica-label">Habilitados</span>
              </div>
              <div className="metrica-card metrica-card--destacado">
                <span className="metrica-valor">{stats.porcentajeParticipacion.toFixed(1)}%</span>
                <span className="metrica-label">Participación</span>
              </div>
              <div className="metrica-card">
                <span className="metrica-valor">
                  {(stats.totalHabilitados - stats.totalVotaron).toLocaleString('es-PE')}
                </span>
                <span className="metrica-label">Pendientes</span>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="progreso-participacion">
              <div className="progreso-header">
                <span>Participación en tiempo real</span>
                <span>{stats.porcentajeParticipacion.toFixed(1)}%</span>
              </div>
              <div className="progreso-barra">
                <div
                  className="progreso-relleno"
                  style={{ width: `${stats.porcentajeParticipacion}%` }}
                  role="progressbar"
                  aria-valuenow={stats.porcentajeParticipacion}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>

            {/* Top candidatos */}
            <div className="admin-resultados-preview">
              <h2 className="admin-seccion-titulo">Resultados parciales</h2>
              <div className="resultados-lista">
                {stats.resultados.slice(0, 5).map((r, i) => (
                  <div key={r.candidato.id} className="resultado-fila">
                    <span className="resultado-posicion">{i + 1}°</span>
                    <div className="resultado-info">
                      <span className="resultado-nombre">
                        {r.candidato.nombre} {r.candidato.apellido}
                        <em style={{ color: r.candidato.colorPartido }}> ({r.candidato.siglas})</em>
                      </span>
                      <div className="resultado-barra-wrap">
                        <div className="resultado-barra">
                          <div
                            className="resultado-barra-fill"
                            style={{
                              width: `${r.porcentaje}%`,
                              backgroundColor: r.candidato.colorPartido,
                            }}
                          />
                        </div>
                        <span className="resultado-pct">{r.porcentaje.toFixed(1)}%</span>
                      </div>
                    </div>
                    <span className="resultado-votos">{r.votos.toLocaleString('es-PE')}</span>
                  </div>
                ))}
              </div>
              <button className="btn-secundario" onClick={() => navigate('/admin/resultados')}>
                Ver resultados completos →
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
