// =============================================
// EDGE FUNCTION: emitir-voto
// POST /functions/v1/emitir-voto
// Body: { "dni": "12345678", "candidato_id": "uuid", "eleccion_id": "uuid" }
// =============================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Genera código de verificación legible (ej: ONP-A3K9-X7M2)
function generarCodigo(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin O,0,I,1 para evitar confusión
  const segmento = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `ONP-${segmento()}-${segmento()}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ detail: 'Método no permitido' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { dni, candidato_id, eleccion_id } = await req.json();

    // Validaciones básicas
    if (!dni || !/^\d{8}$/.test(dni)) {
      return new Response(JSON.stringify({ detail: 'DNI inválido.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!candidato_id || !eleccion_id) {
      return new Response(JSON.stringify({ detail: 'Faltan datos obligatorios.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Verificar que la elección esté activa
    const { data: eleccion } = await supabase
      .from('elecciones')
      .select('id, estado')
      .eq('id', eleccion_id)
      .single();

    if (!eleccion || eleccion.estado !== 'activa') {
      return new Response(JSON.stringify({ detail: 'La elección no está activa en este momento.' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verificar que el candidato pertenece a la elección
    const { data: candidato } = await supabase
      .from('candidatos')
      .select('id')
      .eq('id', candidato_id)
      .eq('eleccion_id', eleccion_id)
      .single();

    if (!candidato) {
      return new Response(JSON.stringify({ detail: 'Candidato no válido para esta elección.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verificar que el DNI está en el padrón
    const { data: votante } = await supabase
      .from('padron')
      .select('dni')
      .eq('dni', dni)
      .single();

    if (!votante) {
      return new Response(JSON.stringify({ detail: 'DNI no registrado en el padrón electoral.' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generar hash del DNI (nunca guardamos el DNI real en votos)
    const encoder = new TextEncoder();
    const dniBytes = encoder.encode(dni);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dniBytes);
    const dniHash = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Verificar doble voto (la constraint UNIQUE en dni_hash también lo previene en BD)
    const { data: votoExistente } = await supabase
      .from('votos')
      .select('id')
      .eq('dni_hash', dniHash)
      .eq('eleccion_id', eleccion_id)
      .maybeSingle();

    if (votoExistente) {
      return new Response(JSON.stringify({ detail: 'Este DNI ya emitió su voto en esta elección.' }), {
        status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Insertar voto
    const codigoVerificacion = generarCodigo();

    const { data: voto, error: errorVoto } = await supabase
      .from('votos')
      .insert({
        eleccion_id,
        candidato_id,
        dni_hash: dniHash,
        codigo_verificacion: codigoVerificacion,
      })
      .select('id, eleccion_id, candidato_id, codigo_verificacion, created_at')
      .single();

    if (errorVoto) {
      // Si es violación de unique (race condition), tratar como doble voto
      if (errorVoto.code === '23505') {
        return new Response(JSON.stringify({ detail: 'Este DNI ya emitió su voto.' }), {
          status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw errorVoto;
    }

    return new Response(JSON.stringify({
      id: voto.id,
      candidatoId: voto.candidato_id,
      eleccionId: voto.eleccion_id,
      timestamp: voto.created_at,
      codigoVerificacion: voto.codigo_verificacion,
    }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Error en emitir-voto:', err);
    return new Response(JSON.stringify({ detail: 'Error interno del servidor.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
