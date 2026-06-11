import { useState, useEffect } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { adminService } from '../../services/api';
import type { Eleccion } from '../../types';

const ELECCION_ID = import.meta.env.VITE_ELECCION_ID;

export const AdminEleccionPage = () => {
  const [eleccion, setEleccion] = useState<Eleccion | null>(null);
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    fechaInicio: '',
    fechaFin: '',
    estado: 'pendiente',
  });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await adminService.getEleccion();
        setEleccion(data);
        setForm({
          titulo:      data.titulo,
          descripcion: data.descripcion,
          fechaInicio: data.fechaInicio?.slice(0, 16) ?? '',
          fechaFin:    data.fechaFin?.slice(0, 16) ?? '',
          estado:      data.estado,
        });
      } catch {
        setMensaje({ tipo: 'error', texto: 'No se pudo cargar la elección.' });
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMensaje(null);
  };

  const handleGuardar = async () => {
    if (!eleccion) return;
    setGuardando(true);
    setMensaje(null);
    try {
      const actualizada = await adminService.actualizarEleccion({
        id:          eleccion.id,
        titulo:      form.titulo,
        descripcion: form.descripcion,
        fechaInicio: form.fechaInicio,
        fechaFin:    form.fechaFin,
        estado:      form.estado as Eleccion['estado'],
      });
      setEleccion(actualizada);
      setMensaje({ tipo: 'ok', texto: '✓ Configuración guardada correctamente.' });
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error al guardar. Intente nuevamente.' });
    } finally {
      setGuardando(false);
    }
  };

  const estadoLabel: Record<string, string> = {
    pendiente: 'PENDIENTE',
    activa:    'ACTIVA',
    pausada:   'PAUSADA',
    cerrada:   'CERRADA',
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <div className="admin-topbar">
          <div>
            <h1 className="admin-titulo">Configuración de Elección</h1>
            <p className="admin-subtitulo">
              Administrar la elección activa del sistema ONPE.
            </p>
          </div>
        </div>

        {mensaje && (
          <div
            className={mensaje.tipo === 'ok' ? 'alerta-exito' : 'alerta-error'}
            role="alert"
          >
            {mensaje.texto}
          </div>
        )}

        {cargando ? (
          <div className="admin-card" style={{ textAlign: 'center', padding: '3rem', opacity: 0.6 }}>
            Cargando datos de la elección...
          </div>
        ) : (
          <>
            <div className="admin-card">
              <div className="admin-form-grid">

                <div className="form-group">
                  <label>Título</label>
                  <input
                    type="text"
                    name="titulo"
                    value={form.titulo}
                    onChange={handleChange}
                    className="admin-input"
                  />
                </div>

                <div className="form-group">
                  <label>Estado</label>
                  <select
                    name="estado"
                    value={form.estado}
                    onChange={handleChange}
                    className="admin-input"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="activa">Activa</option>
                    <option value="pausada">Pausada</option>
                    <option value="cerrada">Cerrada</option>
                  </select>
                </div>

                <div className="form-group form-group-full">
                  <label>Descripción</label>
                  <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    rows={4}
                    className="admin-input"
                  />
                </div>

                <div className="form-group">
                  <label>Fecha de Inicio</label>
                  <input
                    type="datetime-local"
                    name="fechaInicio"
                    value={form.fechaInicio}
                    onChange={handleChange}
                    className="admin-input"
                  />
                </div>

                <div className="form-group">
                  <label>Fecha de Fin</label>
                  <input
                    type="datetime-local"
                    name="fechaFin"
                    value={form.fechaFin}
                    onChange={handleChange}
                    className="admin-input"
                  />
                </div>

              </div>

              <div className="admin-actions">
                <button
                  className="btn-primario"
                  onClick={handleGuardar}
                  disabled={guardando}
                >
                  {guardando ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </div>

            <div className="admin-card">
              <h2 className="admin-seccion-titulo">Estado actual en Supabase</h2>
              <div className="estadisticas-grid">
                <div className="stat-card">
                  <span className="stat-label">Estado</span>
                  <strong>{estadoLabel[eleccion?.estado ?? 'pendiente']}</strong>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Inicio</span>
                  <strong>{eleccion?.fechaInicio?.replace('T', ' ').slice(0, 16) ?? '—'}</strong>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Fin</span>
                  <strong>{eleccion?.fechaFin?.replace('T', ' ').slice(0, 16) ?? '—'}</strong>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Votos emitidos</span>
                  <strong>{eleccion?.votosEmitidos ?? 0}</strong>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};