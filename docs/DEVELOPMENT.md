# Development Guide

Setup, commands, testing, and deployment for contributors and future sessions.

## Prerequisites

- Node.js 22+ (matches CI)
- pnpm 11+ (pinned in `package.json` `packageManager`; use Corepack: `corepack enable`)

## Setup

```bash
git clone https://github.com/dansailer/garageband-song-structure.git
cd garageband-song-structure
corepack enable
pnpm install
```

## Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start Vite dev server with HMR |
| `pnpm build` | Typecheck (`tsc`) + production build to `dist/` |
| `pnpm preview` | Serve production build locally |
| `pnpm test` | Run Vitest unit tests |
| `pnpm test --watch` | Run tests in watch mode |

## Local Development Notes

- Vite `base` is set to `/garageband-song-structure/` in `vite.config.ts`
- Dev server works at `http://localhost:5173/garageband-song-structure/` (note the base path)
- `localStorage` key: `garageband-song-structure-v1` — clear in DevTools to reset state

## Testing

Tests live alongside source as `*.test.ts`:

- `src/timing.test.ts` — duration math, tick counts, formatting
- `src/midi/builder.test.ts` — MIDI byte structure, filename helper

Vitest runs in Node environment (no DOM needed for core logic).

### Manual Verification Checklist

After changes to MIDI or timing logic:

1. `pnpm test` — all unit tests pass
2. `pnpm build` — clean production build
3. Open app, add 2+ sections with different tempo/time signatures
4. Download MIDI and import into GarageBand on Mac
5. Confirm tempo/time signature changes at expected bar boundaries
6. Refresh browser — confirm `localStorage` persistence

## Deployment

### Automated (recommended)

Push to `main` triggers `.github/workflows/deploy.yml`:

1. `pnpm install --frozen-lockfile`
2. `pnpm build`
3. Deploy `dist/` to `gh-pages` branch via `peaceiris/actions-gh-pages`

### GitHub Repo Settings

1. **Settings → Pages → Build and deployment**
2. Source: **Deploy from a branch**
3. Branch: `gh-pages` / `/ (root)`

Live URL: `https://dansailer.github.io/garageband-song-structure/`

### Manual Deploy

```bash
pnpm build
pnpm dlx gh-pages -d dist
```

## Project Conventions

- TypeScript strict checks enabled (`noUnusedLocals`, `noUnusedParameters`)
- No UI framework — keep components as functions returning `HTMLElement`
- State mutations go through `state.ts` only
- Constants (tempo range, storage key) live in `types.ts`
- Document new decisions in `docs/DECISIONS.md`
- Update `docs/REQUIREMENTS.md` if scope changes

## Common Changes

| Task | Files to edit |
|------|---------------|
| Add section field | `types.ts`, `section-card.ts`, `validation.ts`, `midi/builder.ts`, tests |
| Change tempo range | `types.ts`, `validation.ts`, `section-card.ts` |
| Change MIDI encoding | `midi/builder.ts`, `docs/MIDI_FORMAT.md`, `midi/builder.test.ts` |
| UI styling | `styles/main.css` |
| Deploy path / base URL | `vite.config.ts`, `docs/DECISIONS.md` |

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Blank page on GitHub Pages | Check `base` in `vite.config.ts` matches repo name |
| Assets 404 | Ensure Pages serves from `gh-pages` branch root |
| Download doesn't work | Requires valid sections; check validation errors on cards |
| Drag-and-drop not working | Desktop browsers only in v1; handle hidden on mobile CSS |