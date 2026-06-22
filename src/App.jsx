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
  es: { sub:"Pícale. No vas a poder parar.", subJump:"¡Atrápalo si puedes!", vibe:"Buena Vibra", next:"Siguiente nivel", max:"NIVEL MÁXIMO", combo:"COMBO", share:"Presumir mi buena vibra", copied:"¡Copiado! Pégalo donde quieras ✨", best:"Mejor combo", streak:"Retos ✓", frenzy:"¡FRENESÍ!", win:"¡LO LOGRASTE!", caught:"¡ATRAPADO!", escaped:"Se escapó 💨", challenge:"RETO", cSpeed:(n)=>`¡Toca ${n} veces!`, cCombo:(k)=>`¡Llega a combo x${k}!`, cHold:"¡No sueltes el combo!", rank:"Ranking mundial", you:"TÚ", yourPos:"Tu posición", name:"Tu nombre", save:"Guardar", noRank:"Ranking no disponible aquí", anon:"Anónimo", empty:"¡Sé el primero del ranking!", bMode:"Globos", bSub:"¡Explota todos los que puedas!", bGoalLbl:(n)=>`Meta: ${n} globos`, bWin:"¡GANASTE! 🎉", bLose:"¡Se acabó el tiempo! 😅", bPopped:"Reventados", bAgain:"Otra vez", bExit:"Salir", bMsgWin:"¡Reventón total!", bMsgLose:"¡Casi! Inténtalo de nuevo", bLevel:"Nivel", bReached:"Llegaste al nivel", bLevelUp:(n)=>`¡NIVEL ${n}!`, nNotes:"Notas", gMenu:"Juegos", gChoose:"Elige un juego", nameNudge:"Ponte un nombre y compite en el ranking", nameCta:"Guardar y competir", namePh:"Tu nombre o alias", nameSaved:(n)=>`¡Listo, ${n}! Ya apareces en el ranking 🏆`, claimScore:"¡Guarda tu nombre para este puntaje!", mpPlay:"Multijugador", mpTitle:"Jugar con amigos", mpCreate:"Crear sala", mpJoin:"Unirse a sala", mpEnterCode:"Código de 4 letras", mpShareCode:"Comparte este código:", mpInRoom:"En la sala", mpWaiting:"Esperando jugadores…", mpNeed:"Se necesitan 2+ jugadores", mpStartBtn:"¡Empezar partida!", mpHostStarts:"El anfitrión inicia la partida", mpPickGame:"Juego:", mpReady:"¡Prepárate!", mpResults:"Resultados", mpWins:(n)=>`🏆 ${n} gana`, mpTie:"¡Empate!", mpScore:"pts", mpAgain:"Otra ronda", mpUnavail:"Multijugador no disponible aquí", mpLeave:"Salir de la sala", mpBadCode:"Código inválido", mpWaitHost:"⏳ Esperando a que el anfitrión empiece…", mpWaitRematch:"Esperando al anfitrión para otra ronda…",
    dOver:"¡EXTINCIÓN!", dScore:"Puntos", dLevel:"Era alcanzada", dAgain:"Revivir", dHp:"Vida", dTapRoar:"Toca para rugir y morder 🦖", dEaten:"¡ÑAM!" },
  en: { sub:"Tap it. You won't be able to stop.", subJump:"Catch it if you can!", vibe:"Good Vibes", next:"Next level", max:"MAX LEVEL", combo:"COMBO", share:"Brag about my good vibes", copied:"Copied! Paste it anywhere ✨", best:"Best combo", streak:"Challenges ✓", frenzy:"FRENZY!", win:"YOU DID IT!", caught:"CAUGHT!", escaped:"It escaped 💨", challenge:"CHALLENGE", cSpeed:(n)=>`Tap ${n} times!`, cCombo:(k)=>`Reach combo x${k}!`, cHold:"Don't drop the combo!", rank:"World ranking", you:"YOU", yourPos:"Your spot", name:"Your name", save:"Save", noRank:"Ranking unavailable here", anon:"Anonymous", empty:"Be the first on the board!", bMode:"Balloons", bSub:"Pop as many as you can!", bGoalLbl:(n)=>`Goal: ${n} balloons`, bWin:"YOU WON! 🎉", bLose:"Time's up! 😅", bPopped:"Popped", bAgain:"Again", bExit:"Exit", bMsgWin:"Total pop fest!", bMsgLose:"So close! Try again", bLevel:"Level", bReached:"You reached level", bLevelUp:(n)=>`LEVEL ${n}!`, nNotes:"Notes", gMenu:"Games", gChoose:"Choose a game", nameNudge:"Add a name and join the ranking", nameCta:"Save & compete", namePh:"Your name or alias", nameSaved:(n)=>`Done, ${n}! You're on the ranking now 🏆`, claimScore:"Save your name for this score!", mpPlay:"Multiplayer", mpTitle:"Play with friends", mpCreate:"Create room", mpJoin:"Join room", mpEnterCode:"4-letter code", mpShareCode:"Share this code:", mpInRoom:"In the room", mpWaiting:"Waiting for players…", mpNeed:"Need 2+ players", mpStartBtn:"Start match!", mpHostStarts:"Host starts the match", mpPickGame:"Game:", mpReady:"Get ready!", mpResults:"Results", mpWins:(n)=>`🏆 ${n} wins`, mpTie:"It's a tie!", mpScore:"pts", mpAgain:"Another round", mpUnavail:"Multiplayer unavailable here", mpLeave:"Leave room", mpBadCode:"Invalid code", mpWaitHost:"⏳ Waiting for the host to start…", mpWaitRematch:"Waiting for the host for another round…",
    dOver:"EXTINCTION!", dScore:"Score", dLevel:"Era reached", dAgain:"Revive", dHp:"Health", dTapRoar:"Tap to roar & bite 🦖", dEaten:"NOM!" },
};

