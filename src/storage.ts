import { getClickInstrument, type ClickInstrumentId } from './click-instruments';
import { DEFAULT_CLICK_TRACK, STORAGE_KEY, type AppState } from './types';

function normalizeInstrumentId(value: unknown): ClickInstrumentId {
  if (value === 'synthetic') {
    return 'pluck';
  }

  if (typeof value === 'string' && getClickInstrument(value as ClickInstrumentId).id === value) {
    return value as ClickInstrumentId;
  }

  return DEFAULT_CLICK_TRACK.instrumentId;
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { sections: [], clickTrack: { ...DEFAULT_CLICK_TRACK } };
    }

    const parsed = JSON.parse(raw) as Partial<AppState>;
    if (!Array.isArray(parsed.sections)) {
      return { sections: [], clickTrack: { ...DEFAULT_CLICK_TRACK } };
    }

    return {
      sections: parsed.sections,
      clickTrack: {
        enabled: parsed.clickTrack?.enabled ?? DEFAULT_CLICK_TRACK.enabled,
        instrumentId: normalizeInstrumentId(parsed.clickTrack?.instrumentId),
      },
    };
  } catch {
    return { sections: [], clickTrack: { ...DEFAULT_CLICK_TRACK } };
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}