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
        .from('admin_usuarios')
        .select('id, username, rol, activo, created_at');

      if (error) {
        return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
      }

      return Response.json(data || [], { headers: corsHeaders });
    }

    if (req.method === 'POST') {
      const body = await req.json();

      if (!body.username || !body.rol) {
        return Response.json({ error: 'username y rol son requeridos' }, { status: 400, headers: corsHeaders });
      }

      const { data, error } = await supabase
        .from('admin_usuarios')
        .insert({
          username:      body.username,
          password_hash: body.password_hash || '$2b$10$placeholder',
          rol:           body.rol,
          activo:        body.activo ?? true,
        })
        .select('id, username, rol, activo, created_at')
        .single();

      if (error) {
        return Response.json({ error: error.message }, { status: 400, headers: corsHeaders });
      }

      return Response.json(data, { status: 201, headers: corsHeaders });
    }

    return Response.json({ error: 'Método no permitido' }, { status: 405, headers: corsHeaders });

  } catch (err) {
    console.error('Error en admin-usuarios:', err);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500, headers: corsHeaders });
  }
});
