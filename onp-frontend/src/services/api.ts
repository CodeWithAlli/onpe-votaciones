import axios from 'axios';

import type {
  Candidato,
  VotanteVerificado,
  Voto,
  EstadisticasAdmin,
  Eleccion,
  PadronVotante,
  UsuarioAdmin,
  Auditoria,
} from '../types';

const FUNCTIONS_URL    = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ---- Instancia pública (anon key) ----
const api = axios.create({
  baseURL: FUNCTIONS_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    apikey:        SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  },
});

// ---- Instancia admin (JWT del login) ----
const adminApi = axios.create({
  baseURL: FUNCTIONS_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    apikey: SUPABASE_ANON_KEY,
  },
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('onp_admin_token');
  config.headers.Authorization = `Bearer ${token ?? SUPABASE_ANON_KEY}`;
  return config;
});

/* =========================================
   VOTANTE
========================================= */

export const votanteService = {
  verificarDNI: async (dni: string): Promise<VotanteVerificado> => {
    const { data } = await api.post('/verificar-votante', { dni });
    return data;
  },

  emitirVoto: async (
    dni: string,
    candidatoId: string,
    eleccionId: string
  ): Promise<Voto> => {
    const { data } = await api.post('/emitir-voto', {
      dni,
      candidato_id: candidatoId,
      eleccion_id:  eleccionId,
    });
    return data;
  },
};

/* =========================================
   ELECCIÓN PÚBLICA
========================================= */

export const eleccionService = {
  getCandidatos: async (eleccionId?: string): Promise<Candidato[]> => {
    const params = eleccionId ? `?eleccion_id=${eleccionId}` : '';
    const { data } = await api.get(`/candidatos-publicos${params}`);
    return data;
  },
};

/* =========================================
   ADMINISTRACIÓN
========================================= */

export const adminService = {

  /* ---------- LOGIN ---------- */

  login: async (
    username: string,
    password: string
  ): Promise<{ token: string; user: { id: string; username: string; rol: string } }> => {
    const { data } = await api.post('/admin-login', { username, password });
    localStorage.setItem('onp_admin_token', data.token);
    return data;
  },

  logout: () => {
    localStorage.removeItem('onp_admin_token');
    localStorage.removeItem('onp_admin_user');
  },

  /* ---------- DASHBOARD / STATS ---------- */

  getEstadisticas: async (eleccionId: string): Promise<EstadisticasAdmin> => {
    const { data } = await adminApi.get(`/admin-stats?eleccion_id=${eleccionId}`);
    return data;
  },

  /* ---------- ELECCIÓN ---------- */

  getEleccion: async (): Promise<Eleccion> => {
    const { data } = await adminApi.get('/admin-eleccion');
    return data;
  },

  actualizarEleccion: async (eleccion: Partial<Eleccion>): Promise<Eleccion> => {
    const { data } = await adminApi.put('/admin-eleccion', eleccion);
    return data;
  },

  cambiarEstadoEleccion: async (
    eleccionId: string,
    estado: 'activa' | 'pausada' | 'cerrada'
  ) => {
    const { data } = await adminApi.patch('/admin-estado', {
      eleccion_id: eleccionId,
      estado,
    });
    return data;
  },

  /* ---------- CANDIDATOS ---------- */

  guardarCandidato: async (candidato: Record<string, unknown>) => {
    const { data } = await adminApi.post('/admin-candidatos', candidato);
    return data;
  },

  eliminarCandidato: async (id: string) => {
    const { data } = await adminApi.delete(`/admin-candidatos?id=${id}`);
    return data;
  },

  /* ---------- PADRÓN ---------- */

  getPadron: async (): Promise<PadronVotante[]> => {
    const { data } = await adminApi.get('/admin-padron');
    return data;
  },

  crearVotante: async (votante: Partial<PadronVotante>): Promise<PadronVotante> => {
    const { data } = await adminApi.post('/admin-padron', votante);
    return data;
  },

  eliminarVotante: async (id: string) => {
    const { data } = await adminApi.delete(`/admin-padron?id=${id}`);
    return data;
  },

  /* ---------- USUARIOS ---------- */

  getUsuarios: async (): Promise<UsuarioAdmin[]> => {
    const { data } = await adminApi.get('/admin-usuarios');
    return data;
  },

  crearUsuario: async (usuario: { username: string; rol: string; activo?: boolean; password_hash?: string }) => {
    const { data } = await adminApi.post('/admin-usuarios', usuario);
    return data;
  },
  
  actualizarUsuario: async (usuario: { id: string; username?: string; rol: string; activo: boolean; password_hash?: string }) => {
    const { data } = await adminApi.put('/admin-usuarios', usuario);
    return data;
  },

  /* ---------- AUDITORÍA ---------- */

  getAuditoria: async (): Promise<Auditoria[]> => {
    const { data } = await adminApi.get('/admin-auditoria');
    return data;
  },

  /* ---------- EXPORTACIONES ---------- */

  exportarResultados: async (eleccionId: string): Promise<Blob> => {
    const { data } = await adminApi.get(
      `/admin-stats?eleccion_id=${eleccionId}&formato=csv`,
      { responseType: 'blob' }
    );
    return data;
  },

  exportarPadron: async (): Promise<Blob> => {
    const { data } = await adminApi.get('/exportar-padron', {
      responseType: 'blob',
    });
    return data;
  },
};

export default api;