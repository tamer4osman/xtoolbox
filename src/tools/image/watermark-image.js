import { createImageTool } from "./create-image-tool.js";

export const toolConfig = {
  id: "watermark-image",
  name: "Add Watermark to Image",
  category: "image",
  description: "Add text or logo watermark to images. Adjustable position and opacity.",
  icon: "💧",
  accept: "image/*",
  maxSizeMB: 50,
  keywords: ["watermark image", "image watermark", "photo watermark"],
  steps: [
    "Upload an image",
    "Enter watermark text",
    "Choose position, size, and opacity",
    "Download"
  ],
  faqs: [
    {
      question: "Can I use a logo as watermark?",
      answer: "Currently text watermarks are supported. Logo support coming soon."
    }
  ]
};

function drawWatermark(ctx, w, h, scale, tctx) {
  const text = tctx.getValue("wm-text") || "WATERMARK";
  const sizeMap = { small: 16, medium: 32, large: 64, xlarge: 128 };
  const size = (sizeMap[tctx.getValue("wm-size")] || 32) * scale;
  const opacity = parseFloat(tctx.getValue("wm-opacity"));
  const position = tctx.getValue("wm-position");
  const color = tctx.getValue("wm-color");

  ctx.globalAlpha = opacity;
  ctx.font = `bold ${size}px Arial`;
  ctx.fillStyle = color;
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 1;

  if (position === "tiled") {
    const xGap = ctx.measureText(text).width * 2;
    const yGap = size * 3;
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(-Math.PI / 6);
    for (let y = -h; y < h * 2; y += yGap) {
      for (let x = -w; x < w * 2; x += xGap) {
        ctx.fillText(text, x, y);
      }
    }
    ctx.restore();
  } else {
    const tw = ctx.measureText(text).width;
    let x, y;
    if (position === "center") {
      x = (w - tw) / 2;
      y = h / 2;
    } else if (position === "bottom-right") {
      x = w - tw - 20 * scale;
      y = h - 20 * scale;
    } else if (position === "bottom-left") {
      x = 20 * scale;
      y = h - 20 * scale;
    } else {
      x = w - tw - 20 * scale;
      y = 40 * scale;
    }
    ctx.fillText(text, x, y);
  }
  ctx.globalAlpha = 1;
}

const render = createImageTool({
  optionsHTML: `
    <div class="form-group"><label>Watermark Text</label><input type="text" id="wm-text" class="text-input" value="© Your Name" placeholder="Enter watermark text"></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);">
      <div class="form-group"><label>Font Size</label>
        <select id="wm-size" class="select-input">
          <option value="small">Small</option>
          <option value="medium" selected>Medium</option>
          <option value="large">Large</option>
          <option value="xlarge">Extra Large</option>
        </select>
      </div>
      <div class="form-group"><label>Opacity</label>
        <select id="wm-opacity" class="select-input">
          <option value="0.2">Faint (20%)</option>
          <option value="0.4" selected>Light (40%)</option>
          <option value="0.6">Medium (60%)</option>
          <option value="0.8">Strong (80%)</option>
        </select>
      </div>
    </div>
    <div class="form-group"><label>Position</label>
      <select id="wm-position" class="select-input">
        <option value="center">Center</option>
        <option value="bottom-right" selected>Bottom Right</option>
        <option value="bottom-left">Bottom Left</option>
        <option value="top-right">Top Right</option>
        <option value="tiled">Tiled (repeating)</option>
      </select>
    </div>
    <div class="form-group"><label>Text Color</label><input type="color" id="wm-color" value="#ffffff" style="width:60px;height:36px;border:1px solid var(--color-border);border-radius:var(--radius-md);cursor:pointer;"></div>
  `,
  filename: () => "watermarked.png",
  drawEffect(ctx, w, h, scale, tctx, img) {
    ctx.drawImage(img, 0, 0, w, h);
    drawWatermark(ctx, w, h, scale, tctx);
  },
  onReady({ container, tctx, updatePreview }) {
    ["wm-text", "wm-size", "wm-opacity", "wm-position", "wm-color"].forEach(id => {
      const el = container.querySelector(`#${id}`);
      el.addEventListener("input", updatePreview);
      el.addEventListener("change", updatePreview);
    });
  }
});

export { render };
export function destroy() {}