const GOLD = ["#FFD24D","#FFE89A","#FFC53D","#FFFFFF","#FFB13D"];
const BALLOON_COLORS = [
  ["#FF8FA3","#FF3B5C"], ["#FFC36B","#FF8A1E"], ["#FFE27A","#FFC107"], ["#9DEBA0","#34C759"],
  ["#7ED4FF","#1E9BFF"], ["#B79CFF","#7C5CFF"], ["#FF9CE6","#FF4DC4"], ["#86F0E0","#19C7B0"],
];
const DODGE_EMOJIS = ["⭐","🌙","💫","🌸","🎯","💎","🪐","☄️","🔮","🧊"];
// Dificultad por nivel y por juego: más meta, menos tiempo, aparición y subida más rápidas
function gameLevel(kind, L) {
  if (kind === "notes") return {
    level: L,
    time: Math.max(20, 32 - (L - 1) * 2),
    spawnMin: Math.max(300, 620 - (L - 1) * 40),
    spawnRand: Math.max(220, 380 - (L - 1) * 20),
    riseBase: Math.max(3.0, 5.4 - (L - 1) * 0.22),
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
const NOTE_COLORS = [
  ["#FF4D6D","#FF0040"], ["#FFB02E","#FF7A00"], ["#FFE94D","#FFC400"], ["#5CFF8F","#00E676"],
  ["#4DD2FF","#00B0FF"], ["#B388FF","#7C4DFF"], ["#FF6EE6","#FF00C8"], ["#5CFFE4","#00E5C0"],
];
const NF = { C4:261.63, D4:293.66, E4:329.63, F4:349.23, G4:392.00, A4:440.00, B4:493.88, C5:523.25, D5:587.33 };
const MELODIES = [
  [NF.E4,NF.E4,NF.F4,NF.G4,NF.G4,NF.F4,NF.E4,NF.D4,NF.C4,NF.C4,NF.D4,NF.E4,NF.E4,NF.D4,NF.D4], // Oda a la Alegría
  [NF.C4,NF.C4,NF.G4,NF.G4,NF.A4,NF.A4,NF.G4,NF.F4,NF.F4,NF.E4,NF.E4,NF.D4,NF.D4,NF.C4],        // Estrellita / Twinkle
  [NF.G4,NF.G4,NF.A4,NF.G4,NF.C5,NF.B4,NF.G4,NF.G4,NF.A4,NF.G4,NF.D5,NF.C5],                    // Cumpleaños feliz
  [NF.E4,NF.D4,NF.C4,NF.D4,NF.E4,NF.E4,NF.E4,NF.D4,NF.D4,NF.D4,NF.E4,NF.G4,NF.G4],              // Mary Had a Little Lamb
  [NF.C4,NF.D4,NF.E4,NF.C4,NF.C4,NF.D4,NF.E4,NF.C4,NF.E4,NF.F4,NF.G4,NF.E4,NF.F4,NF.G4],        // Frère Jacques
  [NF.E4,NF.E4,NF.E4,NF.E4,NF.E4,NF.E4,NF.E4,NF.G4,NF.C4,NF.D4,NF.E4],                          // Jingle Bells
  [NF.C4,NF.C4,NF.C4,NF.F4,NF.A4,NF.C4,NF.C4,NF.C4,NF.F4,NF.A4],                                // La Cucaracha
  [NF.G4,NF.E4,NF.E4,NF.F4,NF.D4,NF.D4,NF.C4,NF.D4,NF.E4,NF.F4,NF.G4,NF.G4,NF.G4],              // London Bridge
];
// Catálogo de juegos (fácil de extender: agrega una entrada aquí)
const GAMES = [
  { kind: "balloons", emoji: "🎈", es: "Globos",   en: "Balloons", grad: "linear-gradient(135deg, #FF6B81, #7C5CFF)", mpOk: true },
  { kind: "notes",    emoji: "🎹", es: "Melodías", en: "Melodies", grad: "linear-gradient(135deg, #34E89E, #1E9BFF)", mpOk: true },
  { kind: "dodge",    emoji: "🦖", es: "Dino",     en: "Dino",     grad: "linear-gradient(135deg, #8a3b12, #c2410c)", mpOk: false },
];
// Multijugador en vivo (Supabase Realtime)
const MP_DUR = 30, MP_COUNTDOWN = 3;
const roomCode = () => { const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; return Array.from({ length: 4 }, () => a[Math.floor(Math.random() * a.length)]).join(""); };
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

function Note({ c, glyph, size }) {
  const [light, dark] = c;
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", pointerEvents: "none" }}>
      {/* halo circular brillante: pista visual de la zona tocable (generosa) */}
      <div style={{ position: "absolute", width: "100%", height: "100%", borderRadius: "50%", background: `radial-gradient(circle, ${light}cc, ${dark}77 45%, transparent 72%)`, filter: "blur(1px)" }} />
      <span style={{ position: "relative", fontSize: size * 0.96, lineHeight: 1, fontWeight: 700, color: "#fff",
        textShadow: `0 0 4px #fff, 0 0 10px ${light}, 0 0 20px ${light}, 0 0 34px ${dark}, 0 2px 4px rgba(0,0,0,.45)` }}>{glyph}</span>
    </div>
  );
}

/* ── Dibujo del dinosaurio (T-Rex vectorial, mandíbulas animadas) ── */
function drawDino(ctx, cx, gy, u, jaw, hurt, blinkT, run) {
  const top = hurt ? "#ff6a4d" : "#6FB23E", bot = hurt ? "#d83a28" : "#3F7E22";
  const belly = hurt ? "#ffd0a0" : "#C8E89A";
  // bamboleo de carrera: el cuerpo sube/baja un poco
  const bob = Math.sin(run) * u * 0.06;
  cx += 0; gy += bob;
  const bodyCX = cx, bodyCY = gy - u * 1.05, bodyRX = u * 1.15, bodyRY = u * 0.95;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,.35)"; ctx.shadowBlur = u * 0.3; ctx.shadowOffsetY = u * 0.15;

  // cola
  ctx.fillStyle = bot;
  ctx.beginPath();
  ctx.moveTo(cx - u * 0.6, gy - u * 1.2);
  ctx.quadraticCurveTo(cx - u * 2.6, gy - u * 1.1, cx - u * 2.9, gy - u * 0.15);
  ctx.quadraticCurveTo(cx - u * 2.2, gy - u * 0.55, cx - u * 0.5, gy - u * 0.6);
  ctx.closePath(); ctx.fill();

  // patas (animadas: alternan adelante/atrás al correr)
  ctx.fillStyle = bot;
  [[cx - u * 0.45, Math.sin(run)], [cx + u * 0.5, Math.sin(run + Math.PI)]].forEach(([lx, ph]) => {
    const step = ph * u * 0.34, lift = Math.max(0, -ph) * u * 0.2; // alza el pie en su fase
    ctx.beginPath();
    ctx.moveTo(lx - u * 0.34, gy - u * 0.95);
    ctx.quadraticCurveTo(lx - u * 0.42 + step, gy - u * 0.1 - lift, lx - u * 0.2 + step, gy - lift);
    ctx.lineTo(lx + u * 0.5 + step, gy - lift);
    ctx.quadraticCurveTo(lx + u * 0.4 + step, gy - u * 0.2 - lift, lx + u * 0.34, gy - u * 0.95);
    ctx.closePath(); ctx.fill();
  });
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

  // cuerpo
  const bg = ctx.createLinearGradient(0, bodyCY - bodyRY, 0, bodyCY + bodyRY);
  bg.addColorStop(0, top); bg.addColorStop(1, bot);
  ctx.fillStyle = bg;
  ctx.beginPath(); ctx.ellipse(bodyCX, bodyCY, bodyRX, bodyRY, 0, 0, Math.PI * 2); ctx.fill();
  // panza
  ctx.fillStyle = belly;
  ctx.beginPath(); ctx.ellipse(bodyCX + u * 0.15, bodyCY + u * 0.28, bodyRX * 0.62, bodyRY * 0.6, 0, 0, Math.PI * 2); ctx.fill();

  // púas en el lomo
  ctx.fillStyle = hurt ? "#ffcaa0" : "#2E6018";
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI * 0.78 + i * 0.26, sx = bodyCX + Math.cos(a) * bodyRX * 0.96, sy = bodyCY + Math.sin(a) * bodyRY * 0.96, sp = u * 0.26;
    ctx.beginPath(); ctx.moveTo(sx - sp, sy); ctx.lineTo(sx, sy - sp * 1.5); ctx.lineTo(sx + sp, sy); ctx.closePath(); ctx.fill();
  }

  // bracito
  ctx.strokeStyle = bot; ctx.lineWidth = u * 0.16; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(cx + u * 0.55, gy - u * 1.1); ctx.lineTo(cx + u * 0.95, gy - u * 0.8); ctx.stroke();

  // cabeza: se levanta (lift) e inclina hacia arriba (tilt) al abrir la boca para atrapar
  const lift = jaw * u * 0.6, tilt = jaw * 0.42;
  const hx = cx + u * 0.75, hy = gy - u * 2.05 - lift, hr = u * 0.82;
  // cuello (se dibuja primero; no rota con la cabeza)
  ctx.fillStyle = bot;
  ctx.beginPath(); ctx.moveTo(hx - u * 0.5, hy + u * 0.3); ctx.quadraticCurveTo(cx, gy - u * 1.6, bodyCX - u * 0.2, bodyCY - u * 0.5); ctx.lineTo(bodyCX + u * 0.5, bodyCY - u * 0.6); ctx.quadraticCurveTo(hx + u * 0.1, gy - u * 1.7, hx + u * 0.4, hy + u * 0.3); ctx.closePath(); ctx.fill();

  // cabeza + mandíbulas + ojo giran juntos e inclinan hacia arriba al atrapar
  ctx.save();
  const pvx = hx - hr * 0.5, pvy = hy + hr * 0.5;
  ctx.translate(pvx, pvy); ctx.rotate(-tilt); ctx.translate(-pvx, -pvy);
  const hg = ctx.createLinearGradient(0, hy - hr, 0, hy + hr);
  hg.addColorStop(0, top); hg.addColorStop(1, bot);
  ctx.fillStyle = hg;
  ctx.beginPath(); ctx.ellipse(hx, hy, hr, hr * 0.92, 0, 0, Math.PI * 2); ctx.fill();

  const hinge = { x: hx + hr * 0.55, y: hy + u * 0.05 }, snoutLen = u * 1.15;
  const open = jaw * 0.55; // ángulo de apertura (rad)

  // boca interior
  ctx.fillStyle = hurt ? "#5a0d0d" : "#7a1d2b";
  ctx.beginPath();
  ctx.moveTo(hinge.x, hinge.y - u * 0.4);
  ctx.lineTo(hinge.x + Math.cos(-open) * snoutLen, hinge.y + Math.sin(-open) * snoutLen - u * 0.1);
  ctx.lineTo(hinge.x + Math.cos(open) * snoutLen, hinge.y + Math.sin(open) * snoutLen + u * 0.1);
  ctx.closePath(); ctx.fill();

  // mandíbula superior (hocico)
  ctx.save(); ctx.translate(hinge.x, hinge.y); ctx.rotate(-open);
  ctx.fillStyle = top;
  ctx.beginPath();
  ctx.moveTo(-hr * 0.4, -u * 0.55); ctx.lineTo(snoutLen, -u * 0.5);
  ctx.quadraticCurveTo(snoutLen + u * 0.18, -u * 0.18, snoutLen - u * 0.05, u * 0.02);
  ctx.lineTo(-hr * 0.4, u * 0.05); ctx.closePath(); ctx.fill();
  // nariz
  ctx.fillStyle = bot; ctx.beginPath(); ctx.arc(snoutLen - u * 0.18, -u * 0.28, u * 0.07, 0, Math.PI * 2); ctx.fill();
  // dientes superiores
  ctx.fillStyle = "#fff";
  for (let i = 0; i < 4; i++) { const tx = u * 0.18 + i * (snoutLen - u * 0.3) / 4; ctx.beginPath(); ctx.moveTo(tx, u * 0.02); ctx.lineTo(tx + u * 0.1, u * 0.02); ctx.lineTo(tx + u * 0.05, u * 0.22); ctx.closePath(); ctx.fill(); }
  ctx.restore();

  // mandíbula inferior
  ctx.save(); ctx.translate(hinge.x, hinge.y); ctx.rotate(open);
  ctx.fillStyle = bot;
  ctx.beginPath();
  ctx.moveTo(-hr * 0.4, u * 0.5); ctx.lineTo(snoutLen - u * 0.1, u * 0.45);
  ctx.quadraticCurveTo(snoutLen - u * 0.02, u * 0.2, snoutLen - u * 0.2, u * 0.06);
  ctx.lineTo(-hr * 0.4, u * 0.05); ctx.closePath(); ctx.fill();
  // dientes inferiores
  ctx.fillStyle = "#fff";
  for (let i = 0; i < 4; i++) { const tx = u * 0.18 + i * (snoutLen - u * 0.45) / 4; ctx.beginPath(); ctx.moveTo(tx, u * 0.1); ctx.lineTo(tx + u * 0.1, u * 0.1); ctx.lineTo(tx + u * 0.05, -u * 0.1); ctx.closePath(); ctx.fill(); }
  ctx.restore();

  // ojo
  const blink = blinkT > 0.92;
  ctx.fillStyle = "#fff";
  if (!blink) {
    ctx.beginPath(); ctx.ellipse(hx + u * 0.05, hy - u * 0.3, u * 0.2, u * 0.24, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = hurt ? "#d83a28" : "#1a1a1a";
    ctx.beginPath(); ctx.arc(hx + u * 0.12, hy - u * 0.27, u * 0.1, 0, Math.PI * 2); ctx.fill();
    if (hurt) { // cejas de enojo
      ctx.strokeStyle = "#7a1d0d"; ctx.lineWidth = u * 0.09; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(hx - u * 0.18, hy - u * 0.6); ctx.lineTo(hx + u * 0.28, hy - u * 0.45); ctx.stroke();
    }
  } else { ctx.strokeStyle = "#1a1a1a"; ctx.lineWidth = u * 0.07; ctx.beginPath(); ctx.moveTo(hx - u * 0.1, hy - u * 0.28); ctx.lineTo(hx + u * 0.25, hy - u * 0.28); ctx.stroke(); }

  ctx.restore(); // cierra la rotación de la cabeza
  ctx.restore(); // cierra el dino completo
  return { mouthX: hinge.x + Math.cos(0) * snoutLen * 0.7, mouthY: hinge.y - u * 0.1, mouthR: snoutLen * 0.85, bodyCX, bodyCY, bodyRX, bodyRY, hx, hy, hr };
}

