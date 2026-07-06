import { describe, it, expect } from 'vitest';
import { normalizeCrop } from '../tools/video/video-crop.js';

function clampCrop(c, videoW, videoH) {
  c.w = Math.max(16, c.w);
  c.h = Math.max(16, c.h);
  c.x = Math.max(0, Math.min(c.x, videoW - c.w));
  c.y = Math.max(0, Math.min(c.y, videoH - c.h));
  c.w = Math.min(c.w, videoW - c.x);
  c.h = Math.min(c.h, videoH - c.y);
  return c;
}

describe('video-crop', () => {
  describe('clampCrop', () => {
    it('clamps negative width to 16', () => {
      const result = clampCrop({ x: 1800, y: 0, w: -50, h: 100 }, 1920, 1080);
      expect(result.w).toBe(16);
    });

    it('clamps x after width is clamped', () => {
      const result = clampCrop({ x: 1950, y: 0, w: -50, h: 100 }, 1920, 1080);
      expect(result.x).toBeLessThanOrEqual(1920 - 16);
      expect(result.x + result.w).toBeLessThanOrEqual(1920);
    });

    it('does not let x escape past video width', () => {
      const result = clampCrop({ x: 1900, y: 0, w: 100, h: 100 }, 1920, 1080);
      expect(result.x + result.w).toBeLessThanOrEqual(1920);
    });

    it('does not let y escape past video height', () => {
      const result = clampCrop({ x: 0, y: 1000, w: 100, h: 100 }, 1920, 1080);
      expect(result.y + result.h).toBeLessThanOrEqual(1080);
    });

    it('handles dragging tl past opposite edge', () => {
      const result = clampCrop({ x: 1950, y: 500, w: -50, h: 200 }, 1920, 1080);
      expect(result.x).toBe(1920 - 16);
      expect(result.w).toBe(16);
      expect(result.y).toBeGreaterThanOrEqual(0);
      expect(result.y + result.h).toBeLessThanOrEqual(1080);
    });

    it('handles dragging tr past opposite edge', () => {
      const result = clampCrop({ x: 0, y: 0, w: 2000, h: 100 }, 1920, 1080);
      expect(result.w).toBe(1920);
    });

    it('preserves valid crop unchanged', () => {
      const result = clampCrop({ x: 100, y: 200, w: 640, h: 480 }, 1920, 1080);
      expect(result).toEqual({ x: 100, y: 200, w: 640, h: 480 });
    });

    it('full frame crop stays full frame', () => {
      const result = clampCrop({ x: 0, y: 0, w: 1920, h: 1080 }, 1920, 1080);
      expect(result).toEqual({ x: 0, y: 0, w: 1920, h: 1080 });
    });
  });

  describe('normalizeCrop', () => {
    it('makes odd width even', () => {
      const result = normalizeCrop({ x: 0, y: 0, w: 101, h: 100 }, 1920, 1080);
      expect(result.w % 2).toBe(0);
    });

    it('makes odd height even', () => {
      const result = normalizeCrop({ x: 0, y: 0, w: 100, h: 101 }, 1920, 1080);
      expect(result.h % 2).toBe(0);
    });

    it('does not exceed video width', () => {
      const result = normalizeCrop({ x: 0, y: 0, w: 2000, h: 100 }, 1920, 1080);
      expect(result.w).toBeLessThanOrEqual(1920);
    });

    it('does not exceed video height', () => {
      const result = normalizeCrop({ x: 0, y: 0, w: 100, h: 2000 }, 1920, 1080);
      expect(result.h).toBeLessThanOrEqual(1080);
    });

    it('minimum crop size is 16px', () => {
      const result = normalizeCrop({ x: 0, y: 0, w: 4, h: 4 }, 1920, 1080);
      expect(result.w).toBe(16);
      expect(result.h).toBe(16);
    });

    it('keeps even dimensions when already even', () => {
      const result = normalizeCrop({ x: 0, y: 0, w: 640, h: 480 }, 1920, 1080);
      expect(result.w).toBe(640);
      expect(result.h).toBe(480);
    });

    it('preserves x and y', () => {
      const result = normalizeCrop({ x: 100, y: 200, w: 640, h: 480 }, 1920, 1080);
      expect(result.x).toBe(100);
      expect(result.y).toBe(200);
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
