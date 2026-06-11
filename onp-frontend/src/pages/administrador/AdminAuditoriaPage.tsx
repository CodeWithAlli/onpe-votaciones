import { useState, useEffect } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { adminService } from '../../services/api';
import type { Auditoria } from '../../types';

export const AdminAuditoriaPage = () => {
  const [registros, setRegistros] = useState<Auditoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await adminService.getAuditoria();
        setRegistros(data);
      } catch {
        setError('Error al cargar el registro de auditoría.');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const filtrados = registros.filter((r) => {
    const q = busqueda.toLowerCase();
    return (
      (r.usuario ?? '').toLowerCase().includes(q) ||
      (r.accion ?? '').toLowerCase().includes(q)
    );
  });

  const usuariosUnicos = new Set(registros.map((r) => r.usuario).filter(Boolean)).size;

  const formatFecha = (fecha: string) =>
    new Date(fecha).toLocaleString('es-PE', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <div className="admin-topbar">
          <div>
            <h1 className="admin-titulo">Auditoría del Sistema</h1>
            <p className="admin-subtitulo">
              Registro de actividades realizadas por los administradores.
            </p>
          </div>
          <button
            className="btn-secundario"
            onClick={() => { setCargando(true); setError(''); adminService.getAuditoria().then(setRegistros).catch(() => setError('Error al recargar.')).finally(() => setCargando(false)); }}
          >
            Actualizar
          </button>
        </div>

        {error && (
          <div className="alerta-error" role="alert">{error}</div>
        )}

        <div className="admin-card">
          <input
            type="text"
            placeholder="Buscar por usuario o acción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="admin-input"
          />
        </div>

        <div className="admin-card">
          {cargando ? (
            <p style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>
              Cargando registros...
            </p>
          ) : (
            <div className="tabla-scroll">
              <table className="tabla-resultados">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Acción</th>
                    <th>Detalle</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="tabla-vacia">
                        {busqueda ? 'No se encontraron resultados.' : 'No hay registros de auditoría.'}
                      </td>
                    </tr>
                  ) : (
                    filtrados.map((r, i) => (
                      <tr key={r.id ?? i}>
                        <td><strong>{r.usuario ?? '—'}</strong></td>
                        <td>{r.accion ?? '—'}</td>
                        <td style={{ fontSize: '0.85em', opacity: 0.7 }}>{r.detalle ?? '—'}</td>
                        <td>{r.fecha ? formatFecha(r.fecha) : '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!cargando && (
          <div className="estadisticas-grid">
            <div className="stat-card">
              <span className="stat-label">Eventos registrados</span>
              <strong>{registros.length}</strong>
            </div>
            <div className="stat-card">
              <span className="stat-label">Usuarios con actividad</span>
              <strong>{usuariosUnicos}</strong>
            </div>
            <div className="stat-card">
              <span className="stat-label">Último evento</span>
              <strong>
                {registros[0]?.fecha ? formatFecha(registros[0].fecha) : '—'}
              </strong>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};