/* ── Meteorito en llamas ── */
function drawMeteor(ctx, X, Y, r, rot) {
  ctx.save(); ctx.translate(X, Y);
  // estela de fuego (hacia arriba, opuesto a la caída)
  const tail = ctx.createLinearGradient(0, -r * 5, 0, 0);
  tail.addColorStop(0, "rgba(255,180,40,0)"); tail.addColorStop(0.5, "rgba(255,120,20,.45)"); tail.addColorStop(1, "rgba(255,80,10,.85)");
  ctx.fillStyle = tail;
  ctx.beginPath(); ctx.moveTo(-r * 0.7, 0); ctx.quadraticCurveTo(-r * 0.3, -r * 4, 0, -r * 5); ctx.quadraticCurveTo(r * 0.3, -r * 4, r * 0.7, 0); ctx.closePath(); ctx.fill();
  // halo caliente
  ctx.shadowColor = "#ff7a18"; ctx.shadowBlur = r * 1.2;
  ctx.rotate(rot);
  const rock = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.2, 0, 0, r);
  rock.addColorStop(0, "#6b5048"); rock.addColorStop(0.6, "#3a2622"); rock.addColorStop(1, "#1c1110");
  ctx.fillStyle = rock;
  ctx.beginPath();
  for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2, rr = r * (0.82 + ((i * 7) % 5) * 0.045); const xx = Math.cos(a) * rr, yy = Math.sin(a) * rr; i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
  ctx.closePath(); ctx.fill();
  // borde incandescente
  ctx.shadowBlur = 0; ctx.strokeStyle = "rgba(255,140,40,.7)"; ctx.lineWidth = r * 0.12; ctx.stroke();
  // cráteres
  ctx.fillStyle = "rgba(0,0,0,.3)";
  ctx.beginPath(); ctx.arc(r * 0.2, -r * 0.1, r * 0.18, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(-r * 0.25, r * 0.25, r * 0.12, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

/* ── Juego Dino · esquiva meteoritos (canvas, RAF loop) ── */
function DodgeGame({ lang, accent, onVibeAdd, onExit, onRestart, muted, haptics }) {
  const canvasRef = useRef(null);
  const gRef = useRef(null);
  const rafRef = useRef(null);
  const pausedRef = useRef(false);
  const langRef = useRef(lang);
  const accentRef = useRef(accent);
  const onVibeRef = useRef(onVibeAdd);
  const mutedRef = useRef(muted);
  const acRef = useRef(null);

  useEffect(() => { langRef.current = lang; }, [lang]);
  useEffect(() => { accentRef.current = accent; }, [accent]);
  useEffect(() => { onVibeRef.current = onVibeAdd; }, [onVibeAdd]);
  useEffect(() => { mutedRef.current = muted; }, [muted]);

  const [hud, setHud] = useState({ hp: 100, score: 0, lvl: 1, over: false, paused: false, msg: null, eaten: 0 });

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    /* audio local */
    const ac = () => { try { if (!acRef.current) acRef.current = new (window.AudioContext || window.webkitAudioContext)(); return acRef.current; } catch (e) { return null; } };
    const noise = (dur, vol, freq, type, q) => {
      if (mutedRef.current) return; const ctx = ac(); if (!ctx) return;
      try { const n = Math.max(1, Math.floor(ctx.sampleRate * dur)), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
        for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
        const s = ctx.createBufferSource(); s.buffer = buf; const g = ctx.createGain(); g.gain.value = vol;
        const f = ctx.createBiquadFilter(); f.type = type || "highpass"; f.frequency.value = freq; try { f.Q.value = q || 1; } catch (e) {}
        s.connect(f); f.connect(g); g.connect(ctx.destination); s.start(); } catch (e) {}
    };
    const sweep = (f1, f2, dur, vol, type, vibHz, vibAmt) => {
      if (mutedRef.current) return; const ctx = ac(); if (!ctx) return;
      try { const s = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(); o.type = type || "sawtooth";
        o.frequency.setValueAtTime(f1, s); o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), s + dur);
        if (vibHz) { const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = vibHz; lg.gain.value = vibAmt || 40; lfo.connect(lg); lg.connect(o.frequency); lfo.start(s); lfo.stop(s + dur); }
        g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(vol, s + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, s + dur);
        o.connect(g); g.connect(ctx.destination); o.start(s); o.stop(s + dur + 0.03); } catch (e) {}
    };
    const sndScreech = () => { sweep(1100, 240, 0.4, 0.2, "sawtooth", 30, 70); noise(0.25, 0.18, 2600, "highpass", 0.7); };
    const sndBoom = () => { sweep(140, 45, 0.35, 0.32, "sine"); noise(0.18, 0.4, 500, "lowpass", 0.8); };
    const sndRoar = () => { sweep(180, 70, 0.5, 0.26, "sawtooth", 18, 30); sweep(90, 50, 0.5, 0.18, "square"); };
    // rugido de depredador (más grave, largo y gutural) — suena de vez en cuando
    const sndPredator = () => { sweep(150, 55, 0.85, 0.3, "sawtooth", 11, 24); sweep(70, 42, 0.9, 0.22, "square", 7, 12); noise(0.4, 0.1, 320, "lowpass", 0.7); };
    const sndCrunch = () => { noise(0.07, 0.45, 1400, "bandpass", 1.2); noise(0.05, 0.4, 600, "lowpass", 1); sweep(420, 120, 0.12, 0.2, "square"); };
    const buzz = (p) => { if (!haptics) return; try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };

    const g = { px: 0.5, prevPx: 0.5, face: 1, faceTarget: 1, nextRoar: 4500, obs: [], embers: [], sparks: [], hp: 100, score: 0, lvl: 1, spawnIn: 700, elapsed: 0, levelUpAt: 14000, scroll: 0,
      inv: 0, hurtUntil: 0, jaw: 0, chompUntil: 0, blink: 0, prevTs: null, running: true };
    for (let i = 0; i < 22; i++) g.embers.push({ x: Math.random(), y: Math.random(), sp: 0.2 + Math.random() * 0.5, r: 0.6 + Math.random() * 1.8, ph: Math.random() * 6.28 });
    gRef.current = g;

    const addSparks = (x, y, col, n) => { for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, sp = 0.05 + Math.random() * 0.22; g.sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 0.06, life: 1, col }); } };

    const drawFrame = () => {
      const ctx = c.getContext("2d");
      const W = c.width, H = c.height, now = Date.now();
      const hurt = now < g.hurtUntil;
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      // cielo prehistórico
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, "#1c0a1e"); sky.addColorStop(0.4, "#5a1410"); sky.addColorStop(0.72, "#a83410"); sky.addColorStop(1, "#d9651a");
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

      // shake
      if (hurt) { const m = (g.hurtUntil - now) / 220 * 9; ctx.translate((Math.random() - 0.5) * m, (Math.random() - 0.5) * m); }

      const gy = H * 0.9;
      // sol/calina
      const sun = ctx.createRadialGradient(W * 0.5, gy, 0, W * 0.5, gy, H * 0.55);
      sun.addColorStop(0, "rgba(255,200,90,.55)"); sun.addColorStop(0.4, "rgba(255,120,30,.22)"); sun.addColorStop(1, "rgba(255,120,30,0)");
      ctx.fillStyle = sun; ctx.fillRect(-20, 0, W + 40, H);

      // embers flotantes
      g.embers.forEach((e) => { const ey = (e.y - (g.elapsed * 0.00004 * e.sp)) % 1, yy = (ey < 0 ? ey + 1 : ey) * H; ctx.fillStyle = `rgba(255,${140 + ((e.r * 40) | 0)},60,${0.35 + 0.3 * Math.sin(g.elapsed * 0.003 + e.ph)})`; ctx.beginPath(); ctx.arc(e.x * W, yy, e.r, 0, Math.PI * 2); ctx.fill(); });

      // helper: capa que hace scroll y se repite (parallax)
      const wrap = (period, f) => -((((g.scroll * f) % period) + period) % period);

      // capa lejana: montañas silueta (scroll lento)
      ctx.fillStyle = "#1a0a10";
      { const period = W * 0.5, off = wrap(period, 0.12);
        for (let x = off - period; x < W + period; x += period) {
          ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x + period * 0.5, gy - H * 0.17); ctx.lineTo(x + period, gy); ctx.closePath(); ctx.fill();
        } }

      // capa media: volcanes en erupción (scroll medio) → quedan atrás al huir
      { const period = W * 1.15, off = wrap(period, 0.3);
        for (let vx = off - period; vx < W + period; vx += period) {
          const cxV = vx + period * 0.5;
          ctx.fillStyle = "#241015";
          ctx.beginPath(); ctx.moveTo(cxV - W * 0.16, gy); ctx.lineTo(cxV, gy - H * 0.28); ctx.lineTo(cxV + W * 0.16, gy); ctx.closePath(); ctx.fill();
          ctx.fillStyle = "rgba(255,90,20,.85)"; ctx.shadowColor = "#ff5a14"; ctx.shadowBlur = 18;
          ctx.beginPath(); ctx.moveTo(cxV - W * 0.04, gy - H * 0.255); ctx.lineTo(cxV, gy - H * 0.29); ctx.lineTo(cxV + W * 0.04, gy - H * 0.255); ctx.lineTo(cxV + W * 0.02, gy - H * 0.18); ctx.lineTo(cxV - W * 0.02, gy - H * 0.18); ctx.closePath(); ctx.fill();
          ctx.shadowBlur = 0;
        } }

      // suelo
      const ground = ctx.createLinearGradient(0, gy, 0, H);
      ground.addColorStop(0, "#3a1d10"); ground.addColorStop(1, "#1c0d08");
      ctx.fillStyle = ground; ctx.fillRect(-20, gy, W + 40, H - gy);
      // rocas en primer plano (scroll rápido) → fuerte sensación de carrera
      { const period = W * 0.32, off = wrap(period, 0.7);
        ctx.fillStyle = "#241007";
        for (let rx = off - period; rx < W + period; rx += period) {
          ctx.beginPath(); ctx.ellipse(rx + period * 0.5, gy + (H - gy) * 0.55, W * 0.055, (H - gy) * 0.2, 0, 0, Math.PI * 2); ctx.fill();
        } }
      // grietas de lava que cruzan el suelo (scroll rápido)
      { const period = W * 0.45, off = wrap(period, 0.7);
        ctx.strokeStyle = "rgba(255,90,20,.3)"; ctx.lineWidth = 2;
        for (let lx = off - period; lx < W + period; lx += period) {
          ctx.beginPath(); ctx.moveTo(lx, H); ctx.lineTo(lx + period * 0.28, gy + 6); ctx.stroke();
        } }

      // meteoritos
      for (const o of g.obs) drawMeteor(ctx, o.x * W, o.y * H, o.r * W, o.rot);

      // sparks
      g.sparks.forEach((s) => { ctx.fillStyle = s.col.replace("ALPHA", s.life.toFixed(2)); ctx.beginPath(); ctx.arc(s.x * W, s.y * H, 3 * s.life + 1, 0, Math.PI * 2); ctx.fill(); });

      // dino (gira el cuerpo al cambiar de dirección: g.face va de 1 a -1 pasando por 0)
      const u = Math.max(13, Math.min(27, W * 0.055));
      const flicker = g.inv && now < g.inv && Math.floor(now / 90) % 2 === 0;
      if (!flicker) {
        const dcx = g.px * W, sx = Math.abs(g.face) < 0.06 ? (g.face < 0 ? -0.06 : 0.06) : g.face;
        ctx.save(); ctx.translate(dcx, 0); ctx.scale(sx, 1); ctx.translate(-dcx, 0);
        g.dino = drawDino(ctx, dcx, gy + u * 0.05, u, g.jaw, hurt, (g.blink % 4), g.scroll * 0.05);
        ctx.restore();
      }

      // viñeta roja al recibir golpe
      if (hurt) { const a = (g.hurtUntil - now) / 220 * 0.5; ctx.setTransform(1, 0, 0, 1, 0, 0); const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.7); v.addColorStop(0, "rgba(255,0,0,0)"); v.addColorStop(1, `rgba(255,0,0,${Math.max(0, a)})`); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H); }
    };

    const loop = (ts) => {
      if (!g.running) return;
      if (pausedRef.current) { drawFrame(); rafRef.current = requestAnimationFrame(loop); return; }
      const W = c.width, H = c.height, now = Date.now();
      const dt = g.prevTs !== null ? Math.min(50, ts - g.prevTs) : 16;
      g.prevTs = ts; g.elapsed += dt; g.blink += dt * 0.0009;
      g.scroll += dt * 0.22 * (1 + g.lvl * 0.07); // el mundo corre más rápido por era

      // dirección: si va hacia un lado, el dino encara ese lado (gira el cuerpo, no retrocede)
      const dpx = g.px - g.prevPx; g.prevPx = g.px;
      if (dpx > 0.0008) g.faceTarget = 1; else if (dpx < -0.0008) g.faceTarget = -1;
      g.face += (g.faceTarget - g.face) * 0.18; // giro suave

      // rugido de depredador de vez en cuando
      if (!g.roarInit) { g.roarInit = true; g.nextRoar = now + 4500; }
      if (now >= g.nextRoar) { g.nextRoar = now + 6000 + Math.random() * 9000; if (g.jaw < 0.2) sndPredator(); }

      // mandíbula → objetivo según mordida
      const jawTarget = now < g.chompUntil ? 1 : 0;
      g.jaw += (jawTarget - g.jaw) * 0.35;

      // aparición de meteoritos (más rápido y agresivo por nivel)
      g.spawnIn -= dt;
      if (g.spawnIn <= 0) {
        const interval = Math.max(280, 950 - g.lvl * 70);
        g.spawnIn = interval * (0.55 + Math.random() * 0.7);
        const big = Math.random() < 0.22;
        g.obs.push({ id: ++pid, x: 0.06 + Math.random() * 0.88, y: -0.08,
          r: (big ? 0.05 : 0.032) + Math.random() * 0.018,
          dmg: big ? 26 : 16,
          vy: (0.00036 + g.lvl * 0.00003) * (0.85 + Math.random() * 0.5) + g.lvl * 0.00002,
          vx: (Math.random() - 0.5) * 0.00016, rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.01 });
      }

      // subir de era
      if (g.elapsed >= g.levelUpAt) {
        g.lvl++; g.levelUpAt += Math.max(7000, 13000 - g.lvl * 600);
        const lvl = g.lvl, msg = langRef.current === "es" ? `¡ERA ${lvl}!` : `ERA ${lvl}!`;
        setHud(h => ({ ...h, lvl, msg })); setTimeout(() => setHud(h => ({ ...h, msg: null })), 1400);
      }

      const u = Math.max(13, Math.min(27, W * 0.055)), gy = H * 0.9;
      const lift = g.jaw * u * 0.6, fd = g.faceTarget; // lado al que mira la cabeza
      const px = g.px * W, bodyCY = gy - u * 1.05, hx = px + fd * u * 0.75, hy = gy - u * 2.05 - lift;
      const mouthX = hx + fd * u * 0.6, mouthY = hy + u * 0.05;
      const inv = now < g.inv, chomping = now < g.chompUntil;
      const next = []; let hitDmg = 0;

      for (const o of g.obs) {
        o.y += o.vy * dt; o.x = Math.max(0.03, Math.min(0.97, o.x + o.vx * dt)); o.rot += o.vr * dt;
        if (o.y > 1.12) continue;
        const ox = o.x * W, oy = o.y * H, orad = o.r * W;
        // ¿el dino lo muerde?
        if (chomping) {
          const mdx = ox - mouthX, mdy = oy - mouthY;
          if (mdx * mdx + mdy * mdy < (u * 1.0 + orad) * (u * 1.0 + orad)) {
            g.score += 25; addSparks(o.x, o.y, "rgba(255,200,80,ALPHA)", 14); sndCrunch(); buzz(18);
            setHud(h => ({ ...h, score: g.score, eaten: (h.eaten || 0) + 1 })); continue;
          }
        }
        // ¿golpea al dino?
        if (!inv) {
          const bdx = ox - px, bdy = oy - bodyCY, hdx = ox - hx, hdy = oy - hy;
          const bodyHit = bdx * bdx + (bdy * 1.1) * (bdy * 1.1) < (u * 1.15 + orad) * (u * 1.15 + orad);
          const headHit = hdx * hdx + hdy * hdy < (u * 0.82 + orad) * (u * 0.82 + orad);
          if (bodyHit || headHit) { hitDmg = Math.max(hitDmg, o.dmg); addSparks(o.x, o.y, "rgba(255,90,30,ALPHA)", 16); continue; }
        }
        next.push(o);
      }
      g.obs = next;

      // sparks update
      g.sparks = g.sparks.filter((s) => { s.x += s.vx * dt * 0.06; s.y += s.vy * dt * 0.06; s.vy += dt * 0.0006; s.life -= dt * 0.0018; return s.life > 0; });

      // aplicar daño
      if (hitDmg > 0) {
        g.hp = Math.max(0, g.hp - hitDmg); g.inv = now + 800; g.hurtUntil = now + 230;
        sndBoom(); sndScreech(); buzz([0, 50, 30, 60]);
        if (g.hp <= 0) {
          g.running = false; drawFrame();
          const sc = g.score; setHud(h => ({ ...h, hp: 0, score: sc, over: true }));
          onVibeRef.current(sc); return;
        }
        setHud(h => ({ ...h, hp: g.hp }));
      }

      // puntaje por supervivencia
      const sc = Math.floor(g.elapsed / 200) + g.score;
      const showScore = sc;
      if (showScore !== g._lastShown) { g._lastShown = showScore; setHud(h => (h.score === showScore ? h : { ...h, score: showScore })); }

      drawFrame(); rafRef.current = requestAnimationFrame(loop);
    };

    // mordida desde fuera
    g.chomp = () => { if (!g.running || pausedRef.current) return; g.chompUntil = Date.now() + 280; sndRoar(); buzz(12); };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      g.running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      try { acRef.current && acRef.current.close(); } catch (e) {}
    };
  }, []);

  const dragging = useRef(false);
  const downAt = useRef({ x: 0, t: 0 });
  const grab = useRef({ x: 0, px: 0.5 });
  // arrastre RELATIVO: el dino se siente "agarrado" por el dedo, no se teletransporta
  const movePtr = (clientX) => {
    const cv = canvasRef.current, g = gRef.current;
    if (!cv || !g || g.over || clientX == null) return;
    const r = cv.getBoundingClientRect(); if (!r.width) return;
    let np = grab.current.px + (clientX - grab.current.x) / r.width;
    if (np < 0.06) { np = 0.06; grab.current = { x: clientX, px: 0.06 }; }       // re-ancla en el borde
    else if (np > 0.94) { np = 0.94; grab.current = { x: clientX, px: 0.94 }; }   // para responder al instante al volver
    g.px = np;
  };
  const startDrag = (clientX) => {
    const g = gRef.current; if (!g || g.over || clientX == null) return;
    dragging.current = true; downAt.current = { x: clientX, t: Date.now() };
    grab.current = { x: clientX, px: g.px }; // ancla: a partir de aquí el dino sigue el desplazamiento del dedo
  };
  const endDrag = (clientX) => {
    if (!dragging.current) return; dragging.current = false;
    const dx = Math.abs((clientX ?? downAt.current.x) - downAt.current.x), dtm = Date.now() - downAt.current.t;
    if (dx < 14 && dtm < 350 && gRef.current && !gRef.current.over) gRef.current.chomp && gRef.current.chomp();
  };

  const togglePause = () => { pausedRef.current = !pausedRef.current; if (pausedRef.current) gRef.current && (gRef.current.prevTs = null); setHud(h => ({ ...h, paused: pausedRef.current })); };
  const t = T[lang];
  const hp = Math.max(0, Math.round(hud.hp));
  const hpCol = hp > 55 ? "#5fd35f" : hp > 25 ? "#ffce3a" : "#ff4d4d";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 40, userSelect: "none", WebkitUserSelect: "none" }}>
      {/* los controles van en el canvas: así los botones de los overlays (pausa/fin) nunca quedan bloqueados */}
      <canvas ref={canvasRef} style={{ display: "block", position: "absolute", inset: 0, touchAction: "none" }}
         onMouseDown={(e) => startDrag(e.clientX)}
         onMouseMove={(e) => { if (dragging.current) movePtr(e.clientX); }}
         onMouseUp={(e) => endDrag(e.clientX)}
         onMouseLeave={() => endDrag()}
         onTouchStart={(e) => { e.preventDefault(); startDrag(e.touches[0]?.clientX); }}
         onTouchMove={(e) => { e.preventDefault(); movePtr(e.touches[0]?.clientX); }}
         onTouchEnd={(e) => { e.preventDefault(); endDrag(e.changedTouches[0]?.clientX); }} />

      {/* HUD superior: barra de vida + puntaje + era */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", pointerEvents: "none", zIndex: 2, fontFamily: "'Fredoka', sans-serif", fontWeight: 700, gap: 12 }}>
        <div style={{ flex: 1, maxWidth: 220 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,.85)", marginBottom: 3 }}>🦖 {t.dHp} <span style={{ color: hpCol }}>{hp}</span></div>
          <div style={{ height: 12, borderRadius: 999, background: "rgba(0,0,0,.45)", overflow: "hidden", border: "1px solid rgba(255,255,255,.18)" }}>
            <div style={{ height: "100%", width: `${hp}%`, background: `linear-gradient(90deg, ${hpCol}, ${hpCol}cc)`, borderRadius: 999, transition: "width .18s ease, background .3s ease", boxShadow: `0 0 10px ${hpCol}` }} />
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 18, color: accent }}>⭐ {hud.score}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.8)" }}>{lang === "es" ? "Era" : "Era"} {hud.lvl}{hud.eaten ? ` · 🦴 ${hud.eaten}` : ""}</div>
        </div>
      </div>

      {!hud.over && (
        <div style={{ position: "absolute", top: 52, right: 14, display: "flex", gap: 6, zIndex: 3 }}>
          <button onClick={togglePause} style={{ border: "none", background: "rgba(0,0,0,.4)", color: "#fff", borderRadius: 999, width: 34, height: 34, cursor: "pointer", fontSize: 16 }}>{hud.paused ? "▶️" : "⏸️"}</button>
          <button onClick={onExit} style={{ border: "none", background: "rgba(0,0,0,.4)", color: "#fff", borderRadius: 999, width: 34, height: 34, cursor: "pointer", fontSize: 15 }}>✕</button>
        </div>
      )}

      {!hud.over && !hud.paused && g_showHint(hud) && (
        <div style={{ position: "absolute", left: "50%", bottom: 26, transform: "translateX(-50%)", zIndex: 3, pointerEvents: "none", fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 14, color: "rgba(255,255,255,.85)", background: "rgba(0,0,0,.35)", padding: "8px 16px", borderRadius: 999, whiteSpace: "nowrap", textAlign: "center" }}>{t.dTapRoar}</div>
      )}

      {hud.paused && !hud.over && (
        <div onClick={togglePause} style={{ position: "absolute", inset: 0, zIndex: 4, background: "rgba(20,8,8,.78)", backdropFilter: "blur(4px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, cursor: "pointer" }}>
          <div style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 38, color: "#fff" }}>⏸️ {lang === "es" ? "En pausa" : "Paused"}</div>
          <button onClick={(e) => { e.stopPropagation(); togglePause(); }} style={{ border: "none", cursor: "pointer", borderRadius: 16, padding: "14px 40px", background: accent, color: "#1a1a2e", fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 20 }}>▶️ {lang === "es" ? "Reanudar" : "Resume"}</button>
        </div>
      )}

      {hud.msg && (
        <div style={{ position: "absolute", left: "50%", top: "26%", transform: "translateX(-50%)", zIndex: 6, pointerEvents: "none", fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: "clamp(32px,10vw,48px)", color: "#FFB13D", textShadow: "0 0 30px #FF6A2C", animation: "eb-bigMsg 1.4s ease forwards", textAlign: "center", whiteSpace: "nowrap" }}>{hud.msg}</div>
      )}

      {hud.over && (
        <div style={{ position: "absolute", inset: 0, zIndex: 5, background: "rgba(20,6,6,.88)", backdropFilter: "blur(6px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, textAlign: "center", padding: 24 }}>
          <div style={{ fontSize: 66 }}>☄️</div>
          <div style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: "clamp(34px,11vw,50px)", color: "#FF5A3C", textShadow: "0 0 30px #FF5A3C" }}>{t.dOver}</div>
          <div style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 26, color: accent }}>🦖 {t.dScore}: {hud.score}</div>
          <div style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 17, color: "rgba(255,255,255,.75)" }}>{t.dLevel}: {hud.lvl}{hud.eaten ? ` · 🦴 ${hud.eaten}` : ""}</div>
          <div style={{ display: "flex", gap: 12, marginTop: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <button onClick={onRestart} style={{ border: "none", cursor: "pointer", borderRadius: 14, padding: "14px 28px", background: accent, color: "#1a1a2e", fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 18 }}>🦖 {t.dAgain}</button>
            <button onClick={onExit} style={{ border: "none", cursor: "pointer", borderRadius: 14, padding: "14px 28px", background: "rgba(255,255,255,.12)", color: "#fff", fontFamily: "'Fredoka', sans-serif", fontWeight: 600, fontSize: 16 }}>{t.gMenu}</button>
          </div>
        </div>
      )}
    </div>
  );
}
// pista visible solo los primeros segundos (hasta interactuar)
function g_showHint(hud) { return hud.score < 6 && !hud.eaten; }


