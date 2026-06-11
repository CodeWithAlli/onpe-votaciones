import { useState, useEffect } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { adminService } from '../../services/api';
import type { UsuarioAdmin } from '../../types';

export const AdminUsuariosPage = () => {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  // Modal crear/editar
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<UsuarioAdmin | null>(null);
  const [form, setForm] = useState({ username: '', rol: 'observador', activo: true, password_hash: '' });
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    setCargando(true);
    try {
      const data = await adminService.getUsuarios();
      setUsuarios(data);
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error al cargar usuarios.' });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const abrirCrear = () => {
    setEditando(null);
    setForm({ username: '', rol: 'observador', activo: true, password_hash: '' });
    setModalAbierto(true);
    setMensaje(null);
  };

  const abrirEditar = (u: UsuarioAdmin) => {
    setEditando(u);
    setForm({
      username: u.username,
      rol: u.rol,
      activo: u.activo ?? false,
      password_hash: ''
    });
    setModalAbierto(true);
    setMensaje(null);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEditando(null);
  };

  const handleGuardar = async () => {
    if (!form.username.trim()) {
      setMensaje({ tipo: 'error', texto: 'El nombre de usuario es requerido.' });
      return;
    }
    setGuardando(true);
    setMensaje(null);
    try {
      if (editando) {
        await adminService.actualizarUsuario({ ...form, id: editando.id });
      } else {
        await adminService.crearUsuario(form);
      }
      setMensaje({ tipo: 'ok', texto: editando ? '✓ Usuario actualizado.' : '✓ Usuario creado.' });
      cerrarModal();
      cargar();
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error al guardar el usuario.' });
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (u: UsuarioAdmin) => {
    const ok = window.confirm(`¿Eliminar al usuario "${u.username}"? Esta acción no se puede deshacer.`);
    if (!ok) return;
    try {
      // Desactivar en lugar de borrar (más seguro para auditoría)
      await adminService.crearUsuario({ ...u, activo: false });
      setMensaje({ tipo: 'ok', texto: `✓ Usuario "${u.username}" desactivado.` });
      cargar();
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error al eliminar el usuario.' });
    }
  };

  const filtrados = usuarios.filter((u) =>
    u.username.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.rol.toLowerCase().includes(busqueda.toLowerCase())
  );

  const rolBadge = (rol: string) => {
    if (rol === 'superadmin') return 'badge-azul';
    if (rol === 'supervisor') return 'badge-amarillo';
    return 'badge-gris';
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <div className="admin-topbar">
          <div>
            <h1 className="admin-titulo">Usuarios Administradores</h1>
            <p className="admin-subtitulo">Gestión de cuentas y permisos administrativos.</p>
          </div>
          <button className="btn-primario" onClick={abrirCrear}>
            + Nuevo Usuario
          </button>
        </div>

        {mensaje && (
          <div className={mensaje.tipo === 'ok' ? 'alerta-exito' : 'alerta-error'} role="alert">
            {mensaje.texto}
          </div>
        )}

        <div className="admin-card">
          <input
            type="text"
            className="admin-input"
            placeholder="Buscar por usuario o rol..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="admin-card">
          {cargando ? (
            <p style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>Cargando usuarios...</p>
          ) : (
            <div className="tabla-scroll">
              <table className="tabla-resultados">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Creado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="tabla-vacia">
                        {busqueda ? 'No se encontraron resultados.' : 'No hay usuarios registrados.'}
                      </td>
                    </tr>
                  ) : (
                    filtrados.map((u) => (
                      <tr key={u.id}>
                        <td><strong>{u.username}</strong></td>
                        <td>
                          <span className={rolBadge(u.rol)}>
                            {u.rol.charAt(0).toUpperCase() + u.rol.slice(1)}
                          </span>
                        </td>
                        <td>
                          <span className={u.activo ? 'badge-verde' : 'badge-gris'}>
                            {u.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-PE') : '—'}</td>
                        <td>
                          <div className="tabla-acciones">
                            <button className="btn-icono" onClick={() => abrirEditar(u)} title="Editar">
                              ✏️
                            </button>
                            <button
                              className="btn-icono btn-icono--danger"
                              onClick={() => handleEliminar(u)}
                              title="Desactivar"
                            >
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

        {!cargando && (
          <div className="estadisticas-grid">
            <div className="stat-card">
              <span className="stat-label">Total usuarios</span>
              <strong>{usuarios.length}</strong>
            </div>
            <div className="stat-card">
              <span className="stat-label">Superadministradores</span>
              <strong>{usuarios.filter((u) => u.rol === 'superadmin').length}</strong>
            </div>
            <div className="stat-card">
              <span className="stat-label">Usuarios activos</span>
              <strong>{usuarios.filter((u) => u.activo).length}</strong>
            </div>
          </div>
        )}

        <div className="admin-card">
          <h2 className="admin-seccion-titulo">Roles del sistema</h2>
          <div className="roles-grid">
            <div className="role-card">
              <h3>Superadmin</h3>
              <p>Acceso total al sistema, elecciones, candidatos, padrón, usuarios y reportes.</p>
            </div>
            <div className="role-card">
              <h3>Supervisor</h3>
              <p>Supervisa el proceso electoral y consulta estadísticas.</p>
            </div>
            <div className="role-card">
              <h3>Observador</h3>
              <p>Solo puede visualizar resultados y reportes.</p>
            </div>
          </div>
        </div>

        {/* Modal crear / editar */}
        {modalAbierto && (
          <div className="modal-overlay" onClick={cerrarModal}>
            <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editando ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
                <button className="modal-cerrar" onClick={cerrarModal}>✕</button>
              </div>

              <div className="admin-form-grid">
                <div className="form-group form-group-full">
                  <label>Nombre de usuario</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="Ej: supervisor01"
                  />
                </div>

                <div className="form-group form-group-full">
                  <label>Contraseña {editando && '(dejar vacío para no cambiar)'}</label>
                  <input
                    type="password"
                    className="admin-input"
                    value={form.password_hash}
                    onChange={(e) => setForm({ ...form, password_hash: e.target.value })}
                    placeholder={editando ? 'Nueva contraseña (opcional)' : 'Contraseña'}
                  />
                </div>

                <div className="form-group">
                  <label>Rol</label>
                  <select
                    className="admin-input"
                    value={form.rol}
                    onChange={(e) => setForm({ ...form, rol: e.target.value })}
                  >
                    <option value="superadmin">Superadmin</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="observador">Observador</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Estado</label>
                  <select
                    className="admin-input"
                    value={form.activo ? 'activo' : 'inactivo'}
                    onChange={(e) => setForm({ ...form, activo: e.target.value === 'activo' })}
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="admin-actions">
                <button className="btn-secundario" onClick={cerrarModal}>Cancelar</button>
                <button className="btn-primario" onClick={handleGuardar} disabled={guardando}>
                  {guardando ? 'Guardando...' : editando ? 'Actualizar' : 'Crear usuario'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};