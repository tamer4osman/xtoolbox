import { createImageTool } from './create-image-tool.js';

export function createImageFilterTool({ optionsHTML, getFilter, filename, onReady, accept = 'image/*', maxSizeMB = 50 }) {
  return createImageTool({
    optionsHTML,
    drawEffect: (ctx, w, h, _scale, tctx, img) => {
      ctx.filter = getFilter(tctx);
      ctx.drawImage(img, 0, 0, w, h);
    },
    filename,
    accept,
    maxSizeMB,
    onReady,
  });
}
