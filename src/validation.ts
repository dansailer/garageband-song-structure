import {
  BARS_MIN,
  NUMERATOR_MAX,
  NUMERATOR_MIN,
  TEMPO_MAX,
  TEMPO_MIN,
  type Section,
} from './types';

export interface SectionValidation {
  valid: boolean;
  errors: Partial<Record<keyof Section, string>>;
}

export function validateSection(section: Section): SectionValidation {
  const errors: Partial<Record<keyof Section, string>> = {};

  if (section.numerator < NUMERATOR_MIN || section.numerator > NUMERATOR_MAX) {
    errors.numerator = `Must be ${NUMERATOR_MIN}–${NUMERATOR_MAX}`;
  }

  if (section.tempo < TEMPO_MIN || section.tempo > TEMPO_MAX) {
    errors.tempo = `Must be ${TEMPO_MIN}–${TEMPO_MAX} BPM`;
  }

  if (!Number.isInteger(section.bars) || section.bars < BARS_MIN) {
    errors.bars = `Must be at least ${BARS_MIN}`;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function allSectionsValid(sections: Section[]): boolean {
  return sections.length > 0 && sections.every((section) => validateSection(section).valid);
}