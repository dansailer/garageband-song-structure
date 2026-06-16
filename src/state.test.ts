import { describe, expect, it } from 'vitest';
import { createSection } from './state';

describe('createSection', () => {
  it('uses defaults when there is no previous section', () => {
    expect(createSection()).toEqual({
      id: expect.any(String),
      label: '',
      numerator: 4,
      denominator: 4,
      tempo: 120,
      bars: 8,
    });
  });

  it('inherits time signature and tempo from the previous section', () => {
    const previous = createSection();
    previous.numerator = 6;
    previous.denominator = 8;
    previous.tempo = 95;

    expect(createSection(previous)).toMatchObject({
      numerator: 6,
      denominator: 8,
      tempo: 95,
      bars: 8,
    });
  });
});