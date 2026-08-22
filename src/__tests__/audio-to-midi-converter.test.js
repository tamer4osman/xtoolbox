import { describe, expect, it } from "vitest";
import {
  buildMidiFile,
  cleanup,
  encodeVarLen,
  freqToMidi,
  midiToFreq,
  midiToName,
  segmentNotes
} from "../tools/audio/audio-to-midi-converter.js";
import { testToolConfig } from "./helpers/tool-config-test.js";

testToolConfig(() => import("../tools/audio/audio-to-midi-converter.js"), {
  id: "audio-to-midi-converter",
  name: "Audio to MIDI Converter",
  category: "audio"
});

describe("pitch helpers", () => {
  it("maps A4 to MIDI 69 and back", () => {
    expect(freqToMidi(440)).toBe(69);
    expect(midiToFreq(69)).toBeCloseTo(440, 5);
    expect(freqToMidi(midiToFreq(60))).toBe(60);
  });

  it("handles invalid frequencies", () => {
    expect(freqToMidi(0)).toBeNull();
    expect(freqToMidi(-100)).toBeNull();
    expect(freqToMidi(NaN)).toBeNull();
  });

  it("names notes correctly", () => {
    expect(midiToName(69)).toBe("A4");
    expect(midiToName(60)).toBe("C4");
    expect(midiToName(61)).toBe("C#4");
    expect(midiToName(21)).toBe("A0");
  });
});

describe("encodeVarLen", () => {
  it("encodes single-byte values", () => {
    expect(encodeVarLen(0)).toEqual([0x00]);
    expect(encodeVarLen(127)).toEqual([0x7f]);
  });

  it("encodes multi-byte VLQs", () => {
    expect(encodeVarLen(128)).toEqual([0x81, 0x00]);
    expect(encodeVarLen(480)).toEqual([0x83, 0x60]);
    expect(encodeVarLen(16384)).toEqual([0x81, 0x80, 0x00]);
  });
});

describe("segmentNotes", () => {
  const mk = freqs => freqs.map(f => (f === null ? null : { freq: f }));
  const HOP = 512 / 22050;

  it("merges consecutive same-pitch frames into one note", () => {
    const f = midiToFreq(69);
    const notes = segmentNotes(mk([f, f, f, f]), { hopSec: HOP });
    expect(notes).toHaveLength(1);
    expect(notes[0].midi).toBe(69);
    expect(notes[0].end - notes[0].start).toBeCloseTo(4 * HOP, 6);
  });

  it("filters blips shorter than minNoteSec", () => {
    const f = midiToFreq(69);
    const frames = [null, { freq: f }, null];
    expect(segmentNotes(frames, { hopSec: HOP, minNoteSec: 0.08 })).toHaveLength(0);
    expect(segmentNotes(frames, { hopSec: HOP, minNoteSec: 0.01 })).toHaveLength(1);
  });

  it("splits distinct pitches and silence gaps", () => {
    const a = midiToFreq(60);
    const b = midiToFreq(67);
    const notes = segmentNotes(mk([a, a, a, a, a, null, null, b, b, b, b, b]), { hopSec: HOP });
    expect(notes.map(n => n.midi)).toEqual([60, 67]);
  });

  it("returns empty for all-silence", () => {
    expect(segmentNotes(mk([null, null, null]))).toHaveLength(0);
  });
});

function parseHeader(bytes) {
  const str = len => String.fromCharCode(...bytes.slice(0, len));
  if (str(4) !== "MThd") throw new Error("bad header");
  return {
    format: (bytes[8] << 8) | bytes[9],
    ntrks: (bytes[10] << 8) | bytes[11],
    division: (bytes[12] << 8) | bytes[13],
    trackLen: (bytes[18] << 24) | (bytes[19] << 16) | (bytes[20] << 8) | bytes[21]
  };
}

describe("buildMidiFile", () => {
  it("emits a valid type-0 SMF header", () => {
    const bytes = buildMidiFile([{ midi: 69, start: 0, end: 0.5, velocity: 96 }]);
    const h = parseHeader(bytes);
    expect(h.format).toBe(0);
    expect(h.ntrks).toBe(1);
    expect(h.division).toBe(480);
    expect(bytes.length - 22).toBe(h.trackLen);
  });

  it("writes note-on then note-off with correct pitches", () => {
    const bytes = buildMidiFile([
      { midi: 69, start: 0, end: 0.25, velocity: 96 },
      { midi: 72, start: 0.5, end: 1, velocity: 96 }
    ]);
    const text = [...bytes].join(",");
    expect(text).toContain(`144,69,96`);
    expect(text).toContain(`144,72,96`);
    expect(text).toContain(`128,69,0`);
    expect(text).toContain(`128,72,0`);
    expect(Array.from(bytes.slice(-3))).toEqual([0xff, 0x2f, 0x00]);
  });

  it("orders events by tick across overlapping notes", () => {
    const bytes = buildMidiFile([
      { midi: 60, start: 0, end: 2, velocity: 96 },
      { midi: 64, start: 0.5, end: 1, velocity: 96 }
    ]);
    let i = 22;
    const onIdx = [];
    while (i < bytes.length - 3) {
      if (bytes[i] === 0x90 && bytes[i + 2] > 0) onIdx.push(i);
      i++;
    }
    expect(onIdx.length).toBe(2);
    expect(onIdx[0] < onIdx[1]).toBe(true);
  });

  it("encodes tempo meta from bpm", () => {
    const bytes = buildMidiFile([{ midi: 69, start: 0, end: 0.1 }], { bpm: 60 });
    let idx = -1;
    for (let i = 0; i < bytes.length - 5; i++) {
      if (bytes[i] === 0xff && bytes[i + 1] === 0x51 && bytes[i + 2] === 0x03) {
        idx = i;
        break;
      }
    }
    expect(idx).toBeGreaterThan(-1);
    const micro = (bytes[idx + 3] << 16) | (bytes[idx + 4] << 8) | bytes[idx + 5];
    expect(micro).toBe(1000000);
  });
});

describe("cleanup", () => {
  it("is safe to call repeatedly", () => {
    expect(() => {
      cleanup();
      cleanup();
    }).not.toThrow();
  });
});
