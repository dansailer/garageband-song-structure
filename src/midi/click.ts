import { getClickInstrument, type ClickInstrument } from '../click-instruments';
import type { ClickInstrumentId } from '../click-instruments';
import { PPQ, quarterNotesPerBar } from '../timing';
import type { Section } from '../types';

/** Short staccato hits for a tight click. */
const NOTE_DURATION_TICKS = 48;

export interface TimedMidiEvent {
  tick: number;
  data: number[];
}

function noteOn(channel: number, note: number, velocity: number): number[] {
  return [0x90 | channel, note, velocity];
}

function noteOff(channel: number, note: number): number[] {
  return [0x80 | channel, note, 0];
}

function metaTextEvent(type: number, text: string): number[] {
  const bytes = Array.from(new TextEncoder().encode(text));
  return [0xff, type, bytes.length, ...bytes];
}

function controlChange(channel: number, controller: number, value: number): number[] {
  return [0xb0 | channel, controller, value];
}

function programChange(channel: number, program: number): number[] {
  return [0xc0 | channel, program];
}

export interface ClickBeat {
  tickOffset: number;
  accent: boolean;
}

function isCompoundEighthMeter(numerator: number, denominator: number): boolean {
  return denominator === 8 && numerator >= 6 && numerator % 3 === 0;
}

/** Click subdivisions within one bar (tick offsets from bar start). */
export function getClickBeatsInBar(
  numerator: number,
  denominator: number,
  ppq = PPQ,
): ClickBeat[] {
  if (denominator === 8) {
    const ticksPerEighth = ppq / 2;
    const compound = isCompoundEighthMeter(numerator, denominator);

    return Array.from({ length: numerator }, (_, beat) => ({
      tickOffset: Math.round(beat * ticksPerEighth),
      accent: compound ? beat % 3 === 0 : beat === 0,
    }));
  }

  const beatsPerBar = quarterNotesPerBar(numerator, denominator);

  return Array.from({ length: beatsPerBar }, (_, beat) => ({
    tickOffset: beat * ppq,
    accent: beat === 0,
  }));
}

export function setupClickInstrumentEvents(instrument: ClickInstrument): TimedMidiEvent[] {
  const events: TimedMidiEvent[] = [
    { tick: 0, data: metaTextEvent(0x03, 'Click') },
    { tick: 0, data: metaTextEvent(0x04, instrument.label) },
  ];

  if (instrument.mode === 'melodic' && instrument.program !== undefined) {
    events.push(
      { tick: 0, data: controlChange(instrument.channel, 0, 0) },
      { tick: 0, data: controlChange(instrument.channel, 32, 0) },
      { tick: 0, data: programChange(instrument.channel, instrument.program) },
    );
  }

  return events;
}

export function collectSectionClickEvents(
  section: Section,
  sectionStartTick: number,
  instrument: ClickInstrument,
): TimedMidiEvent[] {
  const events: TimedMidiEvent[] = [];
  const clicksPerBar = getClickBeatsInBar(section.numerator, section.denominator);
  const ticksPerBar = Math.round(
    quarterNotesPerBar(section.numerator, section.denominator) * PPQ,
  );

  for (let bar = 0; bar < section.bars; bar += 1) {
    for (const click of clicksPerBar) {
      const tick = sectionStartTick + bar * ticksPerBar + click.tickOffset;
      const note = click.accent ? instrument.accentNote : instrument.note;
      const velocity = click.accent ? instrument.accentVelocity : instrument.velocity;

      events.push({ tick, data: noteOn(instrument.channel, note, velocity) });
      events.push({
        tick: tick + NOTE_DURATION_TICKS,
        data: noteOff(instrument.channel, note),
      });
    }
  }

  return events;
}

export function appendClickEvents(
  events: TimedMidiEvent[],
  sections: Section[],
  instrumentId: ClickInstrumentId,
): void {
  const instrument = getClickInstrument(instrumentId);
  let sectionStartTick = 0;

  for (const section of sections) {
    events.push(...collectSectionClickEvents(section, sectionStartTick, instrument));
    const beatsPerBar = quarterNotesPerBar(section.numerator, section.denominator);
    sectionStartTick += Math.round(section.bars * beatsPerBar * PPQ);
  }
}