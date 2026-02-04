# Tetris v3

A from-scratch Tetris clone built purely for fun and to mess around with game dev concepts in vanilla JS + Canvas 2D.

This is a personal test project — no frameworks, no libraries (besides Vite for dev/build), just vibes.

## Play It

```bash
npm install
npm run dev
```

Then open `http://localhost:5173`.

## Controls

| Key | Action |
|-----|--------|
| ← → | Move |
| ↑ / X | Rotate CW |
| Z | Rotate CCW |
| ↓ | Soft drop |
| Space | Hard drop |
| Shift / C | Hold piece |
| Esc / P | Pause |

## What's in here

- Full SRS rotation with wall kicks
- 7-bag randomizer
- Lock delay with move resets
- Ghost piece
- Hold + next queue
- Line clear animations
- Animated menu background
- High scores saved to localStorage

## Deploy

```bash
npm run build
```

Output goes to `dist/`. Configured for Vercel out of the box.

## License

[MIT](LICENSE)
