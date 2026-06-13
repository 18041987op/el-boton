# EL BOTÓN · The Button 🎉

Un juguete de dopamina pura: un solo botón irresistible que suelta buena vibra.
Bilingüe (ES/EN), con **retos relámpago**, **modo frenesí x3**, **botón dorado huidizo**,
**vibración**, **caras de caricatura** que reaccionan, y **ranking mundial en vivo**.

> "Tres businesses. Un operador. Cero atajos." — by @osmanbuilds

## Stack
- **Vite + React** (frontend, un solo componente)
- **Supabase** (Postgres) para el ranking mundial
- Cero dependencias de UI: todo va en código (SVG + CSS-in-JS)

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
- La tabla solo permite **lectura pública**. Toda escritura pasa por la función
  `submit_score()` (SECURITY DEFINER), que guarda únicamente el puntaje **máximo** de cada jugador.
- La identidad del jugador es un id aleatorio guardado en `localStorage` (sin login).
  Es suficiente para un juego casual; si más adelante quieres anti-trampa fuerte,
  el siguiente paso sería añadir auth anónima de Supabase + rate limiting.

## Licencia
Proyecto personal de Osman. Todos los derechos reservados.
