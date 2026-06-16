# Song Structure Builder

A browser-only tool for building MIDI tempo maps with per-section tempo and time signature changes — designed for import into [GarageBand](https://www.apple.com/mac/garageband/).

**Live app:** [dansailer.github.io/garageband-song-structure](https://dansailer.github.io/garageband-song-structure/)

## Why

GarageBand does not let you change tempo or time signature mid-song through its UI. If you import a MIDI file that contains tempo and time signature meta events, GarageBand follows those changes across the timeline. This app lets you define those sections visually and download the MIDI file — no manual MIDI editing required.

## Usage

1. Open the app
2. Click **+ Add Section** for each part of your song
3. For each section, set:
   - **Label** (optional, e.g. "Verse", "Chorus")
   - **Time signature** (numerator 1–12, denominator 2/4/8/16)
   - **Tempo** (40–240 BPM)
   - **Bars** (length in bars)
4. Drag sections to reorder
5. Review the duration summary at the bottom
6. Click **Download MIDI**

Your work is saved automatically in the browser (`localStorage`).

## Import into GarageBand

### Tempo map only (no click track)

1. **File → Import → MIDI File** (or drag the `.mid` onto the timeline)
2. Check the tempo and time signature display at each section boundary

### With click track enabled

GarageBand does **not** auto-assign instruments from MIDI. Set up the instrument first, then import the file:

1. Add a new **Software Instrument** track (+ in the header)
2. Select **Synthesizer → Plucked → Future Rave Pluck** in the Library
3. Download the `.mid` and import it (**File → Import → MIDI File**)
4. **Drag the imported MIDI region** onto the Future Rave Pluck track

The app shows these steps when click track is enabled. Other click presets (wood block, side stick, etc.) list their own GarageBand instrument in the UI.

> **Tip:** Scrub through the timeline and verify each tempo/time-signature change lands on the correct bar.

## Development

```bash
pnpm install
pnpm dev      # http://localhost:5173/garageband-song-structure/
pnpm test
pnpm build
```

See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for full setup, testing, and deployment instructions.

## Documentation

| Document | Description |
|----------|-------------|
| [docs/SESSION_CONTEXT.md](docs/SESSION_CONTEXT.md) | Quick briefing for new contributors / AI sessions |
| [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) | Product requirements and scope |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Design decisions and rationale |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Code structure and data flow |
| [docs/MIDI_FORMAT.md](docs/MIDI_FORMAT.md) | MIDI encoding specification |

## Deploy

Pushing to `main` triggers a GitHub Actions workflow that builds and deploys to the `gh-pages` branch. Enable GitHub Pages from the `gh-pages` branch in repository settings.

## License

Private project — all rights reserved unless otherwise specified.