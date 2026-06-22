import React, { useEffect, useState } from "react";

const shell = {
  overlay: { position: "fixed", inset: 0, zIndex: 115, display: "grid", placeItems: "center", padding: 18, background: "rgba(5,5,14,.95)", color: "white", fontFamily: "Inter,system-ui,sans-serif" },
  card: { width: "min(720px,100%)", minHeight: 560, display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: 28, border: "1px solid rgba(255,255,255,.12)", background: "linear-gradient(180deg,#17172b,#080812)", boxShadow: "0 30px 90px rgba(0,0,0,.55)" },
  top: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "17px 19px", borderBottom: "1px solid rgba(255,255,255,.08)" },
  close: { width: 40, height: 40, border: 0, borderRadius: 999, cursor: "pointer", color: "white", background: "rgba(255,255,255,.09)", fontSize: 18 },
  body: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" },
  action: { border: 0, borderRadius: 16, padding: "14px 21px", cursor: "pointer", fontWeight: 900, background: "white", color: "#12111a" },
};

function tone(freq = 440, duration = .08, volume = .06) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + duration);
    osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + duration);
  } catch {}
}

function GameShell({ title, subtitle, onClose, children }) {
  return <div style={shell.overlay}>
    <div style={shell.card}>
      <div style={shell.top}>
        <div><strong style={{ fontSize: 20 }}>{title}</strong><div style={{ fontSize: 12, color: "#aaa7b8", marginTop: 3 }}>{subtitle}</div></div>
        <button style={shell.close} onClick={onClose}>✕</button>
      </div>
      <div style={shell.body}>{children}</div>
    </div>
  </div>;
}

export function ClassicButtonGame({ lang, onClose }) {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [time, setTime] = useState(30);
  const [running, setRunning] = useState(false);
  const [best, setBest] = useState(() => Number(localStorage.getItem("elboton_classic_best") || 0));
  const t = lang === "es" ? { title: "El Botón", sub: "Toca, encadena combos y supera tu récord.", start: "Empezar", again: "Otra vez", score: "Puntos", best: "Récord" } : { title: "The Button", sub: "Tap, chain combos and beat your record.", start: "Start", again: "Again", score: "Score", best: "Best" };
  useEffect(() => { if (!running) return; const id = setInterval(() => setTime((v) => v <= 1 ? 0 : v - 1), 1000); return () => clearInterval(id); }, [running]);
  useEffect(() => { if (running && time === 0) { setRunning(false); if (score > best) { setBest(score); localStorage.setItem("elboton_classic_best", String(score)); } } }, [time, running, score, best]);
  const start = () => { setScore(0); setCombo(1); setTime(30); setRunning(true); };
  const tap = () => { if (!running) return; const nextCombo = Math.min(12, combo + .25); setCombo(nextCombo); setScore((s) => s + Math.round(10 * nextCombo)); tone(360 + nextCombo * 45, .05); navigator.vibrate?.(8); };
  return <GameShell title={t.title} subtitle={t.sub} onClose={onClose}>
    <div style={{ display: "flex", gap: 10, marginBottom: 22, flexWrap: "wrap", justifyContent: "center", fontWeight: 900 }}><span>{time}s</span><span>{t.score}: {score}</span><span>x{combo.toFixed(1)}</span><span>{t.best}: {best}</span></div>
    <button onClick={tap} disabled={!running} style={{ width: "min(310px,70vw)", height: "min(310px,70vw)", border: 0, borderRadius: "50%", cursor: running ? "pointer" : "default", color: "white", fontSize: "clamp(38px,12vw,72px)", fontWeight: 1000, background: "radial-gradient(circle at 35% 28%,#fff,#fb7185 36%,#7c3aed 72%)", boxShadow: "0 0 65px rgba(236,72,153,.48)", transform: running ? `scale(${1 + Math.min(.08, combo / 120)})` : "scale(.92)", transition: "transform .08s ease" }}>●</button>
    <button style={{ ...shell.action, marginTop: 24 }} onClick={start}>{running ? t.score : score ? t.again : t.start}</button>
  </GameShell>;
}

