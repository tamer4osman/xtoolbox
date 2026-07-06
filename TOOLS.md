# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## Project: xtoolbox

A client-side web app with 344 online tools (312 built, 32 planned). All processing happens in the browser.

### Build Commands
- `npm run dev` - Dev server at localhost:3000
- `npm run build` - Production build to dist/
- `npm run test:unit` - Unit tests (Vitest)
- `npm run test` - Playwright E2E tests

### Quick Reference: Tool Building

**Before you start:**
1. Check if a factory exists (image-tool-factory, video-tool-factory, codec-factory, etc.)
2. Check similar tools for patterns to follow
3. Plan your tests before writing code

**After you finish:**
1. Run `npm run test:unit` — must pass
2. Test in browser at `http://localhost:3000/#/tools/<tool-id>`
3. Update BOTH `tools.json` AND `toolsList.json`
4. Update README.md, PROJECT-PLAN.md, tool-building-progress.md
5. Wait for user approval before committing

---

## Codebase Patterns

### Pattern 1: File Upload → Process → Download

Most tools follow this flow:

```js
export function render(container) {
  // 1. Create upload area
  const uploadArea = createFileUpload({
    accept: '.pdf',
    maxSizeMB: 100,
    onFilesSelected: async (files) => {
      const file = files[0];
      // 2. Process the file
      const result = await processFile(file);
      // 3. Show result and download button
      showResult(result);
    }
  });
  container.appendChild(uploadArea);
}
```

### Pattern 2: Canvas Image Processing

```js
// Load image onto canvas
const img = new Image();
img.onload = () => {
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);
  
  // Apply effects
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // Process pixels
  for (let i = 0; i < data.length; i += 4) {
    data[i] = data[i] * 1.2;     // R
    data[i + 1] = data[i + 1] * 1.1; // G
    data[i + 2] = data[i + 2] * 0.9; // B
  }
  
  ctx.putImageData(imageData, 0, 0);
};
img.src = URL.createObjectURL(file);
```

### Pattern 3: WASM Library Loading

```js
// Lazy-load WASM libraries
const pdfLib = await import('pdf-lib');
const { PDFDocument } = pdfLib;

// Use in tool
async function processPdf(file) {
  const pdfBytes = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(pdfBytes);
  // ... manipulate
  const modifiedBytes = await pdfDoc.save();
  return new Blob([modifiedBytes], { type: 'application/pdf' });
}
```

### Pattern 4: Tool with Options/Sliders

```js
export function render(container) {
  const state = { quality: 80, format: 'jpeg' };
  
  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="my-tool-upload"></div>
      <div class="tool-options" id="my-tool-options" style="display:none;">
        <label>Quality: <span id="my-tool-quality-val">80</span>%</label>
        <input type="range" id="my-tool-quality" min="10" max="100" value="80">
        <label>Format:</label>
        <select id="my-tool-format">
          <option value="jpeg">JPEG</option>
          <option value="png">PNG</option>
        </select>
        <button class="btn btn-primary" id="my-tool-download">Download</button>
      </div>
    </div>
  `;
  
  // Wire up options
  const qualitySlider = document.getElementById('my-tool-quality');
  qualitySlider.addEventListener('input', (e) => {
    state.quality = parseInt(e.target.value);
    document.getElementById('my-tool-quality-val').textContent = state.quality;
    renderPreview();
  });
}
```

---

## Well-Written Tools (Examples)

| Tool | Why It's Good | Lines |
|------|---------------|-------|
| `chmod-calculator.js` | Pure functions, full test coverage, clean API | ~200 |
| `gitignore-generator.js` | Good UX, presets, localStorage, clean structure | ~300 |
| `world-clock.js` | Clean state management, DST-aware, exported helpers | ~250 |
| `markdown-table-generator.js` | Spreadsheet-like UI, import/export, clean parsing | ~300 |

---

## Frequent Mistakes

1. **Forgetting to update both registries**
   - Always update `src/data/tools.json` AND `toolsList.json`
   
2. **Missing category count updates**
   - After adding a tool, check `src/data/categories.json` counts
   
3. **Committing before user testing**
   - Always wait for user approval first
   
4. **Not using existing factories**
   - Check for factories before writing new tool scaffolds
   
5. **Inline CSS instead of using tokens**
   - Use `var(--color-primary)`, `var(--space-4)`, etc. from `tokens.css`
   
6. **Missing error handling**
   - Always wrap user-facing operations in try/catch
   
7. **Not exporting pure functions**
   - Export helper functions for testing
   
8. **Hardcoding values**
   - Extract magic numbers to constants

---

## External APIs Used

- CoinGecko (crypto prices)
- wttr.in / Open-Meteo (weather)
- Free Dictionary API
- Open Library
- CoinGecko markets API
- Open Food Facts (food/product data)
- Nager.Date (public holidays)
- ExchangeRate-API (currency rates)
- Microlink (URL metadata/screenshot)
- USGS Earthquake (seismic data)
- Cloudflare DoH (DNS-over-HTTPS)
- RDAP.org (domain registration)
- Google DNS-over-HTTPS (DNS resolution)

---

Add whatever helps you do your job. This is your cheat sheet.
