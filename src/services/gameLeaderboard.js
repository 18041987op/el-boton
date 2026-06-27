import supabase from "../supabaseClient";

/* ──────────────────────────────────────────────────────────────
   RANKING POR JUEGO (genérico y reutilizable)
   Cada juego usa su propio "game" (ej. "neon-rift"). El ranking
   vive en la tabla game_scores de Supabase (ver supabase/schema.sql).
   Si Supabase no está configurado, todo cae con elegancia a
   localStorage (récord e identidad locales) y nada se rompe.
   ────────────────────────────────────────────────────────────── */

const PID_KEY = "elboton_pid";
const NAME_KEY = "elboton_name";

// Identidad estable del jugador (compartida con el resto de la plataforma)
export function getPlayerId() {
  try {
    let id = localStorage.getItem(PID_KEY);
    if (!id) {
      id = "p" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
      localStorage.setItem(PID_KEY, id);
    }
    return id;
  } catch {
    return "p" + Math.random().toString(36).slice(2, 9);
  }
}

export function getPlayerName() {
  try {
    return localStorage.getItem(NAME_KEY) || "";
  } catch {
    return "";
  }
}

export function setPlayerName(name) {
  const clean = (name || "").slice(0, 16);
  try {
    localStorage.setItem(NAME_KEY, clean);
  } catch {
    // identidad opcional: si falla el almacenamiento, seguimos
  }
  return clean;
}

// Récord local por juego (sirve sin conexión / sin Supabase)
export function getLocalBest(game) {
  try {
    return Number(localStorage.getItem(`elboton_best_${game}`) || 0);
  } catch {
    return 0;
  }
}

export function setLocalBest(game, score) {
  try {
    const best = Math.max(getLocalBest(game), Math.round(score));
    localStorage.setItem(`elboton_best_${game}`, String(best));
    return best;
  } catch {
    return Math.round(score);
  }
}

// ¿Hay ranking mundial disponible?
export const leaderboardEnabled = !!supabase;

// Lee el top 100 del juego. Devuelve [] si no hay Supabase o si falla.
export async function fetchLeaderboard(game, limit = 100) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("game_scores")
      .select("player_id,name,score")
      .eq("game", game)
      .order("score", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []).map((r) => ({ id: r.player_id, name: r.name, score: r.score }));
  } catch {
    return null;
  }
}

// Envía un puntaje (conserva solo el mejor en el servidor).
export async function submitScore(game, score, name) {
  setLocalBest(game, score);
  if (!supabase) return false;
  try {
    const { error } = await supabase.rpc("submit_game_score", {
      p_game: game,
      p_id: getPlayerId(),
      p_name: (name || getPlayerName() || "Anónimo").slice(0, 16),
      p_score: Math.max(0, Math.round(score)),
    });
    if (error) throw error;
    return true;
  } catch {
    return false;
  }
}
