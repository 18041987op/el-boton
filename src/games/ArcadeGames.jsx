import React, { useEffect, useRef, useState } from "react";
import NeonEscape from "./NeonEscape";
import NeonRiftArena from "./NeonRiftArena";
import { BalloonPopGame, ClassicButtonGame, DinoSurvivalGame, MelodyCatchGame } from "./LegacyArcadeGames";

const ui = {
  overlay: { position: "fixed", inset: 0, zIndex: 100, display: "grid", placeItems: "center", padding: 18, background: "rgba(5,5,14,.94)", backdropFilter: "blur(12px)" },
  shell: { width: "min(680px,100%)", minHeight: 520, display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: 28, border: "1px solid rgba(255,255,255,.12)", background: "linear-gradient(180deg,#161629,#0b0b14)", boxShadow: "0 30px 90px rgba(0,0,0,.55)" },
  top: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,.08)" },
  close: { width: 38, height: 38, border: 0, borderRadius: 999, cursor: "pointer", color: "white", background: "rgba(255,255,255,.09)", fontSize: 18 },
  body: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" },
  action: { border: 0, borderRadius: 18, padding: "15px 24px", cursor: "pointer", fontWeight: 900, fontSize: 17, color: "#111", background: "white" },
};

function tone(freq = 440, duration = .08) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + duration);
    osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + duration);
  } catch {}
}

function Shell({ title, subtitle, onClose, children }) {
  return <div style={ui.overlay}>
    <div style={ui.shell}>
      <div style={ui.top}><div><strong style={{fontSize:20}}>{title}</strong><div style={{fontSize:12,color:"#aaa7b8",marginTop:3}}>{subtitle}</div></div><button style={ui.close} onClick={onClose}>✕</button></div>
      <div style={ui.body}>{children}</div>
    </div>
  </div>;
}

function ReflexGame({ lang, onClose }) {
  const [phase, setPhase] = useState("intro");
  const [round, setRound] = useState(1);
  const [startAt, setStartAt] = useState(0);
  const [times, setTimes] = useState([]);
  const timer = useRef();
  const copy = lang === "es" ? {
    title:"Neon Reflex", sub:"Cinco rondas. No te adelantes.", intro:"Espera a que la pantalla cambie a verde y toca lo más rápido posible.", start:"Empezar", wait:"Espera...", go:"¡AHORA!", early:"Muy pronto", again:"Otra vez", result:"Promedio", done:"Resultado final"
  } : {
    title:"Neon Reflex", sub:"Five rounds. Do not jump early.", intro:"Wait for the screen to turn green, then tap as fast as possible.", start:"Start", wait:"Wait...", go:"NOW!", early:"Too early", again:"Again", result:"Average", done:"Final result"
  };
  const beginRound = () => {
    setPhase("wait");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { setStartAt(performance.now()); setPhase("go"); tone(760,.12); }, 900 + Math.random()*1900);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  const tap = () => {
    if (phase === "wait") { clearTimeout(timer.current); setPhase("early"); tone(160,.16); return; }
    if (phase !== "go") return;
    const ms = Math.round(performance.now() - startAt);
    const next = [...times, ms]; setTimes(next); tone(980,.08);
    if (round >= 5) setPhase("done"); else { setRound(round + 1); setPhase("score"); }
  };
  const avg = times.length ? Math.round(times.reduce((a,b)=>a+b,0)/times.length) : 0;
  return <Shell title={copy.title} subtitle={copy.sub} onClose={onClose}>
    <div onClick={tap} style={{width:"100%",minHeight:330,display:"grid",placeItems:"center",borderRadius:24,cursor:["wait","go"].includes(phase)?"pointer":"default",background:phase==="go"?"radial-gradient(circle,#34d399,#047857)":phase==="early"?"radial-gradient(circle,#fb7185,#9f1239)":"radial-gradient(circle,#312e81,#111827)",transition:"background .18s ease"}}>
      {phase==="intro" && <div><div style={{fontSize:62}}>⚡</div><p style={{maxWidth:430,color:"#c8c5d6"}}>{copy.intro}</p><button style={ui.action} onClick={beginRound}>{copy.start}</button></div>}
      {phase==="wait" && <div><div style={{fontSize:18,color:"#c4b5fd"}}>{copy.wait}</div><div style={{fontSize:72,marginTop:12}}>●</div></div>}
      {phase==="go" && <div style={{fontSize:"clamp(48px,12vw,86px)",fontWeight:1000}}>{copy.go}</div>}
      {phase==="early" && <div><div style={{fontSize:50}}>✋</div><h2>{copy.early}</h2><button style={ui.action} onClick={beginRound}>{copy.again}</button></div>}
      {phase==="score" && <div><div style={{fontSize:64,fontWeight:1000}}>{times.at(-1)} ms</div><p>{round}/5</p><button style={ui.action} onClick={beginRound}>{copy.again}</button></div>}
      {phase==="done" && <div><div style={{fontSize:20,color:"#c4b5fd"}}>{copy.done}</div><div style={{fontSize:72,fontWeight:1000}}>{avg} ms</div><p>{copy.result}</p><button style={ui.action} onClick={()=>{setRound(1);setTimes([]);setPhase("intro")}}>{copy.again}</button></div>}
    </div>
  </Shell>;
}

