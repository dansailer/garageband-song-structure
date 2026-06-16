# Requirements

Captured from customer discovery (June 2026). This document is the source of truth for **what** the product must do.

## Problem Statement

GarageBand does not allow changing tempo or time signature mid-song through its UI. A known workaround is to import a MIDI file containing tempo and time signature meta events; GarageBand applies those changes across the project timeline.

This app lets users define song sections in a browser and download a MIDI tempo map — no manual MIDI editing required.

## Users

- Primary user: songwriter/producer using GarageBand on Mac
- Scale: single-song proof of concept (personal use)

## Functional Requirements

### Input

- **No file input.** The user builds the song structure entirely in the UI.

### Sections

Each section supports:

| Field | Required | Constraints | Notes |
|-------|----------|-------------|-------|
| Label | No | Free text | Cosmetic only; not written to MIDI |
| Time signature | Yes | Numerator 1–12; denominator 2, 4, 8, or 16 | Extended support, not just common meters |
| Tempo | Yes | 40–240 BPM | Standard range |
| Bars | Yes | Integer ≥ 1 | Length of section in bars |

### Section Management

- Start with an **empty** project (no pre-created section)
- **Add** sections via button
- **Delete** sections individually
- **Reorder** sections via drag-and-drop
- No hard limit on section count

### Duration Preview

- Show per-section duration in `m:ss`
- Show footer summary: total bars and total duration in `m:ss`
- Update live when any field changes

### Output

- Download a single `.mid` file
- MIDI contains **meta events only** (tempo + time signature changes)
- No musical notes, no key signatures, no marker/text events (v1)

### Persistence

- Auto-save in-progress work to `localStorage`
- Survive browser refresh on the same origin

## Non-Functional Requirements

| Area | Requirement |
|------|-------------|
| Platform | Single-page app, runs entirely in the browser |
| Backend | None — no database, no server |
| Hosting | GitHub Pages compatible |
| Dependencies | Minimal; use libraries only where justified |
| Language | TypeScript |
| Design | Clean, modern; no strong theme preference |
| Timeline | Flexible — quality over speed |

## Deployment

- Automated deploy to GitHub Pages on push to `main`
- Base path: `/garageband-song-structure/`

## Explicitly Out of Scope (v1)

- Audio analysis or automatic section detection
- GarageBand `.band` file parsing
- Key signatures per section
- Marker/text meta events in MIDI
- JSON import/export (localStorage only)
- Multi-song project management
- Logic Pro-specific handling
- iOS GarageBand project support
- Mobile-optimized drag-and-drop polish
- Dummy notes in MIDI output

## GarageBand Workflow (User-Facing)

1. Build sections in the web app
2. Download `.mid`
3. Import into GarageBand (File → Import → MIDI, or drag onto timeline)
4. Verify tempo/time signature changes in GarageBand's tempo display
5. Optionally delete the empty imported MIDI track — the tempo map remains

## Success Criteria

- Generated MIDI imports into GarageBand and applies correct tempo/time signature per section
- UI is intuitive for non-technical musicians
- App works offline after first load (static assets)
- GitHub Pages deployment succeeds with correct asset paths