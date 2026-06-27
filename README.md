# EL BOTÓN · The Button 🎉

Plataforma de mini-juegos en un único hub: un catálogo, niveles, rachas,
recompensas y **ranking mundial por juego**. Bilingüe (ES/EN), instalable (PWA).

> "Tres businesses. Un operador. Cero atajos." — by @osmanbuilds

## Stack
- **Vite + React** — un único hub (`PlatformHome`) que lista el catálogo;
  cada juego se abre como overlay a pantalla completa.
- **Supabase** (Postgres) para el ranking mundial por juego
- Cero dependencias de UI: todo va en código (Canvas + CSS-in-JS)

## Juegos
- **🛸 Neon Rift Arena** (destacado) — arena shooter top-down 360° con multijugador
  local (1-2), bots con IA (patrullar / perseguir / atacar), oleadas de dificultad
  progresiva, jefe, power-ups y **ranking propio** por puntaje.
- **🚀 Neon Escape** — corre por la autopista de neón, esquiva drones y láseres.

## Puesta en marcha

### 1. Supabase (ranking mundial)
1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Abre **SQL Editor** y ejecuta el contenido de [`supabase/schema.sql`](supabase/schema.sql).
3. Ve a **Settings → API** y copia el **Project URL** y la **anon public key**.

### 2. Variables de entorno
```bash
cp .env.example .env
```
Rellena `.env` con tus credenciales:
```
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_ANON_KEY_PUBLICA
```
> Si no configuras Supabase, el juego funciona igual; solo el ranking queda deshabilitado.

### 3. Desarrollo local
```bash
npm install
npm run dev
```
Abre la URL que imprime Vite (normalmente http://localhost:5173).

### 4. Build de producción
```bash
npm run build      # genera /dist
npm run preview    # previsualiza el build
```

## Despliegue

### Netlify
- Build command: `npm run build`
- Publish directory: `dist`
- En **Site settings → Environment variables** agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.

### Vercel
- Framework preset: **Vite**
- Agrega las mismas dos variables de entorno en el proyecto.

## Notas de seguridad
- La tabla `game_scores` solo permite **lectura pública**. Toda escritura pasa por la
  función `submit_game_score()` (`SECURITY DEFINER`), que guarda únicamente el puntaje
  **máximo** de cada jugador por juego.
- La identidad del jugador es un id aleatorio guardado en `localStorage` (sin login).
  Es suficiente para un juego casual; si más adelante quieres anti-trampa fuerte,
  el siguiente paso sería añadir auth anónima de Supabase + rate limiting.

## Licencia
Proyecto personal de Osman. Todos los derechos reservados.
