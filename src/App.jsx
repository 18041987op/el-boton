import React, { useState, useRef, useCallback, useEffect, useLayoutEffect } from "react";
import supabase from "./supabaseClient";

/* ──────────────────────────────────────────────────────────────
   EL BOTÓN · THE BUTTON
   Botón saltarín · Retos · Frenesí · Dorado · Vibración · Ranking
   ────────────────────────────────────────────────────────────── */

const PHRASES = {
  es: ["¡Hoy te ves imparable!","El universo te debía esto 🌟","Eres pura buena vibra","Tu energía contagia ✨","Naciste para brillar","Esto sí cuenta como ejercicio","Sigue, vas increíble","Alguien sonrió por tu culpa","Eres el plan A","Modo leyenda activado","Te lo mereces todo","¡Qué dedo más talentoso!","El mundo es mejor contigo","Hoy ganas tú","Eres una obra de arte","Tienes flow infinito","Respira, lo estás haciendo genial","Confía: vas bien","Eres más fuerte de lo que crees","Tu vibra atrae cosas buenas","¡Eso, campeón!","Hoy el caos te respeta","Brillas hasta apagado","El éxito ya viene en camino","Dale otra vez 👀"],
  en: ["You look unstoppable today!","The universe owed you this 🌟","You're pure good vibes","Your energy is contagious ✨","You were born to shine","This counts as cardio","Keep going, you're amazing","Someone smiled because of you","You're plan A","Legend mode: activated","You deserve it all","What a talented finger!","The world is better with you","Today you win","You're a work of art","You've got infinite flow","Breathe, you're crushing it","Trust it: you're good","You're stronger than you think","Your vibe attracts good things","Yes, champ!","Today chaos respects you","You shine even off","Success is on its way","Go again 👀"],
};

const LEVELS = [
  { at: 0,   es: "Despertando",   en: "Waking Up",   bg: ["#16183a","#2b2a5e"], glow: "#7C6CF0", btn: ["#6C5CE7","#9588F5"] },
  { at: 10,  es: "Con Chispa",    en: "Got a Spark", bg: ["#1b2742","#2d4a66"], glow: "#22D3EE", btn: ["#06B6D4","#3DE6F5"] },
  { at: 25,  es: "Encendido",     en: "Lit",         bg: ["#3a1840","#6a2458"], glow: "#FF6BA3", btn: ["#FF4D8D","#FF92BC"] },
  { at: 50,  es: "En Llamas",     en: "On Fire",     bg: ["#451c20","#7a3318"], glow: "#FF9A3D", btn: ["#FF6A2C","#FFB13D"] },
  { at: 100, es: "Imparable",     en: "Unstoppable", bg: ["#0f3a32","#1d6a4f"], glow: "#34E89E", btn: ["#0FD982","#62F0B4"] },
  { at: 200, es: "Modo Leyenda",  en: "Legend Mode", bg: ["#2a1456","#5a2490"], glow: "#FF5AF0", btn: ["#C13CFF","#FF6EE7"] },
  { at: 400, es: "Vibra Cósmica", en: "Cosmic Vibe", bg: ["#0a0820","#2a1a52"], glow: "#FFD24D", btn: ["#FFC53D","#FFE89A"] },
];

const ACHIEVEMENTS = [
  { at: 1, es: "¡Primer toque! 🎉", en: "First tap! 🎉" },
  { at: 10, es: "Calentando 🔥", en: "Warming up 🔥" },
  { at: 50, es: "50 · imparable 💪", en: "50 · unstoppable 💪" },
  { at: 100, es: "¡100! Leyenda 👑", en: "100! Legend 👑" },
  { at: 250, es: "250 · dedo de acero 🦾", en: "250 · steel finger 🦾" },
  { at: 500, es: "500 · ¿estás bien? 😄", en: "500 · you good? 😄" },
  { at: 1000, es: "1000 · MITO 🛸", en: "1000 · MYTH 🛸" },
];

const FAIL_MSG = { es: ["¡Casi! 😅","Uff, por poquito","Ya casi","La próxima es tuya 💪"], en: ["So close! 😅","Almost!","Nearly had it","Next one's yours 💪"] };

const T = {
  es: { sub:"Pícale. No vas a poder parar.", subJump:"¡Atrápalo si puedes!", vibe:"Buena Vibra", next:"Siguiente nivel", max:"NIVEL MÁXIMO", combo:"COMBO", share:"Presumir mi buena vibra", copied:"¡Copiado! Pégalo donde quieras ✨", best:"Mejor combo", streak:"Retos ✓", frenzy:"¡FRENESÍ!", win:"¡LO LOGRASTE!", caught:"¡ATRAPADO!", escaped:"Se escapó 💨", challenge:"RETO", cSpeed:(n)=>`¡Toca ${n} veces!`, cCombo:(k)=>`¡Llega a combo x${k}!`, cHold:"¡No sueltes el combo!", rank:"Ranking mundial", you:"TÚ", yourPos:"Tu posición", name:"Tu nombre", save:"Guardar", noRank:"Ranking no disponible aquí", anon:"Anónimo", empty:"¡Sé el primero del ranking!", bMode:"Globos", bSub:"¡Explota todos los que puedas!", bGoalLbl:(n)=>`Meta: ${n} globos`, bWin:"¡GANASTE! 🎉", bLose:"¡Se acabó el tiempo! 😅", bPopped:"Reventados", bAgain:"Otra vez", bExit:"Salir", bMsgWin:"¡Reventón total!", bMsgLose:"¡Casi! Inténtalo de nuevo", bLevel:"Nivel", bReached:"Llegaste al nivel", bLevelUp:(n)=>`¡NIVEL ${n}!`, nNotes:"Notas", gMenu:"Juegos", gChoose:"Elige un juego" },
  en: { sub:"Tap it. You won't be able to stop.", subJump:"Catch it if you can!", vibe:"Good Vibes", next:"Next level", max:"MAX LEVEL", combo:"COMBO", share:"Brag about my good vibes", copied:"Copied! Paste it anywhere ✨", best:"Best combo", streak:"Challenges ✓", frenzy:"FRENZY!", win:"YOU DID IT!", caught:"CAUGHT!", escaped:"It escaped 💨", challenge:"CHALLENGE", cSpeed:(n)=>`Tap ${n} times!`, cCombo:(k)=>`Reach combo x${k}!`, cHold:"Don't drop the combo!", rank:"World ranking", you:"YOU", yourPos:"Your spot", name:"Your name", save:"Save", noRank:"Ranking unavailable here", anon:"Anonymous", empty:"Be the first on the board!", bMode:"Balloons", bSub:"Pop as many as you can!", bGoalLbl:(n)=>`Goal: ${n} balloons`, bWin:"YOU WON! 🎉", bLose:"Time's up! 😅", bPopped:"Popped", bAgain:"Again", bExit:"Exit", bMsgWin:"Total pop fest!", bMsgLose:"So close! Try again", bLevel:"Level", bReached:"You reached level", bLevelUp:(n)=>`LEVEL ${n}!`, nNotes:"Notes", gMenu:"Games", gChoose:"Choose a game" },
};

