# MIDI Format Specification

How this app encodes tempo maps for GarageBand import.

## File Structure

### Without click track (default)

Standard Type 0 MIDI file:

```
MThd chunk
  format = 0
  numTracks = 1
  division = 480 (ticks per quarter note)

MTrk chunk
  [delta-time + meta events...]
  End of Track
```

### With click track enabled

Still **Type 0** (one track): tempo/time-signature meta events and click notes are interleaved on a single timeline.

Default click preset: **Future Rave Pluck** — melodic notes on channel 1. In GarageBand: add a Software Instrument track, choose **Synthesizer → Plucked → Future Rave Pluck**, import the `.mid`, drag the region onto that track.

Drum presets (Wood Block, Side Stick, etc.) use GM drum channel 10 and require a matching drum kit track instead.

## Meta Events Used

### Set Tempo (`FF 51 03`)

Three data bytes: microseconds per quarter note.

```
microseconds = round(60_000_000 / BPM)
```

Example: 120 BPM → 500,000 μs → `07 A1 20`

### Time Signature (`FF 58 04`)

Four data bytes: `[nn, dd, cc, bb]`

| Byte | Value | Meaning |
|------|-------|---------|
| nn | numerator | e.g. 4 for 4/4 |
| dd | log₂(denominator) | 2→1, 4→2, 8→3, 16→4 |
| cc | 24 | MIDI clocks per metronome click (standard) |
| bb | 8 | 32nd notes per quarter note (standard) |

Example: 4/4 → `04 02 18 08`

### End of Track (`FF 2F 00`)

Required track terminator. Emitted with delta 0 after all section events.

## Section-to-Event Mapping

For sections `[S0, S1, S2, ...]`:

| Position | Delta time | Event |
|----------|------------|-------|
| Start of S0 | 0 | Set Tempo (S0.tempo) |
| | 0 | Time Signature (S0.num/denom) |
| Start of S1 | ticks(S0) | Set Tempo (S1.tempo) |
| | 0 | Time Signature (S1.num/denom) |
| Start of S2 | ticks(S1) | Set Tempo (S2.tempo) |
| | 0 | Time Signature (S2.num/denom) |
| End | `ticks(lastSection)` | End of Track |

Where `ticks(S)` = `bars × (numerator × 4 / denominator) × 480`

The final-section tail delta ensures the last section has a defined length in DAWs that measure regions to the end-of-track position.

## Variable-Length Quantities (VLQ)

Delta times use MIDI VLQ encoding. Bytes are stored **MSB first** (decreasing significance) — the first byte in the stream carries the most significant 7-bit group. Continuation bit (0x80) is set on all bytes except the last.

Examples:

| Value | VLQ bytes |
|-------|-----------|
| 0 | `00` |
| 128 | `81 00` |
| 15360 | `F8 00` |
| 14400 | `F0 40` |
| 182400 | `8B 91 00` |

## Example: Two Sections

**Section 1:** 4/4, 120 BPM, 8 bars → 15360 ticks  
**Section 2:** 3/4, 90 BPM, 16 bars

Track data (conceptual):

```
00 FF 51 03 07 A1 20     ; tempo 120 at tick 0
00 FF 58 04 04 02 18 08   ; 4/4
80 78 FF 51 03 0A 2C 2A   ; delta 15360, tempo 90
00 FF 58 04 03 02 18 08   ; 3/4
00 FF 2F 00               ; end of track
```

## GarageBand Import Notes

- Import via **File → Import → MIDI File** or drag onto the timeline
- GarageBand creates a track from the file; the track may appear empty (no notes) — this is expected
- Tempo and time signature changes should appear in the project tempo/time signature display
- The imported track can be deleted after verifying the map; tempo changes typically persist
- **Manual verification required** on target GarageBand version — meta-only import behavior is assumed but not guaranteed across all versions

## Validation Tests

Unit tests in `src/midi/builder.test.ts` verify:

- `MThd` / `MTrk` headers
- Format 0, 1 track, PPQ 480
- Presence of `FF 51` and `FF 58` events
- Second section delta encoding after first section tick count