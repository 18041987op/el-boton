import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchLeaderboard,
  getLocalBest,
  getPlayerName,
  leaderboardEnabled,
  setPlayerName as persistName,
  submitScore,
} from "../services/gameLeaderboard";

/* ════════════════════════════════════════════════════════════════
   NEON RIFT ARENA
   Arena shooter top-down (vista cenital) · movimiento 360°
   Multijugador local (1-2 humanos) vs bots con IA · oleadas · jefe
   Canvas 2D con glow, partículas, audio sintetizado (Web Audio)
   ════════════════════════════════════════════════════════════════ */

const GAME_KEY = "neon-rift";

const copy = {
  es: {
    title: "NEON RIFT ARENA",
    tagline: "Sobrevive a la grieta. Domina la arena.",
    intro: "Esquiva, dispara y sube de nivel mientras enjambres de bots con IA intentan borrarte de la grieta. Aguanta las oleadas y enfréntate al JEFE.",
    players: "Jugadores",
    onePlayer: "1 Jugador",
    twoPlayers: "2 Jugadores",
    difficulty: "Dificultad",
    easy: "Fácil",
    normal: "Normal",
    hard: "Difícil",
    start: "ENTRAR A LA ARENA",
    controlsTitle: "Cómo jugar",
    touchControls: "📱 Táctil: arrastra el dedo para moverte",
    p1Controls: "⌨️ Teclado: WASD o flechas para moverte",
    p2Controls: "J2 (teclado): flechas para moverse",
    autoaim: "🔫 Disparas SOLO al enemigo más cercano. Tú solo muévete y esquiva.",
    restart: "Reiniciar (R)",
    exit: "Salir",
    wave: "Oleada",
    score: "Puntos",
    best: "Récord",
    pause: "Pausa",
    resume: "Reanudar",
    paused: "PAUSA",
    waveClear: "OLEADA SUPERADA",
    nextWave: "Siguiente oleada",
    xpGained: "XP ganado",
    gameOver: "GAME OVER",
    bossIncoming: "¡JEFE EN CAMINO!",
    bossAlert: "Sobrevive a la grieta",
    finalScore: "Puntuación final",
    newRecord: "¡NUEVO RÉCORD!",
    ranking: "Ranking mundial",
    rankLocal: "Récord local",
    rankOffline: "Ranking no disponible (modo local)",
    you: "TÚ",
    yourName: "Tu nombre",
    save: "Guardar y competir",
    namePh: "Tu nombre o alias",
    empty: "¡Sé el primero del ranking!",
    playAgain: "JUGAR DE NUEVO",
    eliminated: "ELIMINADO",
    p1: "J1",
    p2: "J2",
    level: "Nv",
  },
  en: {
    title: "NEON RIFT ARENA",
    tagline: "Survive the rift. Own the arena.",
    intro: "Dodge, shoot and level up while swarms of AI bots try to erase you from the rift. Hold the waves and face the BOSS.",
    players: "Players",
    onePlayer: "1 Player",
    twoPlayers: "2 Players",
    difficulty: "Difficulty",
    easy: "Easy",
    normal: "Normal",
    hard: "Hard",
    start: "ENTER THE ARENA",
    controlsTitle: "How to play",
    touchControls: "📱 Touch: drag your finger to move",
    p1Controls: "⌨️ Keyboard: WASD or arrows to move",
    p2Controls: "P2 (keyboard): arrows to move",
    autoaim: "🔫 You auto-fire at the nearest enemy. Just move and dodge.",
    restart: "Restart (R)",
    exit: "Exit",
    wave: "Wave",
    score: "Score",
    best: "Best",
    pause: "Pause",
    resume: "Resume",
    paused: "PAUSED",
    waveClear: "WAVE CLEARED",
    nextWave: "Next wave",
    xpGained: "XP gained",
    gameOver: "GAME OVER",
    bossIncoming: "BOSS INCOMING!",
    bossAlert: "Survive the rift",
    finalScore: "Final score",
    newRecord: "NEW RECORD!",
    ranking: "World ranking",
    rankLocal: "Local best",
    rankOffline: "Ranking unavailable (local mode)",
    you: "YOU",
    yourName: "Your name",
    save: "Save & compete",
    namePh: "Your name or alias",
    empty: "Be the first on the board!",
    playAgain: "PLAY AGAIN",
    eliminated: "ELIMINATED",
    p1: "P1",
    p2: "P2",
    level: "Lv",
  },
};

// Ajustes globales por dificultad: velocidad de enemigos, cadencia y power-ups
const DIFFS = {
  easy: { id: "easy", enemySpeed: 0.75, enemyFire: 0.6, powerupEvery: 12000, label: "easy" },
  normal: { id: "normal", enemySpeed: 1.0, enemyFire: 1.0, powerupEvery: 15000, label: "normal" },
  hard: { id: "hard", enemySpeed: 1.32, enemyFire: 1.45, powerupEvery: 19000, label: "hard" },
};

const BOT_NAMES = ["Bot_Alpha", "Bot_Omega", "Bot_Nyx", "Bot_Vex", "Bot_Zero", "Bot_Hex", "Bot_Rho", "Bot_Kilo"];
// Colores por nivel del bot: suben de tono al subir de nivel (más peligrosos)
const BOT_LEVEL_COLORS = ["#f43f5e", "#fb923c", "#facc15", "#a3e635", "#22d3ee", "#a855f7", "#ec4899"];
const PLAYER_COLORS = [
  { core: "#22d3ee", glow: "#22d3ee", trail: "rgba(34,211,238," },
  { core: "#a3e635", glow: "#a3e635", trail: "rgba(163,230,53," },
];

/* ── Configuración de la oleada (dificultad progresiva, sección 4) ── */
function waveConfig(wave) {
  if (wave >= 10 && wave % 5 === 0) {
    // Cada 5 oleadas a partir de la 10: JEFE con adds
    return { boss: true, count: 2, tier: "fast", canShoot: true, predict: true };
  }
  if (wave <= 3) return { boss: false, count: 2, tier: "slow", canShoot: false, predict: false };
  if (wave <= 6) return { boss: false, count: 4, tier: "med", canShoot: true, predict: false };
  if (wave <= 9) return { boss: false, count: 6, tier: "fast", canShoot: true, predict: true };
  // 10+: oleadas cargadas y agresivas entre jefes
  return { boss: false, count: Math.min(8, 6 + Math.floor((wave - 9) / 2)), tier: "fast", canShoot: true, predict: true };
}

const TIER_SPEED = { slow: 70, med: 105, fast: 145 };

