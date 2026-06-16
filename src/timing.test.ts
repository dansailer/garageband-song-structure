import { describe, expect, it } from 'vitest';
import type { Section } from './types';
import {
  formatDuration,
  quarterNotesPerBar,
  sectionDurationSeconds,
  sectionTicks,
  totalBars,
  totalDurationSeconds,
} from './timing';

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

describe('quarterNotesPerBar', () => {
  it('computes 4/4 correctly', () => {
    expect(quarterNotesPerBar(4, 4)).toBe(4);
  });

  it('computes 3/4 correctly', () => {
    expect(quarterNotesPerBar(3, 4)).toBe(3);
  });

  it('computes 6/8 correctly', () => {
    expect(quarterNotesPerBar(6, 8)).toBe(3);
  });
});

describe('sectionDurationSeconds', () => {
  it('computes 8 bars of 4/4 at 120 BPM as 16 seconds', () => {
    expect(sectionDurationSeconds(section())).toBe(16);
  });

  it('computes 16 bars of 3/4 at 90 BPM', () => {
    const duration = sectionDurationSeconds(
      section({ numerator: 3, denominator: 4, tempo: 90, bars: 16 }),
    );
    expect(duration).toBeCloseTo(32, 5);
  });
});

describe('sectionTicks', () => {
  it('computes 8 bars of 4/4 as 15360 ticks at PPQ 480', () => {
    expect(sectionTicks(section())).toBe(15360);
  });
});

describe('totals', () => {
  it('sums bars and duration across sections', () => {
    const sections = [
      section({ bars: 4 }),
      section({ id: '2', bars: 8, tempo: 60 }),
    ];

    expect(totalBars(sections)).toBe(12);
    expect(totalDurationSeconds(sections)).toBe(40);
  });
});

describe('formatDuration', () => {
  it('formats minutes and seconds', () => {
    expect(formatDuration(106)).toBe('1:46');
    expect(formatDuration(16)).toBe('0:16');
  });
});