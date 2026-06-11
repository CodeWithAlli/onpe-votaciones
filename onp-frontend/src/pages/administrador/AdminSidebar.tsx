import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

type Rol = 'superadmin' | 'supervisor' | 'observador';

const menuItems = [
  { label: 'Dashboard',       path: '/admin/dashboard',  icon: '📊', roles: ['superadmin', 'supervisor', 'observador'] },
  { label: 'Elección',        path: '/admin/eleccion',   icon: '🗳️', roles: ['superadmin'] },
  { label: 'Candidatos',      path: '/admin/candidatos', icon: '👥', roles: ['superadmin', 'supervisor'] },
  { label: 'Padrón Electoral',path: '/admin/padron',     icon: '📋', roles: ['superadmin', 'supervisor'] },
  { label: 'Usuarios',        path: '/admin/usuarios',   icon: '🔐', roles: ['superadmin'] },
  { label: 'Resultados',      path: '/admin/resultados', icon: '📈', roles: ['superadmin', 'supervisor', 'observador'] },
  { label: 'Auditoría',       path: '/admin/auditoria',  icon: '🕒', roles: ['superadmin', 'supervisor'] },
  { label: 'Reportes',        path: '/admin/reportes',   icon: '📄', roles: ['superadmin', 'supervisor', 'observador'] },
];

export const AdminSidebar = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { logout, admin } = useAuth();

  const rol = (admin?.rol ?? 'observador') as Rol;

  const itemsVisibles = menuItems.filter((item) =>
    item.roles.includes(rol)
  );

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-logo">
        <span aria-hidden="true">🗳</span>
        <span>ONPE Admin</span>
      </div>

      <nav className="admin-nav">
        {itemsVisibles.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`admin-nav-item ${
              location.pathname === item.path ? 'admin-nav-item--active' : ''
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <div className="admin-sidebar-rol">
          <span style={{ opacity: 0.5, fontSize: '0.75rem', textTransform: 'uppercase' }}>
            {rol}
          </span>
        </div>
        <button className="admin-logout-btn" onClick={handleLogout}>
          <span>🚪</span>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
};