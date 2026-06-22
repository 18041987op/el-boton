import React, { useCallback, useEffect, useRef, useState } from "react";

const BEST_KEY = "elboton_neon_escape_best_v1";
const LANES = [-1, 0, 1];

const copy = {
  es: {
    title: "NEON ESCAPE",
    subtitle: "Corre. Esquiva. Sobrevive.",
    intro: "Cambia de carril, esquiva amenazas y recoge energía. Los roces perfectos aumentan tu multiplicador.",
    start: "INICIAR ESCAPE",
    retry: "OTRA PARTIDA",
    exit: "Salir",
    score: "Puntos",
    distance: "Distancia",
    best: "Récord",
    combo: "Combo",
    shield: "ESCUDO",
    slow: "TIEMPO LENTO",
    gameOver: "ESCAPE FALLIDO",
    controls: "Desliza, toca los lados o usa ← →",
    newBest: "NUEVO RÉCORD",
  },
  en: {
    title: "NEON ESCAPE",
    subtitle: "Run. Dodge. Survive.",
    intro: "Switch lanes, dodge threats and collect energy. Perfect near misses raise your multiplier.",
    start: "START ESCAPE",
    retry: "RUN AGAIN",
    exit: "Exit",
    score: "Score",
    distance: "Distance",
    best: "Best",
    combo: "Combo",
    shield: "SHIELD",
    slow: "SLOW TIME",
    gameOver: "ESCAPE FAILED",
    controls: "Swipe, tap the sides or use ← →",
    newBest: "NEW RECORD",
  },
};

function beep(freq = 440, duration = 0.08, volume = 0.06) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

function loadBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY) || 0);
  } catch {
    return 0;
  }
}

