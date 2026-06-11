import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  roles?: string[]; // si no se pasa, cualquier admin autenticado puede acceder
}

export const RutaProtegida = ({ children, roles }: Props) => {
  const { isAuthenticated, admin } = useAuth();

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  if (roles && admin && !roles.includes(admin.rol)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};
