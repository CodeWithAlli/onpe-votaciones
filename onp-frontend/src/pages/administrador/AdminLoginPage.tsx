import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const AdminLoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) { setError('Complete todos los campos.'); return; }
    setCargando(true);
    setError('');
    try {
      await login(username, password);
      navigate('/admin/dashboard');
    } catch {
      setError('Credenciales incorrectas. Verifique su usuario y contraseña.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="admin-login-layout">
      <div className="admin-login-card">
  
        <button
          type="button"
          className="btn-volver"
          onClick={() => navigate('/votar')}
        >
          ← Volver al sistema de votación
        </button>
  
        <div className="admin-login-header">
          <div
            className="logo-escudo logo-escudo--grande"
            aria-hidden="true"
          >
            🗳
          </div>
  
          <h1>Panel Administrativo</h1>
          <p>ONPE — Sistema de Gestión Electoral</p>
        </div>
  
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grupo">
            <label htmlFor="admin-user">Usuario</label>
            <input
              id="admin-user"
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
            />
          </div>
  
          <div className="form-grupo">
            <label htmlFor="admin-pass">Contraseña</label>
            <input
              id="admin-pass"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
  
          {error && (
            <div className="alerta-error" role="alert">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}
  
          <button
            type="submit"
            className="btn-primario btn-grande"
            disabled={cargando}
            aria-busy={cargando}
          >
            {cargando ? (
              <>
                <span className="spinner" />
                Accediendo...
              </>
            ) : (
              'Ingresar al panel'
            )}
          </button>
        </form>
  
        <div className="admin-login-aviso">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <rect
              x="3"
              y="11"
              width="18"
              height="11"
              rx="2"
              ry="2"
            />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
  
          Acceso restringido a personal autorizado por ONPE
        </div>
  
      </div>
    </div>
  );
};
