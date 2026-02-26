# AGENTS.md

## Cursor Cloud specific instructions

This is a client-side-only React/TypeScript poker roguelike game. There is no backend, no database, and no external service dependencies.

### Services

| Service | Command | Port | Notes |
|---|---|---|---|
| Vite Dev Server | `npm run dev` | 5173 | Serves at `/OublietteNo9/` (base path). Access at `http://localhost:5173/OublietteNo9/` |

### Running checks

- **Lint**: `npm run lint` — ESLint with `--max-warnings 0`. There is 1 pre-existing warning in `screen-ParallelHandsAnimation.tsx` (missing useEffect dependency) that causes exit code 1.
- **Tests**: `npx vitest run` — 264 passing, 73 pre-existing failures (component tests and failure-condition tests are out of sync with current code).
- **Build**: `npm run build` — runs `tsc && vite build`. Succeeds cleanly.
- **Dev server**: `npm run dev` — Vite dev server with HMR on port 5173.

### Gotchas

- The dev server serves under base path `/OublietteNo9/`, so navigate to `http://localhost:5173/OublietteNo9/` not just `http://localhost:5173/`.
- `npm test` runs Vitest in watch mode. Use `npx vitest run` for a single non-interactive run.