function MemoryGame({ lang, onClose }) {
  const colors = ["#f43f5e","#3b82f6","#22c55e","#eab308"];
  const [sequence,setSequence] = useState([]), [input,setInput] = useState([]), [active,setActive] = useState(-1), [status,setStatus] = useState("intro"), [level,setLevel] = useState(0);
  const copy = lang === "es" ? {title:"Código Fantasma",sub:"Memoriza. Repite. Sobrevive.",intro:"Observa la secuencia y repítela sin equivocarte.",start:"Empezar",level:"Nivel",fail:"Código roto",again:"Intentar otra vez"} : {title:"Ghost Code",sub:"Memorize. Repeat. Survive.",intro:"Watch the sequence and repeat it without mistakes.",start:"Start",level:"Level",fail:"Code broken",again:"Try again"};
  const play = async (seq) => {
    setStatus("show"); setInput([]);
    for (let i=0;i<seq.length;i++) { await new Promise(r=>setTimeout(r,420)); setActive(seq[i]); tone(320+seq[i]*140,.12); await new Promise(r=>setTimeout(r,260)); setActive(-1); }
    setStatus("input");
  };
  const next = () => { const seq=[...sequence,Math.floor(Math.random()*4)]; setSequence(seq); setLevel(seq.length); play(seq); };
  const press = (i) => {
    if (status!=="input") return;
    tone(320+i*140,.08); const nextInput=[...input,i];
    if (sequence[nextInput.length-1]!==i) { setStatus("fail"); tone(120,.22); return; }
    setInput(nextInput);
    if (nextInput.length===sequence.length) { setStatus("clear"); setTimeout(next,650); }
  };
  return <Shell title={copy.title} subtitle={copy.sub} onClose={onClose}>
    {status==="intro" ? <div><div style={{fontSize:62}}>🧠</div><p style={{color:"#c8c5d6"}}>{copy.intro}</p><button style={ui.action} onClick={next}>{copy.start}</button></div> : <>
      <div style={{marginBottom:18,fontWeight:900}}>{copy.level} {level}</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,140px)",gap:14}}>{colors.map((c,i)=><button key={c} onClick={()=>press(i)} style={{height:140,border:0,borderRadius:24,cursor:"pointer",background:c,opacity:active===i?1:.42,transform:active===i?"scale(1.05)":"scale(1)",boxShadow:active===i?`0 0 40px ${c}`:"none",transition:"all .12s ease"}}/>)}</div>
      {status==="fail" && <div style={{marginTop:20}}><h2>{copy.fail}</h2><button style={ui.action} onClick={()=>{setSequence([]);setInput([]);setLevel(0);setStatus("intro")}}>{copy.again}</button></div>}
    </>}
  </Shell>;
}