function PlatformHome({ lang, setLang, onPlay, onMultiplayer, supabaseReady }) {
  const [audience, setAudience] = useState("all");
  const copy = {
    es: { title: "EL BOTÓN", eyebrow: "MINI-JUEGOS PARA TODOS", subtitle: "Partidas rápidas, dificultad creciente y recompensas que te hacen querer intentarlo otra vez.", play: "Jugar", all: "Todos", kids: "Niños", teens: "Adolescentes", adults: "Adultos", featured: "Juegos disponibles", soon: "Próximamente", multiplayer: "Jugar con amigos", install: "Instalable en tu móvil", rewards: "Niveles, rachas y recompensas", quick: "Partidas cortas, diversión inmediata" },
    en: { title: "THE BUTTON", eyebrow: "MINI GAMES FOR EVERYONE", subtitle: "Quick sessions, rising difficulty and rewards that make you want one more try.", play: "Play", all: "All", kids: "Kids", teens: "Teens", adults: "Adults", featured: "Available games", soon: "Coming soon", multiplayer: "Play with friends", install: "Installable on mobile", rewards: "Levels, streaks and rewards", quick: "Short rounds, instant fun" },
  }[lang];
  const cards = [
    { kind: "classic", emoji: "🔴", es: "El Botón", en: "The Button", descEs: "Reflejos, combos, retos y botón dorado.", descEn: "Reflexes, combos, challenges and golden button.", audience: ["kids","teens","adults"], grad: "linear-gradient(135deg,#7c3aed,#ec4899)" },
    { kind: "balloons", emoji: "🎈", es: "Globos", en: "Balloons", descEs: "Explota la meta antes de que termine el tiempo.", descEn: "Hit the target before time runs out.", audience: ["kids","teens","adults"], grad: "linear-gradient(135deg,#fb7185,#8b5cf6)" },
    { kind: "notes", emoji: "🎹", es: "Melodías", en: "Melodies", descEs: "Atrapa notas y completa melodías famosas.", descEn: "Catch notes and complete famous melodies.", audience: ["kids","teens","adults"], grad: "linear-gradient(135deg,#10b981,#0ea5e9)" },
    { kind: "dodge", emoji: "🦖", es: "Dino", en: "Dino", descEs: "Sobrevive, muerde y avanza por nuevas eras.", descEn: "Survive, bite and advance through new eras.", audience: ["teens","adults"], grad: "linear-gradient(135deg,#92400e,#ea580c)" },
  ];
  const filtered = audience === "all" ? cards : cards.filter((g) => g.audience.includes(audience));
  return <div className="platform-shell">
    <div className="platform-orb platform-orb-one"/><div className="platform-orb platform-orb-two"/>
    <header className="platform-nav">
      <div className="platform-logo"><span>●</span>{copy.title}</div>
      <div className="platform-lang">{["es","en"].map(l => <button key={l} className={lang===l?"active":""} onClick={()=>setLang(l)}>{l.toUpperCase()}</button>)}</div>
    </header>
    <main className="platform-main">
      <section className="platform-hero">
        <div className="platform-kicker">{copy.eyebrow}</div>
        <h1>{lang === "es" ? <>Un juego más.<br/><span>Y luego otro.</span></> : <>One more game.<br/><span>Then another.</span></>}</h1>
        <p>{copy.subtitle}</p>
        <div className="platform-benefits"><span>⚡ {copy.quick}</span><span>🏆 {copy.rewards}</span><span>📲 {copy.install}</span></div>
      </section>
      <section className="platform-library">
        <div className="platform-section-head"><div><small>{copy.featured}</small><h2>{lang === "es" ? "Elige tu próxima obsesión" : "Choose your next obsession"}</h2></div>
          <div className="platform-filters">{[["all",copy.all],["kids",copy.kids],["teens",copy.teens],["adults",copy.adults]].map(([id,label])=><button key={id} className={audience===id?"active":""} onClick={()=>setAudience(id)}>{label}</button>)}</div>
        </div>
        <div className="platform-grid">{filtered.map(g=><article key={g.kind} className="platform-card" style={{"--card-gradient":g.grad}}>
          <div className="platform-card-art"><span>{g.emoji}</span><div className="platform-difficulty">● ● ●</div></div>
          <div className="platform-card-body"><h3>{g[lang]}</h3><p>{lang === "es" ? g.descEs : g.descEn}</p><button onClick={()=>onPlay(g.kind)}>{copy.play} <span>→</span></button></div>
        </article>)}</div>
        {supabaseReady && <button className="platform-multiplayer" onClick={onMultiplayer}>👥 {copy.multiplayer}</button>}
      </section>
    </main>
    <footer className="platform-footer">{copy.title} · {new Date().getFullYear()}</footer>
  </div>;
}

