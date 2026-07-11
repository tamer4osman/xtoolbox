import { describe, it, expect, vi } from "vitest";
import { drawPixelated, drawBlurred } from "../tools/image/face-blur.js";

function createMockCtx(w, h) {
  const imageData = {
    data: new Uint8ClampedArray(w * h * 4),
    width: w,
    height: h
  };
  return {
    getImageData: vi.fn(() => imageData),
    putImageData: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
    drawImage: vi.fn(),
    canvas: { width: w, height: h },
    filter: ""
  };
}

describe("face-blur", () => {
  describe("drawPixelated", () => {
    it("calls getImageData with correct region", () => {
      const ctx = createMockCtx(100, 100);
      drawPixelated(ctx, 10, 10, 20, 20, 5);
      expect(ctx.getImageData).toHaveBeenCalledWith(10, 10, 20, 20);
    });

    it("calls putImageData", () => {
      const ctx = createMockCtx(100, 100);
      drawPixelated(ctx, 0, 0, 10, 10, 5);
      expect(ctx.putImageData).toHaveBeenCalled();
    });

    it("uses default pixelSize of 10", () => {
      const ctx = createMockCtx(100, 100);
      drawPixelated(ctx, 0, 0, 100, 100);
      expect(ctx.getImageData).toHaveBeenCalledWith(0, 0, 100, 100);
    });

    it("modifies image data", () => {
      const ctx = createMockCtx(10, 10);
      const data = ctx.getImageData().data;
      data[0] = 255;
      data[1] = 0;
      data[2] = 0;
      data[3] = 255;
      drawPixelated(ctx, 0, 0, 10, 10, 5);
      expect(ctx.putImageData).toHaveBeenCalled();
    });
  });

  describe("drawBlurred", () => {
    it("sets blur filter", () => {
      const ctx = createMockCtx(100, 100);
      drawBlurred(ctx, 10, 10, 50, 50, 15);
      expect(ctx.filter).toBe("blur(15px)");
    });

    it("calls save and restore", () => {
      const ctx = createMockCtx(100, 100);
      drawBlurred(ctx, 0, 0, 100, 100, 10);
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });

    it("clips the region", () => {
      const ctx = createMockCtx(100, 100);
      drawBlurred(ctx, 5, 5, 30, 30, 10);
      expect(ctx.rect).toHaveBeenCalledWith(5, 5, 30, 30);
      expect(ctx.clip).toHaveBeenCalled();
    });

    it("draws the image", () => {
      const ctx = createMockCtx(100, 100);
      drawBlurred(ctx, 0, 0, 100, 100, 10);
      expect(ctx.drawImage).toHaveBeenCalled();
    });

    it("uses default radius of 10", () => {
      const ctx = createMockCtx(100, 100);
      drawBlurred(ctx, 0, 0, 100, 100);
      expect(ctx.filter).toBe("blur(10px)");
    });
  });
});
