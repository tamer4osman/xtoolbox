import { describe, it, expect, vi } from 'vitest';

vi.stubGlobal('document', {
  createElement: (tag) => {
    if (tag === 'canvas') {
      return {
        width: 0,
        height: 0,
        getContext: () => ({
          fillStyle: '',
          fillRect: vi.fn(),
          drawImage: vi.fn(),
          createLinearGradient: vi.fn(() => ({
            addColorStop: vi.fn()
          })),
          globalCompositeOperation: '',
          getImageData: () => ({ data: new Uint8ClampedArray(0) })
        })
      };
    }
    return {};
  }
});

describe('panorama-stitcher', () => {
  it('has correct tool config', async () => {
    const { toolConfig } = await import('../tools/image/panorama-stitcher.js');
    expect(toolConfig.id).toBe('panorama-stitcher');
    expect(toolConfig.name).toBe('Panorama Stitcher');
    expect(toolConfig.category).toBe('image');
    expect(toolConfig.accept).toBe('image/*');
  });

  it('exports render function', async () => {
    const { render } = await import('../tools/image/panorama-stitcher.js');
    expect(typeof render).toBe('function');
  });

  it('exports detectOverlap function', async () => {
    const { detectOverlap } = await import('../tools/image/panorama-stitcher.js');
    expect(typeof detectOverlap).toBe('function');
  });

  it('exports stitchPanorama function', async () => {
    const { stitchPanorama } = await import('../tools/image/panorama-stitcher.js');
    expect(typeof stitchPanorama).toBe('function');
  });

  it('stitchPanorama returns canvas with correct dimensions', async () => {
    const { stitchPanorama } = await import('../tools/image/panorama-stitcher.js');
    const mockImg = (w, h) => ({
      naturalWidth: w,
      naturalHeight: h
    });
    const img1 = mockImg(400, 300);
    const img2 = mockImg(400, 300);
    const result = stitchPanorama([img1, img2], [100]);
    expect(result).toBeDefined();
    expect(result.width).toBe(700);
    expect(result.height).toBe(300);
  });

  it('stitchPanorama handles no overlap', async () => {
    const { stitchPanorama } = await import('../tools/image/panorama-stitcher.js');
    const mockImg = (w, h) => ({
      naturalWidth: w,
      naturalHeight: h
    });
    const img1 = mockImg(400, 300);
    const img2 = mockImg(400, 300);
    const result = stitchPanorama([img1, img2], [0]);
    expect(result.width).toBe(800);
    expect(result.height).toBe(300);
  });

  it('stitchPanorama handles multiple images', async () => {
    const { stitchPanorama } = await import('../tools/image/panorama-stitcher.js');
    const mockImg = (w, h) => ({
      naturalWidth: w,
      naturalHeight: h
    });
    const imgs = [mockImg(400, 300), mockImg(400, 300), mockImg(400, 300)];
    const result = stitchPanorama(imgs, [100, 100]);
    expect(result.width).toBe(1000);
    expect(result.height).toBe(300);
  });

  it('stitchPanorama uses max height', async () => {
    const { stitchPanorama } = await import('../tools/image/panorama-stitcher.js');
    const mockImg = (w, h) => ({
      naturalWidth: w,
      naturalHeight: h
    });
    const img1 = mockImg(400, 200);
    const img2 = mockImg(400, 400);
    const result = stitchPanorama([img1, img2], [100]);
    expect(result.height).toBe(400);
  });
});
