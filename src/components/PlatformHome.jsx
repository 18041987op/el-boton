import React, { useEffect, useMemo, useState } from "react";
import { AUDIENCES, GAME_CATALOG } from "../data/gameCatalog";
import { levelFromXp, recordGameStart, xpForNextLevel } from "../services/playerProgress";
import { markLegacyPlatformLaunch } from "../services/platformLaunchBridge";
import RetentionPanel from "./RetentionPanel";
import ArcadeGames from "../games/ArcadeGames";

const COPY = {
  es: {
    title: "EL BOTÓN", eyebrow: "MINI-JUEGOS PARA TODOS",
    subtitle: "Partidas rápidas, dificultad creciente y recompensas que te hacen querer intentarlo otra vez.",
    play: "Jugar", featured: "Juegos disponibles", multiplayer: "Jugar con amigos",
    install: "Instalable en tu móvil", rewards: "Niveles, rachas y recompensas", quick: "Partidas cortas, diversión inmediata",
    choose: "Elige tu próxima obsesión", level: "Nivel", coins: "Monedas", streak: "Racha", plays: "Partidas",
    daily: "Recompensa diaria", claimed: "Ya reclamada", claim: "Reclamar", difficulty: "Dificultad",
  },
  en: {
    title: "THE BUTTON", eyebrow: "MINI GAMES FOR EVERYONE",
    subtitle: "Quick sessions, rising difficulty and rewards that make you want one more try.",
    play: "Play", featured: "Available games", multiplayer: "Play with friends",
    install: "Installable on mobile", rewards: "Levels, streaks and rewards", quick: "Short rounds, instant fun",
    choose: "Choose your next obsession", level: "Level", coins: "Coins", streak: "Streak", plays: "Games",
    daily: "Daily reward", claimed: "Already claimed", claim: "Claim", difficulty: "Difficulty",
  },
};

export default function PlatformHome({ lang, setLang, onPlay, onMultiplayer, supabaseReady, progress, onClaimDaily }) {
  const [audience, setAudience] = useState("all");
  const [displayProgress, setDisplayProgress] = useState(progress);
  const [activeStandalone, setActiveStandalone] = useState(null);
  useEffect(() => setDisplayProgress(progress), [progress]);

  const copy = COPY[lang];
  const level = levelFromXp(displayProgress.xp);
  const currentFloor = level === 1 ? 0 : xpForNextLevel(level - 1);
  const nextTarget = xpForNextLevel(level);
  const xpPct = Math.min(100, Math.max(0, ((displayProgress.xp - currentFloor) / Math.max(1, nextTarget - currentFloor)) * 100));
  const claimedToday = displayProgress.lastDailyReward === new Date().toISOString().slice(0, 10);
  const filtered = useMemo(() => audience === "all" ? GAME_CATALOG : GAME_CATALOG.filter((g) => g.audience.includes(audience)), [audience]);

  const launchGame = (game) => {
    if (!game.standalone) {
      markLegacyPlatformLaunch(game.kind);
      onPlay(game);
      return;
    }
    const nextProgress = recordGameStart(displayProgress, game);
    setDisplayProgress(nextProgress);
    setActiveStandalone(game.kind);
  };

  return <div className="platform-shell">
    <div className="platform-orb platform-orb-one"/><div className="platform-orb platform-orb-two"/>
    <header className="platform-nav">
      <div className="platform-logo"><span>●</span>{copy.title}</div>
      <div className="platform-lang">{["es","en"].map((l) => <button key={l} className={lang===l?"active":""} onClick={() => setLang(l)}>{l.toUpperCase()}</button>)}</div>
    </header>

    <main className="platform-main">
      <section className="platform-hero">
        <div className="platform-kicker">{copy.eyebrow}</div>
        <h1>{lang === "es" ? <>Un juego más.<br/><span>Y luego otro.</span></> : <>One more game.<br/><span>Then another.</span></>}</h1>
        <p>{copy.subtitle}</p>
        <div className="platform-benefits"><span>⚡ {copy.quick}</span><span>🏆 {copy.rewards}</span><span>📲 {copy.install}</span></div>
      </section>

      <section className="player-dashboard" aria-label="Player progress">
        <div className="player-level-ring"><strong>{level}</strong><span>{copy.level}</span></div>
        <div className="player-progress-main">
          <div className="player-progress-title"><strong>{displayProgress.xp} XP</strong><span>{nextTarget} XP</span></div>
          <div className="player-progress-track"><span style={{ width: `${xpPct}%` }}/></div>
          <div className="player-stats"><span>🪙 {displayProgress.coins} {copy.coins}</span><span>🔥 {displayProgress.streak} {copy.streak}</span><span>🎮 {displayProgress.totalPlays} {copy.plays}</span></div>
        </div>
        <button className="daily-reward" disabled={claimedToday} onClick={onClaimDaily}>
          <span>🎁 {copy.daily}</span><strong>{claimedToday ? copy.claimed : copy.claim}</strong>
        </button>
      </section>

      <RetentionPanel lang={lang} progress={displayProgress} onProgressChange={setDisplayProgress}/>

      <section className="platform-library">
        <div className="platform-section-head"><div><small>{copy.featured}</small><h2>{copy.choose}</h2></div>
          <div className="platform-filters">{AUDIENCES.map((item) => <button key={item.id} className={audience===item.id?"active":""} onClick={() => setAudience(item.id)}>{item[lang]}</button>)}</div>
        </div>
        <div className="platform-grid">{filtered.map((g) => <article key={g.kind} className="platform-card" style={{"--card-gradient":g.grad}}>
          <div className="platform-card-art"><span>{g.emoji}</span><div className="platform-difficulty" title={copy.difficulty}>{Array.from({length:5},(_,i)=><i key={i} className={i<g.difficulty?"on":""}>●</i>)}</div></div>
          <div className="platform-card-body"><h3>{g[lang]}</h3><p>{lang === "es" ? g.descEs : g.descEn}</p><div className="platform-card-meta"><span>+{g.reward} 🪙</span><span>{displayProgress.games[g.kind]?.plays || 0} 🎮</span></div><button onClick={() => launchGame(g)}>{copy.play} <span>→</span></button></div>
        </article>)}</div>
        {supabaseReady && <button className="platform-multiplayer" onClick={onMultiplayer}>👥 {copy.multiplayer}</button>}
      </section>
    </main>
    <footer className="platform-footer">{copy.title} · {new Date().getFullYear()}</footer>
    {activeStandalone && <ArcadeGames kind={activeStandalone} lang={lang} onClose={() => setActiveStandalone(null)}/>} 
  </div>;
}
