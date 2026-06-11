import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'GET') {
      return Response.json({ error: 'Método no permitido' }, { status: 405, headers: corsHeaders });
    }

    const url = new URL(req.url);
    const eleccionId = url.searchParams.get('eleccion_id');

    if (!eleccionId) {
      return Response.json({ error: 'Se requiere eleccion_id' }, { status: 400, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Total habilitados en padrón
    const { count: totalHabilitados } = await supabase
      .from('padron')
      .select('*', { count: 'exact', head: true });

    // Total votos emitidos para esta elección
    const { count: totalVotaron } = await supabase
      .from('votos')
      .select('*', { count: 'exact', head: true })
      .eq('eleccion_id', eleccionId);

    // Votos por candidato
    const { data: votosPorCandidato } = await supabase
      .from('votos')
      .select('candidato_id')
      .eq('eleccion_id', eleccionId);

    const { data: candidatos } = await supabase
      .from('candidatos')
      .select('*')
      .eq('eleccion_id', eleccionId);

    // Contar votos por candidato
    const conteo: Record<string, number> = {};
    (votosPorCandidato || []).forEach((v: { candidato_id: string }) => {
      conteo[v.candidato_id] = (conteo[v.candidato_id] || 0) + 1;
    });

    const total = totalVotaron ?? 0;
    const resultados = (candidatos || []).map((c) => ({
      candidato: {
        id:           c.id,
        nombre:       c.nombre,
        apellido:     c.apellido,
        partido:      c.partido,
        siglas:       c.siglas,
        numero:       c.numero,
        colorPartido: c.color_partido,
      },
      votos:      conteo[c.id] ?? 0,
      porcentaje: total > 0 ? Number(((conteo[c.id] ?? 0) / total * 100).toFixed(1)) : 0,
    }));

    // Votos por hora (últimas 12 horas)
    const { data: recientes } = await supabase
      .from('votos')
      .select('created_at')
      .eq('eleccion_id', eleccionId)
      .gte('created_at', new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString());

    const porHoraMap: Record<string, number> = {};
    (recientes || []).forEach((v: { created_at: string }) => {
      const hora = new Date(v.created_at).toLocaleTimeString('es-PE', {
        hour: '2-digit', minute: '2-digit', hour12: false,
      });
      porHoraMap[hora] = (porHoraMap[hora] || 0) + 1;
    });

    const votosPorHora = Object.entries(porHoraMap)
      .map(([hora, votos]) => ({ hora, votos }))
      .sort((a, b) => a.hora.localeCompare(b.hora));

    const hab = totalHabilitados ?? 0;
    return Response.json({
      totalHabilitados: hab,
      totalVotaron:     total,
      porcentajeParticipacion: hab > 0 ? Number((total / hab * 100).toFixed(1)) : 0,
      votosPorHora,
      resultados,
    }, { headers: corsHeaders });

  } catch (err) {
    console.error('Error en admin-stats:', err);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500, headers: corsHeaders });
  }
});
