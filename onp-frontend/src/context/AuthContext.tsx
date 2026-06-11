import { createContext, useContext, useState, type ReactNode } from 'react';
import type { AdminUser } from '../types';
import { adminService } from '../services/api';

interface AuthContextType {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  admin: null,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    const stored = localStorage.getItem('onp_admin_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (username: string, password: string) => {
    const { user, token: _ } = await adminService.login(username, password);
    const adminUser: AdminUser = { id: user.id, username: user.username, rol: user.rol as AdminUser['rol'] };
    setAdmin(adminUser);
    localStorage.setItem('onp_admin_user', JSON.stringify(adminUser));
  };

  const logout = () => {
    adminService.logout();
    setAdmin(null);
    localStorage.removeItem('onp_admin_user');
  };

  return (
    <AuthContext.Provider value={{ admin, isAuthenticated: !!admin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
