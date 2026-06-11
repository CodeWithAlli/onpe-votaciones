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

const FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const api = axios.create({
  baseURL: FUNCTIONS_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  },
});

/* =========================================
   VOTANTE
========================================= */

export const votanteService = {
  verificarDNI: async (
    dni: string
  ): Promise<VotanteVerificado> => {
    const { data } = await api.post('/verificar-votante', {
      dni,
    });

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
      eleccion_id: eleccionId,
    });

    return data;
  },
};

/* =========================================
   ELECCIÓN PÚBLICA
========================================= */

export const eleccionService = {
  getCandidatos: async (
    eleccionId?: string
  ): Promise<Candidato[]> => {
    const params = eleccionId
      ? `?eleccion_id=${eleccionId}`
      : '';

    const { data } = await api.get(
      `/candidatos-publicos${params}`
    );

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
  ): Promise<{
    token: string;
    user: {
      id: string;
      username: string;
      rol: string;
    };
  }> => {
    const { data } = await api.post(
      '/admin-login',
      {
        username,
        password,
      }
    );

    localStorage.setItem(
      'onp_admin_token',
      data.token
    );

    return data;
  },

  logout: () => {
    localStorage.removeItem(
      'onp_admin_token'
    );
  },

  /* ---------- DASHBOARD ---------- */

  getEstadisticas: async (
    eleccionId: string
  ): Promise<EstadisticasAdmin> => {
    const { data } = await api.get(
      `/admin-stats?eleccion_id=${eleccionId}`
    );

    return data;
  },

  /* ---------- ELECCIÓN ---------- */

  getEleccion: async (): Promise<Eleccion> => {
    const { data } = await api.get(
      '/admin-eleccion'
    );

    return data;
  },

  cambiarEstadoEleccion: async (
    eleccionId: string,
    estado: 'activa' | 'pausada' | 'cerrada'
  ) => {
    const { data } = await api.patch(
      '/admin-estado',
      {
        eleccion_id: eleccionId,
        estado,
      }
    );

    return data;
  },

  actualizarEleccion: async (
    eleccion: Partial<Eleccion>
  ) => {
    const { data } = await api.put(
      '/admin-eleccion',
      eleccion
    );

    return data;
  },

  /* ---------- PADRÓN ---------- */

  getPadron: async (): Promise<
    PadronVotante[]
  > => {
    const { data } = await api.get(
      '/admin-padron'
    );

    return data;
  },

  /* ---------- USUARIOS ---------- */

  getUsuarios: async (): Promise<
    UsuarioAdmin[]
  > => {
    const { data } = await api.get(
      '/admin-usuarios'
    );

    return data;
  },

  crearUsuario: async (
    usuario: Partial<UsuarioAdmin>
  ) => {
    const { data } = await api.post(
      '/admin-usuarios',
      usuario
    );

    return data;
  },

  /* ---------- AUDITORÍA ---------- */

  getAuditoria: async (): Promise<
    Auditoria[]
  > => {
    const { data } = await api.get(
      '/admin-auditoria'
    );

    return data;
  },

  /* ---------- EXPORTACIONES ---------- */

  exportarResultados: async (
    eleccionId: string
  ): Promise<Blob> => {
    const { data } = await api.get(
      `/admin-stats?eleccion_id=${eleccionId}&formato=csv`,
      {
        responseType: 'blob',
      }
    );

    return data;
  },

  exportarPadron: async (): Promise<Blob> => {
    const { data } = await api.get(
      '/exportar-padron',
      {
        responseType: 'blob',
      }
    );

    return data;
  },
};

export default api;