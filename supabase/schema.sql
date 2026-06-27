-- ─────────────────────────────────────────────────────────────
-- EL BOTÓN · esquema de ranking mundial
-- Pégalo completo en Supabase → SQL Editor → Run
-- ─────────────────────────────────────────────────────────────

-- Tabla de puntajes (un registro por jugador)
create table if not exists public.el_boton_scores (
  player_id  text primary key,
  name       text not null default 'Anónimo',
  vibe       integer not null default 0,
  updated_at timestamptz not null default now()
);

-- Índice para ordenar el ranking rápido
create index if not exists el_boton_scores_vibe_idx
  on public.el_boton_scores (vibe desc);

-- Activar Row Level Security
alter table public.el_boton_scores enable row level security;

-- Lectura pública del ranking (cualquiera puede ver el top)
drop policy if exists "lectura publica" on public.el_boton_scores;
create policy "lectura publica"
  on public.el_boton_scores
  for select
  using (true);

-- NOTA: no exponemos INSERT/UPDATE directo. Toda escritura pasa por
-- la función submit_score() de abajo, que conserva siempre el máximo.

-- Función que registra el puntaje guardando solo el mejor
create or replace function public.submit_score(p_id text, p_name text, p_vibe integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.el_boton_scores (player_id, name, vibe, updated_at)
  values (
    p_id,
    coalesce(nullif(trim(p_name), ''), 'Anónimo'),
    greatest(p_vibe, 0),
    now()
  )
  on conflict (player_id) do update
    set vibe       = greatest(public.el_boton_scores.vibe, excluded.vibe),
        name       = excluded.name,
        updated_at = now();
end;
$$;

-- Permitir que los visitantes (rol anon) ejecuten la función
grant execute on function public.submit_score(text, text, integer) to anon;

-- ─────────────────────────────────────────────────────────────
-- RANKING POR JUEGO (genérico y reutilizable)
-- Cada juego competitivo (ej. "neon-rift") tiene su propio top 100.
-- Un registro por jugador y por juego: se conserva siempre el mejor puntaje.
-- ─────────────────────────────────────────────────────────────

create table if not exists public.game_scores (
  game       text not null,
  player_id  text not null,
  name       text not null default 'Anónimo',
  score      integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (game, player_id)
);

-- Índice para ordenar cada ranking rápido
create index if not exists game_scores_game_score_idx
  on public.game_scores (game, score desc);

-- Row Level Security: lectura pública, escritura solo vía RPC
alter table public.game_scores enable row level security;

drop policy if exists "game_scores lectura publica" on public.game_scores;
create policy "game_scores lectura publica"
  on public.game_scores
  for select
  using (true);

-- Registra el puntaje de un juego guardando solo el mejor del jugador
create or replace function public.submit_game_score(
  p_game text, p_id text, p_name text, p_score integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.game_scores (game, player_id, name, score, updated_at)
  values (
    p_game,
    p_id,
    coalesce(nullif(trim(p_name), ''), 'Anónimo'),
    greatest(p_score, 0),
    now()
  )
  on conflict (game, player_id) do update
    set score      = greatest(public.game_scores.score, excluded.score),
        name       = excluded.name,
        updated_at = now();
end;
$$;

grant execute on function public.submit_game_score(text, text, text, integer) to anon;