export default function App() {
  const [lang, setLang] = useState("es");
  const [showPlatform, setShowPlatform] = useState(true);
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
  const poppedCount = useRef(0), escapedCount = useRef(0), poppedTotal = useRef(0), melodyRef = useRef([]), lastMelodyIdx = useRef(-1);

  // multijugador en vivo
  const [mp, setMpState] = useState({ open: false, status: "idle", code: "", role: "", kind: "balloons", players: [], countdown: 0 });
  const mpRef = useRef({ active: false, status: "idle", code: "", kind: "balloons", role: "", startAt: 0, dur: MP_DUR, melodyIdx: 0 });
  const channelRef = useRef(null), playersRef = useRef({}), nextProgressAt = useRef(0);
  const setMp = (u) => setMpState((prev) => (typeof u === "function" ? u(prev) : u));

  const [playerName, setPlayerName] = useState("");
  const [nameDraft, setNameDraft] = useState("");
  const [lb, setLb] = useState([]);
  const [showLB, setShowLB] = useState(false);
  const [showGames, setShowGames] = useState(false);
  const [lbOk, setLbOk] = useState(true);
  const [entered, setEntered] = useState(false);
  const [paused, setPaused] = useState(false);
  const [bigMsg, setBigMsg] = useState(null);
  const [dodgeActive, setDodgeActive] = useState(false);
  const [dodgeKey, setDodgeKey] = useState(0);

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
  useEffect(() => () => { try { channelRef.current && supabase && supabase.removeChannel(channelRef.current); } catch (e) {} }, []);
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
  // ráfaga de ruido con caída muy rápida → transitorio de "pop"
  const noiseBurst = (dur = 0.05, vol = 0.22, freq = 800, ftype = "highpass", q = 0.8) => {
    if (muted) return;
    try {
      const ctx = ac(), n = Math.max(1, Math.floor(ctx.sampleRate * dur));
      const buf = ctx.createBuffer(1, n, ctx.sampleRate), data = buf.getChannelData(0);
      for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
      const src = ctx.createBufferSource(); src.buffer = buf;
      const g = ctx.createGain(); g.gain.value = vol;
      const f = ctx.createBiquadFilter(); f.type = ftype; f.frequency.value = freq; try { f.Q.value = q; } catch (e) {}
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
  // sonido propio del globo: crack de ruido broadband + golpe grave seco (sin tono musical)
  const popTone = () => {
    if (muted) return;
    noiseBurst(0.045, 0.6, 1100, "bandpass", 0.7); // cuerpo del estallido
    noiseBurst(0.018, 0.5, 3800, "highpass", 0.5); // chasquido agudo
    tone(125, 0, 0.05, "sine", 0.32);              // golpe grave
    tone(72, 0.006, 0.07, "sine", 0.24);           // sub-golpe
  };
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
  const handleMiss = () => {};

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
  const loadGameLevel = (kind, L, breather, opts) => {
    const cfg = gameLevel(kind, L);
    poppedCount.current = 0; escapedCount.current = 0; poppedGuard.current = new Set();
    let goal = cfg.goal, time = cfg.time;
    if (kind === "notes") {
      let mi = opts && opts.melodyIdx != null ? opts.melodyIdx : Math.floor(Math.random() * MELODIES.length);
      if (!(opts && opts.melodyIdx != null) && MELODIES.length > 1 && mi === lastMelodyIdx.current) mi = (mi + 1) % MELODIES.length;
      lastMelodyIdx.current = mi; melodyRef.current = MELODIES[mi]; goal = melodyRef.current.length;
    }
    if (opts && opts.mp) { goal = Infinity; time = opts.dur || MP_DUR; } // multijugador: ronda fija por puntaje
    setBalloons([]); nextBalloonAt.current = Date.now() + breather;
    setBG((p) => ({ ...p, active: true, status: "playing", kind, level: L, goal, popped: 0, escaped: 0, progress: 0,
      timeLeft: time, duration: time, deadline: Date.now() + time * 1000,
      spawnMin: cfg.spawnMin, spawnRand: cfg.spawnRand, riseBase: cfg.riseBase, riseRand: cfg.riseRand }));
  };
  actions.current.startBalloonGame = (kind = "balloons", opts) => {
    setChallenge(null); setFrenzy(false); setGolden({ visible: false });
    poppedTotal.current = 0;
    loadGameLevel(kind, 1, opts && opts.mp ? 150 : 350, opts);
    chimeUp(); buzz(15);
  };
  actions.current.spawnBalloon = () => {
    const now = Date.now(); const bg = balloonGameRef.current;
    const h = boxRef.current.h; if (!h) { nextBalloonAt.current = now + 400; return; }
    let item;
    if (bg.kind === "notes") {
      const size = 66 + Math.floor(Math.random() * 22);
      item = { id: ++pid, kind: "notes", x: 6 + Math.random() * 88, w: size, h: size,
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
      // la melodía cicla: siempre suena como nota de piano (incluso en multijugador, meta infinita)
      if (mel.length) pianoNote(mel[idx % mel.length]); else sparkle();
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
    if (mpRef.current.active && mpRef.current.status === "playing") {
      mpRef.current.status = "over";
      const sc = poppedTotal.current;
      playersRef.current[playerId.current] = { name: nameRef.current || t.anon, score: sc, finished: true };
      try { channelRef.current && channelRef.current.send({ type: "broadcast", event: "finish", payload: { id: playerId.current, name: nameRef.current || t.anon, score: sc } }); } catch (e) {}
      fanfare(); buzz([0, 30, 40, 30]); saveScore();
      setMp((p) => ({ ...p, status: "over" })); mpSync();
    } else { sadTone(); buzz([0, 15, 30, 15]); saveScore(); }
  };
  actions.current.exitBalloonGame = () => {
    setBalloons([]); nextBalloonAt.current = Infinity;
    setBG({ active: false, status: "idle", kind: "balloons", level: 1, timeLeft: 0, popped: 0, escaped: 0, progress: 0, goal: 0, duration: 0, deadline: 0 });
    nextChAt.current = Date.now() + 6000; goldenNextAt.current = Date.now() + 14000;
  };

  /* ── multijugador en vivo (Supabase Realtime) ── */
  const mpSync = () => {
    const st = channelRef.current ? channelRef.current.presenceState() : {};
    const ids = new Set([...Object.keys(st), ...Object.keys(playersRef.current)]);
    if (playerId.current) ids.add(playerId.current);
    const arr = [...ids].map((id) => {
      const pres = st[id] && st[id][0], pr = playersRef.current[id] || {};
      return { id, name: (pres && pres.name) || pr.name || (id === playerId.current ? (nameRef.current || t.anon) : t.anon),
        score: pr.score || 0, finished: !!pr.finished, me: id === playerId.current };
    });
    // el anfitrión re-difunde el juego elegido para los que se unen después
    if (mpRef.current.role === "host" && mpRef.current.status === "lobby") {
      try { channelRef.current && channelRef.current.send({ type: "broadcast", event: "kind", payload: { kind: mpRef.current.kind } }); } catch (e) {}
    }
    setMp((p) => ({ ...p, players: arr }));
  };
  const mpLeave = () => {
    try { channelRef.current && supabase && supabase.removeChannel(channelRef.current); } catch (e) {}
    channelRef.current = null; playersRef.current = {};
    mpRef.current = { active: false, status: "idle", code: "", kind: "balloons", role: "", startAt: 0, dur: MP_DUR, melodyIdx: 0 };
    if (balloonGameRef.current.active) actions.current.exitBalloonGame();
    setMp({ open: false, status: "idle", code: "", role: "", kind: "balloons", players: [], countdown: 0 });
  };
  const mpConnect = (code, role) => {
    if (!supabase) { setMp((p) => ({ ...p, open: true, status: "unavail" })); return; }
    try { channelRef.current && supabase.removeChannel(channelRef.current); } catch (e) {}
    playersRef.current = {};
    const ch = supabase.channel("eb-room-" + code, { config: { presence: { key: playerId.current }, broadcast: { self: false } } });
    channelRef.current = ch;
    ch.on("presence", { event: "sync" }, mpSync);
    ch.on("broadcast", { event: "start" }, ({ payload }) => mpOnStart(payload));
    ch.on("broadcast", { event: "progress" }, ({ payload }) => { playersRef.current[payload.id] = { ...(playersRef.current[payload.id] || {}), name: payload.name, score: payload.score }; mpSync(); });
    ch.on("broadcast", { event: "finish" }, ({ payload }) => { playersRef.current[payload.id] = { ...(playersRef.current[payload.id] || {}), name: payload.name, score: payload.score, finished: true }; mpSync(); });
    ch.on("broadcast", { event: "rematch" }, () => mpOnRematch());
    ch.on("broadcast", { event: "kind" }, ({ payload }) => { mpRef.current.kind = payload.kind; setMp((p) => ({ ...p, kind: payload.kind })); });
    ch.subscribe((status) => { if (status === "SUBSCRIBED") { try { ch.track({ name: nameRef.current || t.anon }); } catch (e) {} mpSync(); } });
    mpRef.current = { ...mpRef.current, active: true, status: "lobby", code, role };
    setMp((p) => ({ ...p, open: true, status: "lobby", code, role, players: [] }));
  };
  const mpCreate = () => { if (nameDraft.trim() && !playerName) saveName(); mpConnect(roomCode(), "host"); };
  const mpJoinCode = (raw) => { const c = (raw || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4); if (c.length !== 4) { setMp((p) => ({ ...p, error: t.mpBadCode })); return; } if (nameDraft.trim() && !playerName) saveName(); mpConnect(c, "guest"); };
  const mpStart = () => {
    const startAt = Date.now() + (MP_COUNTDOWN + 0.4) * 1000;
    const melodyIdx = Math.floor(Math.random() * MELODIES.length);
    const payload = { kind: mpRef.current.kind, startAt, melodyIdx, dur: MP_DUR };
    try { channelRef.current && channelRef.current.send({ type: "broadcast", event: "start", payload }); } catch (e) {}
    mpOnStart(payload);
  };
  const mpOnStart = (payload) => {
    Object.keys(playersRef.current).forEach((id) => { playersRef.current[id] = { ...playersRef.current[id], score: 0, finished: false }; });
    mpRef.current = { ...mpRef.current, status: "countdown", kind: payload.kind, dur: payload.dur, melodyIdx: payload.melodyIdx, startAt: payload.startAt };
    setMp((p) => ({ ...p, open: false, status: "countdown", kind: payload.kind, countdown: MP_COUNTDOWN })); mpSync();
    setTimeout(() => {
      if (mpRef.current.status !== "countdown") return;
      mpRef.current.status = "playing"; nextProgressAt.current = Date.now() + 400;
      setMp((p) => ({ ...p, status: "playing" }));
      actions.current.startBalloonGame(mpRef.current.kind, { mp: true, dur: mpRef.current.dur, melodyIdx: mpRef.current.melodyIdx });
    }, Math.max(0, payload.startAt - Date.now()));
  };
  const mpSetKind = (kind) => { mpRef.current.kind = kind; setMp((p) => ({ ...p, kind })); try { channelRef.current && channelRef.current.send({ type: "broadcast", event: "kind", payload: { kind } }); } catch (e) {} };
  // revancha: todos (anfitrión e invitados) vuelven al lobby con marcadores en cero
  const mpOnRematch = () => {
    Object.keys(playersRef.current).forEach((id) => { playersRef.current[id] = { ...playersRef.current[id], score: 0, finished: false }; });
    if (balloonGameRef.current.active) actions.current.exitBalloonGame();
    mpRef.current = { ...mpRef.current, status: "lobby" };
    setMp((p) => ({ ...p, open: true, status: "lobby" })); mpSync();
  };
  const mpRematch = () => {
    try { channelRef.current && channelRef.current.send({ type: "broadcast", event: "rematch", payload: {} }); } catch (e) {}
    mpOnRematch();
  };

  /* ── reloj maestro ── */
  useEffect(() => {
    const iv = setInterval(() => {
      if (!enteredRef.current || pausedRef.current) return;
      const now = Date.now();

      if (mpRef.current.active && mpRef.current.status === "countdown") {
        const cd = Math.max(0, Math.ceil((mpRef.current.startAt - now) / 1000));
        setMp((p) => (p.countdown !== cd ? { ...p, countdown: cd } : p));
      }

      const bg = balloonGameRef.current;
      if (bg.active) {
        if (bg.status === "playing") {
          if (now >= nextBalloonAt.current) actions.current.spawnBalloon();
          if (mpRef.current.active && mpRef.current.status === "playing" && now >= nextProgressAt.current) {
            nextProgressAt.current = now + 450;
            playersRef.current[playerId.current] = { name: nameRef.current || t.anon, score: poppedTotal.current, finished: false };
            try { channelRef.current && channelRef.current.send({ type: "broadcast", event: "progress", payload: { id: playerId.current, name: nameRef.current || t.anon, score: poppedTotal.current } }); } catch (e) {}
            mpSync();
          }
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
  const enterGame = (kind) => { if (nameDraft.trim()) saveName(); setEntered(true); if (kind === "dodge") { setDodgeActive(true); return; } if (kind !== "classic") actions.current.startBalloonGame(kind); };
  const pickGame = (kind) => { setShowGames(false); if (kind === "dodge") { setDodgeActive(true); return; } actions.current.startBalloonGame(kind); };
  const gameEmoji = balloonGame.kind === "notes" ? "🎹" : "🎈";
  const inMp = mp.status === "playing" || mp.status === "over" || mp.status === "countdown";
  const mpRanking = [...mp.players].sort((a, b) => b.score - a.score);
  const mpTop = mpRanking[0];
  const dimTitle = !!flash || !!toast || frenzy || !!bigMsg;
  const goldUrgent = golden.visible && golden.timeLeft <= 1.5;
  const btnFont = Math.max(15, Math.round(SIZE * 0.16));
  const faceExpr = frenzy ? "frenzy" : taunt ? "taunt" : pressed ? "tap" : combo >= 4 ? "wild" : combo >= 2 ? "happy" : "idle";

  if (showPlatform) {
    return <PlatformHome
      lang={lang}
      setLang={setLang}
      supabaseReady={!!supabase}
      onPlay={(kind) => {
        setShowPlatform(false);
        setEntered(true);
        if (kind === "dodge") setTimeout(() => setDodgeActive(true), 0);
        else if (kind !== "classic") setTimeout(() => actions.current.startBalloonGame(kind), 0);
      }}
      onMultiplayer={() => {
        setShowPlatform(false);
        setEntered(true);
        setTimeout(() => setMp((p) => ({ ...p, open: true, status: "menu", error: "" })), 0);
      }}
    />;
  }

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
              <span style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 15, color: "#fff" }}>{inMp ? "👥" : `${t.bLevel} ${balloonGame.level}`} · {gameEmoji} {balloonGame.progress}{Number.isFinite(balloonGame.goal) ? `/${balloonGame.goal}` : ""}</span>
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
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "rgba(255,255,255,.75)", fontWeight: 600 }}>{lang === "es" ? "Mini-juegos de buena vibra" : "Good-vibe mini games"}</p>
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
              {b.kind === "notes" ? <Note c={b.color} glyph={b.glyph} size={b.w} /> : <Balloon c={b.color} />}
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

        {entered && !balloonGame.active && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, zIndex: 6, padding: "0 8px" }}>
            <div style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 18, color: "rgba(255,255,255,.85)" }}>{lang === "es" ? "Elige tu juego" : "Choose your game"}</div>
            <div style={{ display: "flex", gap: 14, width: "100%", maxWidth: 360 }}>
              {GAMES.map((g) => (
                <button key={g.kind} onClick={(e) => { e.stopPropagation(); if (g.kind === "dodge") { setDodgeActive(true); } else { actions.current.startBalloonGame(g.kind); } }} style={{ flex: 1, border: "none", cursor: "pointer", borderRadius: 22, padding: "30px 8px",
                  background: g.grad, color: "#fff", fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 18, display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                  boxShadow: "0 12px 30px rgba(0,0,0,.35)" }}>
                  <span style={{ fontSize: 44 }}>{g.emoji}</span>{g[lang]}
                </button>
              ))}
            </div>
            {supabase && (
              <button onClick={(e) => { e.stopPropagation(); setMp((p) => ({ ...p, open: true, status: "menu", error: "" })); }} style={{ border: "none", cursor: "pointer", borderRadius: 16, padding: "13px 22px",
                background: "rgba(255,255,255,.14)", color: "#fff", fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 16, marginTop: 4 }}>
                👥 {t.mpPlay}
              </button>
            )}
          </div>
        )}

        {mp.status === "playing" && mp.players.length > 0 && (
          <div style={{ position: "absolute", top: 6, left: 0, right: 0, display: "flex", flexDirection: "column", gap: 5, padding: "0 6px", zIndex: 12, pointerEvents: "none" }}>
            {[...mp.players].sort((a, b) => b.score - a.score).slice(0, 5).map((pl) => {
              const mx = Math.max(1, ...mp.players.map((x) => x.score));
              return (
                <div key={pl.id} style={{ background: "rgba(0,0,0,.32)", borderRadius: 10, padding: "4px 8px", border: pl.me ? `1px solid ${accent}` : "1px solid transparent" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: pl.me ? accent : "#fff", marginBottom: 2 }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>{pl.me ? t.you : pl.name} {pl.finished ? "🏁" : ""}</span><span>{pl.score}</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 999, background: "rgba(255,255,255,.14)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(pl.score / mx) * 100}%`, background: pl.me ? accent : "#fff", borderRadius: 999, transition: "width .25s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* stats */}
      <div style={{ width: "100%", maxWidth: 460, zIndex: 5 }}>
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 13, letterSpacing: 1.5, color: "rgba(255,255,255,.65)", fontWeight: 700, textTransform: "uppercase" }}>{t.vibe}</div>
          <div style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: "clamp(38px, 12vw, 56px)", lineHeight: 1, textShadow: `0 0 30px ${accent}66` }}>{vibe.toLocaleString()}</div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, fontSize: 12, color: "rgba(255,255,255,.6)", fontWeight: 700, flexWrap: "wrap" }}>
            {myRank > 0 && <span style={{ color: accent }}>🏆 #{myRank}</span>}
            {playerName && <span>{playerName}</span>}
          </div>
        </div>
        {entered && !playerName && lbOk && (
          <button onClick={() => { loadLeaderboard(); setShowLB(true); }} style={{ width: "100%", border: "none", cursor: "pointer", borderRadius: 16, padding: "13px",
            marginBottom: 10, background: `linear-gradient(135deg, ${accent}, ${level.glow})`, color: level.bg[0],
            fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 15, boxShadow: `0 6px 20px ${accent}55`, animation: "eb-breathe 3s ease-in-out infinite" }}>
            🏆 {t.nameNudge}
          </button>
        )}
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

      {balloonGame.active && balloonGame.status === "over" && !inMp && (
        <div style={{ position: "fixed", inset: 0, zIndex: 46, background: "rgba(10,8,26,.82)", backdropFilter: "blur(6px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 24, textAlign: "center" }}>
          <div style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: "clamp(34px, 11vw, 52px)", color: "#fff", textShadow: "0 0 30px rgba(0,0,0,.5)" }}>
            {t.bLose}
          </div>
          <div style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 22, color: "#FFD24D", textShadow: "0 0 24px #FFD24D" }}>{t.bReached} {balloonGame.level}</div>
          <div style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 20, color: accent }}>{gameEmoji} {balloonGame.kind === "notes" ? t.nNotes : t.bPopped}: {poppedTotal.current}</div>
          {!playerName && lbOk && (
            <div style={{ width: "100%", maxWidth: 320, marginTop: 4 }}>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,.8)", fontWeight: 700, marginBottom: 8 }}>🏆 {t.claimScore}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} placeholder={t.namePh} maxLength={16}
                  style={{ flex: 1, border: "none", borderRadius: 12, padding: "12px 14px", fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 15, background: "rgba(255,255,255,.14)", color: "#fff", outline: "none", textAlign: "center" }} />
                <button onClick={() => { if (nameDraft.trim()) saveName(); }} style={{ border: "none", cursor: "pointer", borderRadius: 12, padding: "0 18px", background: accent, color: level.bg[0], fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 15 }}>{t.save}</button>
              </div>
            </div>
          )}
          {playerName && <div style={{ fontSize: 13, color: "rgba(255,255,255,.6)", fontWeight: 700 }}>{playerName}{myRank > 0 ? ` · 🏆 #${myRank}` : ""}</div>}
          <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap", justifyContent: "center" }}>
            <button onClick={() => actions.current.startBalloonGame(balloonGame.kind)} style={{ border: "none", cursor: "pointer", borderRadius: 14, padding: "14px 28px", background: accent, color: level.bg[0], fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 18 }}>{gameEmoji} {t.bAgain}</button>
            <button onClick={() => actions.current.exitBalloonGame()} style={{ border: "none", cursor: "pointer", borderRadius: 14, padding: "14px 28px", background: "rgba(255,255,255,.12)", color: "#fff", fontFamily: "'Fredoka', sans-serif", fontWeight: 600, fontSize: 16 }}>{t.gMenu}</button>
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
            {supabase && (
              <button onClick={() => { if (nameDraft.trim()) saveName(); setEntered(true); setMp((p) => ({ ...p, open: true, status: "menu", error: "" })); }} style={{ border: "none", cursor: "pointer", borderRadius: 14, padding: "14px", background: "rgba(255,255,255,.16)", color: "#fff", fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 15 }}>👥 {t.mpPlay}</button>
            )}
            <button onClick={() => setEntered(true)} style={{ border: "none", cursor: "pointer", borderRadius: 14, padding: "13px", background: "rgba(255,255,255,.1)", color: "#fff", fontFamily: "'Fredoka', sans-serif", fontWeight: 600, fontSize: 15 }}>{lang === "es" ? "Jugar como invitado" : "Play as guest"}</button>
          </div>
          <div style={{ marginTop: 24, display: "flex", gap: 6, background: "rgba(255,255,255,.1)", borderRadius: 999, padding: 4 }}>
            {["es", "en"].map((l) => (
              <button key={l} onClick={() => setLang(l)} style={{ border: "none", cursor: "pointer", borderRadius: 999, padding: "6px 14px", fontFamily: "'Fredoka', sans-serif", fontWeight: 600, fontSize: 13, background: lang === l ? "#fff" : "transparent", color: lang === l ? level.bg[0] : "rgba(255,255,255,.7)" }}>{l.toUpperCase()}</button>
            ))}
          </div>
        </div>
      )}

      {/* multijugador: cuenta regresiva 3·2·1 */}
      {mp.status === "countdown" && (
        <div style={{ position: "fixed", inset: 0, zIndex: 48, background: "rgba(10,8,26,.85)", backdropFilter: "blur(6px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <div style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 20, color: "rgba(255,255,255,.85)" }}>{t.mpReady}</div>
          <div key={mp.countdown} style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: "clamp(70px, 26vw, 140px)", color: accent, textShadow: `0 0 40px ${accent}`, animation: "eb-pop .3s ease", lineHeight: 1 }}>{mp.countdown > 0 ? mp.countdown : "¡GO!"}</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,.7)", fontWeight: 700 }}>{(mp.kind === "notes" ? "🎹 " : "🎈 ") + (GAMES.find((g) => g.kind === mp.kind) || {})[lang]}</div>
        </div>
      )}

      {/* multijugador: resultados */}
      {mp.status === "over" && (
        <div style={{ position: "fixed", inset: 0, zIndex: 49, background: "rgba(10,8,26,.86)", backdropFilter: "blur(6px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 24, textAlign: "center" }}>
          <div style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: "clamp(30px, 9vw, 44px)", color: "#FFD24D", textShadow: "0 0 28px #FFD24D" }}>🏆 {t.mpResults}</div>
          {mpTop && <div style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 20, color: "#fff" }}>{mpRanking.length > 1 && mpRanking[0].score === mpRanking[1].score ? t.mpTie : t.mpWins(mpTop.me ? t.you : mpTop.name)}</div>}
          <div style={{ width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
            {mpRanking.map((pl, i) => (
              <div key={pl.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 14,
                background: pl.me ? `${accent}26` : "rgba(255,255,255,.06)", border: pl.me ? `1px solid ${accent}88` : "1px solid transparent" }}>
                <span style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 16, width: 26, color: i === 0 ? "#FFD24D" : "rgba(255,255,255,.6)" }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}</span>
                <span style={{ flex: 1, textAlign: "left", fontWeight: 700, fontSize: 15, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pl.me ? t.you : pl.name} {pl.finished ? "🏁" : "…"}</span>
                <span style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 16, color: accent }}>{pl.score} {t.mpScore}</span>
              </div>
            ))}
          </div>
          {mp.role !== "host" && <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)", fontWeight: 700, marginTop: 6, animation: "eb-breathe 2s ease-in-out infinite" }}>{t.mpWaitRematch}</div>}
          <div style={{ display: "flex", gap: 12, marginTop: 10, flexWrap: "wrap", justifyContent: "center" }}>
            {mp.role === "host" && (
              <button onClick={() => mpRematch()} style={{ border: "none", cursor: "pointer", borderRadius: 14, padding: "14px 26px", background: accent, color: level.bg[0], fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 17 }}>🔁 {t.mpAgain}</button>
            )}
            <button onClick={() => mpLeave()} style={{ border: "none", cursor: "pointer", borderRadius: 14, padding: "14px 26px", background: "rgba(255,255,255,.12)", color: "#fff", fontFamily: "'Fredoka', sans-serif", fontWeight: 600, fontSize: 16 }}>{t.mpLeave}</button>
          </div>
        </div>
      )}

      {/* multijugador: lobby / menú de sala */}
      {mp.open && (mp.status === "menu" || mp.status === "lobby" || mp.status === "unavail") && (
        <div onClick={() => mpLeave()} style={{ position: "fixed", inset: 0, zIndex: 47, background: "rgba(0,0,0,.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 380, background: level.bg[0], borderRadius: 22, padding: 22, boxShadow: `0 20px 60px rgba(0,0,0,.5), 0 0 0 1px ${accent}44` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 20, color: "#fff" }}>👥 {t.mpTitle}</h2>
              <button onClick={() => mpLeave()} style={{ border: "none", background: "rgba(255,255,255,.12)", color: "#fff", width: 32, height: 32, borderRadius: 999, cursor: "pointer", fontSize: 16 }}>✕</button>
            </div>

            {mp.status === "unavail" && <p style={{ color: "rgba(255,255,255,.7)", fontSize: 14, textAlign: "center", padding: "16px 0" }}>{t.mpUnavail}</p>}

            {mp.status === "menu" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <button onClick={() => mpCreate()} style={{ border: "none", cursor: "pointer", borderRadius: 14, padding: "15px", background: accent, color: level.bg[0], fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 17 }}>➕ {t.mpCreate}</button>
                <div style={{ display: "flex", gap: 8 }}>
                  <input value={mp.joinCode || ""} onChange={(e) => setMp((p) => ({ ...p, joinCode: e.target.value.toUpperCase().slice(0, 4), error: "" }))} placeholder={t.mpEnterCode} maxLength={4}
                    style={{ flex: 1, border: "none", borderRadius: 12, padding: "13px 14px", fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 18, letterSpacing: 3, textAlign: "center", background: "rgba(255,255,255,.12)", color: "#fff", outline: "none" }} />
                  <button onClick={() => mpJoinCode(mp.joinCode)} style={{ border: "none", borderRadius: 12, padding: "0 18px", cursor: "pointer", background: "rgba(255,255,255,.16)", color: "#fff", fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 15 }}>{t.mpJoin}</button>
                </div>
                {mp.error && <div style={{ color: "#FF8A8A", fontSize: 13, fontWeight: 700, textAlign: "center" }}>{mp.error}</div>}
              </div>
            )}

            {mp.status === "lobby" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{t.mpShareCode}</div>
                  <div style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 44, letterSpacing: 8, color: accent, textShadow: `0 0 24px ${accent}88` }}>{mp.code}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)", fontWeight: 700, marginBottom: 6 }}>{t.mpInRoom} ({mp.players.length})</div>
                  {mp.players.map((pl) => (
                    <div key={pl.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, marginBottom: 5, background: pl.me ? `${accent}22` : "rgba(255,255,255,.05)" }}>
                      <span style={{ fontSize: 15 }}>🙂</span>
                      <span style={{ flex: 1, fontWeight: 700, fontSize: 14, color: "#fff" }}>{pl.me ? `${pl.name} (${t.you})` : pl.name}</span>
                    </div>
                  ))}
                  {mp.players.length < 2 && <div style={{ fontSize: 13, color: "rgba(255,255,255,.55)", fontWeight: 700, textAlign: "center", padding: "4px 0" }}>{t.mpWaiting}</div>}
                </div>
                {mp.role === "host" ? (
                  <>
                    <div>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)", fontWeight: 700, marginBottom: 8, textAlign: "center" }}>🎮 {t.gChoose}</div>
                      <div style={{ display: "flex", gap: 10 }}>
                        {GAMES.filter((g) => g.mpOk !== false).map((g) => {
                          const sel = mp.kind === g.kind;
                          return (
                            <button key={g.kind} onClick={() => mpSetKind(g.kind)} style={{ flex: 1, border: "none", cursor: "pointer", borderRadius: 16, padding: "14px 6px", background: g.grad, color: "#fff",
                              fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 15, display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                              opacity: sel ? 1 : 0.45, boxShadow: sel ? `0 0 0 3px ${accent}, 0 8px 20px rgba(0,0,0,.3)` : "none", transform: sel ? "scale(1)" : "scale(.95)", transition: "all .15s" }}>
                              <span style={{ fontSize: 30 }}>{g.emoji}</span>{g[lang]}{sel && <span style={{ fontSize: 12 }}>✓</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <button onClick={() => mpStart()} disabled={mp.players.length < 2} style={{ border: "none", cursor: mp.players.length < 2 ? "default" : "pointer", borderRadius: 14, padding: "15px", background: mp.players.length < 2 ? "rgba(255,255,255,.1)" : accent, color: mp.players.length < 2 ? "rgba(255,255,255,.5)" : level.bg[0], fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 17 }}>
                      {mp.players.length < 2 ? t.mpNeed : t.mpStartBtn}
                    </button>
                  </>
                ) : (
                  <div style={{ textAlign: "center", padding: "6px 0" }}>
                    {(() => { const g = GAMES.find((x) => x.kind === mp.kind); return g ? (
                      <div style={{ fontSize: 14, color: "#fff", fontWeight: 700, marginBottom: 8 }}>{t.mpPickGame} {g.emoji} {g[lang]}</div>
                    ) : null; })()}
                    <div style={{ fontSize: 16, color: accent, fontWeight: 700, animation: "eb-breathe 2s ease-in-out infinite" }}>{t.mpWaitHost}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,.55)", fontWeight: 700, marginTop: 4 }}>{t.mpHostStarts}</div>
                  </div>
                )}
                <button onClick={() => mpLeave()} style={{ border: "none", cursor: "pointer", borderRadius: 12, padding: "11px", background: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.8)", fontFamily: "'Fredoka', sans-serif", fontWeight: 600, fontSize: 14 }}>{t.mpLeave}</button>
              </div>
            )}
          </div>
        </div>
      )}

      {dodgeActive && (
        <DodgeGame
          key={dodgeKey}
          lang={lang}
          accent={accent}
          muted={muted}
          haptics={haptics}
          onVibeAdd={(pts) => { setVibe((v) => v + pts); dirty.current = true; saveScore(); }}
          onExit={() => setDodgeActive(false)}
          onRestart={() => setDodgeKey((k) => k + 1)}
        />
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
