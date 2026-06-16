import { describe, expect, it } from 'vitest';
import type { Section } from '../types';
import { buildMidi } from './builder';
import { collectSectionClickEvents, getClickBeatsInBar } from './click';
import { PPQ } from '../timing';
import { getClickInstrument } from '../click-instruments';

function section(overrides: Partial<Section> = {}): Section {
  return {
    id: 'test',
    numerator: 4,
    denominator: 4,
    tempo: 120,
    bars: 2,
    ...overrides,
  };
}

function countNoteOns(trackData: Uint8Array, channel = 9): number {
  let count = 0;

  for (let index = 0; index < trackData.length - 2; index += 1) {
    if (trackData[index] === (0x90 | channel)) {
      count += 1;
    }
  }

  return count;
}

describe('getClickBeatsInBar', () => {
  it('uses eighth-note pulses for /8 meters', () => {
    expect(getClickBeatsInBar(6, 8)).toEqual([
      { tickOffset: 0, accent: true },
      { tickOffset: 240, accent: false },
      { tickOffset: 480, accent: false },
      { tickOffset: 720, accent: true },
      { tickOffset: 960, accent: false },
      { tickOffset: 1200, accent: false },
    ]);
    expect(getClickBeatsInBar(9, 8)).toHaveLength(9);
    expect(getClickBeatsInBar(12, 8)).toHaveLength(12);
  });

  it('accents only the downbeat for simple /8 meters', () => {
    expect(getClickBeatsInBar(5, 8)).toEqual([
      { tickOffset: 0, accent: true },
      { tickOffset: 240, accent: false },
      { tickOffset: 480, accent: false },
      { tickOffset: 720, accent: false },
      { tickOffset: 960, accent: false },
    ]);
    expect(getClickBeatsInBar(3, 8)).toHaveLength(3);
  });

  it('uses quarter-note pulses for /4 meters', () => {
    expect(getClickBeatsInBar(4, 4)).toEqual([
      { tickOffset: 0, accent: true },
      { tickOffset: PPQ, accent: false },
      { tickOffset: PPQ * 2, accent: false },
      { tickOffset: PPQ * 3, accent: false },
    ]);
  });
});

describe('collectSectionClickEvents', () => {
  it('uses GM drum wood block notes at full velocity', () => {
    const instrument = getClickInstrument('woodblock');
    const events = collectSectionClickEvents(section({ bars: 1 }), 0, instrument);
    const noteOns = events.filter((event) => event.data[0] === 0x99);

    expect(noteOns).toHaveLength(4);
    expect(noteOns[0]?.data[1]).toBe(77);
    expect(noteOns[0]?.data[2]).toBe(127);
    expect(noteOns[1]?.data[1]).toBe(76);
  });

  it('clicks on every eighth in 6/8 with accents on 1 and 4', () => {
    const instrument = getClickInstrument('woodblock');
    const events = collectSectionClickEvents(
      section({ numerator: 6, denominator: 8, bars: 1 }),
      0,
      instrument,
    );
    const noteOns = events.filter((event) => event.data[0] === 0x99);

    expect(noteOns).toHaveLength(6);
    expect(noteOns[0]?.data[1]).toBe(77);
    expect(noteOns[1]?.data[1]).toBe(76);
    expect(noteOns[3]?.data[1]).toBe(77);
    expect(noteOns[4]?.data[1]).toBe(76);
  });
});

describe('buildMidi click track', () => {
  it('emits a program change for the pluck preset', () => {
    const midi = buildMidi([section()], {
      clickTrack: { enabled: true, instrumentId: 'pluck' },
    });
    const trackData = midi.slice(22);

    expect(trackData.includes(0xc0)).toBe(true);
    expect(trackData.includes(25)).toBe(true);
  });

  it('keeps a single Type 0 track with tempo meta and click notes combined', () => {
    const midi = buildMidi([section()], {
      clickTrack: { enabled: true, instrumentId: 'woodblock' },
    });

    expect(midi[9]).toBe(0);
    expect(midi[11]).toBe(1);
    expect(countNoteOns(midi.slice(22))).toBeGreaterThan(0);
  });

  it('keeps meta-only output when click is disabled', () => {
    const midi = buildMidi([section()], {
      clickTrack: { enabled: false, instrumentId: 'woodblock' },
    });

    expect(countNoteOns(midi.slice(22))).toBe(0);
  });
});