import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    if (req.method === 'POST') {
      const body = await req.json();

      if (body.id) {
        const { data, error } = await supabase
          .from('candidatos')
          .update({
            nombre:        body.nombre,
            apellido:      body.apellido,
            partido:       body.partido,
            siglas:        body.siglas,
            numero:        body.numero,
            color_partido: body.colorPartido,
          })
          .eq('id', body.id)
          .select()
          .single();
        if (error) return Response.json({ error: error.message }, { status: 400, headers: corsHeaders });
        return Response.json(data, { headers: corsHeaders });
      } else {
        const { data, error } = await supabase
          .from('candidatos')
          .insert({
            nombre:        body.nombre,
            apellido:      body.apellido,
            partido:       body.partido,
            siglas:        body.siglas,
            numero:        body.numero,
            color_partido: body.colorPartido,
            eleccion_id:   body.eleccion_id,
          })
          .select()
          .single();
        if (error) return Response.json({ error: error.message }, { status: 400, headers: corsHeaders });
        return Response.json(data, { status: 201, headers: corsHeaders });
      }
    }

    if (req.method === 'DELETE') {
      const url = new URL(req.url);
      const id  = url.searchParams.get('id');
      if (!id) return Response.json({ error: 'Se requiere id' }, { status: 400, headers: corsHeaders });
      const { error } = await supabase.from('candidatos').delete().eq('id', id);
      if (error) return Response.json({ error: error.message }, { status: 400, headers: corsHeaders });
      return Response.json({ ok: true }, { headers: corsHeaders });
    }

    return Response.json({ error: 'Método no permitido' }, { status: 405, headers: corsHeaders });

  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Error interno' }, { status: 500, headers: corsHeaders });
  }
});