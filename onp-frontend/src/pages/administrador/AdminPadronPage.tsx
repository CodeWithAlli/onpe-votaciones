import { useState, useEffect } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { adminService } from '../../services/api';
import type { PadronVotante } from '../../types';

export const AdminPadronPage = () => {
  const [padron, setPadron] = useState<PadronVotante[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);
        const data = await adminService.getPadron();
        setPadron(data);
      } catch (err) {
        setError('Error al cargar el padrón electoral.');
        console.error(err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const filtrados = padron.filter((v) => {
    const q = busqueda.toLowerCase();
    return (
      v.dni.includes(q) ||
      v.nombre.toLowerCase().includes(q) ||
      v.apellido.toLowerCase().includes(q)
    );
  });

  // Distrito más frecuente
  const distritoPrincipal = (() => {
    if (padron.length === 0) return '—';
    const conteo: Record<string, number> = {};
    padron.forEach((v) => {
      if (v.distrito) conteo[v.distrito] = (conteo[v.distrito] || 0) + 1;
    });
    return Object.entries(conteo).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
  })();

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <div className="admin-topbar">
          <div>
            <h1 className="admin-titulo">Padrón Electoral</h1>
            <p className="admin-subtitulo">
              Gestión de ciudadanos habilitados para votar.
            </p>
          </div>

          <div className="admin-topbar-actions">
            <button className="btn-secundario">Importar CSV</button>
            <button className="btn-primario">+ Nuevo votante</button>
          </div>
        </div>

        <div className="admin-card">
          <input
            type="text"
            placeholder="Buscar por DNI, nombre o apellido..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="admin-input"
          />
        </div>

        <div className="admin-card">
          {cargando ? (
            <p style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>
              Cargando padrón...
            </p>
          ) : error ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
              {error}
            </p>
          ) : (
            <div className="tabla-scroll">
              <table className="tabla-resultados">
                <thead>
                  <tr>
                    <th>DNI</th>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Distrito</th>
                    <th>Fecha Nacimiento</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {filtrados.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="tabla-vacia">
                        {busqueda
                          ? 'No se encontraron resultados.'
                          : 'No hay votantes en el padrón.'}
                      </td>
                    </tr>
                  ) : (
                    filtrados.map((v) => (
                      <tr key={v.id}>
                        <td>{v.dni}</td>
                        <td>{v.nombre}</td>
                        <td>{v.apellido}</td>
                        <td>{v.distrito ?? '—'}</td>
                        <td>{v.fechaNacimiento ?? '—'}</td>
                        <td>
                          <div className="tabla-acciones">
                            <button className="btn-icono">✏️</button>
                            <button className="btn-icono btn-icono--danger">
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="estadisticas-grid">
          <div className="stat-card">
            <span className="stat-label">Total habilitados</span>
            <strong>{padron.length}</strong>
          </div>

          <div className="stat-card">
            <span className="stat-label">Distrito principal</span>
            <strong>{distritoPrincipal}</strong>
          </div>
        </div>
      </main>
    </div>
  );
};