// =============================================
// TIPOS CENTRALES - Sistema de Votaciones ONP
// =============================================

export interface Candidato {
  id: string;
  nombre: string;
  apellido: string;
  partido: string;
  siglas: string;
  numero: number;
  foto?: string;
  colorPartido: string;
}

export interface Eleccion {
  id: string;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  estado: 'pendiente' | 'activa' | 'pausada' | 'cerrada';
  totalVotantes: number;
  votosEmitidos: number;
}

export interface VotanteVerificado {
  dni: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  ubigeo: string;
  distrito: string;
  yaVoto: boolean;
}

export interface Voto {
  id: string;
  candidatoId: string;
  eleccionId: string;
  timestamp: string;
  codigoVerificacion: string;
}

export interface ResultadosCandidato {
  candidato: Candidato;
  votos: number;
  porcentaje: number;
}

export interface EstadisticasAdmin {
  totalHabilitados: number;
  totalVotaron: number;
  porcentajeParticipacion: number;
  votosPorHora: { hora: string; votos: number }[];
  resultados: ResultadosCandidato[];
}

export interface UsuarioAdmin {
  id: string;
  username: string;
  rol: 'superadmin' | 'supervisor' | 'observador';
  activo?: boolean;
}


export interface PadronVotante {
  id: string;
  dni: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  ubigeo?: string;
  distrito?: string;
  createdAt?: string;
}

export interface Auditoria {
  id: string;
  usuario: string;
  accion: string;
  fecha: string;
}

export interface ReporteParticipacion {
  totalHabilitados: number;
  totalVotaron: number;
  porcentajeParticipacion: number;
}


export interface SesionVotante {
  dni: string;
  votante: VotanteVerificado | null;
  paso: 'verificacion' | 'candidatos' | 'confirmacion' | 'completado';
  candidatoSeleccionado: Candidato | null;
  codigoConfirmacion: string | null;
}

export type AccesibilidadModo = 'estandar' | 'altoContraste' | 'textoGrande' | 'daltonismo';

// Alias para AuthContext (compatible con UsuarioAdmin)
export interface AdminUser {
  id: string;
  username: string;
  rol: 'superadmin' | 'supervisor' | 'observador';
}
