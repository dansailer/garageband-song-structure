import type { Section } from './types';

export const PPQ = 480;

export function quarterNotesPerBar(numerator: number, denominator: number): number {
  return numerator * (4 / denominator);
}

export function sectionDurationSeconds(section: Section): number {
  const beats = section.bars * quarterNotesPerBar(section.numerator, section.denominator);
  return beats * (60 / section.tempo);
}

export function sectionTicks(section: Section, ppq = PPQ): number {
  const beats = section.bars * quarterNotesPerBar(section.numerator, section.denominator);
  return Math.round(beats * ppq);
}

export function totalBars(sections: Section[]): number {
  return sections.reduce((sum, section) => sum + section.bars, 0);
}

export function totalDurationSeconds(sections: Section[]): number {
  return sections.reduce((sum, section) => sum + sectionDurationSeconds(section), 0);
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}