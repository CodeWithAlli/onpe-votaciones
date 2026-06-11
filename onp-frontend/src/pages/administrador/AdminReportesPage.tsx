import { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { adminService, eleccionService } from '../../services/api';

const ELECCION_ID = import.meta.env.VITE_ELECCION_ID;

type ReporteKey = 'resultados' | 'padron' | 'candidatos' | 'auditoria';

const descargarBlob = (blob: Blob, nombre: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
};

const arrayToCSV = (filas: Record<string, unknown>[]): Blob => {
  if (filas.length === 0) return new Blob(['Sin datos'], { type: 'text/csv' });
  const headers = Object.keys(filas[0]);
  const csv = [
    headers.join(','),
    ...filas.map((f) =>
      headers.map((h) => `"${String(f[h] ?? '').replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
};

export const AdminReportesPage = () => {
  const [descargando, setDescargando] = useState<ReporteKey | null>(null);
  const [mensajes, setMensajes] = useState<Record<ReporteKey, string>>({
    resultados: '', padron: '', candidatos: '', auditoria: '',
  });

  const setMsg = (key: ReporteKey, texto: string) =>
    setMensajes((prev) => ({ ...prev, [key]: texto }));

  const handleResultados = async () => {
    setDescargando('resultados');
    setMsg('resultados', '');
    try {
      const blob = await adminService.exportarResultados(ELECCION_ID);
      descargarBlob(blob, 'resultados-eleccion.csv');
      setMsg('resultados', '✓ Descarga iniciada.');
    } catch {
      setMsg('resultados', '✗ Error al exportar.');
    } finally {
      setDescargando(null);
    }
  };

  const handlePadron = async () => {
    setDescargando('padron');
    setMsg('padron', '');
    try {
      const blob = await adminService.exportarPadron();
      descargarBlob(blob, 'padron-electoral.csv');
      setMsg('padron', '✓ Descarga iniciada.');
    } catch {
      setMsg('padron', '✗ Error al exportar.');
    } finally {
      setDescargando(null);
    }
  };

  const handleCandidatos = async () => {
    setDescargando('candidatos');
    setMsg('candidatos', '');
    try {
      const lista = await eleccionService.getCandidatos(ELECCION_ID);
      const filas = lista.map((c) => ({
        numero:   c.numero,
        nombre:   c.nombre,
        apellido: c.apellido,
        partido:  c.partido,
        siglas:   c.siglas,
      }));
      descargarBlob(arrayToCSV(filas), 'candidatos.csv');
      setMsg('candidatos', '✓ Descarga iniciada.');
    } catch {
      setMsg('candidatos', '✗ Error al exportar.');
    } finally {
      setDescargando(null);
    }
  };

  const handleAuditoria = async () => {
    setDescargando('auditoria');
    setMsg('auditoria', '');
    try {
      const lista = await adminService.getAuditoria();
      const filas = lista.map((a) => ({
        usuario: a.usuario ?? '',
        accion:  a.accion  ?? '',
        detalle: a.detalle ?? '',
        fecha:   a.fecha   ?? '',
      }));
      descargarBlob(arrayToCSV(filas), 'auditoria.csv');
      setMsg('auditoria', '✓ Descarga iniciada.');
    } catch {
      setMsg('auditoria', '✗ Error al exportar.');
    } finally {
      setDescargando(null);
    }
  };

  const reportes: {
    key:       ReporteKey;
    icono:     string;
    titulo:    string;
    desc:      string;
    onClick:   () => void;
  }[] = [
    {
      key:     'resultados',
      icono:   '📊',
      titulo:  'Resultados Electorales',
      desc:    'Exportar resultados completos con votos y porcentajes por candidato.',
      onClick: handleResultados,
    },
    {
      key:     'padron',
      icono:   '📋',
      titulo:  'Padrón Electoral',
      desc:    'Exportar listado completo de ciudadanos habilitados para votar.',
      onClick: handlePadron,
    },
    {
      key:     'candidatos',
      icono:   '👥',
      titulo:  'Candidatos',
      desc:    'Exportar lista completa de candidatos registrados en la elección.',
      onClick: handleCandidatos,
    },
    {
      key:     'auditoria',
      icono:   '🕒',
      titulo:  'Auditoría',
      desc:    'Exportar historial completo de actividades administrativas.',
      onClick: handleAuditoria,
    },
  ];

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <div className="admin-topbar">
          <div>
            <h1 className="admin-titulo">Reportes</h1>
            <p className="admin-subtitulo">
              Exportación de información y estadísticas del proceso electoral.
            </p>
          </div>
        </div>

        <div className="estadisticas-grid">
          {reportes.map((r) => (
            <div key={r.key} className="admin-card">
              <h2>{r.icono} {r.titulo}</h2>
              <p style={{ marginBottom: '1rem', opacity: 0.8 }}>{r.desc}</p>
              <button
                className="btn-primario"
                onClick={r.onClick}
                disabled={descargando !== null}
              >
                {descargando === r.key ? 'Generando...' : 'Exportar CSV'}
              </button>
              {mensajes[r.key] && (
                <p style={{
                  marginTop: '0.5rem',
                  fontSize: '0.85em',
                  color: mensajes[r.key].startsWith('✓') ? 'var(--verde)' : 'var(--rojo)',
                }}>
                  {mensajes[r.key]}
                </p>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};