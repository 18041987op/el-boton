const STORAGE_KEY = "elboton_progress_v1";

const DEFAULT_PROGRESS = {
  xp: 0,
  coins: 25,
  streak: 1,
  totalPlays: 0,
  lastPlayedAt: null,
  lastDailyReward: null,
  games: {},
  daily: { date: null, plays: 0, games: {}, claimedMissions: [] },
};

export const dayKey = (date = new Date()) => date.toISOString().slice(0, 10);

function normalizeDaily(daily) {
  const today = dayKey();
  if (!daily || daily.date !== today) {
    return { date: today, plays: 0, games: {}, claimedMissions: [] };
  }
  return {
    date: today,
    plays: daily.plays || 0,
    games: daily.games || {},
    claimedMissions: daily.claimedMissions || [],
  };
}

export function levelFromXp(xp = 0) {
  return Math.max(1, Math.floor(Math.sqrt(Math.max(0, xp) / 40)) + 1);
}

export function xpForNextLevel(level) {
  return Math.pow(level, 2) * 40;
}

export function loadProgress() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!parsed) return { ...DEFAULT_PROGRESS, daily: normalizeDaily(null) };
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      games: parsed.games || {},
      daily: normalizeDaily(parsed.daily),
    };
  } catch {
    return { ...DEFAULT_PROGRESS, daily: normalizeDaily(null) };
  }
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Local progress is optional; gameplay must continue if storage is unavailable.
  }
  return progress;
}

export function claimDailyReward(progress) {
  const today = dayKey();
  if (progress.lastDailyReward === today) return { progress, reward: 0 };

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const continued = progress.lastDailyReward === dayKey(yesterday);
  const streak = continued ? (progress.streak || 0) + 1 : 1;
  const reward = Math.min(50, 10 + streak * 2);
  const next = saveProgress({ ...progress, streak, coins: progress.coins + reward, lastDailyReward: today });
  return { progress: next, reward };
}

export function recordGameStart(progress, game) {
  const now = new Date().toISOString();
  const daily = normalizeDaily(progress.daily);
  const gameStats = progress.games[game.kind] || { plays: 0, best: 0 };
  const xpReward = Math.max(4, Math.round((game.reward || 8) / 2));
  const next = {
    ...progress,
    xp: progress.xp + xpReward,
    totalPlays: progress.totalPlays + 1,
    lastPlayedAt: now,
    daily: {
      ...daily,
      plays: daily.plays + 1,
      games: { ...daily.games, [game.kind]: (daily.games[game.kind] || 0) + 1 },
    },
    games: {
      ...progress.games,
      [game.kind]: { ...gameStats, plays: gameStats.plays + 1, lastPlayedAt: now },
    },
  };
  return saveProgress(next);
}

export function claimMissionReward(progress, missionId, reward) {
  const daily = normalizeDaily(progress.daily);
  if (daily.claimedMissions.includes(missionId)) return { progress, reward: 0 };
  const next = saveProgress({
    ...progress,
    coins: progress.coins + reward,
    daily: { ...daily, claimedMissions: [...daily.claimedMissions, missionId] },
  });
  return { progress: next, reward };
}
