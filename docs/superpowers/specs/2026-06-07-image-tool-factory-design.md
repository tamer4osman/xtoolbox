# Image Tool Factory

**Date:** 2026-06-07
**Status:** Design — pending user approval
**Related commits:** `a65a064` (lookup factory), `4699865` (scanner factory)

## Problem

Fallow's dupe detector finds three clone groups among 4-5 image tools:

1. **101 lines × 3 instances** — add-border-image, blur-background, round-image-cropper
2. **94 lines × 4 instances** — same three + image-sharpening
3. **93 lines × 2 instances** — collage-maker, round-image-cropper

The shared pattern is the **image-tool scaffold**: file-upload dropzone, options area, preview canvas, download button with processing spinner, and the per-slider event wiring. Each tool currently re-implements this scaffold from scratch.

The codebase already has a smaller abstraction (`pixel-tool-utils.js`) used by `image-sharpening.js`, but the four older tools (add-border, blur-background, round-image-cropper, collage-maker) predate it and use a slightly different pattern (full `container.innerHTML` block, separate `processing` spinner element, per-tool download handlers).

## Goal

Extract the image-tool scaffold into a factory so that adding a new image transform tool requires only:

- A unique `optionsHTML` string
- A unique `optionsCSS` string
- A `renderPreview()` function (tool-specific drawing)
- A `processForDownload()` function (full-size processing)
- Filename/format/quality resolvers (static or DOM-based)

## Non-Goals

- **Not** changing the image-sharpening / pixel-tool-utils.js pattern. The two patterns (Pattern A = full scaffold, Pattern B = smaller helpers) will coexist; this design only addresses Pattern A.
- **Not** touching per-tool processing logic. The factory owns the chrome; tools own the math.
- **Not** refactoring collage-maker's multi-image logic into a separate factory. The single factory handles both single-image and multi-image cases via a `multiple` flag.

## Design

### New file: `src/tools/image/image-tool-factory.js`

Exports `createImageTool({ ... })` that returns an object with DOM refs and a helper for slider wiring.

### Factory input shape

```js
createImageTool({
  container, // HTMLElement — tool's render container
  toolId, // string — for ID prefixing
  accept, // 'image/*' default
  multiple, // false = single image, true = images[] (collage)
  maxSizeMB, // default 50

  // Tool provides the unique parts:
  optionsHTML, // string of form controls (inserted into options-area)
  optionsCSS, // string of scoped CSS (.${toolId} prefix)
  renderPreview, // ({ state, container }) => void
  processForDownload, // ({ state, canvas }) => void

  // Optional hooks for per-tool sidebar behavior:
  onImageLoaded, // ({ state, container }) => void
  getFilename, // () => string
  getFormat, // () => 'image/png' | 'image/jpeg' | 'image/webp'
  getQuality // () => number (0-1)

  // State object passed to all callbacks:
  //   - { originalImage } when multiple=false
  //   - { images: [] }     when multiple=true
});
```

### Factory output shape

```js
{
  state,                    // the state object (mutated as images load)
  elements: {
    uploadArea,             // HTMLElement
    optionsArea,            // HTMLElement
    countInfo,              // HTMLElement
    previewArea,            // HTMLElement
    previewCanvas,          // HTMLCanvasElement
    processing,             // HTMLElement
    downloadBtn,            // HTMLElement
  },
  bindOptionChange({        // helper for the (range -> val -> renderPreview) pattern
    rangeId,                // string — id of the <input type="range">
    valueId,                // string — id of the value display element
    formatValue,            // (raw) => string — optional formatter
    onChange,               // optional (raw) => void — extra logic
  })
}
```

### State management

- `multiple=false`: factory sets `state.originalImage` to the loaded `HTMLImageElement`. `countInfo` shows `WxHpx`.
- `multiple=true`: factory sets `state.images` to an array of `HTMLImageElement`. `countInfo` shows `N photos loaded`.

### Download flow

1. Show `processing` spinner (set `style.display = 'block'`, disable button).
2. Create a fresh canvas at the tool's natural dimensions (or collage width for collage).
3. Call `processForDownload({ state, canvas })`.
4. `canvasToBlob(canvas, getFormat(), getQuality())` → blob.
5. `downloadBlob(blob, getFilename())`.
6. Show success toast (configurable message per tool).
7. Hide `processing` spinner, re-enable button.

Errors are caught, shown as error toast, spinner hidden in `finally`.

### HTML scaffold (factory-generated)

```html
<div class="tool-layout">
  <div class="tool-upload-area" id="${toolId}-upload-area"></div>
  <div class="tool-options" id="${toolId}-options" style="display:none;">
    <div class="tool-count-info" id="${toolId}-count-info">-</div>
    <!-- optionsHTML inserted here -->
    <button class="btn btn-primary btn-lg" id="${toolId}-download-btn">Download</button>
  </div>
  <div class="tool-preview" id="${toolId}-preview" style="display:none;">
    <h3>Preview</h3>
    <canvas id="${toolId}-preview-canvas" class="tool-preview-canvas"></canvas>
  </div>
  <div class="tool-processing" id="${toolId}-processing" style="display:none;">
    <div class="spinner"></div>
    <p>Processing...</p>
  </div>
</div>
```

Processing message is configurable per tool.

## Testing strategy

- **Unit tests for the factory** (no DOM integration): use jsdom; verify file upload wires up, options show on image load, download button triggers `processForDownload` + download flow.
- **Tests for each refactored tool**: existing tool tests stay; if none, add one smoke test verifying `render(container)` doesn't throw and the upload area is created.
- **TDD pattern**: red test for factory function (mock `downloadBlob`, `canvasToBlob`, `showToast`), then green implementation.

## Refactor order (one commit per tool)

1. Create `image-tool-factory.js` with TDD tests (separate commit `chore(refactor): add image tool factory`).
2. Refactor `add-border-image.js` (highest dupe weight, 335 → ~250 lines).
3. Refactor `blur-background.js` (307 → ~220 lines).
4. Refactor `round-image-cropper.js` (296 → ~210 lines).
5. Refactor `collage-maker.js` (338 → ~250 lines; uses `multiple: true`).
6. Final fallow dupes check + commit summary.

Estimated total: ~150-200 lines removed from tools; ~150 lines added to factory. Net: roughly even, with a major maintainability win (new image tools become ~50-line stubs).

## Out of scope (deferred)

- Migrating `image-sharpening.js` to use the new factory (it uses a different `pixel-tool-utils.js` pattern; would be a separate effort if we ever want to consolidate).
- Migrating any non-image tool (no fallow dupes found).
- Touching `image-utils.js` (low-level helpers, no dupe).

## Acceptance criteria

1. `npx vitest run` → 664+ tests pass.
2. Browser smoke: each refactored tool loads at `#/tools/<id>` with 0 console errors.
3. Fallow dupes: 101-line / 3-instance clone group eliminated (or dramatically reduced).
4. No regression in tool behavior (border, blur, circle crop, collage all still work).
5. Commit history: one factory commit, one commit per refactored tool, one summary.