export default function NeonEscape({ lang = "es", onClose }) {
  const t = copy[lang];
  const canvasRef = useRef(null);
  const frameRef = useRef(0);
  const stateRef = useRef(null);
  const touchRef = useRef(null);
  const [phase, setPhase] = useState("intro");
  const [hud, setHud] = useState({ score: 0, distance: 0, combo: 1, shield: 0, slow: 0 });
  const [best, setBest] = useState(loadBest);
  const [result, setResult] = useState(null);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (stateRef.current) {
      stateRef.current.width = rect.width;
      stateRef.current.height = rect.height;
    }
  }, []);

  const move = useCallback((direction) => {
    const game = stateRef.current;
    if (!game || !game.running) return;
    const next = Math.max(-1, Math.min(1, game.playerLane + direction));
    if (next !== game.playerLane) {
      game.playerLane = next;
      game.targetLane = next;
      beep(460 + (next + 1) * 80, 0.045, 0.035);
    }
  }, []);

  const finish = useCallback(() => {
    const game = stateRef.current;
    if (!game || !game.running) return;
    game.running = false;
    cancelAnimationFrame(frameRef.current);
    navigator.vibrate?.([90, 45, 130]);
    beep(100, 0.28, 0.08);
    const finalScore = Math.round(game.score);
    const finalDistance = Math.round(game.distance);
    const nextBest = Math.max(best, finalScore);
    if (nextBest > best) {
      setBest(nextBest);
      try { localStorage.setItem(BEST_KEY, String(nextBest)); } catch {}
    }
    setResult({ score: finalScore, distance: finalDistance, newBest: nextBest > best });
    setHud({ score: finalScore, distance: finalDistance, combo: game.combo, shield: 0, slow: 0 });
    setPhase("over");
  }, [best]);

  const spawnObject = (game) => {
    const difficulty = Math.min(1, game.elapsed / 90000);
    const roll = Math.random();
    let type = "barrier";
    if (roll > 0.76) type = "drone";
    if (roll > 0.91) type = "laser";
    if (roll < 0.13) type = "energy";
    if (roll > 0.965) type = Math.random() > 0.5 ? "shield" : "slow";
    const lane = LANES[Math.floor(Math.random() * LANES.length)];
    game.objects.push({
      id: game.nextId++,
      type,
      lane,
      y: -80,
      speed: 250 + difficulty * 190 + Math.random() * 55,
      passed: false,
      pulse: Math.random() * Math.PI * 2,
    });
  };

  const draw = (ctx, game) => {
    const { width: w, height: h } = game;
    ctx.clearRect(0, 0, w, h);

    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, "#050816");
    bg.addColorStop(0.55, "#11103a");
    bg.addColorStop(1, "#05050b");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const horizon = h * 0.18;
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = "#22d3ee";
    ctx.lineWidth = 1;
    for (let i = -5; i <= 5; i++) {
      const xBottom = w / 2 + i * (w / 5);
      ctx.beginPath();
      ctx.moveTo(w / 2, horizon);
      ctx.lineTo(xBottom, h);
      ctx.stroke();
    }
    const gridOffset = (game.distance * 7) % 42;
    for (let y = horizon + gridOffset; y < h; y += 42) {
      const p = (y - horizon) / (h - horizon);
      ctx.globalAlpha = 0.12 + p * 0.32;
      ctx.beginPath();
      ctx.moveTo(w * (0.5 - p * 0.7), y);
      ctx.lineTo(w * (0.5 + p * 0.7), y);
      ctx.stroke();
    }
    ctx.restore();

    const laneX = (lane) => w / 2 + lane * Math.min(120, w * 0.26);
    const playerY = h - 92;

    game.objects.forEach((obj) => {
      const x = laneX(obj.lane);
      const scale = 0.75 + Math.min(0.45, obj.y / h * 0.45);
      ctx.save();
      ctx.translate(x, obj.y);
      ctx.scale(scale, scale);
      obj.pulse += 0.08;
      if (obj.type === "energy") {
        ctx.shadowBlur = 22;
        ctx.shadowColor = "#fde047";
        ctx.fillStyle = "#fde047";
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = i * Math.PI / 3;
          const r = i % 2 ? 12 : 21;
          ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.fill();
      } else if (obj.type === "shield" || obj.type === "slow") {
        ctx.shadowBlur = 26;
        ctx.shadowColor = obj.type === "shield" ? "#38bdf8" : "#c084fc";
        ctx.fillStyle = obj.type === "shield" ? "#38bdf8" : "#c084fc";
        ctx.beginPath();
        ctx.arc(0, 0, 22 + Math.sin(obj.pulse) * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#07111f";
        ctx.font = "900 19px system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(obj.type === "shield" ? "S" : "T", 0, 1);
      } else if (obj.type === "laser") {
        ctx.shadowBlur = 18;
        ctx.shadowColor = "#f43f5e";
        ctx.fillStyle = "#f43f5e";
        ctx.fillRect(-42, -8, 84, 16);
        ctx.fillStyle = "#fff";
        ctx.fillRect(-32, -2, 64, 4);
      } else if (obj.type === "drone") {
        ctx.shadowBlur = 16;
        ctx.shadowColor = "#a855f7";
        ctx.fillStyle = "#a855f7";
        ctx.beginPath();
        ctx.moveTo(0, -26); ctx.lineTo(31, 0); ctx.lineTo(0, 25); ctx.lineTo(-31, 0); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.fillRect(-6, -3, 12, 6);
      } else {
        ctx.shadowBlur = 14;
        ctx.shadowColor = "#fb7185";
        ctx.fillStyle = "#fb7185";
        ctx.fillRect(-34, -25, 68, 50);
        ctx.fillStyle = "#111827";
        ctx.fillRect(-24, -15, 48, 30);
      }
      ctx.restore();
    });

    game.playerVisual += (game.targetLane - game.playerVisual) * 0.22;
    const px = laneX(game.playerVisual);
    ctx.save();
    ctx.translate(px, playerY);
    if (game.shield > 0) {
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 4;
      ctx.shadowBlur = 24;
      ctx.shadowColor = "#38bdf8";
      ctx.beginPath();
      ctx.arc(0, 0, 35 + Math.sin(game.elapsed / 100) * 3, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.shadowBlur = 24;
    ctx.shadowColor = "#22d3ee";
    ctx.fillStyle = "#22d3ee";
    ctx.beginPath();
    ctx.moveTo(0, -28); ctx.lineTo(24, 22); ctx.lineTo(0, 13); ctx.lineTo(-24, 22); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(0, -16); ctx.lineTo(8, 8); ctx.lineTo(-8, 8); ctx.closePath(); ctx.fill();
    ctx.restore();

    if (game.flash > 0) {
      ctx.fillStyle = `rgba(255,255,255,${game.flash})`;
      ctx.fillRect(0, 0, w, h);
    }
  };

  const startGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const game = {
      running: true,
      width: rect.width,
      height: rect.height,
      playerLane: 0,
      targetLane: 0,
      playerVisual: 0,
      objects: [],
      nextId: 1,
      elapsed: 0,
      distance: 0,
      score: 0,
      combo: 1,
      shield: 0,
      slow: 0,
      spawnClock: 0,
      flash: 0,
      lastHud: 0,
      lastTime: performance.now(),
    };
    stateRef.current = game;
    setHud({ score: 0, distance: 0, combo: 1, shield: 0, slow: 0 });
    setResult(null);
    setPhase("playing");
    beep(520, 0.08, 0.05);

    const ctx = canvas.getContext("2d");
    const loop = (now) => {
      if (!game.running) return;
      const rawDt = Math.min(0.034, (now - game.lastTime) / 1000);
      game.lastTime = now;
      const timeScale = game.slow > 0 ? 0.58 : 1;
      const dt = rawDt * timeScale;
      game.elapsed += rawDt * 1000;
      game.distance += dt * (12 + game.elapsed / 9000);
      game.score += dt * 22 * game.combo;
      game.spawnClock -= rawDt * 1000;
      game.shield = Math.max(0, game.shield - rawDt * 1000);
      game.slow = Math.max(0, game.slow - rawDt * 1000);
      game.flash = Math.max(0, game.flash - rawDt * 2.8);

      const spawnEvery = Math.max(330, 880 - game.elapsed / 190);
      if (game.spawnClock <= 0) {
        spawnObject(game);
        game.spawnClock = spawnEvery;
      }

      const playerY = game.height - 92;
      const hitWindow = 34;
      game.objects.forEach((obj) => {
        obj.y += obj.speed * dt;
        const sameLane = obj.lane === game.playerLane;
        const dy = Math.abs(obj.y - playerY);
        const collectible = ["energy", "shield", "slow"].includes(obj.type);
        if (!obj.passed && sameLane && dy < hitWindow) {
          obj.passed = true;
          if (collectible) {
            if (obj.type === "energy") {
              game.score += 120 * game.combo;
              game.combo = Math.min(8, game.combo + 0.5);
              beep(940, 0.06, 0.045);
            } else if (obj.type === "shield") {
              game.shield = 7000;
              beep(620, 0.12, 0.055);
            } else {
              game.slow = 5500;
              beep(340, 0.14, 0.05);
            }
            game.flash = 0.12;
          } else if (game.shield > 0) {
            game.shield = 0;
            game.combo = 1;
            game.flash = 0.35;
            navigator.vibrate?.(45);
            beep(170, 0.16, 0.07);
          } else {
            finish();
          }
        }
        if (!obj.passed && obj.y > playerY + hitWindow) {
          obj.passed = true;
          if (!collectible && Math.abs(obj.lane - game.playerLane) === 1) {
            game.combo = Math.min(8, game.combo + 0.25);
            game.score += 35 * game.combo;
          }
        }
      });
      game.objects = game.objects.filter((obj) => obj.y < game.height + 100 && !(obj.passed && ["energy", "shield", "slow"].includes(obj.type)));

      if (now - game.lastHud > 120) {
        game.lastHud = now;
        setHud({
          score: Math.round(game.score),
          distance: Math.round(game.distance),
          combo: Math.max(1, Math.floor(game.combo * 10) / 10),
          shield: Math.ceil(game.shield / 1000),
          slow: Math.ceil(game.slow / 1000),
        });
      }

      draw(ctx, game);
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
  }, [finish]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    const key = (event) => {
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") move(-1);
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") move(1);
    };
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("keydown", key);
      cancelAnimationFrame(frameRef.current);
      if (stateRef.current) stateRef.current.running = false;
    };
  }, [move, resizeCanvas]);

  const handlePointerDown = (event) => {
    touchRef.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerUp = (event) => {
    const start = touchRef.current;
    if (!start || phase !== "playing") return;
    const dx = event.clientX - start.x;
    if (Math.abs(dx) > 28) move(dx > 0 ? 1 : -1);
    else {
      const rect = event.currentTarget.getBoundingClientRect();
      move(event.clientX < rect.left + rect.width / 2 ? -1 : 1);
    }
    touchRef.current = null;
  };

  return <div style={{ position: "fixed", inset: 0, zIndex: 120, background: "#05050b", color: "white", fontFamily: "Inter,system-ui,sans-serif" }}>
    <canvas ref={canvasRef} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} style={{ width: "100%", height: "100%", display: "block", touchAction: "none" }}/>

    <button onClick={onClose} aria-label={t.exit} style={{ position: "fixed", top: 16, right: 16, width: 42, height: 42, zIndex: 3, border: "1px solid rgba(255,255,255,.18)", borderRadius: 999, color: "white", background: "rgba(0,0,0,.45)", backdropFilter: "blur(10px)", cursor: "pointer", fontSize: 18 }}>✕</button>

    {phase === "playing" && <div style={{ position: "fixed", inset: "16px auto auto 16px", zIndex: 3, display: "grid", gap: 7, pointerEvents: "none" }}>
      <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: ".16em", color: "#67e8f9" }}>{t.title}</div>
      <div style={{ fontSize: "clamp(28px,6vw,46px)", fontWeight: 1000, lineHeight: 1 }}>{hud.score.toLocaleString()}</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: 11, fontWeight: 900 }}>
        <span style={{ padding: "6px 9px", borderRadius: 999, background: "rgba(255,255,255,.09)" }}>{hud.distance} m</span>
        <span style={{ padding: "6px 9px", borderRadius: 999, background: "rgba(168,85,247,.28)", color: "#e9d5ff" }}>x{hud.combo}</span>
        {hud.shield > 0 && <span style={{ padding: "6px 9px", borderRadius: 999, background: "rgba(56,189,248,.25)", color: "#7dd3fc" }}>🛡 {hud.shield}s</span>}
        {hud.slow > 0 && <span style={{ padding: "6px 9px", borderRadius: 999, background: "rgba(192,132,252,.25)", color: "#d8b4fe" }}>⏳ {hud.slow}s</span>}
      </div>
    </div>}

    {phase === "intro" && <div style={{ position: "fixed", inset: 0, zIndex: 2, display: "grid", placeItems: "center", padding: 24, background: "radial-gradient(circle at 50% 35%,rgba(79,70,229,.32),rgba(5,5,11,.9) 55%)" }}>
      <div style={{ width: "min(560px,100%)", textAlign: "center" }}>
        <div style={{ fontSize: 72, filter: "drop-shadow(0 0 25px #22d3ee)" }}>🚀</div>
        <div style={{ color: "#67e8f9", fontSize: 12, fontWeight: 1000, letterSpacing: ".22em" }}>{t.subtitle.toUpperCase()}</div>
        <h1 style={{ margin: "9px 0 14px", fontSize: "clamp(46px,12vw,82px)", lineHeight: .9, letterSpacing: "-.07em" }}>{t.title}</h1>
        <p style={{ maxWidth: 500, margin: "0 auto 12px", color: "#c8c5d6", lineHeight: 1.55 }}>{t.intro}</p>
        <p style={{ margin: "0 0 26px", color: "#7dd3fc", fontSize: 12, fontWeight: 800 }}>{t.controls}</p>
        <button onClick={startGame} style={{ border: 0, borderRadius: 18, padding: "16px 28px", cursor: "pointer", color: "#07111f", background: "linear-gradient(135deg,#67e8f9,#a78bfa)", boxShadow: "0 14px 45px rgba(34,211,238,.28)", fontWeight: 1000, fontSize: 16 }}>{t.start}</button>
        <div style={{ marginTop: 18, color: "#a5b4fc", fontSize: 12, fontWeight: 800 }}>{t.best}: {best.toLocaleString()}</div>
      </div>
    </div>}

    {phase === "over" && result && <div style={{ position: "fixed", inset: 0, zIndex: 2, display: "grid", placeItems: "center", padding: 24, background: "rgba(4,4,12,.82)", backdropFilter: "blur(12px)" }}>
      <div style={{ width: "min(500px,100%)", padding: 28, textAlign: "center", border: "1px solid rgba(255,255,255,.12)", borderRadius: 28, background: "linear-gradient(180deg,rgba(30,27,75,.95),rgba(8,8,18,.96))", boxShadow: "0 28px 90px rgba(0,0,0,.5)" }}>
        <div style={{ color: result.newBest ? "#fde047" : "#fb7185", fontSize: 12, fontWeight: 1000, letterSpacing: ".18em" }}>{result.newBest ? t.newBest : t.gameOver}</div>
        <h2 style={{ margin: "9px 0 4px", fontSize: "clamp(48px,12vw,76px)", letterSpacing: "-.06em" }}>{result.score.toLocaleString()}</h2>
        <div style={{ color: "#a5b4fc", fontWeight: 800 }}>{t.score}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, margin: "24px 0" }}>
          <div style={{ padding: 14, borderRadius: 16, background: "rgba(255,255,255,.06)" }}><strong style={{ display: "block", fontSize: 24 }}>{result.distance} m</strong><span style={{ fontSize: 11, color: "#aaa7b8" }}>{t.distance}</span></div>
          <div style={{ padding: 14, borderRadius: 16, background: "rgba(255,255,255,.06)" }}><strong style={{ display: "block", fontSize: 24 }}>{best.toLocaleString()}</strong><span style={{ fontSize: 11, color: "#aaa7b8" }}>{t.best}</span></div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={startGame} style={{ border: 0, borderRadius: 16, padding: "14px 20px", cursor: "pointer", color: "#07111f", background: "linear-gradient(135deg,#67e8f9,#a78bfa)", fontWeight: 1000 }}>{t.retry}</button>
          <button onClick={onClose} style={{ border: "1px solid rgba(255,255,255,.14)", borderRadius: 16, padding: "14px 20px", cursor: "pointer", color: "white", background: "rgba(255,255,255,.06)", fontWeight: 900 }}>{t.exit}</button>
        </div>
      </div>
    </div>}
  </div>;
}
