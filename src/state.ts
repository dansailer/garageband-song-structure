import type { ClickInstrumentId } from './click-instruments';
import { loadState, saveState } from './storage';
import type { ClickTrackSettings, Section } from './types';


type Listener = () => void;

const initialState = loadState();
let sections: Section[] = initialState.sections;
let clickTrack: ClickTrackSettings = initialState.clickTrack;
const listeners = new Set<Listener>();

function persist(): void {
  saveState({ sections, clickTrack });
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify(): void {
  persist();
  listeners.forEach((listener) => listener());
}

export function getSections(): Section[] {
  return sections;
}

export function getClickTrackSettings(): ClickTrackSettings {
  return clickTrack;
}

export function setClickTrackEnabled(enabled: boolean): void {
  clickTrack = { ...clickTrack, enabled };
  notify();
}

export function setClickInstrument(instrumentId: ClickInstrumentId): void {
  clickTrack = { ...clickTrack, instrumentId };
  notify();
}

export function createSection(previous?: Section): Section {
  return {
    id: crypto.randomUUID(),
    label: '',
    numerator: previous?.numerator ?? 4,
    denominator: previous?.denominator ?? 4,
    tempo: previous?.tempo ?? 120,
    bars: 8,
  };
}

export function addSection(): void {
  const previous = sections.at(-1);
  sections = [...sections, createSection(previous)];
  notify();
}

export function updateSection(id: string, patch: Partial<Section>): void {
  sections = sections.map((section) =>
    section.id === id ? { ...section, ...patch, id: section.id } : section,
  );
  notify();
}

export function deleteSection(id: string): void {
  sections = sections.filter((section) => section.id !== id);
  notify();
}

export function reorderSections(fromIndex: number, toIndex: number): void {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= sections.length ||
    toIndex >= sections.length
  ) {
    return;
  }

  const next = [...sections];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  sections = next;
  notify();
}

