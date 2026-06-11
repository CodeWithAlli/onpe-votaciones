import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AccesibilidadProvider } from './context/AccesibilidadContext';
import { AuthProvider } from './context/AuthContext';
import { RutaProtegida } from './components/shared/RutaProtegida';

// Páginas de votante
import { VerificacionPage } from './pages/usuario/VerificacionPage';
import { CandidatosPage } from './pages/usuario/CandidatosPage';
import { ConfirmacionPage } from './pages/usuario/ConfirmacionPage';
import { ComprobantePage } from './pages/usuario/ComprobantePage';

// Páginas de admin
import { AdminLoginPage } from './pages/administrador/AdminLoginPage';
import { AdminDashboardPage } from './pages/administrador/AdminDashboardPage';
import { AdminResultadosPage } from './pages/administrador/AdminResultadosPage';
import { AdminCandidatosPage } from './pages/administrador/AdminCandidatosPage';
import { AdminEleccionPage } from './pages/administrador/AdminEleccionPage';
import { AdminPadronPage } from './pages/administrador/AdminPadronPage';
import { AdminUsuariosPage } from './pages/administrador/AdminUsuariosPage';
import { AdminAuditoriaPage } from './pages/administrador/AdminAuditoriaPage';
import { AdminReportesPage } from './pages/administrador/AdminReportesPage';

function App() {
  return (
    <BrowserRouter>
      <AccesibilidadProvider>
        <AuthProvider>
          <Routes>
            {/* Flujo del votante */}
            <Route path="/" element={<Navigate to="/votar" replace />} />
            <Route path="/votar" element={<VerificacionPage />} />
            <Route path="/votar/candidatos" element={<CandidatosPage />} />
            <Route path="/votar/confirmar" element={<ConfirmacionPage />} />
            <Route path="/votar/gracias" element={<ComprobantePage />} />

            {/* Admin — login sin protección */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Todos los roles autenticados */}
            <Route path="/admin/dashboard" element={
              <RutaProtegida>
                <AdminDashboardPage />
              </RutaProtegida>
            } />
            <Route path="/admin/resultados" element={
              <RutaProtegida>
                <AdminResultadosPage />
              </RutaProtegida>
            } />
            <Route path="/admin/reportes" element={
              <RutaProtegida>
                <AdminReportesPage />
              </RutaProtegida>
            } />

            {/* Superadmin y Supervisor */}
            <Route path="/admin/candidatos" element={
              <RutaProtegida roles={['superadmin', 'supervisor']}>
                <AdminCandidatosPage />
              </RutaProtegida>
            } />
            <Route path="/admin/padron" element={
              <RutaProtegida roles={['superadmin', 'supervisor']}>
                <AdminPadronPage />
              </RutaProtegida>
            } />
            <Route path="/admin/auditoria" element={
              <RutaProtegida roles={['superadmin', 'supervisor']}>
                <AdminAuditoriaPage />
              </RutaProtegida>
            } />

            {/* Solo Superadmin */}
            <Route path="/admin/eleccion" element={
              <RutaProtegida roles={['superadmin']}>
                <AdminEleccionPage />
              </RutaProtegida>
            } />
            <Route path="/admin/usuarios" element={
              <RutaProtegida roles={['superadmin']}>
                <AdminUsuariosPage />
              </RutaProtegida>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/votar" replace />} />
          </Routes>
        </AuthProvider>
      </AccesibilidadProvider>
    </BrowserRouter>
  );
}

export default App;