export default function NeonRiftArena({ lang = "es", onClose }) {
  const t = copy[lang] || copy.es;
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const gRef = useRef(null);
  const acRef = useRef(null);
  const langRef = useRef(lang);
  useEffect(() => { langRef.current = lang; }, [lang]);

  const [phase, setPhase] = useState("intro"); // intro | playing | waveclear | over
  const [numPlayers, setNumPlayers] = useState(1);
  const [diff, setDiff] = useState("normal");
  const [paused, setPaused] = useState(false);
  const [hud, setHud] = useState({ wave: 1, score: 0, players: [] });
  const [waveResult, setWaveResult] = useState(null);
  const [over, setOver] = useState(null);
  const [bossFlash, setBossFlash] = useState(false);
  const [best, setBest] = useState(() => getLocalBest(GAME_KEY));
  const [board, setBoard] = useState(null);
  const [nameDraft, setNameDraft] = useState(getPlayerName());
  const [savedName, setSavedName] = useState(getPlayerName());

  /* ── Audio sintetizado (Web Audio API, sin archivos externos) ── */
  const ac = () => {
    try {
      if (!acRef.current) acRef.current = new (window.AudioContext || window.webkitAudioContext)();
      if (acRef.current.state === "suspended") acRef.current.resume();
      return acRef.current;
    } catch {
      return null;
    }
  };
  const blip = (f1, f2, dur, vol, type = "square") => {
    const ctx = ac(); if (!ctx) return;
    try {
      const s = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(f1, s);
      o.frequency.exponentialRampToValueAtTime(Math.max(30, f2), s + dur);
      g.gain.setValueAtTime(0.0001, s);
      g.gain.exponentialRampToValueAtTime(vol, s + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, s + dur);
      o.connect(g); g.connect(ctx.destination); o.start(s); o.stop(s + dur + 0.02);
    } catch {}
  };
  const noise = (dur, vol, freq, type = "lowpass") => {
    const ctx = ac(); if (!ctx) return;
    try {
      const n = Math.max(1, Math.floor(ctx.sampleRate * dur)), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
      const src = ctx.createBufferSource(); src.buffer = buf;
      const g = ctx.createGain(); g.gain.value = vol;
      const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq;
      src.connect(f); f.connect(g); g.connect(ctx.destination); src.start();
    } catch {}
  };
  const sndShoot = () => blip(820, 460, 0.08, 0.04, "square");
  const sndExplosion = () => { blip(180, 50, 0.3, 0.16, "sawtooth"); noise(0.22, 0.18, 900, "lowpass"); };
  const sndPower = () => { blip(620, 1180, 0.16, 0.1, "triangle"); blip(880, 1320, 0.18, 0.06, "sine"); };
  const sndHurt = () => { blip(300, 90, 0.28, 0.16, "sawtooth"); noise(0.12, 0.12, 500, "lowpass"); };
  const sndLevel = () => [523, 784, 1047].forEach((f, i) => setTimeout(() => blip(f, f, 0.12, 0.08, "triangle"), i * 70));

  /* ── Ajuste de tamaño del canvas (responsive + DPR) ── */
  const resize = useCallback(() => {
    const c = canvasRef.current; if (!c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth, h = window.innerHeight;
    c.width = Math.floor(w * dpr);
    c.height = Math.floor(h * dpr);
    const ctx = c.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const g = gRef.current;
    if (g) { g.W = w; g.H = h; }
  }, []);

  // Refresca el ranking mundial
  const refreshBoard = useCallback(async () => {
    if (!leaderboardEnabled) { setBoard(null); return; }
    const data = await fetchLeaderboard(GAME_KEY);
    setBoard(data);
  }, []);

  useEffect(() => { refreshBoard(); }, [refreshBoard]);

  /* ════════════════════════════════════════════════════════════
     NÚCLEO DEL JUEGO (bucle con requestAnimationFrame + deltaTime)
     ════════════════════════════════════════════════════════════ */
  const startGame = useCallback((nPlayers, difficulty) => {
    const c = canvasRef.current; if (!c) return;
    ac(); // "despierta" el audio con el gesto del usuario
    const W = window.innerWidth, H = window.innerHeight;
    const D = DIFFS[difficulty] || DIFFS.normal;

    // Helper de creación de jugador humano
    const makeHuman = (idx) => ({
      id: "human" + idx, isHuman: true, name: idx === 0 ? "J1" : "J2",
      x: W * (idx === 0 ? 0.38 : 0.62), y: H * 0.62, vx: 0, vy: 0,
      r: 16, aim: -Math.PI / 2, lives: 3, maxLives: 5, xp: 0, level: 1,
      dmgMul: 1, fireRate: 1, fireCD: 0, invUntil: 0, shield: 0, tripleUntil: 0,
      dead: false, kills: 0, color: PLAYER_COLORS[idx], pIndex: idx,
    });

    const players = [];
    for (let i = 0; i < nPlayers; i++) players.push(makeHuman(i));

    // ── POOL DE OBJETOS (balas y partículas reutilizadas, sin GC en caliente) ──
    const bullets = [];
    for (let i = 0; i < 200; i++) bullets.push({ active: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, dmg: 0, team: "", owner: null, color: "#fff", r: 4 });
    const particles = [];
    for (let i = 0; i < 320; i++) particles.push({ active: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1, color: "#fff", size: 3 });

    // Campo de estrellas (parpadean) para el fondo cyberpunk
    const stars = [];
    for (let i = 0; i < 90; i++) stars.push({ x: Math.random(), y: Math.random(), r: Math.random() * 1.6 + 0.3, ph: Math.random() * 6.28, sp: 0.4 + Math.random() });

    const g = {
      running: true, W, H, D, diffId: difficulty,
      players, bullets, particles, stars,
      enemies: [], powerups: [],
      wave: 1, waveCfg: waveConfig(1), enemiesToSpawn: 0, spawnTimer: 0,
      powerupTimer: D.powerupEvery, botNameIdx: 0,
      score: 0, teamXp: 0,
      keys: new Set(), lastTime: 0, elapsed: 0, hudClock: 0,
      shake: 0, gridT: 0,
      // Joystick táctil del J1: base (bx,by) y vector analógico (tvx,tvy ∈ -1..1)
      touch: { active: false, bx: 0, by: 0, tvx: 0, tvy: 0 },
    };
    gRef.current = g;
    resize();

    setNumPlayers(nPlayers);
    setDiff(difficulty);
    setPaused(false);
    setWaveResult(null);
    setOver(null);
    setPhase("playing");
    beginWave(g, 1);
    sndLevel();

    g.lastTime = performance.now();
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame((ts) => loop(ts));
  }, [resize]);

  // ── Arranca una oleada: configura cuántos enemigos y de qué tipo ──
  function beginWave(g, wave) {
    g.wave = wave;
    g.waveCfg = waveConfig(wave);
    g.enemiesToSpawn = g.waveCfg.count;
    g.spawnTimer = 0;
    if (g.waveCfg.boss) g.bossPending = true;
  }

  // Genera un enemigo (bot con IA) en un borde de la arena
  function spawnEnemy(g, isBoss) {
    const { W, H } = g;
    const edge = Math.floor(Math.random() * 4);
    let x, y;
    if (edge === 0) { x = Math.random() * W; y = -30; }
    else if (edge === 1) { x = W + 30; y = Math.random() * H; }
    else if (edge === 2) { x = Math.random() * W; y = H + 30; }
    else { x = -30; y = Math.random() * H; }

    if (isBoss) {
      g.enemies.push({
        boss: true, name: "RIFT BOSS", x: W / 2, y: -60, vx: 0, vy: 0, r: 46,
        hp: 50, maxHp: 50, speed: 60 * g.D.enemySpeed, fireCD: 1.4,
        state: "chase", level: 5, xp: 0, color: "#ff2d75", canShoot: true, predict: true,
        wander: Math.random() * 6.28, waypoint: { x: W / 2, y: H * 0.3 }, attackPhase: 0,
      });
      return;
    }
    const cfg = g.waveCfg;
    const baseSpeed = TIER_SPEED[cfg.tier] * g.D.enemySpeed;
    g.enemies.push({
      boss: false, name: BOT_NAMES[g.botNameIdx++ % BOT_NAMES.length],
      x, y, vx: 0, vy: 0, r: 15,
      hp: 3 + Math.floor(g.wave / 4), maxHp: 3 + Math.floor(g.wave / 4),
      speed: baseSpeed * (0.85 + Math.random() * 0.3),
      fireCD: 1 + Math.random(), level: 1, xp: 0,
      color: BOT_LEVEL_COLORS[0], canShoot: cfg.canShoot, predict: cfg.predict,
      state: "patrol", wander: Math.random() * 6.28, wanderCD: 0,
    });
  }

  // ── Pool: toma una bala libre ──
  function fireBullet(g, x, y, angle, speed, dmg, team, owner, color, r = 4.5) {
    let b = g.bullets.find((o) => !o.active);
    if (!b) { b = { active: false }; g.bullets.push(b); }
    b.active = true; b.x = x; b.y = y;
    b.vx = Math.cos(angle) * speed; b.vy = Math.sin(angle) * speed;
    b.life = 1.6; b.dmg = dmg; b.team = team; b.owner = owner; b.color = color; b.r = r;
  }

  // ── Pool: explosión de partículas ──
  function burst(g, x, y, color, n, spread = 220) {
    for (let i = 0; i < n; i++) {
      let p = g.particles.find((o) => !o.active);
      if (!p) { p = { active: false }; g.particles.push(p); }
      const a = Math.random() * 6.28, sp = spread * (0.2 + Math.random() * 0.8);
      p.active = true; p.x = x; p.y = y;
      p.vx = Math.cos(a) * sp; p.vy = Math.sin(a) * sp;
      p.maxLife = 0.4 + Math.random() * 0.5; p.life = p.maxLife;
      p.color = color; p.size = 2 + Math.random() * 3.5;
    }
  }

  // Reparte XP al jugador y sube de nivel cada 100 XP (+10% daño y cadencia)
  function grantXp(g, p, amount) {
    p.xp += amount;
    g.teamXp += amount;
    while (p.xp >= p.level * 100) {
      p.xp -= p.level * 100;
      p.level++;
      p.dmgMul *= 1.1;
      p.fireRate *= 1.1;
      if (p.isHuman) { sndLevel(); burst(g, p.x, p.y, p.color.glow, 20, 260); }
    }
  }

  // Los bots también ganan XP y suben de nivel (cambian de color) → justo y desafiante
  function grantBotXp(bot, amount) {
    bot.xp += amount;
    while (bot.xp >= bot.level * 60) {
      bot.xp -= bot.level * 60;
      bot.level++;
      bot.speed *= 1.06;
      bot.color = BOT_LEVEL_COLORS[Math.min(BOT_LEVEL_COLORS.length - 1, bot.level - 1)];
    }
  }

  const aliveHumans = (g) => g.players.filter((p) => p.isHuman && !p.dead);

  /* ── Bucle principal ── */
  function loop(ts) {
    const g = gRef.current; if (!g || !g.running) return;
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d");

    let dt = (ts - g.lastTime) / 1000;
    g.lastTime = ts;
    if (dt > 0.05) dt = 0.05; // clamp anti-saltos (cambia de pestaña, etc.)

    if (!g.paused) {
      update(g, dt);
    }
    render(ctx, g, dt);

    rafRef.current = requestAnimationFrame((next) => loop(next));
  }

  /* ════════════════════════════════════════════════════════════
     ACTUALIZACIÓN (física, IA, colisiones) — todo con deltaTime
     ════════════════════════════════════════════════════════════ */
  function update(g, dt) {
    const { W, H } = g;
    g.elapsed += dt;
    g.gridT += dt;
    if (g.shake > 0) g.shake = Math.max(0, g.shake - dt * 60);
    const now = g.elapsed * 1000;

    // ── Jugadores humanos: movimiento + auto-aim + disparo ──
    for (const p of g.players) {
      if (!p.isHuman || p.dead) continue;
      const k = g.keys;
      const speed = 240;
      let vx = 0, vy = 0, mx = 0, my = 0;
      // El J1 puede moverse con el joystick táctil (analógico) o con teclado.
      if (p.pIndex === 0 && g.touch.active && (g.touch.tvx || g.touch.tvy)) {
        vx = g.touch.tvx * speed;
        vy = g.touch.tvy * speed;
        mx = g.touch.tvx; my = g.touch.tvy;
      } else {
        if (p.pIndex === 0) {
          // En 1 jugador, J1 también acepta flechas; en 2 jugadores las flechas son del J2
          const solo = g.players.length === 1;
          if (k.has("KeyW") || (solo && k.has("ArrowUp"))) my -= 1;
          if (k.has("KeyS") || (solo && k.has("ArrowDown"))) my += 1;
          if (k.has("KeyA") || (solo && k.has("ArrowLeft"))) mx -= 1;
          if (k.has("KeyD") || (solo && k.has("ArrowRight"))) mx += 1;
        } else {
          if (k.has("ArrowUp")) my -= 1;
          if (k.has("ArrowDown")) my += 1;
          if (k.has("ArrowLeft")) mx -= 1;
          if (k.has("ArrowRight")) mx += 1;
        }
        const mag = Math.hypot(mx, my);
        if (mag > 0) { vx = (mx / mag) * speed; vy = (my / mag) * speed; }
      }
      p.vx = vx; p.vy = vy;
      p.x = Math.max(p.r, Math.min(W - p.r, p.x + p.vx * dt));
      p.y = Math.max(p.r, Math.min(H - p.r, p.y + p.vy * dt));

      // Auto-puntería hacia el enemigo más cercano
      const target = nearestEnemy(g, p.x, p.y);
      if (target) p.aim = Math.atan2(target.y - p.y, target.x - p.x);
      else if (mx || my) p.aim = Math.atan2(my, mx);

      // Disparo AUTOMÁTICO: el jugador solo se concentra en moverse/esquivar
      p.fireCD -= dt;
      if (p.fireCD <= 0 && target) {
        const baseCD = 0.34 / p.fireRate;
        p.fireCD = baseCD;
        const dmg = 1 * p.dmgMul;
        const col = p.color.core;
        if (now < p.tripleUntil) {
          // Power-up Rayo: disparo triple
          fireBullet(g, p.x, p.y, p.aim, 560, dmg, "human", p, col);
          fireBullet(g, p.x, p.y, p.aim - 0.22, 560, dmg, "human", p, col);
          fireBullet(g, p.x, p.y, p.aim + 0.22, 560, dmg, "human", p, col);
        } else {
          fireBullet(g, p.x, p.y, p.aim, 560, dmg, "human", p, col);
        }
        sndShoot();
      }
    }

    // ── Aparición de enemigos de la oleada ──
    if (g.bossPending) {
      g.bossPending = false;
      spawnEnemy(g, true);
    }
    if (g.enemiesToSpawn > 0) {
      g.spawnTimer -= dt;
      if (g.spawnTimer <= 0) {
        spawnEnemy(g, false);
        g.enemiesToSpawn--;
        g.spawnTimer = 0.7;
      }
    }

    // ── IA de los bots: máquina de estados (patrullar / perseguir / atacar) ──
    for (const e of g.enemies) {
      const target = nearestHuman(g, e.x, e.y);
      const dist = target ? Math.hypot(target.x - e.x, target.y - e.y) : Infinity;

      if (e.boss) {
        updateBoss(g, e, dt, target, dist);
      } else {
        // Transición de estado según la distancia al humano más cercano
        if (!target) e.state = "patrol";
        else if (dist < 250) e.state = "attack";
        else if (dist < 620) e.state = "chase";
        else e.state = "patrol";

        if (e.state === "patrol") {
          // Movimiento aleatorio suave (deambula)
          e.wanderCD -= dt;
          if (e.wanderCD <= 0) { e.wander += (Math.random() - 0.5) * 1.6; e.wanderCD = 0.6 + Math.random(); }
          e.vx = Math.cos(e.wander) * e.speed * 0.6;
          e.vy = Math.sin(e.wander) * e.speed * 0.6;
        } else {
          // Perseguir / atacar: ir hacia el humano (atacar mantiene algo de distancia)
          const ang = Math.atan2(target.y - e.y, target.x - e.x);
          const approach = e.state === "attack" ? 0.4 : 1;
          e.vx = Math.cos(ang) * e.speed * approach;
          e.vy = Math.sin(ang) * e.speed * approach;

          // Atacar: dispara si el bot puede y el humano está en rango (≤250px)
          if (e.state === "attack" && e.canShoot) {
            e.fireCD -= dt * g.D.enemyFire;
            if (e.fireCD <= 0) {
              e.fireCD = 1.3;
              let aim = ang;
              if (e.predict) {
                // IA predictiva: adelanta el disparo al movimiento del humano
                const lead = dist / 430;
                const px = target.x + target.vx * lead, py = target.y + target.vy * lead;
                aim = Math.atan2(py - e.y, px - e.x);
              }
              fireBullet(g, e.x, e.y, aim, 360, 1, "enemy", e, e.color, 5);
            }
          }
        }
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        // Rebote suave en los bordes
        if (e.x < e.r) { e.x = e.r; e.wander = Math.PI - e.wander; }
        if (e.x > W - e.r) { e.x = W - e.r; e.wander = Math.PI - e.wander; }
        if (e.y < e.r) { e.y = e.r; e.wander = -e.wander; }
        if (e.y > H - e.r) { e.y = H - e.r; e.wander = -e.wander; }
      }

      // Daño por contacto cuerpo a cuerpo
      if (target && dist < e.r + target.r) damageHuman(g, target, e);
    }

    // ── Power-ups: aparecen cada 15s (según dificultad) ──
    g.powerupTimer -= dt * 1000;
    if (g.powerupTimer <= 0) {
      g.powerupTimer = g.D.powerupEvery;
      const types = ["heart", "lightning", "shield"];
      g.powerups.push({
        type: types[Math.floor(Math.random() * types.length)],
        x: 60 + Math.random() * (W - 120), y: 90 + Math.random() * (H - 180),
        pulse: 0, ttl: 12,
      });
    }
    for (const pu of g.powerups) {
      pu.pulse += dt * 4; pu.ttl -= dt;
      for (const p of aliveHumans(g)) {
        if (Math.hypot(p.x - pu.x, p.y - pu.y) < p.r + 18) { pu.ttl = -1; applyPowerup(g, p, pu.type); }
      }
    }
    g.powerups = g.powerups.filter((pu) => pu.ttl > 0);

    // ── Balas: mover, vida, colisiones ──
    for (const b of g.bullets) {
      if (!b.active) continue;
      b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
      if (b.life <= 0 || b.x < -20 || b.x > W + 20 || b.y < -20 || b.y > H + 20) { b.active = false; continue; }
      if (b.team === "human") {
        for (const e of g.enemies) {
          if (Math.hypot(b.x - e.x, b.y - e.y) < e.r + b.r) {
            b.active = false;
            e.hp -= b.dmg;
            burst(g, b.x, b.y, b.color, 5, 160);
            if (e.hp <= 0) killEnemy(g, e, b.owner);
            break;
          }
        }
      } else {
        for (const p of aliveHumans(g)) {
          if (Math.hypot(b.x - p.x, b.y - p.y) < p.r + b.r) {
            b.active = false;
            damageHuman(g, p, b.owner);
            break;
          }
        }
      }
    }

    // ── Partículas (pool) ──
    for (const p of g.particles) {
      if (!p.active) continue;
      p.life -= dt;
      if (p.life <= 0) { p.active = false; continue; }
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vx *= 0.94; p.vy *= 0.94;
    }

    // ── Limpieza de enemigos muertos ──
    g.enemies = g.enemies.filter((e) => !e._dead);

    // ── ¿Oleada superada? ──
    if (g.enemiesToSpawn === 0 && g.enemies.length === 0 && !g.bossPending) {
      finishWave(g);
      return;
    }

    // ── ¿Game over? (ambos humanos eliminados) ──
    if (aliveHumans(g).length === 0) {
      endGame(g);
      return;
    }

    // HUD (refresco ~12 fps para no saturar React)
    g.hudClock += dt;
    if (g.hudClock > 0.08) {
      g.hudClock = 0;
      pushHud(g);
    }
  }

  // Boss: patrones erráticos + ataques en área (sección 4)
  function updateBoss(g, e, dt, target, dist) {
    const { W, H } = g;
    // Movimiento errático: persigue waypoints aleatorios
    if (!e.waypoint || Math.hypot(e.waypoint.x - e.x, e.waypoint.y - e.y) < 40) {
      e.waypoint = { x: 80 + Math.random() * (W - 160), y: 80 + Math.random() * (H * 0.6) };
    }
    const wa = Math.atan2(e.waypoint.y - e.y, e.waypoint.x - e.x);
    e.x += Math.cos(wa) * e.speed * dt;
    e.y += Math.sin(wa) * e.speed * dt;

    e.fireCD -= dt * g.D.enemyFire;
    if (e.fireCD <= 0) {
      e.attackPhase++;
      if (e.attackPhase % 3 === 0) {
        // Ataque en área: ráfaga radial de balas
        const ring = 16;
        for (let i = 0; i < ring; i++) fireBullet(g, e.x, e.y, (i / ring) * 6.28, 260, 1, "enemy", e, "#ff7ab8", 6);
        e.fireCD = 1.8;
        g.shake = 8;
        sndExplosion();
      } else if (target) {
        // Disparo dirigido (en abanico)
        const ang = Math.atan2(target.y - e.y, target.x - e.x);
        for (let o = -1; o <= 1; o++) fireBullet(g, e.x, e.y, ang + o * 0.18, 340, 1, "enemy", e, "#ff2d75", 6);
        e.fireCD = 0.9;
      }
    }
  }

  function nearestEnemy(g, x, y) {
    let best = null, bd = Infinity;
    for (const e of g.enemies) {
      const d = (e.x - x) ** 2 + (e.y - y) ** 2;
      if (d < bd) { bd = d; best = e; }
    }
    return best;
  }
  function nearestHuman(g, x, y) {
    let best = null, bd = Infinity;
    for (const p of g.players) {
      if (!p.isHuman || p.dead) continue;
      const d = (p.x - x) ** 2 + (p.y - y) ** 2;
      if (d < bd) { bd = d; best = p; }
    }
    return best;
  }

  // Daña a un humano (con invencibilidad temporal, escudo y parpadeo)
  function damageHuman(g, p, attacker) {
    const now = g.elapsed * 1000;
    if (now < p.invUntil || p.dead) return;
    // Power-up Escudo: absorbe 1 golpe
    if (p.shield > 0) {
      p.shield--;
      p.invUntil = now + 600;
      burst(g, p.x, p.y, "#38bdf8", 16, 240);
      sndPower();
      return;
    }
    p.lives--;
    p.invUntil = now + 1000; // 1 segundo de invencibilidad
    g.shake = 7;
    burst(g, p.x, p.y, p.color.glow, 24, 300);
    sndHurt();
    navigator.vibrate?.(60);
    // El bot atacante gana XP por dañar a un humano (sube de nivel / color)
    if (attacker && !attacker.isHuman) grantBotXp(attacker, 40);
    if (p.lives <= 0) {
      p.dead = true; // queda "eliminado" (fantasma)
      burst(g, p.x, p.y, p.color.glow, 40, 380);
      sndExplosion();
    }
  }

  // Mata a un enemigo y reparte XP/puntos a su verdugo
  function killEnemy(g, e, killer) {
    if (e._dead) return;
    e._dead = true;
    const reward = e.boss ? 500 : 25 + e.level * 5;
    g.score += reward;
    burst(g, e.x, e.y, e.color, e.boss ? 70 : 22, e.boss ? 460 : 300);
    g.shake = e.boss ? 12 : 4;
    sndExplosion();
    if (killer && killer.isHuman) {
      killer.kills++;
      grantXp(g, killer, e.boss ? 200 : 30 + e.level * 4);
    }
  }

  // Aplica el efecto de un power-up recogido
  function applyPowerup(g, p, type) {
    const now = g.elapsed * 1000;
    sndPower();
    burst(g, p.x, p.y, "#fff", 14, 200);
    if (type === "heart") p.lives = Math.min(p.maxLives, p.lives + 1); // Corazón: +1 vida
    else if (type === "lightning") p.tripleUntil = now + 5000; // Rayo: disparo triple 5s
    else if (type === "shield") p.shield = Math.min(2, p.shield + 1); // Escudo: absorbe golpes
  }

  // Termina la oleada → pantalla "Oleada Superada"
  function finishWave(g) {
    g.paused = true;
    const xpGained = g.teamXp;
    pushHud(g);
    setWaveResult({ wave: g.wave, score: g.score, xp: xpGained });
    setPhase("waveclear");
  }

  // Avanza a la siguiente oleada
  const nextWave = useCallback(() => {
    const g = gRef.current; if (!g) return;
    // Pequeña recompensa: media vida (redondeada) para los supervivientes
    for (const p of g.players) if (p.isHuman && !p.dead && p.lives < p.maxLives && g.wave % 2 === 0) p.lives++;
    beginWave(g, g.wave + 1);
    g.paused = false;
    g.lastTime = performance.now();
    setWaveResult(null);
    setPhase("playing");
    if (g.waveCfg.boss) { setBossFlash(true); setTimeout(() => setBossFlash(false), 1800); sndExplosion(); }
  }, []);

  // Fin de partida → guarda puntaje y muestra ranking
  function endGame(g) {
    g.running = false;
    cancelAnimationFrame(rafRef.current);
    const finalScore = g.score;
    const prevBest = getLocalBest(GAME_KEY);
    const isRecord = finalScore > prevBest;
    setBest(Math.max(prevBest, finalScore));
    setOver({ score: finalScore, wave: g.wave, isRecord });
    setPhase("over");
    sndExplosion();
    // Envía al ranking mundial (conserva el mejor) y refresca el top
    submitScore(GAME_KEY, finalScore, getPlayerName()).then(() => refreshBoard());
  }

  // Empuja una instantánea ligera del estado al HUD de React
  function pushHud(g) {
    setHud({
      wave: g.wave,
      score: g.score,
      players: g.players.map((p) => ({
        name: p.isHuman ? (p.pIndex === 0 ? "P1" : "P2") : p.name,
        lives: p.lives, maxLives: p.maxLives, level: p.level, dead: p.dead,
        shield: p.shield, triple: g.elapsed * 1000 < p.tripleUntil,
        color: p.color.core, xp: p.xp, xpNext: p.level * 100,
      })),
    });
  }

  /* ════════════════════════════════════════════════════════════
     RENDER (Canvas 2D con glow, gradientes radiales y partículas)
     ════════════════════════════════════════════════════════════ */
  function render(ctx, g, dt) {
    const { W, H } = g;
    ctx.save();
    // Sacudida de pantalla al impactar
    if (g.shake > 0) ctx.translate((Math.random() - 0.5) * g.shake, (Math.random() - 0.5) * g.shake);

    // Fondo espacial oscuro con degradado
    const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.75);
    bg.addColorStop(0, "#0b1030");
    bg.addColorStop(0.6, "#070818");
    bg.addColorStop(1, "#03030a");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Estrellas parpadeantes
    for (const s of g.stars) {
      const a = 0.3 + 0.5 * (0.5 + 0.5 * Math.sin(g.gridT * s.sp + s.ph));
      ctx.globalAlpha = a;
      ctx.fillStyle = "#cfe8ff";
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.r, 0, 6.28);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Rejilla en perspectiva (suelo neón en movimiento)
    drawGrid(ctx, g);

    // Power-ups (con glow y símbolo)
    for (const pu of g.powerups) drawPowerup(ctx, pu);

    // Balas (estela + núcleo brillante)
    for (const b of g.bullets) {
      if (!b.active) continue;
      ctx.save();
      ctx.shadowBlur = 14; ctx.shadowColor = b.color;
      ctx.fillStyle = b.color;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 6.28); ctx.fill();
      ctx.restore();
    }

    // Partículas (explosiones / chispas)
    for (const p of g.particles) {
      if (!p.active) continue;
      const k = p.life / p.maxLife;
      ctx.globalAlpha = Math.max(0, k);
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size * k + 0.4, 0, 6.28); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Enemigos (bots con nombre, barra de vida y glow por nivel)
    for (const e of g.enemies) drawEnemy(ctx, e, g);

    // Jugadores humanos
    for (const p of g.players) if (p.isHuman) drawPlayer(ctx, p, g);

    ctx.restore();

    // Joystick táctil (posición fija en pantalla, fuera de la sacudida)
    if (g.touch && g.touch.active) {
      const R = 56;
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.strokeStyle = "#67e8f9"; ctx.lineWidth = 2.5; ctx.shadowBlur = 12; ctx.shadowColor = "#22d3ee";
      ctx.beginPath(); ctx.arc(g.touch.bx, g.touch.by, R, 0, 6.28); ctx.stroke();
      ctx.fillStyle = "rgba(103,232,249,0.6)";
      ctx.beginPath(); ctx.arc(g.touch.bx + g.touch.tvx * R, g.touch.by + g.touch.tvy * R, 24, 0, 6.28); ctx.fill();
      ctx.restore();
    }
  }

  function drawGrid(ctx, g) {
    const { W, H } = g;
    const horizon = H * 0.42;
    ctx.save();
    ctx.strokeStyle = "rgba(99,102,241,0.32)";
    ctx.lineWidth = 1;
    // Líneas que se alejan al horizonte
    for (let i = -10; i <= 10; i++) {
      ctx.beginPath();
      ctx.moveTo(W / 2 + i * (W / 16), H);
      ctx.lineTo(W / 2 + i * 14, horizon);
      ctx.stroke();
    }
    // Líneas horizontales que avanzan (parallax)
    const off = (g.gridT * 60) % 48;
    for (let y = horizon; y < H; y += 48) {
      const yy = y + off;
      const p = (yy - horizon) / (H - horizon);
      ctx.globalAlpha = 0.08 + p * 0.3;
      ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(W, yy); ctx.stroke();
    }
    ctx.restore();
  }

  function drawPowerup(ctx, pu) {
    const colors = { heart: "#fb7185", lightning: "#facc15", shield: "#38bdf8" };
    const icons = { heart: "♥", lightning: "⚡", shield: "🛡" };
    const col = colors[pu.type];
    const s = 18 + Math.sin(pu.pulse) * 2;
    ctx.save();
    ctx.translate(pu.x, pu.y);
    ctx.shadowBlur = 26; ctx.shadowColor = col;
    const grd = ctx.createRadialGradient(0, 0, 2, 0, 0, s);
    grd.addColorStop(0, "#fff"); grd.addColorStop(0.5, col); grd.addColorStop(1, col + "00");
    ctx.fillStyle = grd;
    ctx.beginPath(); ctx.arc(0, 0, s, 0, 6.28); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#0b0b18";
    ctx.font = "900 16px system-ui";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(icons[pu.type], 0, 1);
    ctx.restore();
  }

  function drawPlayer(ctx, p, g) {
    const now = g.elapsed * 1000;
    if (p.dead) {
      // Fantasma tenue de un jugador eliminado
      ctx.save(); ctx.globalAlpha = 0.18; ctx.fillStyle = p.color.core;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28); ctx.fill(); ctx.restore();
      return;
    }
    // Parpadeo durante la invencibilidad
    const blink = now < p.invUntil && Math.floor(now / 90) % 2 === 0;
    if (blink) return;

    ctx.save();
    ctx.translate(p.x, p.y);

    // Escudo activo
    if (p.shield > 0) {
      ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 3; ctx.shadowBlur = 18; ctx.shadowColor = "#38bdf8";
      ctx.beginPath(); ctx.arc(0, 0, p.r + 8 + Math.sin(g.elapsed * 6) * 2, 0, 6.28); ctx.stroke();
    }

    ctx.rotate(p.aim + Math.PI / 2);
    // Cuerpo: nave triangular con gradiente radial y glow
    ctx.shadowBlur = 22; ctx.shadowColor = p.color.glow;
    const grd = ctx.createRadialGradient(0, 0, 2, 0, 0, p.r + 6);
    grd.addColorStop(0, "#ffffff"); grd.addColorStop(0.4, p.color.core); grd.addColorStop(1, p.color.core + "22");
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.moveTo(0, -p.r - 4);
    ctx.lineTo(p.r, p.r);
    ctx.lineTo(0, p.r * 0.5);
    ctx.lineTo(-p.r, p.r);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Etiqueta del jugador (J1/J2) y nivel
    ctx.save();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#fff";
    ctx.font = "800 11px system-ui";
    ctx.textAlign = "center";
    const tag = (langRef.current === "es" ? (p.pIndex === 0 ? "J1" : "J2") : (p.pIndex === 0 ? "P1" : "P2")) + " · Nv" + p.level;
    ctx.fillText(tag, p.x, p.y - p.r - 12);
    // Mini-corazones de vida
    ctx.font = "10px system-ui";
    ctx.fillStyle = "#fb7185";
    let hearts = "";
    for (let i = 0; i < p.lives; i++) hearts += "♥";
    ctx.fillText(hearts, p.x, p.y - p.r - 24);
    ctx.restore();
  }

  function drawEnemy(ctx, e, g) {
    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.shadowBlur = e.boss ? 34 : 16;
    ctx.shadowColor = e.color;
    const grd = ctx.createRadialGradient(0, 0, 2, 0, 0, e.r + 4);
    grd.addColorStop(0, "#fff"); grd.addColorStop(0.45, e.color); grd.addColorStop(1, e.color + "11");
    ctx.fillStyle = grd;
    if (e.boss) {
      // Jefe: núcleo grande pulsante con anillo
      const pulse = 1 + Math.sin(g.elapsed * 6) * 0.05;
      ctx.beginPath(); ctx.arc(0, 0, e.r * pulse, 0, 6.28); ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.globalAlpha = 0.6;
      ctx.beginPath(); ctx.arc(0, 0, e.r + 8, 0, 6.28); ctx.stroke();
      ctx.globalAlpha = 1;
    } else {
      // Bot: rombo / diamante (estética dron)
      ctx.beginPath();
      ctx.moveTo(0, -e.r); ctx.lineTo(e.r, 0); ctx.lineTo(0, e.r); ctx.lineTo(-e.r, 0);
      ctx.closePath(); ctx.fill();
      // Ojo central
      ctx.shadowBlur = 0; ctx.fillStyle = "#0b0b18";
      ctx.beginPath(); ctx.arc(0, 0, e.r * 0.32, 0, 6.28); ctx.fill();
    }
    ctx.restore();

    // Nombre del bot sobre su cabeza + nivel
    ctx.save();
    ctx.shadowBlur = 0;
    ctx.fillStyle = e.boss ? "#ff8fc4" : "#e2e8f0";
    ctx.font = e.boss ? "900 13px system-ui" : "700 10px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(e.name + (e.boss ? "" : " ·Nv" + e.level), e.x, e.y - e.r - 10);
    // Barra de vida
    const bw = e.boss ? 120 : 30, hp = Math.max(0, e.hp / e.maxHp);
    ctx.fillStyle = "rgba(255,255,255,.18)";
    ctx.fillRect(e.x - bw / 2, e.y - e.r - 7, bw, 4);
    ctx.fillStyle = e.boss ? "#ff2d75" : "#4ade80";
    ctx.fillRect(e.x - bw / 2, e.y - e.r - 7, bw * hp, 4);
    ctx.restore();
  }

  /* ── Controles de teclado ── */
  useEffect(() => {
    const gameKeys = new Set(["KeyW", "KeyA", "KeyS", "KeyD", "Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter", "ShiftRight"]);
    const down = (ev) => {
      if (ev.code === "KeyR") { restart(); return; }
      if (ev.code === "Escape") { onClose?.(); return; }
      if (ev.code === "KeyP") { togglePause(); return; }
      const g = gRef.current;
      if (g && gameKeys.has(ev.code)) { g.keys.add(ev.code); ev.preventDefault(); }
    };
    const up = (ev) => { const g = gRef.current; if (g) g.keys.delete(ev.code); };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    resize();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
      const g = gRef.current; if (g) g.running = false;
      try { acRef.current?.close(); } catch {}
    };
  }, [resize]);

  const togglePause = () => {
    const g = gRef.current;
    if (!g || !g.running || phaseRef.current !== "playing") return;
    g.paused = !g.paused;
    if (!g.paused) g.lastTime = performance.now();
    setPaused(g.paused);
  };

  // phase en ref para los listeners de teclado
  const phaseRef = useRef(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const restart = () => {
    const g = gRef.current;
    cancelAnimationFrame(rafRef.current);
    if (g) g.running = false;
    setPhase("intro");
    setPaused(false);
    setWaveResult(null);
    setOver(null);
  };

  const saveName = () => {
    const clean = persistName(nameDraft);
    setSavedName(clean);
    setNameDraft(clean);
    // Reenvía el récord local con el nombre nuevo
    submitScore(GAME_KEY, getLocalBest(GAME_KEY), clean).then(() => refreshBoard());
  };

  /* ── Joystick táctil (y ratón): arrastra para mover al J1 ── */
  const JOY_R = 56;
  const onPointerDown = (e) => {
    const g = gRef.current;
    if (!g || !g.running || g.paused || phaseRef.current !== "playing") return;
    g.touch.active = true;
    g.touch.bx = e.clientX; g.touch.by = e.clientY;
    g.touch.tvx = 0; g.touch.tvy = 0;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
  };
  const onPointerMove = (e) => {
    const g = gRef.current;
    if (!g || !g.touch.active) return;
    const dx = e.clientX - g.touch.bx, dy = e.clientY - g.touch.by;
    const mag = Math.hypot(dx, dy);
    const k = mag > JOY_R ? JOY_R / mag : 1;
    // Vector analógico -1..1; si se arrastra más allá del radio, la base sigue al dedo
    g.touch.tvx = (dx * k) / JOY_R;
    g.touch.tvy = (dy * k) / JOY_R;
    if (mag > JOY_R) { g.touch.bx = e.clientX - (dx * JOY_R) / mag; g.touch.by = e.clientY - (dy * JOY_R) / mag; }
  };
  const onPointerUp = () => {
    const g = gRef.current; if (!g) return;
    g.touch.active = false; g.touch.tvx = 0; g.touch.tvy = 0;
  };

  /* ════════════════════════════════════════════════════════════
     INTERFAZ (overlays con glassmorphism / neón sobre el canvas)
     ════════════════════════════════════════════════════════════ */
  const neonBtn = {
    border: 0, borderRadius: 16, padding: "15px 26px", cursor: "pointer", fontWeight: 1000,
    fontSize: 16, color: "#06121f", letterSpacing: ".02em",
    background: "linear-gradient(135deg,#67e8f9,#a78bfa)", boxShadow: "0 12px 40px rgba(34,211,238,.32)",
  };
  const ghostBtn = {
    border: "1px solid rgba(255,255,255,.18)", borderRadius: 14, padding: "11px 18px", cursor: "pointer",
    fontWeight: 800, color: "#fff", background: "rgba(255,255,255,.06)", backdropFilter: "blur(8px)",
  };
  const chip = (active, accent) => ({
    border: active ? `1px solid ${accent}` : "1px solid rgba(255,255,255,.16)",
    borderRadius: 12, padding: "10px 16px", cursor: "pointer", fontWeight: 900, fontSize: 13,
    color: active ? "#06121f" : "#dbe4ff",
    background: active ? accent : "rgba(255,255,255,.05)",
    transition: "all .15s ease",
  });

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 130, background: "#03030a", color: "#fff", fontFamily: "Inter,system-ui,sans-serif", overflow: "hidden" }}>
      <style>{`
        @keyframes nra-blink { 0%,100%{opacity:1;text-shadow:0 0 18px #22d3ee,0 0 38px #a855f7} 50%{opacity:.55;text-shadow:0 0 8px #22d3ee} }
        @keyframes nra-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes nra-scan { 0%{transform:translateY(-100%)} 100%{transform:translateY(100%)} }
        @keyframes nra-pop { 0%{transform:scale(.7);opacity:0} 100%{transform:scale(1);opacity:1} }
      `}</style>

      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", touchAction: "none" }}
      />

      {/* Botones flotantes siempre disponibles */}
      <div style={{ position: "fixed", top: 14, right: 14, zIndex: 6, display: "flex", gap: 8 }}>
        {phase === "playing" && <button style={{ ...ghostBtn, padding: "9px 14px" }} onClick={togglePause}>{paused ? "▶" : "❚❚"}</button>}
        <button style={{ ...ghostBtn, padding: "9px 14px" }} onClick={restart} title={t.restart}>⟲</button>
        <button style={{ ...ghostBtn, padding: "9px 14px" }} onClick={onClose} title={t.exit}>✕</button>
      </div>

      {/* HUD superior durante el juego */}
      {phase === "playing" && (
        <>
          <div style={{ position: "fixed", top: 14, left: 14, zIndex: 5, display: "flex", gap: 10, alignItems: "stretch", flexWrap: "wrap", pointerEvents: "none" }}>
            <div style={glass()}>
              <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: ".16em", color: "#67e8f9" }}>{t.wave.toUpperCase()}</div>
              <div style={{ fontSize: 26, fontWeight: 1000, lineHeight: 1 }}>{hud.wave}</div>
            </div>
            <div style={glass()}>
              <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: ".16em", color: "#c4b5fd" }}>{t.score.toUpperCase()}</div>
              <div style={{ fontSize: 26, fontWeight: 1000, lineHeight: 1 }}>{hud.score.toLocaleString()}</div>
            </div>
          </div>

          {/* Tarjetas de cada jugador (vidas, nivel, power-ups) */}
          <div style={{ position: "fixed", bottom: 14, left: 14, zIndex: 5, display: "flex", gap: 10, pointerEvents: "none" }}>
            {hud.players.map((p, i) => (
              <div key={i} style={{ ...glass(), opacity: p.dead ? 0.45 : 1, borderColor: p.color }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 1000, color: p.color }}>{p.name}</span>
                  <span style={{ fontSize: 10, color: "#9aa6c4", fontWeight: 800 }}>{t.level}{p.level}</span>
                  {p.shield > 0 && <span style={{ fontSize: 11 }}>🛡{p.shield}</span>}
                  {p.triple && <span style={{ fontSize: 11 }}>⚡</span>}
                </div>
                <div style={{ fontSize: 15, marginTop: 3, letterSpacing: 1 }}>
                  {p.dead ? <span style={{ color: "#64748b", fontSize: 11, fontWeight: 900 }}>{t.eliminated}</span>
                    : Array.from({ length: p.maxLives }, (_, h) => <span key={h} style={{ opacity: h < p.lives ? 1 : 0.22 }}>{h < p.lives ? "❤️" : "🖤"}</span>)}
                </div>
                {!p.dead && <div style={{ marginTop: 5, width: "100%", height: 3, borderRadius: 3, background: "rgba(255,255,255,.12)", overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(100, (p.xp / p.xpNext) * 100)}%`, height: "100%", background: p.color }} />
                </div>}
              </div>
            ))}
          </div>

          {paused && (
            <div style={overlayCenter("rgba(3,3,12,.72)")}>
              <div style={{ textAlign: "center" }}>
                <h2 style={{ fontSize: "clamp(36px,9vw,72px)", letterSpacing: "-.04em", margin: 0 }}>{t.paused}</h2>
                <button style={{ ...neonBtn, marginTop: 22 }} onClick={togglePause}>{t.resume}</button>
              </div>
            </div>
          )}

          {bossFlash && (
            <div style={{ ...overlayCenter("transparent"), pointerEvents: "none" }}>
              <div style={{ textAlign: "center", animation: "nra-pop .3s ease" }}>
                <div style={{ fontSize: "clamp(40px,11vw,90px)", fontWeight: 1000, color: "#ff2d75", textShadow: "0 0 30px #ff2d75", letterSpacing: "-.04em" }}>{t.bossIncoming}</div>
                <div style={{ color: "#ffb3d1", fontWeight: 800, letterSpacing: ".2em" }}>{t.bossAlert.toUpperCase()}</div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── MENÚ PRINCIPAL ── */}
      {phase === "intro" && (
        <div style={{ ...overlayCenter("radial-gradient(circle at 50% 30%,rgba(79,70,229,.34),rgba(3,3,10,.92) 60%)"), overflowY: "auto" }}>
          <div style={{ width: "min(620px,100%)", textAlign: "center", padding: 24 }}>
            <div style={{ fontSize: 58, animation: "nra-float 3s ease-in-out infinite", filter: "drop-shadow(0 0 26px #22d3ee)" }}>🛸</div>
            <div style={{ color: "#67e8f9", fontSize: 12, fontWeight: 1000, letterSpacing: ".24em", marginTop: 4 }}>{t.tagline.toUpperCase()}</div>
            <h1 style={{ margin: "8px 0 14px", fontSize: "clamp(36px,9vw,76px)", lineHeight: .92, letterSpacing: "-.06em", animation: "nra-blink 1.6s ease-in-out infinite" }}>{t.title}</h1>
            <p style={{ maxWidth: 520, margin: "0 auto 22px", color: "#c8c5d6", lineHeight: 1.55, fontSize: 14 }}>{t.intro}</p>

            <div style={{ display: "grid", gap: 16, justifyItems: "center", marginBottom: 22 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: ".18em", color: "#a5b4fc", marginBottom: 8 }}>{t.players.toUpperCase()}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={chip(numPlayers === 1, "#22d3ee")} onClick={() => setNumPlayers(1)}>{t.onePlayer}</button>
                  <button style={chip(numPlayers === 2, "#a3e635")} onClick={() => setNumPlayers(2)}>{t.twoPlayers}</button>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: ".18em", color: "#a5b4fc", marginBottom: 8 }}>{t.difficulty.toUpperCase()}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={chip(diff === "easy", "#4ade80")} onClick={() => setDiff("easy")}>{t.easy}</button>
                  <button style={chip(diff === "normal", "#facc15")} onClick={() => setDiff("normal")}>{t.normal}</button>
                  <button style={chip(diff === "hard", "#fb7185")} onClick={() => setDiff("hard")}>{t.hard}</button>
                </div>
              </div>
            </div>

            <button style={{ ...neonBtn, fontSize: 17, padding: "17px 32px" }} onClick={() => startGame(numPlayers, diff)}>{t.start}</button>

            <div style={{ marginTop: 22, fontSize: 12, color: "#94a3c8", lineHeight: 1.8 }}>
              <div style={{ fontWeight: 900, color: "#cbd5f5", letterSpacing: ".1em", marginBottom: 4 }}>{t.controlsTitle.toUpperCase()}</div>
              <div>{t.touchControls}</div>
              <div>{t.p1Controls}</div>
              {numPlayers === 2 && <div>{t.p2Controls}</div>}
              <div style={{ color: "#67e8f9", marginTop: 4 }}>{t.autoaim}</div>
            </div>
            <div style={{ marginTop: 16, color: "#a5b4fc", fontSize: 12, fontWeight: 800 }}>🏆 {t.best}: {best.toLocaleString()}</div>
          </div>
        </div>
      )}

      {/* ── OLEADA SUPERADA ── */}
      {phase === "waveclear" && waveResult && (
        <div style={overlayCenter("rgba(3,6,18,.84)")}>
          <div style={{ ...card(), animation: "nra-pop .3s ease" }}>
            <div style={{ color: "#4ade80", fontSize: 12, fontWeight: 1000, letterSpacing: ".2em" }}>{t.waveClear}</div>
            <h2 style={{ margin: "8px 0 2px", fontSize: "clamp(40px,10vw,68px)", letterSpacing: "-.05em" }}>{t.wave} {waveResult.wave}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin: "22px 0" }}>
              <div style={stat()}><strong style={{ fontSize: 24 }}>{waveResult.score.toLocaleString()}</strong><span style={statLbl()}>{t.score}</span></div>
              <div style={stat()}><strong style={{ fontSize: 24, color: "#67e8f9" }}>+{waveResult.xp}</strong><span style={statLbl()}>{t.xpGained}</span></div>
            </div>
            <button style={neonBtn} onClick={nextWave}>{t.nextWave} →</button>
          </div>
        </div>
      )}

      {/* ── GAME OVER + RANKING ── */}
      {phase === "over" && over && (
        <div style={{ ...overlayCenter("rgba(3,4,12,.88)"), overflowY: "auto" }}>
          <div style={{ ...card(560), animation: "nra-pop .3s ease" }}>
            <div style={{ color: over.isRecord ? "#facc15" : "#fb7185", fontSize: 12, fontWeight: 1000, letterSpacing: ".2em" }}>
              {over.isRecord ? t.newRecord : t.gameOver}
            </div>
            <h2 style={{ margin: "8px 0 2px", fontSize: "clamp(46px,12vw,76px)", letterSpacing: "-.05em" }}>{over.score.toLocaleString()}</h2>
            <div style={{ color: "#a5b4fc", fontWeight: 800, fontSize: 13 }}>{t.finalScore} · {t.wave} {over.wave}</div>

            {/* Ranking mundial */}
            <div style={{ margin: "20px 0", textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <strong style={{ fontSize: 13, letterSpacing: ".14em", color: "#cbd5f5" }}>🏆 {leaderboardEnabled ? t.ranking.toUpperCase() : t.rankLocal.toUpperCase()}</strong>
              </div>
              {leaderboardEnabled ? (
                board === null ? <div style={{ color: "#94a3c8", fontSize: 13, padding: "8px 0" }}>…</div>
                  : board.length === 0 ? <div style={{ color: "#94a3c8", fontSize: 13, padding: "8px 0" }}>{t.empty}</div>
                    : <div style={{ maxHeight: 190, overflowY: "auto", display: "grid", gap: 4 }}>
                      {board.slice(0, 20).map((row, i) => (
                        <div key={row.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 11px", borderRadius: 10, background: i < 3 ? "rgba(250,204,21,.12)" : "rgba(255,255,255,.04)", fontSize: 13 }}>
                          <span style={{ width: 22, fontWeight: 1000, color: i === 0 ? "#facc15" : i === 1 ? "#cbd5e1" : i === 2 ? "#fb923c" : "#7c8bb0" }}>{i + 1}</span>
                          <span style={{ flex: 1, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.name || t.you}</span>
                          <span style={{ fontWeight: 900, color: "#67e8f9" }}>{row.score.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
              ) : (
                <div style={{ color: "#94a3c8", fontSize: 13 }}>{t.rankOffline} · {t.best}: {best.toLocaleString()}</div>
              )}
            </div>

            {/* Guardar nombre para competir */}
            {leaderboardEnabled && (
              <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
                <input
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  maxLength={16}
                  placeholder={t.namePh}
                  style={{ flex: 1, border: "1px solid rgba(255,255,255,.16)", borderRadius: 12, padding: "12px 14px", background: "rgba(255,255,255,.05)", color: "#fff", fontWeight: 700, fontSize: 14, outline: "none" }}
                />
                <button style={{ ...ghostBtn, fontWeight: 900 }} onClick={saveName} disabled={!nameDraft.trim()}>{t.save}</button>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button style={neonBtn} onClick={() => startGame(numPlayers, diff)}>{t.playAgain}</button>
              <button style={ghostBtn} onClick={onClose}>{t.exit}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Estilos auxiliares (glassmorphism) ── */
function glass() {
  return {
    padding: "9px 14px", borderRadius: 14, border: "1px solid rgba(255,255,255,.14)",
    background: "rgba(12,14,30,.55)", backdropFilter: "blur(10px)", minWidth: 70,
  };
}
function overlayCenter(bg) {
  return { position: "fixed", inset: 0, zIndex: 7, display: "grid", placeItems: "center", padding: 18, background: bg };
}
function card(w = 460) {
  return {
    width: `min(${w}px,100%)`, padding: 26, textAlign: "center", borderRadius: 26,
    border: "1px solid rgba(255,255,255,.12)",
    background: "linear-gradient(180deg,rgba(28,26,66,.96),rgba(8,8,20,.97))",
    boxShadow: "0 30px 90px rgba(0,0,0,.55)",
  };
}
function stat() {
  return { padding: 14, borderRadius: 14, background: "rgba(255,255,255,.06)", display: "grid", gap: 2 };
}
function statLbl() {
  return { fontSize: 11, color: "#9aa6c4", fontWeight: 700 };
}
