# Session Context

Quick briefing for AI agents or developers picking up this project cold.

## One-Line Summary

Browser-only GitHub Pages app that builds a MIDI tempo/time-signature map from user-defined song sections for import into GarageBand.

## Why It Exists

GarageBand cannot change tempo or time signature mid-song in the UI. Importing a MIDI file with tempo (`FF 51`) and time signature (`FF 58`) meta events is the accepted workaround.

## Current Status (v1)

- **Implemented:** Full SPA with section CRUD, drag-and-drop reorder, duration preview, localStorage persistence, MIDI download, GitHub Actions deploy, unit tests
- **Not implemented:** JSON import/export, key signatures, markers, audio preview, GarageBand `.band` parsing

## Key Files

| File | Purpose |
|------|---------|
| `src/state.ts` | App state + mutations |
| `src/midi/builder.ts` | MIDI file generation |
| `src/timing.ts` | Duration/tick math |
| `src/ui/app.ts` | Main UI shell |
| `vite.config.ts` | `base: '/garageband-song-structure/'` |
| `.github/workflows/deploy.yml` | Auto-deploy to gh-pages |

## Documentation Index

| Doc | Contents |
|-----|----------|
| [REQUIREMENTS.md](./REQUIREMENTS.md) | Customer requirements, scope, out-of-scope |
| [DECISIONS.md](./DECISIONS.md) | Design choices and rejected alternatives |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Code structure, data flow, extension points |
| [MIDI_FORMAT.md](./MIDI_FORMAT.md) | Byte-level MIDI encoding spec |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | Setup, commands, deploy, conventions |
| [../README.md](../README.md) | User-facing usage and GarageBand import steps |

## Customer Preferences (Do Not Override Without Asking)

- Output only — no file upload
- Meta-only MIDI (no notes)
- TypeScript, minimal dependencies
- GitHub Pages, browser-only, no backend
- Optional section labels (UI only)
- Empty start, drag-and-drop, localStorage auto-save
- Extended time signatures (1–12 / 2,4,8,16)
- Tempo 40–240 BPM

## Before Making Changes

1. Read `REQUIREMENTS.md` for scope boundaries
2. Read `DECISIONS.md` for rationale behind current choices
3. If changing MIDI encoding, update `MIDI_FORMAT.md` and `builder.test.ts`
4. If changing scope, update `REQUIREMENTS.md` and `DECISIONS.md`
5. Run `pnpm test && pnpm build` before committing

## Open Validation Item

Meta-only MIDI import into GarageBand should be manually verified on the customer's Mac. If GarageBand rejects files without note data, the fallback documented in `DECISIONS.md` is adding minimal dummy notes — but v1 intentionally ships without them per customer request.