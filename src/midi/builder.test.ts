import { describe, expect, it } from 'vitest';
import { sectionTicks } from '../timing';
import type { Section } from '../types';
import { buildMidi, decodeVlq, encodeVlq, suggestedFilename } from './builder';

function section(overrides: Partial<Section> = {}): Section {
  return {
    id: 'test',
    numerator: 4,
    denominator: 4,
    tempo: 120,
    bars: 8,
    ...overrides,
  };
}

function readAscii(bytes: Uint8Array, start: number, length: number): string {
  return String.fromCharCode(...bytes.slice(start, start + length));
}

function findTempoEventIndexes(trackData: Uint8Array): number[] {
  const indexes: number[] = [];

  for (let index = 0; index < trackData.length - 1; index += 1) {
    if (trackData[index] === 0xff && trackData[index + 1] === 0x51) {
      indexes.push(index);
    }
  }

  return indexes;
}

function deltaBefore(trackData: Uint8Array, eventIndex: number): number {
  let cursor = 0;

  while (cursor < eventIndex) {
    const { value, next } = decodeVlq(trackData, cursor);
    cursor = next;

    if (cursor === eventIndex) {
      return value;
    }

    if (trackData[cursor] !== 0xff) {
      throw new Error('Expected meta event');
    }

    const length = trackData[cursor + 2]!;
    cursor += 3 + length;
  }

  throw new Error('Could not find delta before event');
}

describe('encodeVlq', () => {
  it.each([
    [0, [0]],
    [127, [127]],
    [128, [0x81, 0x00]],
    [15360, [0xf8, 0x00]],
    [182400, [0x8b, 0x91, 0x00]],
    [14400, [0xf0, 0x40]],
  ])('encodes %i', (value, expected) => {
    expect(encodeVlq(value)).toEqual(expected);
    expect(decodeVlq(expected).value).toBe(value);
  });
});

describe('buildMidi', () => {
  it('writes a valid Type 0 header', () => {
    const midi = buildMidi([section()]);
    expect(readAscii(midi, 0, 4)).toBe('MThd');
    expect(midi[9]).toBe(0);
    expect(midi[11]).toBe(1);
    expect((midi[12] << 8) | midi[13]).toBe(480);
  });

  it('includes tempo and time signature meta events', () => {
    const midi = buildMidi([section({ tempo: 120, numerator: 4, denominator: 4 })]);
    expect(readAscii(midi, 14, 4)).toBe('MTrk');

    const trackData = midi.slice(22);
    expect(trackData[0]).toBe(0x00);
    expect(trackData[1]).toBe(0xff);
    expect(trackData[2]).toBe(0x51);
    expect(trackData[3]).toBe(0x03);

    const timeSigIndex = trackData.indexOf(0x58);
    expect(timeSigIndex).toBeGreaterThan(0);
    expect(trackData[timeSigIndex + 1]).toBe(0x04);
    expect(trackData[timeSigIndex + 2]).toBe(4);
    expect(trackData[timeSigIndex + 3]).toBe(2);
  });

  it('includes click notes on the same track when enabled', () => {
    const midi = buildMidi(
      [section({ bars: 2 })],
      { clickTrack: { enabled: true, instrumentId: 'woodblock' } },
    );
    const trackData = midi.slice(22);
    const noteOnCount = [...trackData].filter((_, index) => trackData[index] === 0x99).length;

    expect(noteOnCount).toBe(8);
  });

  it('places section boundaries at the correct tick offsets', () => {
    const sections = [
      section({ bars: 95 }),
      section({ id: '2', numerator: 6, denominator: 8, bars: 10 }),
      section({ id: '3', bars: 45 }),
    ];
    const midi = buildMidi(sections);
    const trackData = midi.slice(22);
    const tempoIndexes = findTempoEventIndexes(trackData);

    expect(tempoIndexes).toHaveLength(3);
    expect(deltaBefore(trackData, tempoIndexes[0]!)).toBe(0);
    expect(deltaBefore(trackData, tempoIndexes[1]!)).toBe(sectionTicks(sections[0]!));
    expect(deltaBefore(trackData, tempoIndexes[2]!)).toBe(sectionTicks(sections[1]!));
  });

  it('extends the track through the final section', () => {
    const sections = [section({ bars: 45 })];
    const midi = buildMidi(sections);
    const trackData = midi.slice(22);
    const endOfTrackIndex = trackData.findIndex(
      (byte, index) => byte === 0xff && trackData[index + 1] === 0x2f,
    );

    expect(deltaBefore(trackData, endOfTrackIndex)).toBe(sectionTicks(sections[0]!));
  });

  it('throws when no sections are provided', () => {
    expect(() => buildMidi([])).toThrow('At least one section is required');
  });
});

describe('suggestedFilename', () => {
  it('uses first section label when present', () => {
    expect(suggestedFilename([section({ label: 'Verse 1' })])).toBe('verse-1.mid');
  });

  it('falls back to default filename', () => {
    expect(suggestedFilename([section()])).toBe('song-structure.mid');
  });
});