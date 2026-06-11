// =============================================
// EDGE FUNCTION: candidatos-publicos
// GET /functions/v1/candidatos-publicos?eleccion_id=uuid
// Pública — no requiere autenticación
// =============================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const url = new URL(req.url);
    const eleccionId = url.searchParams.get('eleccion_id');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Si no se pasa eleccion_id, buscar la elección activa
    let eleccionFinal = eleccionId;

    if (!eleccionFinal) {
      const { data: eleccionActiva } = await supabase
        .from('elecciones')
        .select('id')
        .eq('estado', 'activa')
        .single();
      eleccionFinal = eleccionActiva?.id;
    }

    if (!eleccionFinal) {
      return new Response(JSON.stringify({ detail: 'No hay elección activa.' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: candidatos, error } = await supabase
      .from('candidatos')
      .select('id, numero, nombre, apellido, partido, siglas, color_partido, foto_url')
      .eq('eleccion_id', eleccionFinal)
      .order('numero', { ascending: true });

    if (error) throw error;

    // Transformar al formato camelCase que espera el frontend
    const candidatosFormateados = (candidatos || []).map(c => ({
      id: c.id,
      numero: c.numero,
      nombre: c.nombre,
      apellido: c.apellido,
      partido: c.partido,
      siglas: c.siglas,
      colorPartido: c.color_partido,
      foto: c.foto_url || undefined,
    }));

    return new Response(JSON.stringify(candidatosFormateados), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Error en candidatos-publicos:', err);
    return new Response(JSON.stringify({ detail: 'Error interno del servidor.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
