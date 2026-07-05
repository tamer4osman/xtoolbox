import { describe, it, expect } from 'vitest';
import { parseSilenceEvents, buildTrimSegments, buildSelectFilter, buildAudioSelectFilter } from '../tools/video/silence-remover.js';

describe('silence-remover', () => {
  describe('parseSilenceEvents', () => {
    it('parses silence_start and silence_end from log output', () => {
      const log = [
        '    Stream #0:0: Audio: aac, 44100 Hz, stereo, fltp, 128 kb/s',
        '    Metadata:',
        '      DURATION    : 00:00:10.000000000',
        '[silencedetect @ 0x1234] silence_start: 1.5',
        '[silencedetect @ 0x1234] silence_end: 4.2 | silence_duration: 2.7',
      ].join('\n');

      const events = parseSilenceEvents(log);
      expect(events).toEqual([{ start: 1.5, end: 4.2 }]);
    });

    it('parses multiple silence sections', () => {
      const log = [
        '[silencedetect @ 0x1] silence_start: 0.5',
        '[silencedetect @ 0x1] silence_end: 2.0 | silence_duration: 1.5',
        '[silencedetect @ 0x1] silence_start: 6.0',
        '[silencedetect @ 0x1] silence_end: 8.5 | silence_duration: 2.5',
      ].join('\n');

      const events = parseSilenceEvents(log);
      expect(events).toEqual([
        { start: 0.5, end: 2.0 },
        { start: 6.0, end: 8.5 },
      ]);
    });

    it('handles unclosed silence (no end)', () => {
      const log = [
        '[silencedetect @ 0x1] silence_start: 7.0',
      ].join('\n');

      const events = parseSilenceEvents(log);
      expect(events).toEqual([{ start: 7.0, end: Infinity }]);
    });

    it('returns empty array when no silence detected', () => {
      const log = '    Stream #0:0: Audio: aac, 44100 Hz';
      const events = parseSilenceEvents(log);
      expect(events).toEqual([]);
    });

    it('handles empty log', () => {
      expect(parseSilenceEvents('')).toEqual([]);
    });
  });

  describe('buildTrimSegments', () => {
    it('returns null when no silence events', () => {
      expect(buildTrimSegments([], 10)).toBeNull();
    });

    it('builds segments from silence in the middle', () => {
      const events = [{ start: 3, end: 5 }];
      const segments = buildTrimSegments(events, 10);
      expect(segments).toEqual([
        { start: 0, end: 3 },
        { start: 5, end: 10 },
      ]);
    });

    it('builds segment when silence is at start', () => {
      const events = [{ start: 0, end: 2 }];
      const segments = buildTrimSegments(events, 10);
      expect(segments).toEqual([{ start: 2, end: 10 }]);
    });

    it('builds segment when silence is at end', () => {
      const events = [{ start: 8, end: 10 }];
      const segments = buildTrimSegments(events, 10);
      expect(segments).toEqual([{ start: 0, end: 8 }]);
    });

    it('handles multiple silence sections', () => {
      const events = [
        { start: 2, end: 3 },
        { start: 6, end: 8 },
      ];
      const segments = buildTrimSegments(events, 10);
      expect(segments).toEqual([
        { start: 0, end: 2 },
        { start: 3, end: 6 },
        { start: 8, end: 10 },
      ]);
    });

    it('handles silence covering entire video', () => {
      const events = [{ start: 0, end: 10 }];
      const segments = buildTrimSegments(events, 10);
      expect(segments).toBeNull();
    });

    it('handles Infinity end (unclosed silence)', () => {
      const events = [{ start: 5, end: Infinity }];
      const segments = buildTrimSegments(events, 10);
      expect(segments).toEqual([{ start: 0, end: 5 }]);
    });
  });

  describe('buildSelectFilter', () => {
    it('returns null for null segments', () => {
      expect(buildSelectFilter(null)).toBeNull();
    });

    it('returns null for empty segments', () => {
      expect(buildSelectFilter([])).toBeNull();
    });

    it('builds a select expression for one segment', () => {
      const filter = buildSelectFilter([{ start: 0, end: 3 }]);
      expect(filter).toBe("select='between(t,0.000,3.000)',setpts=N/FRAME_RATE/TB");
    });

    it('builds a select expression for multiple segments', () => {
      const filter = buildSelectFilter([
        { start: 0, end: 2 },
        { start: 5, end: 10 },
      ]);
      expect(filter).toBe("select='between(t,0.000,2.000)+between(t,5.000,10.000)',setpts=N/FRAME_RATE/TB");
    });
  });

  describe('buildAudioSelectFilter', () => {
    it('returns null for null segments', () => {
      expect(buildAudioSelectFilter(null)).toBeNull();
    });

    it('returns null for empty segments', () => {
      expect(buildAudioSelectFilter([])).toBeNull();
    });

    it('builds an aselect expression for one segment', () => {
      const filter = buildAudioSelectFilter([{ start: 0, end: 3 }]);
      expect(filter).toBe("aselect='between(t,0.000,3.000)',asetpts=N/SR/TB");
    });

    it('builds an aselect expression for multiple segments', () => {
      const filter = buildAudioSelectFilter([
        { start: 0, end: 2 },
        { start: 5, end: 10 },
      ]);
      expect(filter).toBe("aselect='between(t,0.000,2.000)+between(t,5.000,10.000)',asetpts=N/SR/TB");
    });
  });
});
