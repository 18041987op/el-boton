# El Botón — Etapa 2

## Cambios

- Catálogo de juegos extraído a `src/data/gameCatalog.js`.
- Portada extraída a `src/components/PlatformHome.jsx`.
- Progreso local persistente en `src/services/playerProgress.js`.
- Nivel de jugador basado en XP.
- Monedas, racha diaria, partidas totales y partidas por juego.
- Recompensa diaria persistente.
- Indicador de dificultad y recompensa por juego.
- Diseño responsive del panel de progreso.

## Validación

```bash
npm ci
npm run build
```

El build de producción termina correctamente.

## Nota técnica

`npm audit` reporta vulnerabilidades de desarrollo relacionadas con Vite 5 y esbuild. La corrección automática exige una actualización mayor de Vite, por lo que debe hacerse en una etapa separada con pruebas de regresión.
