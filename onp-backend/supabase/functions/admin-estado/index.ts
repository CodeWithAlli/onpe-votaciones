// =============================================
// EDGE FUNCTION: admin-estado
// PATCH /functions/v1/admin-estado
// Body: { "eleccion_id": "uuid", "estado": "activa|pausada|cerrada" }
// Header: Authorization: Bearer <token>
// =============================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { verify } from 'https://deno.land/x/djwt@v3.0.1/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
};

async function verificarToken(req: Request): Promise<{ valido: boolean; rol?: string }> {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return { valido: false };
    const token = authHeader.slice(7);
    const jwtSecret = Deno.env.get('JWT_SECRET') || 'onpe-secret-dev-2026';
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(jwtSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );
    const payload = await verify(token, key) as { rol: string };
    return { valido: true, rol: payload.rol };
  } catch {
    return { valido: false };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const { valido, rol } = await verificarToken(req);
  if (!valido) {
    return new Response(JSON.stringify({ detail: 'No autorizado.' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Solo superadmin y supervisor pueden cambiar estado
  if (rol === 'observador') {
    return new Response(JSON.stringify({ detail: 'Sin permisos para esta acción.' }), {
      status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { eleccion_id, estado } = await req.json();

    if (!eleccion_id || !['activa', 'pausada', 'cerrada'].includes(estado)) {
      return new Response(JSON.stringify({ detail: 'Datos inválidos.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // No permitir reabrir una elección cerrada
    const { data: actual } = await supabase
      .from('elecciones')
      .select('estado')
      .eq('id', eleccion_id)
      .single();

    if (actual?.estado === 'cerrada') {
      return new Response(JSON.stringify({ detail: 'Una elección cerrada no puede modificarse.' }), {
        status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: eleccion, error } = await supabase
      .from('elecciones')
      .update({ estado })
      .eq('id', eleccion_id)
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({
      id: eleccion.id,
      titulo: eleccion.titulo,
      descripcion: eleccion.descripcion,
      fechaInicio: eleccion.fecha_inicio,
      fechaFin: eleccion.fecha_fin,
      estado: eleccion.estado,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Error en admin-estado:', err);
    return new Response(JSON.stringify({ detail: 'Error interno del servidor.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
