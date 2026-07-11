import { createImageTool } from "./create-image-tool.js";

export const toolConfig = {
  id: "image-meme",
  name: "Meme Generator",
  category: "image",
  description: "Create memes with top/bottom text, custom fonts, and templates.",
  icon: "😂",
  accept: "image/*",
  maxSizeMB: 50,
  keywords: ["meme", "funny", "text", "image", "generator"],
  steps: ["Upload an image", "Add top/bottom text", "Customize font and size", "Download meme"],
  faqs: [
    {
      question: "What font is used?",
      answer:
        "Classic memes use Impact with white fill and black outline. You can also choose Arial Black or Comic Sans."
    },
    {
      question: "Can I adjust text position?",
      answer:
        "Top text appears at the top, bottom text at the bottom. Font size scales automatically with image width."
    }
  ]
};

const FONTS = [
  { id: "Impact", label: "Impact (Classic)" },
  { id: "Arial Black", label: "Arial Black" },
  { id: "Comic Sans MS", label: "Comic Sans" },
  { id: "Georgia", label: "Georgia" },
  { id: "Courier New", label: "Courier New" }
];

function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";
  for (const word of words) {
    const testLine = currentLine ? currentLine + " " + word : word;
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function drawWrappedMemeText(ctx, text, y, canvasWidth, canvasHeight, fontSize, font, isTop) {
  if (!text) return;
  ctx.font = `900 ${fontSize}px ${font}, sans-serif`;
  const maxWidth = canvasWidth * 0.9;
  const lines = wrapText(ctx, text, maxWidth);
  const lineHeight = fontSize * 1.1;
  const totalHeight = lines.length * lineHeight;
  const startY = isTop ? y : y - totalHeight;
  const lineWidth = Math.max(2, fontSize / 10);
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;
  lines.forEach((line, i) => {
    ctx.strokeText(line, canvasWidth / 2, startY + i * lineHeight);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(line, canvasWidth / 2, startY + i * lineHeight);
  });
}

function getFontSize(canvasWidth, text) {
  if (!text) return 0;
  const baseSize = Math.round(canvasWidth / 10);
  const maxFontSize = Math.round(canvasWidth / 6);
  const minFontSize = 20;
  const charBasedSize = Math.round(canvasWidth / (text.length * 0.6));
  return Math.max(minFontSize, Math.min(maxFontSize, baseSize, charBasedSize));
}

export const render = createImageTool({
  optionsHTML: `
    <div class="form-group">
      <label>Top Text</label>
      <input type="text" id="meme-top-text" class="text-input" placeholder="Top text (optional)">
    </div>
    <div class="form-group">
      <label>Bottom Text</label>
      <input type="text" id="meme-bottom-text" class="text-input" placeholder="Bottom text (optional)">
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);">
      <div class="form-group">
        <label>Font</label>
        <select id="meme-font" class="select-input">
          ${FONTS.map(f => `<option value="${f.id}">${f.label}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label>Font Size</label>
        <select id="meme-font-size" class="select-input">
          <option value="auto">Auto</option>
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>
    </div>
    <div class="form-group">
      <label class="checkbox-label">
        <input type="checkbox" id="meme-all-caps" checked> ALL CAPS
      </label>
    </div>
  `,
  filename: tctx => {
    const top = tctx.getValue("meme-top-text");
    const bot = tctx.getValue("meme-bottom-text");
    const name = (top || bot || "meme")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 30);
    return `${name}.png`;
  },
  drawEffect(ctx, w, h, scale, tctx, img) {
    ctx.drawImage(img, 0, 0, w, h);
    let topText = tctx.getValue("meme-top-text");
    let bottomText = tctx.getValue("meme-bottom-text");
    const font = tctx.getValue("meme-font");
    const sizeMode = tctx.getValue("meme-font-size");
    const allCaps = tctx.query("#meme-all-caps").checked;
    if (allCaps) {
      topText = topText.toUpperCase();
      bottomText = bottomText.toUpperCase();
    }
    let topFontSize = getFontSize(w, topText);
    let bottomFontSize = getFontSize(w, bottomText);
    if (sizeMode === "small") {
      topFontSize *= 0.7;
      bottomFontSize *= 0.7;
    } else if (sizeMode === "large") {
      topFontSize *= 1.4;
      bottomFontSize *= 1.4;
    } else if (sizeMode === "medium") {
      topFontSize *= 1.0;
      bottomFontSize *= 1.0;
    }
    const padding = h * 0.05;
    if (topText) {
      drawWrappedMemeText(ctx, topText, padding, w, h, topFontSize, font, true);
    }
    if (bottomText) {
      drawWrappedMemeText(ctx, bottomText, h - padding, w, h, bottomFontSize, font, false);
    }
  },
  onReady({ container, updatePreview }) {
    container
      .querySelectorAll(
        "#meme-top-text, #meme-bottom-text, #meme-font, #meme-font-size, #meme-all-caps"
      )
      .forEach(el => {
        el.addEventListener("input", updatePreview);
        el.addEventListener("change", updatePreview);
      });
  }
});
