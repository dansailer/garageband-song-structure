export type ClickInstrumentId = 'pluck' | 'woodblock' | 'sidestick' | 'snare' | 'hihat' | 'cowbell';

export type ClickInstrumentMode = 'melodic' | 'drum';

export interface ClickInstrument {
  id: ClickInstrumentId;
  label: string;
  mode: ClickInstrumentMode;
  channel: number;
  program?: number;
  note: number;
  accentNote: number;
  velocity: number;
  accentVelocity: number;
  garageBandKit: string;
  description: string;
}

export const DEFAULT_CLICK_INSTRUMENT_ID: ClickInstrumentId = 'pluck';

export const GARAGEBAND_CLICK_IMPORT_STEPS = [
  'Add a new Software Instrument track (+ in the header).',
  'Select Synthesizer → Plucked → Future Rave Pluck in the Library.',
  'Download and import the .mid file (File → Import → MIDI File).',
  'Drag the imported MIDI region onto the Future Rave Pluck track.',
];

/** GarageBand does not auto-assign instruments from MIDI — assign the patch in the Library first. */
export const CLICK_INSTRUMENTS: ClickInstrument[] = [
  {
    id: 'pluck',
    label: 'Future Rave Pluck (recommended)',
    mode: 'melodic',
    channel: 0,
    program: 25,
    note: 79,
    accentNote: 84,
    velocity: 127,
    accentVelocity: 127,
    garageBandKit: 'Synthesizer → Plucked → Future Rave Pluck',
    description: 'Bright, short pluck — clearly audible and works well as a click.',
  },
  {
    id: 'woodblock',
    label: 'Wood Block',
    mode: 'drum',
    channel: 9,
    note: 76,
    accentNote: 77,
    velocity: 127,
    accentVelocity: 127,
    garageBandKit: 'Drum Kit → Wood Blocks',
    description: 'Classic metronome wood block on a drum kit track.',
  },
  {
    id: 'sidestick',
    label: 'Side Stick',
    mode: 'drum',
    channel: 9,
    note: 37,
    accentNote: 37,
    velocity: 110,
    accentVelocity: 127,
    garageBandKit: 'Drum Kit → SoCal (or any kit)',
    description: 'Sharp rim/side-stick hit on a drum kit track.',
  },
  {
    id: 'snare',
    label: 'Snare',
    mode: 'drum',
    channel: 9,
    note: 38,
    accentNote: 52,
    velocity: 100,
    accentVelocity: 127,
    garageBandKit: 'Drum Kit → SoCal (or any kit)',
    description: 'Loud snare on downbeats on a drum kit track.',
  },
  {
    id: 'hihat',
    label: 'Hi-Hat',
    mode: 'drum',
    channel: 9,
    note: 42,
    accentNote: 44,
    velocity: 110,
    accentVelocity: 127,
    garageBandKit: 'Drum Kit → SoCal (or any kit)',
    description: 'Closed hi-hat on a drum kit track.',
  },
  {
    id: 'cowbell',
    label: 'Cowbell',
    mode: 'drum',
    channel: 9,
    note: 56,
    accentNote: 56,
    velocity: 110,
    accentVelocity: 127,
    garageBandKit: 'Drum Kit → SoCal (or any kit)',
    description: 'Bright cowbell on a drum kit track.',
  },
];

export function getClickInstrument(id: ClickInstrumentId): ClickInstrument {
  return CLICK_INSTRUMENTS.find((entry) => entry.id === id) ?? CLICK_INSTRUMENTS[0]!;
}