export function BalloonPopGame({ lang, onClose }) {
  const [running, setRunning] = useState(false), [time, setTime] = useState(25), [score, setScore] = useState(0), [level, setLevel] = useState(1), [balloons, setBalloons] = useState([]);
  const t = lang === "es" ? { title: "Globos", sub: "Explota todos antes de que escapen.", start: "Empezar", again: "Otra vez" } : { title: "Balloons", sub: "Pop them before they escape.", start: "Start", again: "Again" };
  useEffect(() => { if (!running) return; const id = setInterval(() => setTime((v) => v <= 1 ? 0 : v - 1), 1000); return () => clearInterval(id); }, [running]);
  useEffect(() => { if (!running) return; const id = setInterval(() => setBalloons((b) => [...b.slice(-9), { id: Date.now() + Math.random(), x: 8 + Math.random() * 78, y: 15 + Math.random() * 62, s: 46 + Math.random() * 28 }]), Math.max(360, 850 - level * 70)); return () => clearInterval(id); }, [running, level]);
  useEffect(() => { if (time === 0) setRunning(false); }, [time]);
  const start = () => { setRunning(true); setTime(25); setScore(0); setLevel(1); setBalloons([]); };
  const pop = (id) => { tone(520 + Math.random() * 300, .05); setBalloons((b) => b.filter((x) => x.id !== id)); setScore((s) => { const n = s + 1; if (n % 10 === 0) setLevel((l) => l + 1); return n; }); };
  return <GameShell title={t.title} subtitle={t.sub} onClose={onClose}>
    <div style={{ width: "100%", display: "flex", justifyContent: "space-between", marginBottom: 12, fontWeight: 900 }}><span>{time}s</span><span>🎈 {score}</span><span>Lv {level}</span></div>
    <div style={{ position: "relative", width: "100%", height: 360, borderRadius: 24, overflow: "hidden", background: "linear-gradient(180deg,#172554,#4c1d95)" }}>{balloons.map((b) => <button key={b.id} onClick={() => pop(b.id)} style={{ position: "absolute", left: `${b.x}%`, top: `${b.y}%`, width: b.s, height: b.s * 1.18, border: 0, borderRadius: "50% 50% 45% 45%", cursor: "pointer", background: "radial-gradient(circle at 32% 26%,#fff,#fb7185 35%,#e11d48)", boxShadow: "0 9px 20px rgba(0,0,0,.3)" }}/>)}</div>
    <button style={{ ...shell.action, marginTop: 18 }} onClick={start}>{running ? "..." : score ? t.again : t.start}</button>
  </GameShell>;
}

export function MelodyCatchGame({ lang, onClose }) {
  const notes = ["♪", "♫", "♩", "♬"];
  const [running, setRunning] = useState(false), [time, setTime] = useState(30), [score, setScore] = useState(0), [items, setItems] = useState([]), [combo, setCombo] = useState(1);
  const t = lang === "es" ? { title: "Melodías", sub: "Atrapa notas y mantén el ritmo.", start: "Empezar", again: "Otra vez" } : { title: "Melodies", sub: "Catch notes and keep the rhythm.", start: "Start", again: "Again" };
  useEffect(() => { if (!running) return; const id = setInterval(() => setTime((v) => v <= 1 ? 0 : v - 1), 1000); return () => clearInterval(id); }, [running]);
  useEffect(() => { if (!running) return; const id = setInterval(() => setItems((b) => [...b.slice(-11), { id: Date.now() + Math.random(), glyph: notes[Math.floor(Math.random() * notes.length)], x: 8 + Math.random() * 82, y: 12 + Math.random() * 70, tone: 260 + Math.random() * 500 }]), 620); return () => clearInterval(id); }, [running]);
  useEffect(() => { if (time === 0) setRunning(false); }, [time]);
  const start = () => { setRunning(true); setTime(30); setScore(0); setCombo(1); setItems([]); };
  const hit = (note) => { tone(note.tone, .08); setItems((b) => b.filter((x) => x.id !== note.id)); setCombo((c) => Math.min(8, c + .25)); setScore((s) => s + Math.round(12 * combo)); };
  return <GameShell title={t.title} subtitle={t.sub} onClose={onClose}>
    <div style={{ width: "100%", display: "flex", justifyContent: "space-between", marginBottom: 12, fontWeight: 900 }}><span>{time}s</span><span>{score} pts</span><span>x{combo.toFixed(1)}</span></div>
    <div style={{ position: "relative", width: "100%", height: 360, borderRadius: 24, overflow: "hidden", background: "radial-gradient(circle at 50% 20%,#064e3b,#0f172a)" }}>{items.map((n) => <button key={n.id} onClick={() => hit(n)} style={{ position: "absolute", left: `${n.x}%`, top: `${n.y}%`, width: 58, height: 58, border: 0, borderRadius: "50%", cursor: "pointer", color: "white", fontSize: 36, background: "radial-gradient(circle,#34d399,#0ea5e9)", boxShadow: "0 0 28px rgba(14,165,233,.6)" }}>{n.glyph}</button>)}</div>
    <button style={{ ...shell.action, marginTop: 18 }} onClick={start}>{running ? "..." : score ? t.again : t.start}</button>
  </GameShell>;
}

