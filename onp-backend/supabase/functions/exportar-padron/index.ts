import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
    if (req.method !== 'GET') {
      return Response.json({ error: 'Método no permitido' }, { status: 405, headers: corsHeaders });
    }

    const { data, error } = await supabase
      .from('padron')
      .select('*');

    if (error) {
      return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }

    const headers = ['dni', 'nombre', 'apellido', 'fecha_nacimiento', 'distrito'];
    const csv = [
      headers.join(','),
      ...(data || []).map((v) =>
        [
          v.dni         ?? '',
          v.nombre      ?? '',
          v.apellido    ?? '',
          v.fecha_nacimiento ?? '',
          v.distrito    ?? '',
        ].join(',')
      ),
    ].join('\n');

    return new Response(csv, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="padron.csv"',
      },
    });

  } catch (err) {
    console.error('Error en exportar-padron:', err);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500, headers: corsHeaders });
  }
});
