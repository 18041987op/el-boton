-- ─────────────────────────────────────────────────────────────
-- EL BOTÓN · esquema de ranking por juego
-- Pégalo completo en Supabase → SQL Editor → Run
-- ─────────────────────────────────────────────────────────────

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
