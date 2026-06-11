// =============================================
// EDGE FUNCTION: verificar-votante
// POST /functions/v1/verificar-votante
// Body: { "dni": "12345678" }
// =============================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ detail: 'Método no permitido' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { dni } = await req.json();

    // Validar formato DNI
    if (!dni || !/^\d{8}$/.test(dni)) {
      return new Response(JSON.stringify({ detail: 'DNI inválido. Debe tener 8 dígitos.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Cliente con service_role para acceder al padrón (tabla protegida)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Buscar en el padrón electoral
    const { data: votante, error } = await supabase
      .from('padron')
      .select('dni, nombre, apellido, fecha_nacimiento, ubigeo, distrito')
      .eq('dni', dni)
      .single();

    if (error || !votante) {
      return new Response(JSON.stringify({
        detail: 'DNI no encontrado en el padrón electoral. Verifique el número ingresado.',
      }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verificar edad mínima (18 años)
    const hoy = new Date();
    const nacimiento = new Date(votante.fecha_nacimiento);
    const edad = hoy.getFullYear() - nacimiento.getFullYear();
    const cumplioEsteAnio =
      hoy.getMonth() > nacimiento.getMonth() ||
      (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() >= nacimiento.getDate());
    const edadReal = cumplioEsteAnio ? edad : edad - 1;

    if (edadReal < 18) {
      return new Response(JSON.stringify({
        detail: 'No habilitado para votar. Debe ser mayor de 18 años.',
      }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verificar si ya votó: comparar hash del DNI en tabla votos
    const encoder = new TextEncoder();
    const dniBytes = encoder.encode(dni);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dniBytes);
    const dniHash = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Obtener elección activa
    const { data: eleccion } = await supabase
      .from('elecciones')
      .select('id')
      .eq('estado', 'activa')
      .single();

    let yaVoto = false;
    if (eleccion) {
      const { data: votoExistente } = await supabase
        .from('votos')
        .select('id')
        .eq('dni_hash', dniHash)
        .eq('eleccion_id', eleccion.id)
        .maybeSingle();

      yaVoto = !!votoExistente;
    }

    return new Response(JSON.stringify({
      dni: votante.dni,
      nombre: votante.nombre,
      apellido: votante.apellido,
      fechaNacimiento: votante.fecha_nacimiento,
      ubigeo: votante.ubigeo,
      distrito: votante.distrito,
      yaVoto,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Error en verificar-votante:', err);
    return new Response(JSON.stringify({ detail: 'Error interno del servidor.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
