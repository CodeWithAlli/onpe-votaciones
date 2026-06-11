import { useState, useEffect, useCallback } from 'react';
import { eleccionService, adminService } from '../../services/api';
import type { Candidato } from '../../types';
import { AdminSidebar } from './AdminSidebar';

const ELECCION_ID = import.meta.env.VITE_ELECCION_ID;

const formVacio = {
  nombre:       '',
  apellido:     '',
  partido:      '',
  siglas:       '',
  numero:       '',
  colorPartido: '#1a56db',
};

export const AdminCandidatosPage = () => {
  const [candidatos, setCandidatos]   = useState<Candidato[]>([]);
  const [cargando, setCargando]       = useState(true);
  const [error, setError]             = useState('');
  const [mensaje, setMensaje]         = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando]         = useState<Candidato | null>(null);
  const [form, setForm]                 = useState(formVacio);
  const [guardando, setGuardando]       = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const lista = await eleccionService.getCandidatos(ELECCION_ID);
      setCandidatos(lista);
    } catch {
      setError('No se pudieron cargar los candidatos.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const abrirCrear = () => {
    setEditando(null);
    setForm(formVacio);
    setMensaje(null);
    setModalAbierto(true);
  };

  const abrirEditar = (c: Candidato) => {
    setEditando(c);
    setForm({
      nombre:       c.nombre,
      apellido:     c.apellido,
      partido:      c.partido,
      siglas:       c.siglas,
      numero:       String(c.numero),
      colorPartido: c.colorPartido,
    });
    setMensaje(null);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEditando(null);
  };

  const handleGuardar = async () => {
    if (!form.nombre.trim() || !form.apellido.trim() || !form.partido.trim()) {
      setMensaje({ tipo: 'error', texto: 'Nombre, apellido y partido son requeridos.' });
      return;
    }
    setGuardando(true);
    setMensaje(null);
    try {
      const payload = {
        ...form,
        numero:      Number(form.numero),
        eleccion_id: ELECCION_ID,
        ...(editando ? { id: editando.id } : {}),
      };
      await adminService.guardarCandidato(payload);
      setMensaje({ tipo: 'ok', texto: editando ? '✓ Candidato actualizado.' : '✓ Candidato creado.' });
      cerrarModal();
      cargar();
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error al guardar el candidato.' });
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (c: Candidato) => {
    const ok = window.confirm(`¿Eliminar a "${c.nombre} ${c.apellido}"? Esta acción no se puede deshacer.`);
    if (!ok) return;
    try {
      await adminService.eliminarCandidato(c.id);
      setMensaje({ tipo: 'ok', texto: `✓ Candidato "${c.nombre} ${c.apellido}" eliminado.` });
      cargar();
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error al eliminar el candidato.' });
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <div className="admin-topbar">
          <div>
            <h1 className="admin-titulo">Gestión de Candidatos</h1>
            <p className="admin-subtitulo">
              {cargando ? 'Cargando…' : `${candidatos.length} candidatos registrados`}
            </p>
          </div>
          <div className="admin-topbar-actions">
            <button className="btn-secundario" onClick={cargar} disabled={cargando}>
              {cargando ? 'Actualizando...' : 'Actualizar'}
            </button>
            <button className="btn-primario" onClick={abrirCrear}>
              + Nuevo candidato
            </button>
          </div>
        </div>

        {error && <div className="alerta-error" role="alert">{error}</div>}
        {mensaje && !modalAbierto && (
          <div className={mensaje.tipo === 'ok' ? 'alerta-exito' : 'alerta-error'} role="alert">
            {mensaje.texto}
          </div>
        )}

        {cargando ? (
          <div className="admin-card" style={{ textAlign: 'center', padding: '3rem', opacity: 0.6 }}>
            Cargando candidatos...
          </div>
        ) : candidatos.length === 0 ? (
          <div className="admin-card" style={{ textAlign: 'center', padding: '3rem', opacity: 0.6 }}>
            No hay candidatos registrados. Usa "+ Nuevo candidato" para agregar.
          </div>
        ) : (
          <div className="admin-card">
            <div className="tabla-scroll">
              <table className="tabla-resultados" aria-label="Lista de candidatos">
                <thead>
                  <tr>
                    <th>N°</th>
                    <th>Candidato</th>
                    <th>Partido</th>
                    <th>Siglas</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {candidatos.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <span
                          className="candidato-numero candidato-numero--pequeno"
                          style={{ backgroundColor: c.colorPartido }}
                        >
                          {c.numero}
                        </span>
                      </td>
                      <td><strong>{c.nombre} {c.apellido}</strong></td>
                      <td>{c.partido}</td>
                      <td>
                        <span style={{ color: c.colorPartido, fontWeight: 600 }}>
                          {c.siglas}
                        </span>
                      </td>
                      <td>
                        <div className="tabla-acciones">
                          <button className="btn-icono" onClick={() => abrirEditar(c)} title="Editar">✏️</button>
                          <button className="btn-icono btn-icono--danger" onClick={() => handleEliminar(c)} title="Eliminar">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!cargando && (
          <div className="estadisticas-grid">
            <div className="stat-card">
              <span className="stat-label">Total candidatos</span>
              <strong>{candidatos.length}</strong>
            </div>
            <div className="stat-card">
              <span className="stat-label">Partidos</span>
              <strong>{new Set(candidatos.map((c) => c.partido)).size}</strong>
            </div>
          </div>
        )}

        {modalAbierto && (
          <div className="modal-overlay" onClick={cerrarModal}>
            <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editando ? 'Editar Candidato' : 'Nuevo Candidato'}</h2>
                <button className="modal-cerrar" onClick={cerrarModal}>✕</button>
              </div>

              <div className="admin-form-grid">
                <div className="form-group">
                  <label>Nombre</label>
                  <input type="text" className="admin-input" value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Pedro" />
                </div>
                <div className="form-group">
                  <label>Apellido</label>
                  <input type="text" className="admin-input" value={form.apellido}
                    onChange={(e) => setForm({ ...form, apellido: e.target.value })} placeholder="Ej: Castillo" />
                </div>
                <div className="form-group">
                  <label>Partido político</label>
                  <input type="text" className="admin-input" value={form.partido}
                    onChange={(e) => setForm({ ...form, partido: e.target.value })} placeholder="Ej: Perú Libre" />
                </div>
                <div className="form-group">
                  <label>Siglas</label>
                  <input type="text" className="admin-input" value={form.siglas}
                    onChange={(e) => setForm({ ...form, siglas: e.target.value })} placeholder="Ej: PL" />
                </div>
                <div className="form-group">
                  <label>Número en cédula</label>
                  <input type="number" className="admin-input" value={form.numero} min={1}
                    onChange={(e) => setForm({ ...form, numero: e.target.value })} placeholder="Ej: 1" />
                </div>
                <div className="form-group">
                  <label>Color del partido</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input type="color" value={form.colorPartido}
                      onChange={(e) => setForm({ ...form, colorPartido: e.target.value })}
                      style={{ width: 48, height: 38, border: 'none', cursor: 'pointer' }} />
                    <input type="text" className="admin-input" value={form.colorPartido}
                      onChange={(e) => setForm({ ...form, colorPartido: e.target.value })}
                      placeholder="#1a56db" style={{ flex: 1 }} />
                  </div>
                </div>
              </div>

              {mensaje && (
                <div className={mensaje.tipo === 'ok' ? 'alerta-exito' : 'alerta-error'}>
                  {mensaje.texto}
                </div>
              )}

              <div className="admin-actions">
                <button className="btn-secundario" onClick={cerrarModal}>Cancelar</button>
                <button className="btn-primario" onClick={handleGuardar} disabled={guardando}>
                  {guardando ? 'Guardando...' : editando ? 'Actualizar' : 'Crear candidato'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};