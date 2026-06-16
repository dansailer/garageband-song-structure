import type { ClickInstrumentId } from './click-instruments';

export type TimeSignatureDenominator = 2 | 4 | 8 | 16;

export interface Section {
  id: string;
  label?: string;
  numerator: number;
  denominator: TimeSignatureDenominator;
  tempo: number;
  bars: number;
}

export interface ClickTrackSettings {
  enabled: boolean;
  instrumentId: ClickInstrumentId;
}

export interface AppState {
  sections: Section[];
  clickTrack: ClickTrackSettings;
}

export const DEFAULT_CLICK_TRACK: ClickTrackSettings = {
  enabled: false,
  instrumentId: 'pluck',
};

export const STORAGE_KEY = 'garageband-song-structure-v1';

export const TEMPO_MIN = 40;
export const TEMPO_MAX = 240;
export const NUMERATOR_MIN = 1;
export const NUMERATOR_MAX = 12;
export const BARS_MIN = 1;

export const DENOMINATOR_OPTIONS: TimeSignatureDenominator[] = [2, 4, 8, 16];