const GOLD = ["#FFD24D","#FFE89A","#FFC53D","#FFFFFF","#FFB13D"];
const BALLOON_COLORS = [
  ["#FF8FA3","#FF3B5C"], ["#FFC36B","#FF8A1E"], ["#FFE27A","#FFC107"], ["#9DEBA0","#34C759"],
  ["#7ED4FF","#1E9BFF"], ["#B79CFF","#7C5CFF"], ["#FF9CE6","#FF4DC4"], ["#86F0E0","#19C7B0"],
];
// Dificultad por nivel y por juego: más meta, menos tiempo, aparición y subida más rápidas
function gameLevel(kind, L) {
  if (kind === "notes") return {
    level: L,
    time: Math.max(20, 32 - (L - 1) * 2),
    spawnMin: Math.max(280, 580 - (L - 1) * 40),
    spawnRand: Math.max(200, 360 - (L - 1) * 20),
    riseBase: Math.max(2.4, 4.6 - (L - 1) * 0.22),
    riseRand: Math.max(0.9, 1.6 - (L - 1) * 0.12),
  };
  return {
    level: L,
    goal: 10 + (L - 1) * 3,
    time: Math.max(18, 30 - (L - 1) * 2),
    spawnMin: Math.max(240, 520 - (L - 1) * 40),
    spawnRand: Math.max(180, 340 - (L - 1) * 20),
    riseBase: Math.max(2.0, 4.2 - (L - 1) * 0.25),
    riseRand: Math.max(0.8, 1.6 - (L - 1) * 0.12),
  };
}
// Notas musicales: glifos, colores y melodías (en frecuencias Hz)
const NOTE_GLYPHS = ["♪", "♫", "♩", "♬"];
const NOTE_COLORS = [["#C9B6FF","#7C5CFF"], ["#9DEBA0","#1FB36B"], ["#7ED4FF","#1E9BFF"], ["#FFD78A","#FF8A1E"], ["#FF9CE6","#D43CC0"]];
const NF = { C4:261.63, D4:293.66, E4:329.63, F4:349.23, G4:392.00, A4:440.00, B4:493.88, C5:523.25, D5:587.33 };
const MELODIES = [
  [NF.E4,NF.E4,NF.F4,NF.G4,NF.G4,NF.F4,NF.E4,NF.D4,NF.C4,NF.C4,NF.D4,NF.E4,NF.E4,NF.D4,NF.D4], // Oda a la Alegría
  [NF.C4,NF.C4,NF.G4,NF.G4,NF.A4,NF.A4,NF.G4,NF.F4,NF.F4,NF.E4,NF.E4,NF.D4,NF.D4,NF.C4],        // Estrellita / Twinkle
  [NF.G4,NF.G4,NF.A4,NF.G4,NF.C5,NF.B4,NF.G4,NF.G4,NF.A4,NF.G4,NF.D5,NF.C5],                    // Cumpleaños feliz
];
// Catálogo de juegos (fácil de extender: agrega una entrada aquí)
const GAMES = [
  { kind: "classic",  emoji: "👆", es: "Botón",    en: "Button",   grad: null },
  { kind: "balloons", emoji: "🎈", es: "Globos",   en: "Balloons", grad: "linear-gradient(135deg, #FF6B81, #7C5CFF)" },
  { kind: "notes",    emoji: "🎹", es: "Melodías", en: "Melodies", grad: "linear-gradient(135deg, #34E89E, #1E9BFF)" },
];
const BIG_MSG = {
  es: ["¡IMPARABLE!","¡NO PARES!","¡ERES UNA MÁQUINA!","¡A TODO GAS!","¡LEYENDA!","¡SIGUE ASÍ!","¡VAS VOLANDO!","¡QUÉ NIVEL!","¡FUEGO PURO!","¡ROMPISTE LA PANTALLA!","¡NADIE TE PARA!","¡MODO BESTIA!"],
  en: ["UNSTOPPABLE!","DON'T STOP!","YOU'RE A MACHINE!","FULL SPEED!","LEGEND!","KEEP GOING!","YOU'RE FLYING!","WHAT A LEVEL!","PURE FIRE!","YOU BROKE THE SCREEN!","NOBODY STOPS YOU!","BEAST MODE!"],
};
const PID_KEY = "elboton_pid", NAME_KEY = "elboton_name";
let pid = 0;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const sizeFor = (box, jumpy) => !box.w ? (jumpy ? 130 : 200)
  : jumpy ? Math.round(Math.max(92, Math.min(146, box.w * 0.42, box.h * 0.52)))
          : Math.round(Math.min(220, box.w * 0.62, box.h * 0.62));
const centerPos = (box, s) => ({ x: (box.w - s) / 2, y: (box.h - s) / 2 });
const randPos = (box, s) => ({ x: Math.random() * Math.max(0, box.w - s), y: Math.random() * Math.max(0, box.h - s) });

function Face({ expr }) {
  const F = "#2A2433";
  const C = { idle:{e:"normal",m:"smile"}, happy:{e:"happy",m:"laugh",ch:true}, wild:{e:"dizzy",m:"tongue"}, tap:{e:"happy",m:"open"}, frenzy:{e:"star",m:"open",ch:true}, taunt:{e:"wink",m:"tongue"} }[expr] || { e:"normal", m:"smile" };
  const star = "M0 -11 L3.2 -3.4 L11 -3.4 L4.8 1.6 L7 9 L0 4.4 L-7 9 L-4.8 1.6 L-11 -3.4 L-3.2 -3.4 Z";
  const eyes = () => {
    if (C.e === "normal") return (<g style={{ transformBox:"fill-box", transformOrigin:"center", animation:"eb-blink 4.5s infinite" }}>
        <ellipse cx="34" cy="44" rx="8" ry="11" fill="#fff"/><ellipse cx="66" cy="44" rx="8" ry="11" fill="#fff"/>
        <circle cx="35.5" cy="46" r="4.2" fill={F}/><circle cx="67.5" cy="46" r="4.2" fill={F}/></g>);
    if (C.e === "happy") return (<g fill="none" stroke={F} strokeWidth="5" strokeLinecap="round">
        <path d="M26 47 Q34 39 42 47"/><path d="M58 47 Q66 39 74 47"/></g>);
    if (C.e === "dizzy") return (<g stroke={F} strokeWidth="3.5" fill="none">
        <g style={{transformBox:"fill-box",transformOrigin:"center",animation:"eb-spin .9s linear infinite"}}><circle cx="34" cy="44" r="9"/><circle cx="34" cy="40" r="1.6" fill={F}/></g>
        <g style={{transformBox:"fill-box",transformOrigin:"center",animation:"eb-spin .9s linear infinite"}}><circle cx="66" cy="44" r="9"/><circle cx="66" cy="40" r="1.6" fill={F}/></g></g>);
    if (C.e === "wink") return (<g>
        <path d="M26 47 Q34 39 42 47" fill="none" stroke={F} strokeWidth="5" strokeLinecap="round"/>
        <ellipse cx="66" cy="44" rx="8" ry="11" fill="#fff"/><circle cx="67.5" cy="46" r="4.2" fill={F}/></g>);
    if (C.e === "star") return (<g fill="#FFD24D" stroke={F} strokeWidth="2.5" strokeLinejoin="round">
        <g transform="translate(34 44)"><g style={{transformBox:"fill-box",transformOrigin:"center",animation:"eb-twinkle .5s ease-in-out infinite"}}><path d={star}/></g></g>
        <g transform="translate(66 44)"><g style={{transformBox:"fill-box",transformOrigin:"center",animation:"eb-twinkle .5s ease-in-out infinite"}}><path d={star}/></g></g></g>);
    return null;
  };
  const mouth = () => {
    if (C.m === "smile") return <path d="M38 62 Q50 72 62 62" fill="none" stroke={F} strokeWidth="5" strokeLinecap="round"/>;
    if (C.m === "laugh") return <path d="M36 60 Q50 78 64 60 Z" fill={F}/>;
    if (C.m === "open") return <ellipse cx="50" cy="65" rx="10" ry="13" fill={F}/>;
    if (C.m === "tongue") return (<g><path d="M36 60 Q50 78 64 60 Z" fill={F}/><path d="M43 68 Q50 80 57 68 Q57 75 50 75.5 Q43 75 43 68 Z" fill="#FF6B81"/></g>);
    return null;
  };
  return (<svg viewBox="0 0 100 100" width="72%" height="72%" style={{ overflow:"visible", pointerEvents:"none" }}>
    {C.ch && (<g fill="rgba(255,120,150,.5)"><circle cx="19" cy="58" r="6"/><circle cx="81" cy="58" r="6"/></g>)}
    {eyes()}{mouth()}</svg>);
}

function Balloon({ c }) {
  const [light, dark] = c;
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", pointerEvents: "none" }}>
      <div style={{ width: "100%", height: "80%", borderRadius: "50% 50% 47% 47%",
        background: `radial-gradient(circle at 32% 26%, ${light}, ${dark})`,
        boxShadow: "inset -4px -7px 11px rgba(0,0,0,.20), 0 5px 12px rgba(0,0,0,.28)", position: "relative" }}>
        <div style={{ position: "absolute", left: "20%", top: "15%", width: "24%", height: "30%", borderRadius: "50%", background: "rgba(255,255,255,.55)", filter: "blur(1px)" }} />
        <div style={{ position: "absolute", left: "50%", bottom: "-7%", transform: "translateX(-50%)", width: 0, height: 0,
          borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: `8px solid ${dark}` }} />
      </div>
      <div style={{ position: "absolute", left: "50%", top: "79%", width: 2, height: "26%", transform: "translateX(-50%)",
        background: "linear-gradient(rgba(255,255,255,.5), rgba(255,255,255,.1))", borderRadius: 2 }} />
    </div>
  );
}

