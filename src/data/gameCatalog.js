export const AUDIENCES = [
  { id: "all", es: "Todos", en: "All" },
  { id: "kids", es: "Niños", en: "Kids" },
  { id: "teens", es: "Adolescentes", en: "Teens" },
  { id: "adults", es: "Adultos", en: "Adults" },
];

export const GAME_CATALOG = [
  {
    kind: "neon-rift",
    emoji: "🛸",
    es: "Neon Rift Arena",
    en: "Neon Rift Arena",
    descEs: "Arena shooter 360°: esquiva, dispara y sube de nivel contra enjambres de bots con IA. Sobrevive las oleadas y vence al JEFE. 1-2 jugadores locales.",
    descEn: "360° arena shooter: dodge, shoot and level up against swarms of AI bots. Survive the waves and beat the BOSS. 1-2 local players.",
    audience: ["kids", "teens", "adults"],
    categories: ["action", "shooter", "competitive", "survival"],
    difficulty: 5,
    reward: 35,
    grad: "linear-gradient(135deg,#22d3ee,#7c3aed 52%,#ff2d75)",
    standalone: true,
    featured: true,
  },
  {
    kind: "neon-escape",
    emoji: "🚀",
    es: "Neon Escape",
    en: "Neon Escape",
    descEs: "Corre por una autopista de neón, esquiva drones y láseres, y sobrevive el mayor tiempo posible.",
    descEn: "Race through a neon highway, dodge drones and lasers, and survive as long as possible.",
    audience: ["teens", "adults"],
    categories: ["action", "survival", "competitive"],
    difficulty: 4,
    reward: 30,
    grad: "linear-gradient(135deg,#0891b2,#4338ca 55%,#be185d)",
    standalone: true,
  },
];