export function DinoSurvivalGame({ lang, onClose }) {
  const [running, setRunning] = useState(false), [lane, setLane] = useState(1), [time, setTime] = useState(0), [score, setScore] = useState(0), [rocks, setRocks] = useState([]), [over, setOver] = useState(false);
  const t = lang === "es" ? { title: "Dino", sub: "Cambia de carril y sobrevive a la lluvia de meteoritos.", start: "Empezar", again: "Revivir" } : { title: "Dino", sub: "Switch lanes and survive the meteor storm.", start: "Start", again: "Revive" };
  useEffect(() => { if (!running) return; const id = setInterval(() => { setTime((v) => v + 1); setScore((s) => s + 7); }, 1000); return () => clearInterval(id); }, [running]);
  useEffect(() => { if (!running) return; const id = setInterval(() => setRocks((r) => [...r.slice(-8), { id: Date.now() + Math.random(), lane: Math.floor(Math.random() * 3), y: -10 }]), Math.max(420, 850 - time * 10)); return () => clearInterval(id); }, [running, time]);
  useEffect(() => { if (!running) return; const id = setInterval(() => setRocks((r) => r.map((x) => ({ ...x, y: x.y + 8 + time * .08 })).filter((x) => x.y < 105)), 65); return () => clearInterval(id); }, [running, time]);
  useEffect(() => { if (!running) return; const hit = rocks.some((r) => r.lane === lane && r.y > 73 && r.y < 91); if (hit) { setRunning(false); setOver(true); tone(120, .18); navigator.vibrate?.(80); } }, [rocks, lane, running]);
  const start = () => { setRunning(true); setOver(false); setTime(0); setScore(0); setRocks([]); setLane(1); };
  return <GameShell title={t.title} subtitle={t.sub} onClose={onClose}>
    <div style={{ width: "100%", display: "flex", justifyContent: "space-between", marginBottom: 12, fontWeight: 900 }}><span>{time}s</span><span>{score} pts</span><span>🦖</span></div>
    <div onPointerDown={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setLane(e.clientX < rect.left + rect.width / 2 ? Math.max(0, lane - 1) : Math.min(2, lane + 1)); tone(360, .04); }} style={{ position: "relative", width: "100%", height: 360, borderRadius: 24, overflow: "hidden", background: "linear-gradient(180deg,#431407,#111827)", touchAction: "none" }}>
      {[0,1,2].map((i) => <div key={i} style={{ position: "absolute", left: `${i * 33.33}%`, top: 0, bottom: 0, width: "33.33%", borderLeft: i ? "1px solid rgba(255,255,255,.12)" : 0 }}/>) }
      {rocks.map((r) => <div key={r.id} style={{ position: "absolute", left: `calc(${r.lane * 33.33 + 16.66}% - 18px)`, top: `${r.y}%`, fontSize: 34 }}>☄️</div>)}
      <div style={{ position: "absolute", left: `calc(${lane * 33.33 + 16.66}% - 26px)`, bottom: 22, fontSize: 52, filter: "drop-shadow(0 0 18px #f97316)", transition: "left .12s ease" }}>🦖</div>
      {over && <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "rgba(0,0,0,.55)", fontSize: 28, fontWeight: 1000 }}>EXTINCTION</div>}
    </div>
    <button style={{ ...shell.action, marginTop: 18 }} onClick={start}>{running ? "← →" : over ? t.again : t.start}</button>
  </GameShell>;
}