function Note({ c, glyph }) {
  const [light, dark] = c;
  return (
    <div style={{ width: "100%", height: "100%", borderRadius: "30% 30% 34% 34%", display: "flex", alignItems: "center", justifyContent: "center",
      background: `radial-gradient(circle at 34% 26%, ${light}, ${dark})`,
      boxShadow: `inset -3px -5px 9px rgba(0,0,0,.22), 0 5px 14px ${dark}99, 0 0 18px ${dark}66`, pointerEvents: "none" }}>
      <span style={{ fontSize: "56%", color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,.5)", lineHeight: 1 }}>{glyph}</span>
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useState("es");
  const [vibe, setVibe] = useState(0);
  const [taps, setTaps] = useState(0);
  const [particles, setParticles] = useState([]);
  const [confetti, setConfetti] = useState([]);
  const [toast, setToast] = useState(null);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [pressed, setPressed] = useState(false);
  const [muted, setMuted] = useState(false);
  const [haptics, setHaptics] = useState(true);
  const [jumpy, setJumpy] = useState(true);
  const [copied, setCopied] = useState(false);

  const [challenge, setChallengeState] = useState(null);
  const [cStreak, setCStreak] = useState(0);
  const [frenzy, setFrenzyState] = useState(false);
  const [frenzyLeft, setFrenzyLeft] = useState(0);
  const [flash, setFlash] = useState(null);
  const [taunt, setTaunt] = useState(false);
  const [golden, setGoldenState] = useState({ visible: false, x: 50, y: 40, timeLeft: 0, moveId: 0 });

  const [box, setBox] = useState({ w: 0, h: 0 });
  const [btnPos, setBtnPos] = useState({ x: 0, y: 0 });

  const [balloons, setBalloons] = useState([]);
  const [balloonGame, setBalloonGameState] = useState({ active: false, status: "idle", kind: "balloons", level: 1, timeLeft: 0, popped: 0, escaped: 0, progress: 0, goal: 0, duration: 0, deadline: 0 });
  const balloonGameRef = useRef({ active: false, status: "idle", kind: "balloons", level: 1, goal: 0, deadline: 0 });
  const nextBalloonAt = useRef(Infinity), poppedGuard = useRef(new Set());
  const poppedCount = useRef(0), escapedCount = useRef(0), poppedTotal = useRef(0), melodyRef = useRef([]);

  const [playerName, setPlayerName] = useState("");
  const [nameDraft, setNameDraft] = useState("");
  const [lb, setLb] = useState([]);
  const [showLB, setShowLB] = useState(false);
  const [showGames, setShowGames] = useState(false);
  const [lbOk, setLbOk] = useState(true);
  const [entered, setEntered] = useState(false);
  const [paused, setPaused] = useState(false);
  const [bigMsg, setBigMsg] = useState(null);

  const lastTap = useRef(0), comboTimer = useRef(null), audioCtx = useRef(null), reduce = useRef(false);
  const tapsRef = useRef(0), comboRef = useRef(0), challengeRef = useRef(null), frenzyRef = useRef(false);
  const startedRef = useRef(false), everRef = useRef(false), nextChAt = useRef(Infinity), frenzyDeadline = useRef(0);
  const goldenRef = useRef({ visible: false }), goldenNextAt = useRef(Infinity);
  const playerId = useRef(null), nameRef = useRef(""), dirty = useRef(false), lbSaveAt = useRef(0), prevMult = useRef(1);
  const fxRef = useRef(null), boxRef = useRef({ w: 0, h: 0 }), sizeRef = useRef(200), jumpyRef = useRef(true), btnPosRef = useRef({ x: 0, y: 0 }), movedRef = useRef(false);
  const enteredRef = useRef(false), pausedRef = useRef(false), pausedAt = useRef(0), nextBigAt = useRef(28);
  const actions = useRef({});

  useEffect(() => {
    reduce.current = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    loadMe();
  }, []);
  useEffect(() => { tapsRef.current = taps; }, [taps]);
  useEffect(() => { comboRef.current = combo; }, [combo]);
  useEffect(() => { enteredRef.current = entered; }, [entered]);

  useLayoutEffect(() => {
    const el = fxRef.current; if (!el) return;
    const m = () => { const r = el.getBoundingClientRect(); setBox({ w: r.width, h: r.height }); };
    m();
    let ro; if (window.ResizeObserver) { ro = new ResizeObserver(m); ro.observe(el); }
    window.addEventListener("resize", m);
    return () => { ro && ro.disconnect(); window.removeEventListener("resize", m); };
  }, []);

  const t = T[lang];
  const levelIdx = LEVELS.reduce((a, l, i) => (taps >= l.at ? i : a), 0);
  const level = LEVELS[levelIdx];
  const nextLevel = LEVELS[levelIdx + 1];
  const progress = nextLevel ? Math.min(1, (taps - level.at) / (nextLevel.at - level.at)) : 1;
  const mult = Math.min(5, 1 + Math.floor(combo / 4));
  const bestComboMult = Math.min(5, 1 + Math.floor(maxCombo / 4));
  const accent = frenzy ? "#FFD24D" : level.glow;
  const myRank = lb.findIndex((e) => e.id === playerId.current) + 1;

  const SIZE = sizeFor(box, jumpy);
  let pos = (jumpy && movedRef.current)
    ? { x: clamp(btnPos.x, 0, Math.max(0, box.w - SIZE)), y: clamp(btnPos.y, 0, Math.max(0, box.h - SIZE)) }
    : centerPos(box, SIZE);
  boxRef.current = box; sizeRef.current = SIZE; jumpyRef.current = jumpy; btnPosRef.current = pos;

  /* ── storage / ranking (Supabase) ── */
  function genId() { return "p" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4); }
  function loadMe() {
    try {
      let id = localStorage.getItem(PID_KEY);
      if (!id) { id = genId(); localStorage.setItem(PID_KEY, id); }
      playerId.current = id;
      const nm = localStorage.getItem(NAME_KEY) || "";
      nameRef.current = nm; setPlayerName(nm); setNameDraft(nm);
    } catch (e) { playerId.current = genId(); }
    loadLeaderboard();
  }
  async function loadLeaderboard() {
    if (!supabase) { setLbOk(false); return; }
    try {
      const { data, error } = await supabase.from("el_boton_scores").select("player_id,name,vibe").order("vibe", { ascending: false }).limit(100);
      if (error) throw error;
      setLb((data || []).map((r) => ({ id: r.player_id, name: r.name, vibe: r.vibe }))); setLbOk(true);
    } catch (e) { setLbOk(false); setLb([]); }
  }
  async function saveScore() {
    if (!supabase || !playerId.current) return;
    try {
      const { error } = await supabase.rpc("submit_score", { p_id: playerId.current, p_name: nameRef.current || t.anon, p_vibe: vibe });
      if (error) throw error;
      loadLeaderboard();
    } catch (e) {}
  }
  async function saveName() {
    nameRef.current = nameDraft.slice(0, 16); setPlayerName(nameRef.current);
    try { localStorage.setItem(NAME_KEY, nameRef.current); } catch (e) {}
    saveScore();
  }

  /* ── audio + haptics ── */
  const ac = () => { if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)(); return audioCtx.current; };
  const tone = (freq, delay, dur, type = "triangle", vol = 0.16) => {
    if (muted) return;
    try { const ctx = ac(), o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = freq;
      const s = ctx.currentTime + delay; g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(vol, s + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, s + dur); o.connect(g); g.connect(ctx.destination); o.start(s); o.stop(s + dur + 0.02); } catch (e) {}
  };
  const fanfare = () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.08, 0.18, "triangle", 0.18));
  const sadTone = () => { tone(330, 0, 0.18, "sine", 0.14); tone(247, 0.1, 0.22, "sine", 0.14); };
  const chimeUp = () => [440, 660].forEach((f, i) => tone(f, i * 0.09, 0.14, "square", 0.12));
  const sparkle = () => [880, 1175, 1568].forEach((f, i) => tone(f, i * 0.06, 0.16, "triangle", 0.16));
  const swoop = (f1, f2, dur = 0.2, vol = 0.12) => {
    if (muted) return;
    try { const ctx = ac(), o = ctx.createOscillator(), g = ctx.createGain(); o.type = "sine";
      const s2 = ctx.currentTime; o.frequency.setValueAtTime(f1, s2); o.frequency.exponentialRampToValueAtTime(f2, s2 + dur);
      g.gain.setValueAtTime(0.0001, s2); g.gain.exponentialRampToValueAtTime(vol, s2 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, s2 + dur + 0.04);
      o.connect(g); g.connect(ctx.destination); o.start(s2); o.stop(s2 + dur + 0.06); } catch (e) {}
  };
  const missTone = () => swoop(300, 175, 0.18, 0.09);
  // ráfaga de ruido con caída rápida → "pop" real de globo
  const noiseBurst = (dur = 0.05, vol = 0.22, hp = 800) => {
    if (muted) return;
    try {
      const ctx = ac(), n = Math.max(1, Math.floor(ctx.sampleRate * dur));
      const buf = ctx.createBuffer(1, n, ctx.sampleRate), data = buf.getChannelData(0);
      for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.4);
      const src = ctx.createBufferSource(); src.buffer = buf;
      const g = ctx.createGain(); g.gain.value = vol;
      const f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = hp;
      src.connect(f); f.connect(g); g.connect(ctx.destination); src.start();
    } catch (e) {}
  };
  const anticip = (c) => { tone(560 + c * 300, 0, 0.12, "triangle", 0.13); tone(840 + c * 300, 0.05, 0.12, "sine", 0.10); };
  const nextRound = () => [659, 880, 1175].forEach((f, i) => tone(f, i * 0.07, 0.16, "triangle", 0.16));
  const buzz = (p) => { if (!haptics) return; try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };

  const launchConfetti = (palette, n, ox, oy) => {
    if (reduce.current) return;
    const burst = Array.from({ length: n }, () => {
      const ang = Math.random() * Math.PI * 2, dist = 60 + Math.random() * 150;
      return { id: ++pid, ox, oy, tx: Math.cos(ang) * dist, ty: Math.sin(ang) * dist - 40, rot: (Math.random() - 0.5) * 720, color: palette[Math.floor(Math.random() * palette.length)], size: 6 + Math.random() * 9 };
    });
    setConfetti((c) => [...c.slice(-60), ...burst]);
    const ids = burst.map((b) => b.id);
    setTimeout(() => setConfetti((c) => c.filter((x) => !ids.includes(x.id))), 950);
  };

  const setChallenge = (o) => { challengeRef.current = o; setChallengeState(o); };
  const setFrenzy = (v) => { frenzyRef.current = v; setFrenzyState(v); };
  const setGolden = (o) => { goldenRef.current = o; setGoldenState(o); };
  const setBG = (updater) => setBalloonGameState((prev) => {
    const next = typeof updater === "function" ? updater(prev) : updater;
    balloonGameRef.current = next; return next;
  });
  // sonido propio del globo: ráfaga de ruido + golpe grave que cae (distinto del tono musical del botón)
  const popTone = () => { noiseBurst(0.05, 0.24, 700); swoop(820, 180, 0.09, 0.13); };
  // nota de piano: fundamental + armónicos con envolvente de decaimiento
  const pianoNote = (freq, vol = 0.2) => {
    if (muted) return;
    try {
      const ctx = ac(), s = ctx.currentTime;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(vol, s + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, s + 0.6);
      g.connect(ctx.destination);
      [[1, 1], [2, 0.5], [3, 0.22], [4, 0.1]].forEach(([m, amp]) => {
        const o = ctx.createOscillator(); o.type = m === 1 ? "triangle" : "sine"; o.frequency.value = freq * m;
        const og = ctx.createGain(); og.gain.value = amp; o.connect(og); og.connect(g); o.start(s); o.stop(s + 0.66);
      });
    } catch (e) {}
  };
  const togglePause = () => {
    if (pausedRef.current) {
      const delta = Date.now() - pausedAt.current;
      if (challengeRef.current) challengeRef.current.deadline += delta;
      if (frenzyRef.current) frenzyDeadline.current += delta;
      if (goldenRef.current.visible) { goldenRef.current.deadline += delta; goldenRef.current.moveAt += delta; }
      if (balloonGameRef.current.active && balloonGameRef.current.status === "playing") { setBG((p) => ({ ...p, deadline: p.deadline + delta })); nextBalloonAt.current += delta; }
      nextChAt.current += delta; goldenNextAt.current += delta; lbSaveAt.current += delta;
      pausedRef.current = false; setPaused(false);
    } else { pausedAt.current = Date.now(); pausedRef.current = true; setPaused(true); }
  };
  const handleMiss = () => { if (pausedRef.current || !enteredRef.current || balloonGameRef.current.active) return; missTone(); buzz(4); };

  /* ── acciones ── */
  actions.current.startChallenge = () => {
    if (challengeRef.current || frenzyRef.current) return;
    const roll = !everRef.current ? "speed" : ["speed", "combo", "hold"][Math.floor(Math.random() * 3)];
    everRef.current = true; let o;
    if (roll === "speed") { const target = 12 + Math.floor(Math.random() * 8), d = Math.max(6, Math.round(target * 0.5)); o = { type: "speed", target, duration: d, timeLeft: d, deadline: Date.now() + d * 1000, base: tapsRef.current }; }
    else if (roll === "combo") { o = { type: "combo", target: 5, duration: 10, timeLeft: 10, deadline: Date.now() + 10000 }; }
    else { const d = 6 + Math.floor(Math.random() * 3); o = { type: "hold", duration: d, timeLeft: d, deadline: Date.now() + d * 1000, start: Date.now(), armed: false }; }
    setChallenge(o); if (cStreak > 0) nextRound(); else chimeUp(); buzz(15);
  };
  actions.current.winChallenge = () => {
    const c = challengeRef.current; if (!c) return; setChallenge(null);
    const ns = cStreak + 1; setCStreak(ns); let bonus = 50 + ns * 25; if (frenzyRef.current) bonus *= 2;
    setVibe((v) => v + bonus); dirty.current = true;
    setFlash({ kind: "win", text: t.win, bonus }); setTimeout(() => setFlash(null), 1500);
    fanfare(); buzz([0, 30, 40, 30]); launchConfetti(GOLD, 40, boxRef.current.w / 2, boxRef.current.h / 2);
    nextChAt.current = Date.now() + 8000; if (ns % 2 === 0) actions.current.startFrenzy();
  };
  actions.current.failChallenge = () => {
    if (!challengeRef.current) return; setChallenge(null); setCStreak(0);
    setFlash({ kind: "lose", text: FAIL_MSG[lang][Math.floor(Math.random() * FAIL_MSG[lang].length)] });
    setTimeout(() => setFlash(null), 1400); sadTone(); buzz([0, 15, 30, 15]); nextChAt.current = Date.now() + 9000;
    setTaunt(true); setTimeout(() => setTaunt(false), 1500);
  };
  actions.current.startFrenzy = () => {
    setFrenzy(true); frenzyDeadline.current = Date.now() + 6000; setFrenzyLeft(6);
    [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.06, 0.16, "sawtooth", 0.14)); buzz([0, 40, 30, 40, 30, 60]);
  };
  actions.current.endFrenzy = () => { setFrenzy(false); setFrenzyLeft(0); nextChAt.current = Date.now() + 5000; };
  actions.current.spawnGolden = () => {
    if (goldenRef.current.visible || challengeRef.current) return;
    setGolden({ visible: true, x: 12 + Math.random() * 72, y: 18 + Math.random() * 60, deadline: Date.now() + 4000, moveAt: Date.now() + 700, timeLeft: 4, moveId: 1 }); sparkle();
  };
  actions.current.catchGolden = () => {
    if (!goldenRef.current.visible) return; setGolden({ visible: false });
    let bonus = 80 + Math.floor(Math.random() * 160); if (frenzyRef.current) bonus *= 2;
    setVibe((v) => v + bonus); dirty.current = true;
    setFlash({ kind: "win", text: t.caught, bonus }); setTimeout(() => setFlash(null), 1500);
    sparkle(); fanfare(); buzz([0, 60, 40, 90]); launchConfetti(GOLD, 38, boxRef.current.w / 2, boxRef.current.h / 2);
    goldenNextAt.current = Date.now() + 14000 + Math.random() * 12000;
  };
  actions.current.escapeGolden = () => {
    setGolden({ visible: false }); setFlash({ kind: "lose", text: t.escaped }); setTimeout(() => setFlash(null), 1100);
    goldenNextAt.current = Date.now() + 16000 + Math.random() * 12000;
    setTaunt(true); setTimeout(() => setTaunt(false), 1500);
  };

  /* ── mini-juegos: globos / melodías (niveles progresivos) ── */
  const loadGameLevel = (kind, L, breather) => {
    const cfg = gameLevel(kind, L);
    poppedCount.current = 0; escapedCount.current = 0; poppedGuard.current = new Set();
    let goal = cfg.goal;
    if (kind === "notes") { melodyRef.current = MELODIES[(L - 1) % MELODIES.length]; goal = melodyRef.current.length; }
    setBalloons([]); nextBalloonAt.current = Date.now() + breather;
    setBG((p) => ({ ...p, active: true, status: "playing", kind, level: L, goal, popped: 0, escaped: 0, progress: 0,
      timeLeft: cfg.time, duration: cfg.time, deadline: Date.now() + cfg.time * 1000,
      spawnMin: cfg.spawnMin, spawnRand: cfg.spawnRand, riseBase: cfg.riseBase, riseRand: cfg.riseRand }));
  };
  actions.current.startBalloonGame = (kind = "balloons") => {
    setChallenge(null); setFrenzy(false); setGolden({ visible: false });
    poppedTotal.current = 0;
    loadGameLevel(kind, 1, 350);
    chimeUp(); buzz(15);
  };
  actions.current.spawnBalloon = () => {
    const now = Date.now(); const bg = balloonGameRef.current;
    const h = boxRef.current.h; if (!h) { nextBalloonAt.current = now + 400; return; }
    let item;
    if (bg.kind === "notes") {
      const size = 44 + Math.floor(Math.random() * 20);
      item = { id: ++pid, kind: "notes", x: 8 + Math.random() * 84, w: size, h: size,
        color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)], glyph: NOTE_GLYPHS[Math.floor(Math.random() * NOTE_GLYPHS.length)],
        dur: bg.riseBase + Math.random() * bg.riseRand, rise: -(h + size + 60), swayDur: 1.3 + Math.random() * 1.2 };
    } else {
      const size = 46 + Math.floor(Math.random() * 28);
      item = { id: ++pid, kind: "balloons", x: 8 + Math.random() * 84, w: size, h: size * 1.4,
        color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
        dur: bg.riseBase + Math.random() * bg.riseRand, rise: -(h + size * 1.4 + 60), swayDur: 1.3 + Math.random() * 1.2 };
    }
    setBalloons((arr) => [...arr.slice(-22), item]);
    nextBalloonAt.current = now + bg.spawnMin + Math.random() * bg.spawnRand;
  };
  actions.current.popBalloon = (id, ox, oy, item) => {
    if (poppedGuard.current.has(id)) return; poppedGuard.current.add(id);
    setBalloons((arr) => arr.filter((b) => b.id !== id));
    setVibe((v) => v + 3); dirty.current = true; poppedTotal.current++;
    launchConfetti([item.color[0], item.color[1], "#FFFFFF"], item.kind === "notes" ? 12 : 16, ox, oy);
    if (balloonGameRef.current.kind === "notes") {
      const mel = melodyRef.current, idx = poppedCount.current;
      if (idx < mel.length) pianoNote(mel[idx]); else sparkle();
      buzz(8);
      poppedCount.current = idx + 1;
      setBG((p) => ({ ...p, popped: poppedCount.current, progress: poppedCount.current }));
      if (poppedCount.current >= balloonGameRef.current.goal) actions.current.advanceLevel();
    } else {
      popTone(); buzz(10);
      poppedCount.current++;
      const prog = Math.max(0, poppedCount.current - escapedCount.current);
      setBG((p) => ({ ...p, popped: poppedCount.current, progress: prog }));
      if (prog >= balloonGameRef.current.goal) actions.current.advanceLevel();
    }
  };
  actions.current.escapeBalloon = (id) => {
    setBalloons((arr) => arr.filter((b) => b.id !== id));
    if (balloonGameRef.current.status !== "playing" || poppedGuard.current.has(id)) return;
    if (balloonGameRef.current.kind === "notes") return; // las notas que se van no penalizan
    escapedCount.current++;
    const prog = Math.max(0, poppedCount.current - escapedCount.current);
    setBG((p) => ({ ...p, escaped: escapedCount.current, progress: prog }));
    missTone(); buzz(6);
  };
  actions.current.advanceLevel = () => {
    if (balloonGameRef.current.status !== "playing") return;
    const kind = balloonGameRef.current.kind, L = balloonGameRef.current.level + 1;
    setVibe((v) => v + 40 + L * 25); dirty.current = true;
    fanfare(); buzz([0, 30, 40, 30]); launchConfetti(GOLD, 32, boxRef.current.w / 2, boxRef.current.h / 2);
    setFlash({ kind: "win", text: t.bLevelUp(L) }); setTimeout(() => setFlash(null), 1300);
    loadGameLevel(kind, L, 750);
  };
  actions.current.endBalloonGame = () => {
    if (balloonGameRef.current.status !== "playing") return;
    setBalloons([]);
    setBG((p) => ({ ...p, status: "over", timeLeft: 0 }));
    sadTone(); buzz([0, 15, 30, 15]); saveScore();
  };
  actions.current.exitBalloonGame = () => {
    setBalloons([]); nextBalloonAt.current = Infinity;
    setBG({ active: false, status: "idle", kind: "balloons", level: 1, timeLeft: 0, popped: 0, escaped: 0, progress: 0, goal: 0, duration: 0, deadline: 0 });
    nextChAt.current = Date.now() + 6000; goldenNextAt.current = Date.now() + 14000;
  };

  /* ── reloj maestro ── */
  useEffect(() => {
    const iv = setInterval(() => {
      if (!enteredRef.current || pausedRef.current) return;
      const now = Date.now();

      const bg = balloonGameRef.current;
      if (bg.active) {
        if (bg.status === "playing") {
          if (now >= nextBalloonAt.current) actions.current.spawnBalloon();
          if (now >= bg.deadline) actions.current.endBalloonGame();
          else setBalloonGameState((p) => (p.active ? { ...p, timeLeft: Math.max(0, (bg.deadline - now) / 1000) } : p));
        }
        if (dirty.current && now >= lbSaveAt.current) { dirty.current = false; lbSaveAt.current = now + 4000; saveScore(); }
        return;
      }

      if (frenzyRef.current) { const l = (frenzyDeadline.current - now) / 1000; if (l <= 0) actions.current.endFrenzy(); else setFrenzyLeft(l); }
      const c = challengeRef.current;
      if (c) {
        const left = Math.max(0, (c.deadline - now) / 1000); setChallengeState((p) => (p ? { ...p, timeLeft: left } : p));
        if (c.type === "hold") { if (comboRef.current > 0) c.armed = true; if (c.armed && comboRef.current === 0) actions.current.failChallenge(); else if (now >= c.deadline) actions.current.winChallenge(); }
        else if (now >= c.deadline) actions.current.failChallenge();
      } else if (!frenzyRef.current && startedRef.current && now >= nextChAt.current) actions.current.startChallenge();

      const g = goldenRef.current;
      if (g.visible) {
        if (now >= g.deadline) actions.current.escapeGolden();
        else { const tl = Math.max(0, (g.deadline - now) / 1000);
          if (now >= g.moveAt) setGolden({ ...g, x: 12 + Math.random() * 72, y: 18 + Math.random() * 60, moveAt: now + 700, timeLeft: tl, moveId: g.moveId + 1 });
          else setGoldenState((p) => (p.visible ? { ...p, timeLeft: tl } : p)); }
      } else if (startedRef.current && !challengeRef.current && now >= goldenNextAt.current) actions.current.spawnGolden();

      if (dirty.current && now >= lbSaveAt.current) { dirty.current = false; lbSaveAt.current = now + 4000; saveScore(); }
    }, 100);
    return () => clearInterval(iv);
  }, [vibe, lang]);

  const tap = useCallback((e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (pausedRef.current || !enteredRef.current) return;
    const now = Date.now(); const fast = now - lastTap.current < 700; lastTap.current = now;
    const newCombo = fast ? comboRef.current + 1 : 0; comboRef.current = newCombo; setCombo(newCombo);
    setMaxCombo((m) => Math.max(m, newCombo));
    if (comboTimer.current) clearTimeout(comboTimer.current);
    comboTimer.current = setTimeout(() => { comboRef.current = 0; setCombo(0); }, 750);

    let curMult = Math.min(5, 1 + Math.floor(newCombo / 4)); if (frenzyRef.current) curMult *= 3;
    setVibe((v) => v + curMult); dirty.current = true;

    const newTaps = taps + 1; tapsRef.current = newTaps; setTaps(newTaps);
    if (!startedRef.current && newTaps >= 6) { startedRef.current = true; nextChAt.current = now + 600; goldenNextAt.current = now + 11000 + Math.random() * 9000; }

    // origen de efectos = centro del botón ANTES de moverse
    const s = sizeRef.current, cur = btnPosRef.current;
    const ox = cur.x + s / 2, oy = cur.y + s / 2;

    // mover el botón
    if (jumpyRef.current && boxRef.current.w > s + 10) {
      const np = randPos(boxRef.current, s); movedRef.current = true; btnPosRef.current = np; setBtnPos(np);
    }

    const c = challengeRef.current;
    if (c) {
      if (c.type === "speed") { const prog = newTaps - c.base;
        if (prog >= c.target) actions.current.winChallenge();
        else if (c.target - prog <= 3) anticip(prog / c.target);
      } else if (c.type === "combo") { const cm = Math.min(5, 1 + Math.floor(newCombo / 4));
        if (cm >= c.target) actions.current.winChallenge();
        else if (cm >= 3) anticip(cm / c.target);
      }
    }

    const hit = ACHIEVEMENTS.find((a) => a.at === newTaps);
    if (hit) { setToast(hit[lang]); setTimeout(() => setToast(null), 2200); buzz(25); }
    if (newTaps >= nextBigAt.current) {
      const pool = BIG_MSG[lang]; setBigMsg(pool[Math.floor(Math.random() * pool.length)]);
      setTimeout(() => setBigMsg(null), 1500); nextBigAt.current = newTaps + 18 + Math.floor(Math.random() * 22);
    }
    const m = Math.min(5, 1 + Math.floor(newCombo / 4));
    if (m > prevMult.current && m >= 2) buzz(18); prevMult.current = m;
    buzz(frenzyRef.current ? 12 : 7);

    setPressed(true); setTimeout(() => setPressed(false), 110);
    tone(320 + curMult * 70 + Math.random() * 30, 0, 0.16, "triangle", 0.16);

    const phrase = PHRASES[lang][Math.floor(Math.random() * PHRASES[lang].length)]; const myId = ++pid;
    setParticles((p) => [...p.slice(-6), { id: myId, text: phrase, dx: (Math.random() - 0.5) * 80, ox, oy }]);
    setTimeout(() => setParticles((p) => p.filter((x) => x.id !== myId)), 1500);
    const palette = frenzyRef.current ? GOLD : [level.btn[0], level.btn[1], level.glow, "#FFFFFF", "#FFE89A"];
    launchConfetti(palette, frenzyRef.current ? 20 : 14, ox, oy);
  }, [taps, lang, level, muted, haptics]);

  const share = useCallback(async () => {
    saveScore();
    const url = (typeof window !== "undefined" && window.location)
      ? window.location.origin + window.location.pathname
      : "";
    const r = myRank > 0 ? (lang === "es" ? ` Voy #${myRank} del mundo.` : ` I'm #${myRank} worldwide.`) : "";
    const msg = lang === "es"
      ? `Llevo ${vibe} de buena vibra en EL BOTÓN 🎉${r} ${cStreak ? `racha de ${cStreak} retos, ` : ""}mejor combo x${bestComboMult}. ¿Cuánto aguantas tú? 👀`
      : `I've got ${vibe} good vibes on THE BUTTON 🎉${r} ${cStreak ? `${cStreak}-challenge streak, ` : ""}best combo x${bestComboMult}. How long can you last? 👀`;
    try {
      if (navigator.share) {
        await navigator.share(url ? { title: "EL BOTÓN", text: msg, url } : { title: "EL BOTÓN", text: msg });
        return;
      }
    } catch (e) { if (e && e.name === "AbortError") return; }
    const clip = url ? `${msg}\n${url}` : msg;
    try { await navigator.clipboard.writeText(clip); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch (e) {}
  }, [vibe, bestComboMult, cStreak, lang, myRank]);

  const urgent = challenge && challenge.timeLeft <= 3;
  const bUrgent = balloonGame.active && balloonGame.status === "playing" && balloonGame.timeLeft <= 5;
  const enterGame = (kind) => { if (nameDraft.trim()) saveName(); setEntered(true); if (kind !== "classic") actions.current.startBalloonGame(kind); };
  const pickGame = (kind) => { setShowGames(false); if (kind === "classic") actions.current.exitBalloonGame(); else actions.current.startBalloonGame(kind); };
  const gameEmoji = balloonGame.kind === "notes" ? "🎹" : "🎈";
  const dimTitle = !!flash || !!toast || frenzy || !!bigMsg;
  const goldUrgent = golden.visible && golden.timeLeft <= 1.5;
  const btnFont = Math.max(15, Math.round(SIZE * 0.16));
  const faceExpr = frenzy ? "frenzy" : taunt ? "taunt" : pressed ? "tap" : combo >= 4 ? "wild" : combo >= 2 ? "happy" : "idle";

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@600;800&display=swap');
    @keyframes eb-floatUp {0%{transform:translate(calc(-50% + var(--dx)),0) scale(.6);opacity:0}15%{opacity:1;transform:translate(calc(-50% + var(--dx)),-14px) scale(1)}100%{transform:translate(calc(-50% + var(--dx)),-140px) scale(1);opacity:0}}
    @keyframes eb-fly {0%{transform:translate(-50%,-50%) rotate(0);opacity:1}100%{transform:translate(calc(-50% + var(--tx)),calc(-50% + var(--ty))) rotate(var(--rot));opacity:0}}
    @keyframes eb-breathe {0%,100%{transform:scale(1)}50%{transform:scale(1.035)}}
    @keyframes eb-land {0%{transform:scale(.7)}55%{transform:scale(1.12)}100%{transform:scale(1)}}
    @keyframes eb-toast {0%{transform:translate(-50%,16px) scale(.8);opacity:0}15%{transform:translate(-50%,0) scale(1);opacity:1}85%{transform:translate(-50%,0) scale(1);opacity:1}100%{transform:translate(-50%,-10px) scale(.95);opacity:0}}
    @keyframes eb-comboPop {0%{transform:translate(-50%,0) scale(.5);opacity:0}40%{transform:translate(-50%,0) scale(1.15);opacity:1}100%{transform:translate(-50%,0) scale(1);opacity:1}}
    @keyframes eb-flashIn {0%{transform:translate(-50%,-50%) scale(.4);opacity:0}30%{transform:translate(-50%,-50%) scale(1.1);opacity:1}80%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{transform:translate(-50%,-50%) scale(.95);opacity:0}}
    @keyframes eb-pulse {0%,100%{box-shadow:0 0 0 0 rgba(255,80,80,.5)}50%{box-shadow:0 0 0 14px rgba(255,80,80,0)}}
    @keyframes eb-frenzyBg {0%,100%{opacity:0}50%{opacity:.22}}
    @keyframes eb-slideDown {0%{transform:translate(-50%,-30px);opacity:0}100%{transform:translate(-50%,0);opacity:1}}
    @keyframes eb-pop {0%{transform:translate(-50%,-50%) scale(.3)}60%{transform:translate(-50%,-50%) scale(1.18)}100%{transform:translate(-50%,-50%) scale(1)}}
    @keyframes eb-blink {0%,90%,100%{transform:scaleY(1)}94%{transform:scaleY(.12)}}
    @keyframes eb-spin {0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
    @keyframes eb-twinkle {0%,100%{transform:scale(1)}50%{transform:scale(1.2)}}
    @keyframes eb-bigMsg {0%{transform:translateX(-50%) scale(.4);opacity:0}20%{transform:translateX(-50%) scale(1.12);opacity:1}80%{transform:translateX(-50%) scale(1);opacity:1}100%{transform:translateX(-50%) scale(.9);opacity:0}}
    @keyframes eb-rise {0%{transform:translate(-50%,0)}100%{transform:translate(-50%,var(--rise))}}
    @keyframes eb-sway {0%{transform:translateX(-7px) rotate(-4deg)}100%{transform:translateX(7px) rotate(4deg)}}
  `;

  return (
    <div style={{ minHeight: "100vh", width: "100%", fontFamily: "'Nunito', system-ui, sans-serif",
      background: `radial-gradient(120% 120% at 50% 0%, ${level.bg[1]} 0%, ${level.bg[0]} 70%)`,
      transition: "background 900ms ease", display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "space-between", overflow: "hidden", position: "relative", padding: "16px 16px 24px", boxSizing: "border-box", color: "#fff" }}>
      <style>{css}</style>

      {frenzy && !reduce.current && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", background: "radial-gradient(circle at 50% 40%, #FFD24D, transparent 70%)", animation: "eb-frenzyBg .6s ease-in-out infinite" }} />
      )}

      {/* top bar */}
      <div style={{ width: "100%", maxWidth: 460, display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 5 }}>
        <div style={{ display: "flex", gap: 6, background: "rgba(255,255,255,.1)", borderRadius: 999, padding: 4 }}>
          {["es", "en"].map((l) => (
            <button key={l} onClick={() => setLang(l)} style={{ border: "none", cursor: "pointer", borderRadius: 999, padding: "5px 10px",
              fontFamily: "'Fredoka', sans-serif", fontWeight: 600, fontSize: 13, background: lang === l ? "#fff" : "transparent",
              color: lang === l ? level.bg[0] : "rgba(255,255,255,.7)", transition: "all .2s" }}>{l.toUpperCase()}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          {[[paused ? "▶️" : "⏸️", togglePause, false],
            ["🎮", () => setShowGames(true), false],
            ["🎯", () => { movedRef.current = false; setJumpy((j) => !j); }, !jumpy],
            ["🏆", () => { loadLeaderboard(); setShowLB(true); }, false],
            ["📳", () => setHaptics((h) => !h), !haptics],
            [muted ? "🔇" : "🔊", () => setMuted((m) => !m), false]].map(([ic, fn, dim], i) => (
            <button key={i} onClick={fn} style={{ border: "none", cursor: "pointer", width: 34, height: 34, borderRadius: 999,
              background: "rgba(255,255,255,.1)", color: "#fff", fontSize: 15, opacity: dim ? 0.4 : 1 }}>{ic}</button>
          ))}
        </div>
      </div>

      {/* title + sub / challenge */}
      <div style={{ textAlign: "center", zIndex: 5, marginTop: 4, width: "100%", maxWidth: 460 }}>
        <h1 style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, margin: 0, fontSize: "clamp(28px, 9vw, 46px)", letterSpacing: 1, textShadow: `0 0 28px ${accent}88`, opacity: dimTitle ? 0.12 : 1, transition: "opacity .3s ease" }}>
          {lang === "es" ? "EL BOTÓN" : "THE BUTTON"}
        </h1>
        {balloonGame.active && balloonGame.status === "playing" ? (
          <div style={{ marginTop: 9, animation: "eb-slideDown .3s ease", background: "rgba(0,0,0,.28)", border: `2px solid ${bUrgent ? "#FF5A5A" : accent}`, borderRadius: 16, padding: "9px 13px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 15, color: "#fff" }}>{t.bLevel} {balloonGame.level} · {gameEmoji} {balloonGame.progress}/{balloonGame.goal}</span>
              <span style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 16, color: bUrgent ? "#FF6A6A" : accent }}>⏱️ {Math.ceil(balloonGame.timeLeft)}s</span>
            </div>
            <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,.14)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(balloonGame.timeLeft / balloonGame.duration) * 100}%`, background: bUrgent ? "#FF5A5A" : accent, borderRadius: 999, transition: "width .1s linear" }} />
            </div>
          </div>
        ) : challenge ? (
          <div style={{ marginTop: 9, animation: "eb-slideDown .3s ease", background: "rgba(0,0,0,.28)", border: `2px solid ${urgent ? "#FF5A5A" : accent}`, borderRadius: 16, padding: "9px 13px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 15, color: urgent ? "#FF8A8A" : "#fff" }}>
                ⚡ {challenge.type === "speed" ? t.cSpeed(challenge.target) : challenge.type === "combo" ? t.cCombo(challenge.target) : t.cHold}
              </span>
              <span style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 16, color: urgent ? "#FF6A6A" : accent }}>
                {challenge.type === "speed" ? `${Math.max(0, taps - challenge.base)}/${challenge.target}` : challenge.type === "combo" ? `x${mult}/x${challenge.target}` : `${Math.ceil(challenge.timeLeft)}s`}
              </span>
            </div>
            <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,.14)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(challenge.timeLeft / challenge.duration) * 100}%`, background: urgent ? "#FF5A5A" : accent, borderRadius: 999, transition: "width .1s linear" }} />
            </div>
          </div>
        ) : (
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "rgba(255,255,255,.75)", fontWeight: 600 }}>{frenzy ? "" : jumpy ? t.subJump : t.sub}</p>
        )}
      </div>

      {/* fx + button + golden */}
      <div ref={fxRef} onClick={handleMiss} style={{ position: "relative", flex: 1, width: "100%", maxWidth: 460 }}>
        {particles.map((p) => (
          <div key={p.id} style={{ position: "absolute", left: p.ox, top: p.oy, "--dx": `${p.dx}px`, animation: "eb-floatUp 1.5s ease-out forwards",
            pointerEvents: "none", fontFamily: "'Fredoka', sans-serif", fontWeight: 600, fontSize: 15, color: "#fff", textShadow: "0 2px 12px rgba(0,0,0,.5)", whiteSpace: "nowrap", zIndex: 8 }}>{p.text}</div>
        ))}
        {confetti.map((c) => (
          <div key={c.id} style={{ position: "absolute", left: c.ox, top: c.oy, width: c.size, height: c.size, background: c.color, borderRadius: c.size > 10 ? 2 : "50%",
            "--tx": `${c.tx}px`, "--ty": `${c.ty}px`, "--rot": `${c.rot}deg`, animation: "eb-fly .9s cubic-bezier(.2,.6,.3,1) forwards", pointerEvents: "none", zIndex: 7 }} />
        ))}
        {combo >= 3 && (
          <div key={combo} style={{ position: "absolute", left: "50%", top: "2%", animation: "eb-comboPop .3s ease forwards", fontFamily: "'Fredoka', sans-serif", fontWeight: 700, zIndex: 9, textAlign: "center", pointerEvents: "none" }}>
            <div style={{ fontSize: 12, letterSpacing: 2, color: "rgba(255,255,255,.8)" }}>{t.combo}</div>
            <div style={{ fontSize: 36, color: accent, textShadow: `0 0 20px ${accent}` }}>x{mult}</div>
          </div>
        )}

        {balloons.map((b) => (
          <button key={b.id} aria-label={b.kind === "notes" ? "note" : "balloon"}
            onClick={(e) => { e.stopPropagation(); const r = fxRef.current.getBoundingClientRect(); actions.current.popBalloon(b.id, e.clientX - r.left, e.clientY - r.top, b); }}
            onAnimationEnd={(ev) => { if (ev.animationName === "eb-rise") actions.current.escapeBalloon(b.id); }}
            style={{ position: "absolute", left: `${b.x}%`, bottom: -b.h, width: b.w, height: b.h, border: "none", background: "transparent",
              padding: 0, cursor: "pointer", zIndex: 13, "--rise": `${b.rise}px`, animation: `eb-rise ${b.dur}s linear forwards`,
              animationPlayState: paused ? "paused" : "running", WebkitTapHighlightColor: "transparent" }}>
            <div style={{ width: "100%", height: "100%", animation: `eb-sway ${b.swayDur}s ease-in-out infinite alternate`, animationPlayState: paused ? "paused" : "running" }}>
              {b.kind === "notes" ? <Note c={b.color} glyph={b.glyph} /> : <Balloon c={b.color} />}
            </div>
          </button>
        ))}

        {golden.visible && (
          <button key={golden.moveId} onClick={(e) => { e.stopPropagation(); actions.current.catchGolden(); }} aria-label="golden"
            style={{ position: "absolute", left: `${golden.x}%`, top: `${golden.y}%`, transform: "translate(-50%,-50%)", animation: "eb-pop .25s ease",
              width: 60, height: 60, borderRadius: "50%", border: "none", cursor: "pointer", zIndex: 14,
              background: "radial-gradient(circle at 35% 30%, #FFF6C8, #FFC107)",
              boxShadow: `0 0 0 ${goldUrgent ? 8 : 4}px rgba(255,210,77,${goldUrgent ? .25 : .4}), 0 8px 22px rgba(255,193,7,.6)`,
              fontSize: 25, display: "flex", alignItems: "center", justifyContent: "center", WebkitTapHighlightColor: "transparent" }}><Face expr="happy" /></button>
        )}

        {box.w > 0 && !balloonGame.active && (
          <button key={jumpy && movedRef.current ? `${Math.round(pos.x)},${Math.round(pos.y)}` : "center"} onClick={tap}
            aria-label={lang === "es" ? "Presiona para buena vibra" : "Tap for good vibes"}
            style={{ position: "absolute", left: pos.x, top: pos.y, width: SIZE, height: SIZE, borderRadius: "50%", border: "none", cursor: "pointer", zIndex: 6,
              background: frenzy ? "radial-gradient(circle at 35% 30%, #FFE89A, #FFC53D)" : `radial-gradient(circle at 35% 30%, ${level.btn[1]}, ${level.btn[0]})`,
              boxShadow: `0 16px 40px ${accent}66, 0 0 0 8px rgba(255,255,255,.06), inset 0 -10px 24px rgba(0,0,0,.25), inset 0 8px 18px rgba(255,255,255,.4)`,
              color: "#fff", fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: btnFont, display: "flex", alignItems: "center", justifyContent: "center",
              transform: pressed ? "scale(.92)" : "scale(1)", transition: "transform .1s ease, background .9s ease, box-shadow .9s ease",
              animation: jumpy && movedRef.current ? "eb-land .22s ease" : (urgent ? "eb-pulse 1s infinite" : combo < 1 ? "eb-breathe 3s ease-in-out infinite" : "none"),
              textShadow: "0 2px 8px rgba(0,0,0,.3)", WebkitTapHighlightColor: "transparent", userSelect: "none" }}>
            <Face expr={faceExpr} />
          </button>
        )}
      </div>

      {/* stats */}
      <div style={{ width: "100%", maxWidth: 460, zIndex: 5 }}>
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 13, letterSpacing: 1.5, color: "rgba(255,255,255,.65)", fontWeight: 700, textTransform: "uppercase" }}>{t.vibe}</div>
          <div style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: "clamp(38px, 12vw, 56px)", lineHeight: 1, textShadow: `0 0 30px ${accent}66` }}>{vibe.toLocaleString()}</div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
            <span style={{ color: level.glow }}>● {level[lang]}</span>
            <span style={{ color: "rgba(255,255,255,.6)" }}>{nextLevel ? `${t.next}: ${nextLevel.at - taps}` : t.max}</span>
          </div>
          <div style={{ height: 12, borderRadius: 999, background: "rgba(255,255,255,.12)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress * 100}%`, background: `linear-gradient(90deg, ${level.btn[0]}, ${level.glow})`, borderRadius: 999, transition: "width .3s ease", boxShadow: `0 0 12px ${level.glow}` }} />
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 8, fontSize: 12, color: "rgba(255,255,255,.6)", fontWeight: 700, flexWrap: "wrap" }}>
            {myRank > 0 && <span style={{ color: accent }}>🏆 #{myRank}</span>}
            {cStreak > 0 && <span style={{ color: accent }}>{t.streak} {cStreak}</span>}
            {maxCombo >= 3 && <span>{t.best}: x{bestComboMult}</span>}
          </div>
        </div>
        <button onClick={share} style={{ width: "100%", border: "none", cursor: "pointer", borderRadius: 16, padding: "15px",
          background: copied ? "rgba(255,255,255,.95)" : "rgba(255,255,255,.14)", color: copied ? level.bg[0] : "#fff",
          fontFamily: "'Fredoka', sans-serif", fontWeight: 600, fontSize: 16, transition: "all .2s", backdropFilter: "blur(6px)" }}>
          {copied ? t.copied : `🔗 ${t.share}`}
        </button>
      </div>

      {frenzy && (
        <div style={{ position: "fixed", left: "50%", top: 58, zIndex: 18, transform: "translateX(-50%)", animation: "eb-slideDown .3s ease", textAlign: "center", pointerEvents: "none" }}>
          <div style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 26, color: "#FFD24D", textShadow: "0 0 24px #FFD24D" }}>🔥 {t.frenzy} x3 🔥</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.85)", fontWeight: 700 }}>{Math.ceil(frenzyLeft)}s</div>
        </div>
      )}

      {flash && (
        <div style={{ position: "fixed", left: "50%", top: "44%", zIndex: 25, animation: "eb-flashIn 1.4s ease forwards", pointerEvents: "none", textAlign: "center" }}>
          <div style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: flash.kind === "win" ? 34 : 26, color: flash.kind === "win" ? "#FFD24D" : "#fff", textShadow: `0 0 28px ${flash.kind === "win" ? "#FFD24D" : "rgba(0,0,0,.5)"}` }}>{flash.text}</div>
          {flash.bonus != null && <div style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 28, color: "#fff", textShadow: "0 0 20px #FFD24D" }}>+{flash.bonus}</div>}
        </div>
      )}

      {toast && (
        <div style={{ position: "fixed", left: "50%", bottom: 88, zIndex: 20, animation: "eb-toast 2.2s ease forwards", pointerEvents: "none",
          background: "rgba(255,255,255,.97)", color: level.bg[0], padding: "12px 22px", borderRadius: 999, fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 16, boxShadow: `0 10px 30px ${accent}66`, whiteSpace: "nowrap" }}>{toast}</div>
      )}

      {bigMsg && (
        <div style={{ position: "fixed", left: "50%", top: "21%", zIndex: 22, transform: "translateX(-50%)", animation: "eb-bigMsg 1.5s ease forwards", pointerEvents: "none", textAlign: "center", width: "92%" }}>
          <div style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: "clamp(30px, 11vw, 56px)", color: accent, textShadow: `0 0 30px ${accent}, 0 4px 14px rgba(0,0,0,.5)`, lineHeight: 1 }}>{bigMsg}</div>
        </div>
      )}

      {balloonGame.active && balloonGame.status === "over" && (
        <div style={{ position: "fixed", inset: 0, zIndex: 46, background: "rgba(10,8,26,.82)", backdropFilter: "blur(6px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 24, textAlign: "center" }}>
          <div style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: "clamp(34px, 11vw, 52px)", color: "#fff", textShadow: "0 0 30px rgba(0,0,0,.5)" }}>
            {t.bLose}
          </div>
          <div style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 22, color: "#FFD24D", textShadow: "0 0 24px #FFD24D" }}>{t.bReached} {balloonGame.level}</div>
          <div style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 20, color: accent }}>{gameEmoji} {balloonGame.kind === "notes" ? t.nNotes : t.bPopped}: {poppedTotal.current}</div>
          <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap", justifyContent: "center" }}>
            <button onClick={() => actions.current.startBalloonGame(balloonGame.kind)} style={{ border: "none", cursor: "pointer", borderRadius: 14, padding: "14px 28px", background: accent, color: level.bg[0], fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 18 }}>{gameEmoji} {t.bAgain}</button>
            <button onClick={() => { actions.current.exitBalloonGame(); setShowGames(true); }} style={{ border: "none", cursor: "pointer", borderRadius: 14, padding: "14px 28px", background: "rgba(255,255,255,.12)", color: "#fff", fontFamily: "'Fredoka', sans-serif", fontWeight: 600, fontSize: 16 }}>{t.gMenu}</button>
          </div>
        </div>
      )}

      {paused && entered && (
        <div onClick={togglePause} style={{ position: "fixed", inset: 0, zIndex: 45, background: "rgba(10,8,26,.78)", backdropFilter: "blur(6px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22, cursor: "pointer" }}>
          <div style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 40, color: "#fff" }}>⏸️ {lang === "es" ? "En pausa" : "Paused"}</div>
          <button onClick={(e) => { e.stopPropagation(); togglePause(); }} style={{ border: "none", cursor: "pointer", borderRadius: 16, padding: "15px 40px", background: accent, color: level.bg[0], fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 20 }}>▶️ {lang === "es" ? "Reanudar" : "Resume"}</button>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.6)", fontWeight: 600 }}>{lang === "es" ? "Toca donde sea para seguir" : "Tap anywhere to continue"}</div>
        </div>
      )}

      {!entered && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, background: `radial-gradient(120% 120% at 50% 0%, ${level.bg[1]} 0%, ${level.bg[0]} 75%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
          <h1 style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, margin: 0, fontSize: "clamp(40px, 14vw, 64px)", letterSpacing: 1, color: "#fff", textShadow: `0 0 34px ${accent}` }}>{lang === "es" ? "EL BOTÓN" : "THE BUTTON"}</h1>
          <p style={{ margin: "8px 0 28px", fontSize: 15, color: "rgba(255,255,255,.75)", fontWeight: 600 }}>{lang === "es" ? "Pícale. No vas a poder parar." : "Tap it. You won't be able to stop."}</p>
          <div style={{ width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", gap: 12 }}>
            <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} placeholder={lang === "es" ? "Tu nombre" : "Your name"} maxLength={16}
              style={{ border: "none", borderRadius: 14, padding: "15px 18px", fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 16, background: "rgba(255,255,255,.12)", color: "#fff", outline: "none", textAlign: "center" }} />
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.65)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>{lang === "es" ? "Elige tu juego" : "Choose your game"}</div>
            <div style={{ display: "flex", gap: 10 }}>
              {GAMES.map((g) => (
                <button key={g.kind} onClick={() => enterGame(g.kind)} style={{ flex: 1, border: "none", cursor: "pointer", borderRadius: 16, padding: "16px 4px",
                  background: g.grad || accent, color: g.grad ? "#fff" : level.bg[0], fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 15,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 24 }}>{g.emoji}</span>{g[lang]}
                </button>
              ))}
            </div>
            <button onClick={() => setEntered(true)} style={{ border: "none", cursor: "pointer", borderRadius: 14, padding: "13px", background: "rgba(255,255,255,.1)", color: "#fff", fontFamily: "'Fredoka', sans-serif", fontWeight: 600, fontSize: 15 }}>{lang === "es" ? "Jugar como invitado" : "Play as guest"}</button>
          </div>
          <div style={{ marginTop: 24, display: "flex", gap: 6, background: "rgba(255,255,255,.1)", borderRadius: 999, padding: 4 }}>
            {["es", "en"].map((l) => (
              <button key={l} onClick={() => setLang(l)} style={{ border: "none", cursor: "pointer", borderRadius: 999, padding: "6px 14px", fontFamily: "'Fredoka', sans-serif", fontWeight: 600, fontSize: 13, background: lang === l ? "#fff" : "transparent", color: lang === l ? level.bg[0] : "rgba(255,255,255,.7)" }}>{l.toUpperCase()}</button>
            ))}
          </div>
        </div>
      )}

      {showGames && (
        <div onClick={() => setShowGames(false)} style={{ position: "fixed", inset: 0, zIndex: 47, background: "rgba(0,0,0,.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 380, background: level.bg[0], borderRadius: 22, padding: 20, boxShadow: `0 20px 60px rgba(0,0,0,.5), 0 0 0 1px ${accent}44` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 20, color: "#fff" }}>🎮 {t.gChoose}</h2>
              <button onClick={() => setShowGames(false)} style={{ border: "none", background: "rgba(255,255,255,.12)", color: "#fff", width: 32, height: 32, borderRadius: 999, cursor: "pointer", fontSize: 16 }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {GAMES.map((g) => {
                const cur = g.kind === "classic" ? !balloonGame.active : balloonGame.active && balloonGame.kind === g.kind;
                return (
                  <button key={g.kind} onClick={() => pickGame(g.kind)} style={{ display: "flex", alignItems: "center", gap: 14, border: "none", cursor: "pointer", borderRadius: 16, padding: "14px 16px",
                    background: g.grad || "rgba(255,255,255,.1)", color: "#fff", fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 18, textAlign: "left",
                    boxShadow: cur ? `0 0 0 2px ${accent}` : "none" }}>
                    <span style={{ fontSize: 28 }}>{g.emoji}</span>
                    <span style={{ flex: 1 }}>{g[lang]}</span>
                    {cur && <span style={{ fontSize: 13, color: g.grad ? "rgba(255,255,255,.9)" : accent }}>● {lang === "es" ? "actual" : "current"}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showLB && (
        <div onClick={() => setShowLB(false)} style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 380, background: level.bg[0], borderRadius: 22, padding: 20, boxShadow: `0 20px 60px rgba(0,0,0,.5), 0 0 0 1px ${accent}44` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h2 style={{ margin: 0, fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 20, color: "#fff" }}>🏆 {t.rank}</h2>
              <button onClick={() => setShowLB(false)} style={{ border: "none", background: "rgba(255,255,255,.12)", color: "#fff", width: 32, height: 32, borderRadius: 999, cursor: "pointer", fontSize: 16 }}>✕</button>
            </div>
            {!lbOk ? (
              <p style={{ color: "rgba(255,255,255,.7)", fontSize: 14, textAlign: "center", padding: "20px 0" }}>{t.noRank}</p>
            ) : (
              <>
                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                  <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} placeholder={t.name} maxLength={16}
                    style={{ flex: 1, border: "none", borderRadius: 12, padding: "11px 14px", fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 15, background: "rgba(255,255,255,.12)", color: "#fff", outline: "none" }} />
                  <button onClick={saveName} style={{ border: "none", borderRadius: 12, padding: "0 18px", cursor: "pointer", fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 15, background: accent, color: level.bg[0] }}>{t.save}</button>
                </div>
                <div style={{ maxHeight: "46vh", overflowY: "auto" }}>
                  {lb.length === 0 && <p style={{ color: "rgba(255,255,255,.7)", fontSize: 14, textAlign: "center", padding: "16px 0" }}>{t.empty}</p>}
                  {lb.slice(0, 10).map((e, i) => {
                    const me = e.id === playerId.current;
                    return (
                      <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 12, marginBottom: 5,
                        background: me ? `${accent}26` : "rgba(255,255,255,.05)", border: me ? `1px solid ${accent}88` : "1px solid transparent" }}>
                        <span style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 15, width: 30, color: i < 3 ? accent : "rgba(255,255,255,.6)" }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}</span>
                        <span style={{ flex: 1, fontWeight: 700, fontSize: 15, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name || t.anon} {me && <span style={{ fontSize: 11, color: accent }}>({t.you})</span>}</span>
                        <span style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 15, color: accent }}>{e.vibe.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
                {myRank > 10 && (<div style={{ marginTop: 8, textAlign: "center", fontSize: 13, color: "rgba(255,255,255,.7)", fontWeight: 700 }}>{t.yourPos}: #{myRank}</div>)}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
