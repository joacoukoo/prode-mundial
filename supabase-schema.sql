-- ============================================================
-- PRODE MUNDIAL 2026 — Schema Supabase (completo e idempotente)
-- Pegar todo esto en el SQL Editor de tu proyecto Supabase
-- Es seguro correrlo aunque ya tengas tablas creadas
-- ============================================================

-- 1. PERFILES (extiende auth.users de Supabase)
create table if not exists public.profiles (
  id              uuid references auth.users(id) on delete cascade primary key,
  username        text unique not null,
  display_name    text not null,
  avatar_color    text not null default '#f0b429',
  avatar_url      text,
  country         text,
  is_admin        boolean not null default false,
  total_points    integer not null default 0,
  correct_results integer not null default 0,
  correct_winners integer not null default 0,
  matches_played  integer not null default 0,
  created_at      timestamptz not null default now()
);

-- Agregar columnas que pueden faltar si ya existía la tabla
alter table public.profiles add column if not exists country text;
alter table public.profiles add column if not exists is_admin boolean not null default false;
alter table public.profiles add column if not exists paid boolean not null default false;

-- 2. PRONÓSTICOS
create table if not exists public.predictions (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  match_id    text not null,
  home_score  integer not null,
  away_score  integer not null,
  points      integer,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique(user_id, match_id)
);

-- 3. RESULTADOS DE PARTIDOS (se actualiza desde API o admin)
create table if not exists public.match_results (
  match_id    text primary key,
  home_score  integer,
  away_score  integer,
  status      text not null default 'upcoming', -- upcoming | live | finished
  minute      integer,
  updated_at  timestamptz not null default now()
);

-- 4. PRONÓSTICOS ESPECIALES (campeón, goleador, etc.)
create table if not exists public.special_predictions (
  id               uuid default gen_random_uuid() primary key,
  user_id          uuid references public.profiles(id) on delete cascade not null unique,
  champion         text not null default '',
  top_scorer       text not null default '',
  best_player      text not null default '',
  best_goalkeeper  text not null default '',
  created_at       timestamptz not null default now()
);

-- 5. CHAT DE GRUPO
create table if not exists public.messages (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references public.profiles(id) on delete cascade not null,
  content    text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles          enable row level security;
alter table public.predictions       enable row level security;
alter table public.match_results     enable row level security;
alter table public.special_predictions enable row level security;
alter table public.messages          enable row level security;

-- Perfiles: todos pueden leer, solo el dueño puede editar
drop policy if exists "Perfiles visibles para todos"   on public.profiles;
drop policy if exists "Usuario edita su propio perfil" on public.profiles;
create policy "Perfiles visibles para todos"
  on public.profiles for select using (true);
create policy "Usuario edita su propio perfil"
  on public.profiles for update using (auth.uid() = id);

-- Pronósticos: cada usuario maneja los suyos
-- Solo se ven los de otros cuando el partido terminó
drop policy if exists "Usuario gestiona sus pronósticos"          on public.predictions;
drop policy if exists "Pronósticos públicos al terminar el partido" on public.predictions;
create policy "Usuario gestiona sus pronósticos"
  on public.predictions for all using (auth.uid() = user_id);
create policy "Pronósticos públicos al terminar el partido"
  on public.predictions for select using (true);

-- Resultados: solo lectura pública; escritura solo desde service role (API)
drop policy if exists "Resultados visibles para todos" on public.match_results;
create policy "Resultados visibles para todos"
  on public.match_results for select using (true);

-- Pronósticos especiales
drop policy if exists "Usuario gestiona sus pronósticos especiales" on public.special_predictions;
drop policy if exists "Pronósticos especiales públicos"             on public.special_predictions;
create policy "Usuario gestiona sus pronósticos especiales"
  on public.special_predictions for all using (auth.uid() = user_id);
create policy "Pronósticos especiales públicos"
  on public.special_predictions for select using (true);

-- Chat
drop policy if exists "Mensajes visibles para todos"       on public.messages;
drop policy if exists "Usuario envía sus propios mensajes" on public.messages;
create policy "Mensajes visibles para todos"
  on public.messages for select using (true);
create policy "Usuario envía sus propios mensajes"
  on public.messages for insert with check (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: crear perfil automáticamente al registrarse
-- ============================================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  uname  text;
  dname  text;
  acolor text;
begin
  uname  := new.raw_user_meta_data->>'username';
  dname  := new.raw_user_meta_data->>'display_name';
  acolor := coalesce(new.raw_user_meta_data->>'avatar_color', '#f0b429');
  insert into public.profiles (id, username, display_name, avatar_color)
  values (new.id, uname, dname, acolor);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- TRIGGER: recalcular puntos al cargar un resultado
-- ============================================================

create or replace function public.recalculate_points_for_match()
returns trigger language plpgsql security definer as $$
declare
  pred         record;
  pts          integer;
  old_pts      integer;
  pred_outcome integer;
  real_outcome integer;
begin
  -- Solo recalcular cuando el partido termina
  if new.status <> 'finished' then return new; end if;
  -- Si ya estaba finalizado con el mismo marcador, no hay nada que recalcular
  if TG_OP = 'UPDATE' and old.status = 'finished'
     and old.home_score = new.home_score and old.away_score = new.away_score then
    return new;
  end if;

  real_outcome := sign(new.home_score - new.away_score);

  for pred in
    select * from public.predictions where match_id = new.match_id
  loop
    -- old_pts permite corregir un marcador ya finalizado sin duplicar puntos:
    -- se resta lo que ya se había otorgado y se suma lo que corresponde ahora
    old_pts := coalesce(pred.points, 0);

    if pred.home_score = new.home_score and pred.away_score = new.away_score then
      pts := 5;
    else
      pred_outcome := sign(pred.home_score - pred.away_score);
      pts := case when pred_outcome = real_outcome then 3 else 0 end;
    end if;

    update public.predictions
    set points = pts, updated_at = now()
    where id = pred.id;

    update public.profiles
    set
      total_points    = total_points - old_pts + pts,
      correct_results = correct_results
                         - case when old_pts = 5 then 1 else 0 end
                         + case when pts = 5 then 1 else 0 end,
      correct_winners = correct_winners
                         - case when old_pts = 3 then 1 else 0 end
                         + case when pts = 3 then 1 else 0 end,
      -- matches_played solo sube la primera vez que el partido pasa a finished,
      -- no en correcciones posteriores del marcador
      matches_played  = matches_played
                         + case when TG_OP = 'INSERT' or old.status <> 'finished' then 1 else 0 end
    where id = pred.user_id;
  end loop;

  return new;
end;
$$;

drop trigger if exists on_result_inserted on public.match_results;
create trigger on_result_inserted
  after insert or update on public.match_results
  for each row execute procedure public.recalculate_points_for_match();

-- ============================================================
-- STORAGE: bucket para fotos de perfil
-- ============================================================

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict do nothing;

drop policy if exists "Fotos de perfil visibles para todos" on storage.objects;
drop policy if exists "Usuario sube su propia foto"         on storage.objects;
drop policy if exists "Usuario actualiza su propia foto"    on storage.objects;

create policy "Fotos de perfil visibles para todos"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Usuario sube su propia foto"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Usuario actualiza su propia foto"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
