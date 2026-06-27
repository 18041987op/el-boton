import React from "react";
import NeonEscape from "./NeonEscape";
import NeonRiftArena from "./NeonRiftArena";

/* Lanzador de juegos del catálogo. Cada juego es un overlay a pantalla
   completa con su propio botón de salida que devuelve al hub. */
export default function ArcadeGames({ kind, lang, onClose }) {
  if (kind === "neon-rift") return <NeonRiftArena lang={lang} onClose={onClose} />;
  if (kind === "neon-escape") return <NeonEscape lang={lang} onClose={onClose} />;
  return null;
}
