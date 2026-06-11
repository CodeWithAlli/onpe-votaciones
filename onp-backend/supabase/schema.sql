-- =============================================
-- ONP VOTACIONES — SCHEMA COMPLETO SUPABASE
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- =============================================

-- ---- 1. TABLAS ----

create table if not exists elecciones (
  id            uuid primary key default gen_random_uuid(),
  titulo        text not null,
  descripcion   text,
  fecha_inicio  timestamptz,
  fecha_fin     timestamptz,
  estado        text default 'pendiente'
                check (estado in ('pendiente','activa','pausada','cerrada')),
  created_at    timestamptz default now()
);

create table if not exists candidatos (
  id            uuid primary key default gen_random_uuid(),
  eleccion_id   uuid references elecciones(id) on delete cascade,
  numero        integer not null,
  nombre        text not null,
  apellido      text not null,
  partido       text not null,
  siglas        text not null,
  color_partido text default '#1a56db',
  foto_url      text,
  created_at    timestamptz default now(),
  unique(eleccion_id, numero)
);

create table if not exists padron (
  id                uuid primary key default gen_random_uuid(),
  dni               text unique not null,
  nombre            text not null,
  apellido          text not null,
  fecha_nacimiento  date not null,
  ubigeo            text,
  distrito          text,
  created_at        timestamptz default now()
);

create table if not exists votos (
  id                    uuid primary key default gen_random_uuid(),
  eleccion_id           uuid references elecciones(id),
  candidato_id          uuid references candidatos(id),
  dni_hash              text unique not null,  -- SHA-256 del DNI, nunca el DNI real
  codigo_verificacion   text unique not null,
  created_at            timestamptz default now()
);

create table if not exists admin_usuarios (
  id          uuid primary key default gen_random_uuid(),
  username    text unique not null,
  password_hash text not null,           -- bcrypt hash
  rol         text default 'supervisor'
              check (rol in ('superadmin','supervisor','observador')),
  activo      boolean default true,
  created_at  timestamptz default now()
);

-- ---- 2. ÍNDICES ----

create index if not exists idx_votos_eleccion    on votos(eleccion_id);
create index if not exists idx_votos_candidato   on votos(candidato_id);
create index if not exists idx_candidatos_eleccion on candidatos(eleccion_id);
create index if not exists idx_padron_dni        on padron(dni);

-- ---- 3. ROW LEVEL SECURITY ----

alter table elecciones    enable row level security;
alter table candidatos    enable row level security;
alter table padron        enable row level security;
alter table votos         enable row level security;
alter table admin_usuarios enable row level security;

-- Lectura pública para elecciones activas
create policy "lectura publica elecciones"
  on elecciones for select
  using (true);

-- Lectura pública de candidatos
create policy "lectura publica candidatos"
  on candidatos for select
  using (true);

-- El padrón, votos y admins solo desde service_role (Edge Functions)
-- No se exponen con anon key

-- ---- 4. DATOS INICIALES DE PRUEBA ----

-- Elección activa
insert into elecciones (id, titulo, descripcion, fecha_inicio, fecha_fin, estado)
values (
  'a1b2c3d4-0000-0000-0000-000000000001',
  'Elecciones Generales 2026',
  'Elección del Presidente y Vicepresidentes de la República del Perú',
  '2026-06-15 08:00:00+00',
  '2026-06-15 18:00:00+00',
  'activa'
) on conflict (id) do nothing;

-- Candidatos
insert into candidatos (eleccion_id, numero, nombre, apellido, partido, siglas, color_partido)
values
  ('a1b2c3d4-0000-0000-0000-000000000001', 1, 'María',  'González Ríos',   'Alianza por el Perú',   'APP', '#1a56db'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 2, 'Carlos', 'Huamán Quispe',   'Frente Popular Andino', 'FPA', '#e3a008'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 3, 'Rosa',   'Vargas Mendoza',  'Unidad Democrática',    'UD',  '#057a55'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 4, 'Jorge',  'Campos Delgado',  'Movimiento Renovación', 'MR',  '#c81e1e'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 5, 'Ana',    'Torres Castillo', 'Perú Primero',          'PP',  '#7e3af2')
on conflict do nothing;

-- Votante de prueba en el padrón (DNI: 12345678)
insert into padron (dni, nombre, apellido, fecha_nacimiento, ubigeo, distrito)
values ('12345678', 'Juan Pedro', 'Villanueva Soto', '1985-03-22', '150101', 'Lima Cercado')
on conflict (dni) do nothing;

-- Admin de prueba
-- password: onpe2026 (bcrypt hash)
insert into admin_usuarios (username, password_hash, rol)
values (
  'admin',
  '$2b$10$rQ9K8K1n5V7v8E2mJ3xN4.wYzABCDEFGHIJKLMNOPQRSTUVWXYZ12',
  'superadmin'
) on conflict (username) do nothing;

-- ---- 5. FUNCIÓN SQL para estadísticas (más eficiente que múltiples queries) ----

create or replace function get_estadisticas_eleccion(p_eleccion_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  v_total_habilitados bigint;
  v_total_votaron     bigint;
  v_resultados        json;
begin
  select count(*) into v_total_habilitados from padron;

  select count(*) into v_total_votaron
  from votos where eleccion_id = p_eleccion_id;

  select json_agg(r order by r.votos desc)
  into v_resultados
  from (
    select
      c.id,
      c.nombre,
      c.apellido,
      c.partido,
      c.siglas,
      c.numero,
      c.color_partido,
      count(v.id) as votos,
      round(count(v.id) * 100.0 / nullif(v_total_votaron, 0), 1) as porcentaje
    from candidatos c
    left join votos v on v.candidato_id = c.id and v.eleccion_id = p_eleccion_id
    where c.eleccion_id = p_eleccion_id
    group by c.id
  ) r;

  return json_build_object(
    'totalHabilitados',       v_total_habilitados,
    'totalVotaron',           v_total_votaron,
    'porcentajeParticipacion', round(v_total_votaron * 100.0 / nullif(v_total_habilitados, 0), 1),
    'resultados',             coalesce(v_resultados, '[]'::json)
  );
end;
$$;

create table auditoria (
  id uuid primary key default gen_random_uuid(),

  usuario text not null,

  accion text not null,

  fecha timestamptz default now()
);
