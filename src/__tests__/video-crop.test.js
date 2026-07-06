import { describe, it, expect } from 'vitest';

function normalizeCrop(crop, videoW, videoH) {
  const cw = crop.w % 2 === 0 ? crop.w : crop.w - 1;
  const ch = crop.h % 2 === 0 ? crop.h : crop.h - 1;
  return {
    x: Math.max(0, Math.min(crop.x, videoW - cw)),
    y: Math.max(0, Math.min(crop.y, videoH - ch)),
    w: Math.max(16, Math.min(cw, videoW)),
    h: Math.max(16, Math.min(ch, videoH)),
  };
}

describe('video-crop', () => {
  describe('normalizeCrop', () => {
    it('makes even width', () => {
      const result = normalizeCrop({ x: 0, y: 0, w: 101, h: 100 }, 1920, 1080);
      expect(result.w % 2).toBe(0);
    });

    it('makes even height', () => {
      const result = normalizeCrop({ x: 0, y: 0, w: 100, h: 101 }, 1920, 1080);
      expect(result.h % 2).toBe(0);
    });

    it('clamps x to not exceed video width', () => {
      const result = normalizeCrop({ x: 1900, y: 0, w: 100, h: 100 }, 1920, 1080);
      expect(result.x + result.w).toBeLessThanOrEqual(1920);
    });

    it('clamps y to not exceed video height', () => {
      const result = normalizeCrop({ x: 0, y: 1000, w: 100, h: 100 }, 1920, 1080);
      expect(result.y + result.h).toBeLessThanOrEqual(1080);
    });

    it('minimum crop size is 16px', () => {
      const result = normalizeCrop({ x: 0, y: 0, w: 4, h: 4 }, 1920, 1080);
      expect(result.w).toBe(16);
      expect(result.h).toBe(16);
    });

    it('does not exceed video width', () => {
      const result = normalizeCrop({ x: 0, y: 0, w: 2000, h: 100 }, 1920, 1080);
      expect(result.w).toBeLessThanOrEqual(1920);
    });

    it('does not exceed video height', () => {
      const result = normalizeCrop({ x: 0, y: 0, w: 100, h: 2000 }, 1920, 1080);
      expect(result.h).toBeLessThanOrEqual(1080);
    });

    it('keeps even dimensions when already even', () => {
      const result = normalizeCrop({ x: 0, y: 0, w: 640, h: 480 }, 1920, 1080);
      expect(result.w).toBe(640);
      expect(result.h).toBe(480);
    });

    it('preserves x and y when within bounds', () => {
      const result = normalizeCrop({ x: 100, y: 200, w: 640, h: 480 }, 1920, 1080);
      expect(result.x).toBe(100);
      expect(result.y).toBe(200);
    });

    it('clamps negative x and y to 0', () => {
      const result = normalizeCrop({ x: -10, y: -20, w: 640, h: 480 }, 1920, 1080);
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });

    it('full frame crop stays full frame', () => {
      const result = normalizeCrop({ x: 0, y: 0, w: 1920, h: 1080 }, 1920, 1080);
      expect(result).toEqual({ x: 0, y: 0, w: 1920, h: 1080 });
    });

    it('odd dimensions are reduced by 1', () => {
      const result = normalizeCrop({ x: 0, y: 0, w: 1921, h: 1081 }, 1920, 1080);
      expect(result.w).toBe(1920);
      expect(result.h).toBe(1080);
    });
  });
});
