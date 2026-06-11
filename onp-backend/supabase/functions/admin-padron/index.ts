import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
        .from('padron')
        .select('*')
        .order('apellido');

      if (error) {
        return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
      }

      // Normalizar campo names al formato camelCase que espera el frontend
      const normalizado = (data || []).map((v) => ({
        id:              v.id,
        dni:             v.dni,
        nombre:          v.nombre,
        apellido:        v.apellido,
        fechaNacimiento: v.fecha_nacimiento,
        ubigeo:          v.ubigeo,
        distrito:        v.distrito,
        createdAt:       v.created_at,
      }));

      return Response.json(normalizado, { headers: corsHeaders });
    }

    if (req.method === 'POST') {
      const body = await req.json();

      const { data, error } = await supabase
        .from('padron')
        .insert({
          dni:              body.dni,
          nombre:           body.nombre,
          apellido:         body.apellido,
          fecha_nacimiento: body.fechaNacimiento,
          ubigeo:           body.ubigeo,
          distrito:         body.distrito,
        })
        .select()
        .single();

      if (error) {
        return Response.json({ error: error.message }, { status: 400, headers: corsHeaders });
      }

      return Response.json({
        id:              data.id,
        dni:             data.dni,
        nombre:          data.nombre,
        apellido:        data.apellido,
        fechaNacimiento: data.fecha_nacimiento,
        ubigeo:          data.ubigeo,
        distrito:        data.distrito,
        createdAt:       data.created_at,
      }, { headers: corsHeaders });
    }

    return Response.json({ error: 'Método no permitido' }, { status: 405, headers: corsHeaders });

  } catch (err) {
    console.error('Error en admin-padron:', err);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500, headers: corsHeaders });
  }
});
