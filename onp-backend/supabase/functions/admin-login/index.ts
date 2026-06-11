import { createClient } from 'npm:@supabase/supabase-js@2';
import { create } from 'https://deno.land/x/djwt@v3.0.1/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function verificarPassword(password: string, hash: string): Promise<boolean> {
  // Formato nuevo: SHA-256 (usuarios creados desde el panel admin)
  if (hash.startsWith('sha256:')) {
    const encoded = new TextEncoder().encode(password);
    const buffer  = await crypto.subtle.digest('SHA-256', encoded);
    const hex     = Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return `sha256:${hex}` === hash;
  }

  // Formato antiguo: bcrypt (usuario admin original con onpe2026)
  if (hash.startsWith('$2b$') || hash.startsWith('$2a$')) {
    try {
      const { compare } = await import('https://deno.land/x/bcrypt@v0.4.1/mod.ts');
      return await compare(password, hash);
    } catch {
      // Si bcrypt falla, comparar texto plano como último recurso
      return false;
    }
  }

  // Texto plano (solo entornos de desarrollo, no debería existir en producción)
  return password === hash;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return Response.json({ detail: 'Método no permitido' }, { status: 405, headers: corsHeaders });
  }

  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return Response.json(
        { detail: 'Usuario y contraseña requeridos.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: admin, error } = await supabase
      .from('admin_usuarios')
      .select('id, username, password_hash, rol, activo')
      .eq('username', username)
      .single();

    if (error || !admin || !admin.activo) {
      return Response.json(
        { detail: 'Credenciales incorrectas.' },
        { status: 401, headers: corsHeaders }
      );
    }

    const passwordValida = await verificarPassword(password, admin.password_hash);
    if (!passwordValida) {
      return Response.json(
        { detail: 'Credenciales incorrectas.' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Generar JWT
    const jwtSecret = Deno.env.get('JWT_SECRET') || 'onpe-secret-dev-2026';
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(jwtSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );

    const token = await create(
      { alg: 'HS256', typ: 'JWT' },
      {
        sub:      admin.id,
        username: admin.username,
        rol:      admin.rol,
        exp:      Math.floor(Date.now() / 1000) + 60 * 60 * 8,
      },
      key
    );

    return Response.json(
      { token, user: { id: admin.id, username: admin.username, rol: admin.rol } },
      { status: 200, headers: corsHeaders }
    );

  } catch (err) {
    console.error('Error en admin-login:', err);
    return Response.json(
      { detail: 'Error interno del servidor.' },
      { status: 500, headers: corsHeaders }
    );
  }
});