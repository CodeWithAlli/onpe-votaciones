/*import type { Candidato, Eleccion, VotanteVerificado, EstadisticasAdmin } from '../types';

export const MOCK_ELECCION: Eleccion = {
  id: 'elec-2026',
  titulo: 'Elecciones Generales 2026',
  descripcion: 'Elección del Presidente y Vicepresidentes de la República del Perú',
  fechaInicio: '2026-06-15T08:00:00Z',
  fechaFin: '2026-06-15T18:00:00Z',
  estado: 'activa',
  totalVotantes: 25800000,
  votosEmitidos: 12340000,
};

export const MOCK_CANDIDATOS: Candidato[] = [
  {
    id: 'c1',
    numero: 1,
    nombre: 'María',
    apellido: 'González Ríos',
    partido: 'Alianza por el Perú',
    siglas: 'APP',
    colorPartido: '#1a56db',
    foto: undefined,
  },
  {
    id: 'c2',
    numero: 2,
    nombre: 'Carlos',
    apellido: 'Huamán Quispe',
    partido: 'Frente Popular Andino',
    siglas: 'FPA',
    colorPartido: '#e3a008',
    foto: undefined,
  },
  {
    id: 'c3',
    numero: 3,
    nombre: 'Rosa',
    apellido: 'Vargas Mendoza',
    partido: 'Unidad Democrática',
    siglas: 'UD',
    colorPartido: '#057a55',
    foto: undefined,
  },
  {
    id: 'c4',
    numero: 4,
    nombre: 'Jorge',
    apellido: 'Campos Delgado',
    partido: 'Movimiento Renovación',
    siglas: 'MR',
    colorPartido: '#c81e1e',
    foto: undefined,
  },
  {
    id: 'c5',
    numero: 5,
    nombre: 'Ana',
    apellido: 'Torres Castillo',
    partido: 'Perú Primero',
    siglas: 'PP',
    colorPartido: '#7e3af2',
    foto: undefined,
  },
];

export const MOCK_VOTANTE: VotanteVerificado = {
  dni: '12345678',
  nombre: 'Juan Pedro',
  apellido: 'Villanueva Soto',
  fechaNacimiento: '1985-03-22',
  ubigeo: '150101',
  distrito: 'Lima Cercado',
  yaVoto: false,
};

export const MOCK_ESTADISTICAS: EstadisticasAdmin = {
  totalHabilitados: 25800000,
  totalVotaron: 12340000,
  porcentajeParticipacion: 47.8,
  votosPorHora: [
    { hora: '08:00', votos: 820000 },
    { hora: '09:00', votos: 1450000 },
    { hora: '10:00', votos: 2100000 },
    { hora: '11:00', votos: 2890000 },
    { hora: '12:00', votos: 3200000 },
    { hora: '13:00', votos: 3500000 },
    { hora: '14:00', votos: 3900000 },
  ],
  resultados: [
    { candidato: MOCK_CANDIDATOS[0], votos: 3820000, porcentaje: 30.9 },
    { candidato: MOCK_CANDIDATOS[1], votos: 2950000, porcentaje: 23.9 },
    { candidato: MOCK_CANDIDATOS[2], votos: 2340000, porcentaje: 18.9 },
    { candidato: MOCK_CANDIDATOS[3], votos: 1840000, porcentaje: 14.9 },
    { candidato: MOCK_CANDIDATOS[4], votos: 1390000, porcentaje: 11.3 },
  ],
};
*/