/**
 * Shared canvas blur kernels used by image blur tools.
 */

export function applyGaussianBlur(ctx, w, h, radius) {
  ctx.filter = `blur(${radius}px)`;
  ctx.drawImage(ctx.canvas, 0, 0);
  ctx.filter = "none";
}

export function applyBoxBlur(ctx, w, h, radius) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  const copy = new Uint8ClampedArray(data);
  const r = Math.max(1, Math.round(radius));
  const size = (2 * r + 1) * (2 * r + 1);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let rSum = 0,
        gSum = 0,
        bSum = 0;
      for (let ky = -r; ky <= r; ky++) {
        for (let kx = -r; kx <= r; kx++) {
          const px = Math.min(w - 1, Math.max(0, x + kx));
          const py = Math.min(h - 1, Math.max(0, y + ky));
          const idx = (py * w + px) * 4;
          rSum += copy[idx];
          gSum += copy[idx + 1];
          bSum += copy[idx + 2];
        }
      }
      const idx = (y * w + x) * 4;
      data[idx] = rSum / size;
      data[idx + 1] = gSum / size;
      data[idx + 2] = bSum / size;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}
