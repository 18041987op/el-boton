import React, { useEffect, useState } from "react";
import PlatformHome from "./components/PlatformHome";
import { claimDailyReward, loadProgress } from "./services/playerProgress";

/* ──────────────────────────────────────────────────────────────
   EL BOTÓN · Plataforma de juegos
   Un único hub: PlatformHome lista el catálogo y cada juego se
   abre como overlay. Sin pantallas ni menús de juegos duplicados.
   ────────────────────────────────────────────────────────────── */

const LANG_KEY = "elboton_lang";

function initialLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === "es" || saved === "en") return saved;
  } catch {}
  return (navigator.language || "es").toLowerCase().startsWith("en") ? "en" : "es";
}

export default function App() {
  const [lang, setLang] = useState(initialLang);
  const [progress, setProgress] = useState(loadProgress);

  useEffect(() => {
    try { localStorage.setItem(LANG_KEY, lang); } catch {}
  }, [lang]);

  return (
    <PlatformHome
      lang={lang}
      setLang={setLang}
      progress={progress}
      onClaimDaily={() => setProgress(claimDailyReward(progress).progress)}
    />
  );
}
