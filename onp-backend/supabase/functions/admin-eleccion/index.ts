import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('elecciones')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
      }

      return Response.json({
        id: data.id,
        titulo: data.titulo,
        descripcion: data.descripcion,
        fechaInicio: data.fecha_inicio,
        fechaFin: data.fecha_fin,
        estado: data.estado,
        totalVotantes: data.total_votantes ?? 0,
        votosEmitidos: data.votos_emitidos ?? 0,
      }, { headers: corsHeaders });
    }

    if (req.method === 'PUT') {
      const body = await req.json();

      const updatePayload: Record<string, unknown> = {};
      if (body.titulo)       updatePayload.titulo       = body.titulo;
      if (body.descripcion)  updatePayload.descripcion  = body.descripcion;
      if (body.fechaInicio)  updatePayload.fecha_inicio = body.fechaInicio;
      if (body.fechaFin)     updatePayload.fecha_fin    = body.fechaFin;
      if (body.estado)       updatePayload.estado       = body.estado;

      const { data, error } = await supabase
        .from('elecciones')
        .update(updatePayload)
        .eq('id', body.id)
        .select()
        .single();

      if (error) {
        return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
      }

      return Response.json({
        id: data.id,
        titulo: data.titulo,
        descripcion: data.descripcion,
        fechaInicio: data.fecha_inicio,
        fechaFin: data.fecha_fin,
        estado: data.estado,
        totalVotantes: data.total_votantes ?? 0,
        votosEmitidos: data.votos_emitidos ?? 0,
      }, { headers: corsHeaders });
    }

    return Response.json({ error: 'Método no permitido' }, { status: 405, headers: corsHeaders });

  } catch (err) {
    console.error('Error en admin-eleccion:', err);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500, headers: corsHeaders });
  }
});