function PrecisionGame({ lang, onClose }) {
  const [running,setRunning]=useState(false), [pos,setPos]=useState(0), [dir,setDir]=useState(1), [round,setRound]=useState(1), [score,setScore]=useState(0), [message,setMessage]=useState("");
  const raf=useRef(); const zone=Math.max(8,28-round*3);
  const copy=lang==="es"?{title:"Zona Cero",sub:"Precisión bajo presión.",intro:"Detén el marcador dentro de la zona brillante. Cada ronda será más difícil.",start:"Empezar",stop:"DETENER",hit:"Perfecto",miss:"Fallaste",round:"Ronda",again:"Reiniciar"}:{title:"Zero Zone",sub:"Precision under pressure.",intro:"Stop the marker inside the glowing zone. Every round gets harder.",start:"Start",stop:"STOP",hit:"Perfect",miss:"Missed",round:"Round",again:"Restart"};
  useEffect(()=>{ if(!running)return; const tick=()=>{setPos(p=>{let n=p+dir*(1.2+round*.28);if(n>=100){n=100;setDir(-1)}if(n<=0){n=0;setDir(1)}return n});raf.current=requestAnimationFrame(tick)};raf.current=requestAnimationFrame(tick);return()=>cancelAnimationFrame(raf.current)},[running,dir,round]);
  const stop=()=>{ if(!running)return; setRunning(false); const min=50-zone/2,max=50+zone/2,hit=pos>=min&&pos<=max; if(hit){setScore(score+round*100);setMessage(copy.hit);tone(920,.1);setTimeout(()=>{setRound(round+1);setMessage("");setRunning(true)},700)}else{setMessage(copy.miss);tone(140,.2)} };
  return <Shell title={copy.title} subtitle={copy.sub} onClose={onClose}>
    <div style={{width:"100%"}}><div style={{fontSize:56}}>🎯</div><p style={{color:"#c8c5d6"}}>{copy.intro}</p><div style={{display:"flex",justifyContent:"space-between",margin:"18px 0 8px",fontWeight:900}}><span>{copy.round} {round}</span><span>{score} pts</span></div>
      <div style={{position:"relative",height:82,borderRadius:18,background:"#111827",overflow:"hidden",border:"1px solid rgba(255,255,255,.1)"}}><div style={{position:"absolute",left:`${50-zone/2}%`,width:`${zone}%`,top:0,bottom:0,background:"linear-gradient(90deg,#22c55e55,#a3e635aa,#22c55e55)",boxShadow:"0 0 25px #84cc16"}}/><div style={{position:"absolute",left:`calc(${pos}% - 4px)`,top:8,bottom:8,width:8,borderRadius:999,background:"white",boxShadow:"0 0 18px white"}}/></div>
      <div style={{minHeight:44,marginTop:15,fontSize:20,fontWeight:900}}>{message}</div>
      {!running && !message && <button style={ui.action} onClick={()=>setRunning(true)}>{copy.start}</button>}
      {running && <button style={{...ui.action,background:"#fb7185",color:"white",minWidth:180}} onClick={stop}>{copy.stop}</button>}
      {!running && message===copy.miss && <button style={ui.action} onClick={()=>{setRound(1);setScore(0);setPos(0);setMessage("")}}>{copy.again}</button>}
    </div>
  </Shell>;
}

export default function ArcadeGames({ kind, lang, onClose }) {
  if (kind === "neon-rift") return <NeonRiftArena lang={lang} onClose={onClose}/>;
  if (kind === "neon-escape") return <NeonEscape lang={lang} onClose={onClose}/>;
  if (kind === "classic") return <ClassicButtonGame lang={lang} onClose={onClose}/>;
  if (kind === "balloons") return <BalloonPopGame lang={lang} onClose={onClose}/>;
  if (kind === "notes") return <MelodyCatchGame lang={lang} onClose={onClose}/>;
  if (kind === "dodge") return <DinoSurvivalGame lang={lang} onClose={onClose}/>;
  if (kind === "reflex") return <ReflexGame lang={lang} onClose={onClose}/>;
  if (kind === "memory") return <MemoryGame lang={lang} onClose={onClose}/>;
  if (kind === "precision") return <PrecisionGame lang={lang} onClose={onClose}/>;
  return null;
}
