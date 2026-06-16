import { appendClickEvents, setupClickInstrumentEvents, type TimedMidiEvent } from './click';
import { getClickInstrument } from '../click-instruments';
import { sectionTicks } from '../timing';
import type { ClickTrackSettings, Section } from '../types';

const HEADER = new TextEncoder().encode('MThd');
const TRACK = new TextEncoder().encode('MTrk');

export interface BuildMidiOptions {
  clickTrack?: ClickTrackSettings;
}

function writeUint32(value: number): Uint8Array {
  const buffer = new Uint8Array(4);
  buffer[0] = (value >> 24) & 0xff;
  buffer[1] = (value >> 16) & 0xff;
  buffer[2] = (value >> 8) & 0xff;
  buffer[3] = value & 0xff;
  return buffer;
}

function writeUint16(value: number): Uint8Array {
  const buffer = new Uint8Array(2);
  buffer[0] = (value >> 8) & 0xff;
  buffer[1] = value & 0xff;
  return buffer;
}

/** MIDI VLQ: bytes in order of decreasing significance (MSB first). */
export function encodeVlq(value: number): number[] {
  if (value < 0) {
    throw new Error('VLQ value must be non-negative');
  }

  if (value === 0) {
    return [0];
  }

  const bytes: number[] = [];
  let remaining = value;

  while (remaining > 0) {
    bytes.unshift(remaining & 0x7f);
    remaining >>= 7;
  }

  for (let index = 0; index < bytes.length - 1; index += 1) {
    bytes[index]! |= 0x80;
  }

  return bytes;
}

/** Standard MIDI VLQ decoder (matches GarageBand / DAW parsers). */
export function decodeVlq(bytes: number[] | Uint8Array, start = 0): { value: number; next: number } {
  let value = 0;
  let index = start;

  while (index < bytes.length) {
    const byte = bytes[index]!;
    index += 1;
    value = (value << 7) | (byte & 0x7f);
    if ((byte & 0x80) === 0) {
      break;
    }
  }

  return { value, next: index };
}

function denominatorExponent(denominator: number): number {
  return Math.log2(denominator);
}

function tempoEvent(tempo: number): number[] {
  const microsecondsPerQuarter = Math.round(60_000_000 / tempo);
  return [
    0xff,
    0x51,
    0x03,
    (microsecondsPerQuarter >> 16) & 0xff,
    (microsecondsPerQuarter >> 8) & 0xff,
    microsecondsPerQuarter & 0xff,
  ];
}

function timeSignatureEvent(numerator: number, denominator: number): number[] {
  return [
    0xff,
    0x58,
    0x04,
    numerator,
    denominatorExponent(denominator),
    24,
    8,
  ];
}

function trackNameEvent(name: string): number[] {
  const bytes = Array.from(new TextEncoder().encode(name));
  return [0xff, 0x03, bytes.length, ...bytes];
}

function encodeTimedEvents(events: TimedMidiEvent[]): number[] {
  const output: number[] = [];
  let previousTick = 0;

  for (const event of events) {
    const delta = event.tick - previousTick;
    output.push(...encodeVlq(delta));
    output.push(...event.data);
    previousTick = event.tick;
  }

  return output;
}

function compareTimedEvents(left: TimedMidiEvent, right: TimedMidiEvent): number {
  if (left.tick !== right.tick) {
    return left.tick - right.tick;
  }

  const leftIsMeta = left.data[0] === 0xff ? 0 : 1;
  const rightIsMeta = right.data[0] === 0xff ? 0 : 1;
  return leftIsMeta - rightIsMeta;
}

function buildTrackData(sections: Section[], clickTrack?: ClickTrackSettings): Uint8Array {
  const clickEnabled = clickTrack?.enabled ?? false;
  const events: TimedMidiEvent[] = [];

  if (clickEnabled) {
    events.push({ tick: 0, data: trackNameEvent('Tempo Map + Click') });
    events.push(...setupClickInstrumentEvents(getClickInstrument(clickTrack!.instrumentId)));
  }

  let sectionStartTick = 0;

  for (let index = 0; index < sections.length; index += 1) {
    const section = sections[index]!;
    const tick = sectionStartTick;

    events.push({ tick, data: tempoEvent(section.tempo) });
    events.push({ tick, data: timeSignatureEvent(section.numerator, section.denominator) });
    sectionStartTick += sectionTicks(section);
  }

  if (clickEnabled) {
    appendClickEvents(events, sections, clickTrack!.instrumentId);
  }

  const sorted = events.sort(compareTimedEvents);
  const encoded = encodeTimedEvents(sorted);
  const totalTicks = sectionStartTick;
  const lastTick = sorted.reduce((max, event) => Math.max(max, event.tick), 0);

  encoded.push(...encodeVlq(totalTicks - lastTick));
  encoded.push(0xff, 0x2f, 0x00);

  return new Uint8Array(encoded);
}

function assembleMidi(tracks: Uint8Array[]): Uint8Array {
  const format: 0 | 1 = tracks.length > 1 ? 1 : 0;
  const chunks: Uint8Array[] = [];

  chunks.push(HEADER);
  chunks.push(writeUint32(6));
  chunks.push(writeUint16(format));
  chunks.push(writeUint16(tracks.length));
  chunks.push(writeUint16(480));

  for (const track of tracks) {
    chunks.push(TRACK);
    chunks.push(writeUint32(track.length));
    chunks.push(track);
  }

  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const output = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.length;
  }

  return output;
}

export function buildMidi(sections: Section[], options: BuildMidiOptions = {}): Uint8Array {
  if (sections.length === 0) {
    throw new Error('At least one section is required');
  }

  return assembleMidi([buildTrackData(sections, options.clickTrack)]);
}

export function suggestedBasename(sections: Section[]): string {
  const label = sections[0]?.label?.trim();
  if (!label) {
    return 'song-structure';
  }

  const safe = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return safe || 'song-structure';
}

export function suggestedFilename(sections: Section[]): string {
  return `${suggestedBasename(sections)}.mid`;
}

function triggerDownload(bytes: Uint8Array, mimeType: string, filename: string): void {
  const blob = new Blob([new Uint8Array(bytes)], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadMidi(sections: Section[], options: BuildMidiOptions = {}): void {
  triggerDownload(buildMidi(sections, options), 'audio/midi', suggestedFilename(sections));
}