# Design Decisions

Record of intentional choices made during v1 development. Consult this before changing architecture or scope.

## Stack

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Package manager | pnpm 11+ | Team standard; v11+ avoids Node `url.parse()` deprecation warnings present in pnpm 9 |
| Build tool | Vite | Fast dev server, simple static output, first-class TypeScript |
| UI framework | None (vanilla TS) | Minimal bundle, no framework overhead for a simple form-heavy UI |
| State management | Module-level state + pub/sub | Sufficient for single-page scope; no need for external store |
| Drag-and-drop | Native HTML5 DnD | Avoids `@dnd-kit` dependency; adequate for desktop reorder |
| MIDI generation | Hand-rolled encoder | Meta-only Type 0 MIDI is ~100 lines; no need for `@tonejs/midi` |
| Testing | Vitest | Same config as Vite; fast unit tests for timing and MIDI bytes |
| CSS | Plain CSS with custom properties | Supports light/dark via `prefers-color-scheme` without a CSS framework |

## MIDI Encoding

| Decision | Choice | Rationale |
|----------|--------|-----------|
| MIDI format | Type 0 (single track) | Simplest structure for meta-only files |
| PPQ (ticks per quarter) | 480 | Industry standard; GarageBand-compatible |
| Events per section | Set Tempo (`FF 51`) + Time Signature (`FF 58`) at section start | Matches GarageBand tempo-map import behavior |
| Note data | None by default; optional click track | Click is opt-in; tempo meta + drum notes on one Type 0 track |
| Click instrument default | GM drum Wood Block (notes 76/77, ch 10, velocity 127) | Matches GarageBand tutorials; user assigns **Drum Kit → Wood Blocks** manually |
| Click import UX | In-app numbered steps for GarageBand | User adds Software Instrument track, assigns Future Rave Pluck, drags MIDI region |
| Section boundaries | Cumulative tick offsets | Each section's first event delta equals previous section's tick length |
| Filename | Derived from first section label (sanitized) or `song-structure.mid` | Small UX nicety without complexity |

## Data & Persistence

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Storage key | `garageband-song-structure-v1` | Versioned key allows future schema migrations |
| Storage format | JSON `{ sections: Section[] }` | Simple, human-readable in DevTools |
| Section IDs | `crypto.randomUUID()` | Stable keys across reorder and edit |
| Label persistence | Save on `blur` | Avoids full re-render on every keystroke |

## Validation

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Validation timing | On render + before download | Inline errors on cards; download disabled when invalid |
| Empty project | Download disabled | MIDI requires at least one section |
| Default new section | Inherits time signature and tempo from previous section; 8 bars; first section defaults to 4/4, 120 BPM | Reduces repetitive input when adding consecutive sections |

## Deployment

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Host | GitHub Pages | Customer requirement |
| CI | GitHub Actions + `peaceiris/actions-gh-pages` | Deploy `dist/` on push to `main` |
| Base path | `/garageband-song-structure/` | Matches repository name for project Pages URL |

## Rejected Alternatives

| Alternative | Why rejected |
|-------------|--------------|
| `@tonejs/midi` | Heavy for meta-only export |
| `@dnd-kit` | Extra dependency for simple reorder |
| React / Vue | Unnecessary complexity for v1 scope |
| JSON export/import | Out of scope for v1; localStorage sufficient |
| Marker meta events | Customer chose meta-only; markers unverified in GarageBand |
| Dummy MIDI notes | Customer chose meta-only; may revisit if GarageBand requires notes |

## Open Questions / Future Revisit

- Does GarageBand require at least one note event? (v1 ships meta-only per customer decision; validate manually on Mac)
- Should marker names be embedded as MIDI text events for section visibility in the DAW?
- JSON export/import for backup beyond localStorage?
- `base` path configuration if repo is renamed or deployed to a custom domain