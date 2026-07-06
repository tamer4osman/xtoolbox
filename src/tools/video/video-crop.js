import { createVideoTool } from "./video-tool-factory.js";
import { downloadVideoOutput } from "./video-utils.js";

function createCropSelector({ canvas, videoWidth, videoHeight, onChange }) {
  const ctx = canvas.getContext("2d");
  const scale = Math.min(640 / videoWidth, 400 / videoHeight, 1);
  const displayW = Math.round(videoWidth * scale);
  const displayH = Math.round(videoHeight * scale);

  canvas.width = displayW;
  canvas.height = displayH;
  canvas.style.maxWidth = "100%";
  canvas.style.borderRadius = "var(--radius-md)";

  let crop = { x: 0, y: 0, w: videoWidth, h: videoHeight };
  let dragHandle = null;
  let dragStart = { mx: 0, my: 0, orig: null };

  function toDisplay(px) {
    return px * scale;
  }

  function clampCrop(c) {
    c.w = Math.max(16, c.w);
    c.h = Math.max(16, c.h);
    c.x = Math.max(0, Math.min(c.x, videoWidth - c.w));
    c.y = Math.max(0, Math.min(c.y, videoHeight - c.h));
    c.w = Math.min(c.w, videoWidth - c.x);
    c.h = Math.min(c.h, videoHeight - c.y);
    return c;
  }

  function getHandle(mx, my) {
    const dx = mx - canvas.getBoundingClientRect().left;
    const dy = my - canvas.getBoundingClientRect().top;

    const corners = [
      { name: "tl", hx: toDisplay(crop.x), hy: toDisplay(crop.y) },
      { name: "tr", hx: toDisplay(crop.x) + toDisplay(crop.w), hy: toDisplay(crop.y) },
      { name: "bl", hx: toDisplay(crop.x), hy: toDisplay(crop.y) + toDisplay(crop.h) },
      {
        name: "br",
        hx: toDisplay(crop.x) + toDisplay(crop.w),
        hy: toDisplay(crop.y) + toDisplay(crop.h),
      },
    ];

    for (const h of corners) {
      if (Math.abs(dx - h.hx) < 10 && Math.abs(dy - h.hy) < 10)
        return { type: "corner", name: h.name };
    }

    if (
      dx >= toDisplay(crop.x) &&
      dx <= toDisplay(crop.x) + toDisplay(crop.w) &&
      dy >= toDisplay(crop.y) &&
      dy <= toDisplay(crop.y) + toDisplay(crop.h)
    ) {
      return { type: "move" };
    }
    return null;
  }

  function draw() {
    ctx.clearRect(0, 0, displayW, displayH);

    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, displayW, displayH);

    ctx.clearRect(toDisplay(crop.x), toDisplay(crop.y), toDisplay(crop.w), toDisplay(crop.h));

    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.strokeRect(toDisplay(crop.x), toDisplay(crop.y), toDisplay(crop.w), toDisplay(crop.h));

    const thirdW = toDisplay(crop.w) / 3;
    const thirdH = toDisplay(crop.h) / 3;
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    for (let i = 1; i < 3; i++) {
      const ox = toDisplay(crop.x) + thirdW * i;
      const oy = toDisplay(crop.y) + thirdH * i;
      ctx.beginPath();
      ctx.moveTo(ox, toDisplay(crop.y));
      ctx.lineTo(ox, toDisplay(crop.y) + toDisplay(crop.h));
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(toDisplay(crop.x), oy);
      ctx.lineTo(toDisplay(crop.x) + toDisplay(crop.w), oy);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    const handles = [
      [toDisplay(crop.x), toDisplay(crop.y)],
      [toDisplay(crop.x) + toDisplay(crop.w), toDisplay(crop.y)],
      [toDisplay(crop.x), toDisplay(crop.y) + toDisplay(crop.h)],
      [toDisplay(crop.x) + toDisplay(crop.w), toDisplay(crop.y) + toDisplay(crop.h)],
    ];
    for (const [hx, hy] of handles) {
      ctx.fillStyle = "#fff";
      ctx.fillRect(hx - 5, hy - 5, 10, 10);
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;
      ctx.strokeRect(hx - 5, hy - 5, 10, 10);
    }

    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "12px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(
      `${crop.w}×${crop.h}`,
      toDisplay(crop.x) + toDisplay(crop.w) / 2,
      toDisplay(crop.y) + toDisplay(crop.h) / 2 + 4,
    );
  }

  canvas.addEventListener("mousedown", (e) => {
    const handle = getHandle(e.clientX, e.clientY);
    if (handle) {
      dragHandle = handle;
      dragStart = { mx: e.clientX, my: e.clientY, orig: { ...crop } };
      canvas.style.cursor = handle.type === "move" ? "move" : "nwse-resize";
    }
  });

  function handleMouseMove(e) {
    if (!dragHandle) {
      const h = getHandle(e.clientX, e.clientY);
      canvas.style.cursor = h ? (h.type === "move" ? "move" : "nwse-resize") : "default";
      return;
    }

    const dx = (e.clientX - dragStart.mx) / scale;
    const dy = (e.clientY - dragStart.my) / scale;
    const o = dragStart.orig;

    if (dragHandle.type === "move") {
      crop.x = clampCrop({ ...crop, x: o.x + dx, y: o.y + dy }).x;
      crop.y = clampCrop({ ...crop, x: o.x + dx, y: o.y + dy }).y;
    } else {
      const n = { name: dragHandle.name, dx, dy };
      if (n.name === "br") {
        crop.w = Math.max(16, o.w + n.dx);
        crop.h = Math.max(16, o.h + n.dy);
      } else if (n.name === "tl") {
        crop.x = o.x + n.dx;
        crop.y = o.y + n.dy;
        crop.w = o.w - n.dx;
        crop.h = o.h - n.dy;
      } else if (n.name === "tr") {
        crop.y = o.y + n.dy;
        crop.w = o.w + n.dx;
        crop.h = o.h - n.dy;
      } else if (n.name === "bl") {
        crop.x = o.x + n.dx;
        crop.w = o.w - n.dx;
        crop.h = o.h + n.dy;
      }
      clampCrop(crop);
    }

    onChange(crop);
    draw();
  }

  function handleMouseUp() {
    dragHandle = null;
    canvas.style.cursor = "default";
  }

  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("mouseup", handleMouseUp);

  draw();

  return {
    getCrop: () => ({ ...crop }),
    setCrop: (c) => {
      crop = clampCrop({ ...c });
      onChange(crop);
      draw();
    },
    setAspect: (ratio) => {
      if (ratio === "free") {
        crop = { x: 0, y: 0, w: videoWidth, h: videoHeight };
      } else {
        const [rw, rh] = ratio.split(":").map(Number);
        let w = videoWidth;
        let h = Math.round((w * rh) / rw);
        if (h > videoHeight) {
          h = videoHeight;
          w = Math.round((h * rw) / rh);
        }
        crop = { x: Math.round((videoWidth - w) / 2), y: Math.round((videoHeight - h) / 2), w, h };
      }
      clampCrop(crop);
      onChange(crop);
      draw();
    },
    dispose: () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    },
  };
}

export const toolConfig = {
  id: "video-crop",
  name: "Video Cropper",
  category: "video",
  description: "Crop video frames to remove unwanted areas by selecting a visual region.",
  icon: "✂️",
  accept: "video/*",
  maxSizeMB: 500,
  keywords: ["crop video", "video crop", "trim area", "remove borders"],
  steps: [
    "Upload a video",
    "Adjust the crop rectangle or enter values",
    'Click "Crop Video"',
    "Download cropped video",
  ],
  faqs: [
    {
      question: "What crop filter is used?",
      answer:
        "We use FFmpeg's crop filter which re-encodes the video. Use even pixel dimensions for best compatibility.",
    },
    {
      question: "Can I crop to a specific aspect ratio?",
      answer: "Yes! Use the preset buttons (16:9, 4:3, 1:1) or drag the handles freely.",
    },
  ],
};

export const render = createVideoTool({
  optionsHTML: `
    <div class="form-group"><label>Aspect Ratio</label>
      <div id="aspect-presets" style="display:flex;gap:var(--space-2);flex-wrap:wrap;">
        <button class="btn btn-sm aspect-btn active" data-ratio="free">Free</button>
        <button class="btn btn-sm aspect-btn" data-ratio="16:9">16:9</button>
        <button class="btn btn-sm aspect-btn" data-ratio="4:3">4:3</button>
        <button class="btn btn-sm aspect-btn" data-ratio="1:1">1:1</button>
        <button class="btn btn-sm aspect-btn" data-ratio="9:16">9:16</button>
      </div>
    </div>
    <div style="margin:var(--space-4) 0;text-align:center;">
      <canvas id="crop-canvas" style="border-radius:var(--radius-md);cursor:crosshair;"></canvas>
    </div>
    <div id="video-dims" style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-3);text-align:center;">Video: - × -</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-3);">
      <div class="form-group"><label>X (px)</label><input type="number" id="crop-x" class="text-input" min="0" value="0"></div>
      <div class="form-group"><label>Y (px)</label><input type="number" id="crop-y" class="text-input" min="0" value="0"></div>
      <div class="form-group"><label>Width (px)</label><input type="number" id="crop-w" class="text-input" min="16" value="100"></div>
      <div class="form-group"><label>Height (px)</label><input type="number" id="crop-h" class="text-input" min="16" value="100"></div>
    </div>
  `,
  processingText: "Cropping video...",
  actionBtnLabel: "Crop Video",
  onFileLoaded(videoInfo, tctx) {
    tctx.query("#video-dims").textContent = `Video: ${videoInfo.width} × ${videoInfo.height} px`;

    tctx.query("#crop-x").max = videoInfo.width;
    tctx.query("#crop-y").max = videoInfo.height;
    tctx.query("#crop-w").value = videoInfo.width;
    tctx.query("#crop-w").max = videoInfo.width;
    tctx.query("#crop-h").value = videoInfo.height;
    tctx.query("#crop-h").max = videoInfo.height;

    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    let selector = null;
    const canvas = tctx.query("#crop-canvas");

    video.onloadeddata = () => {
      video.currentTime = Math.min(0.1, video.duration * 0.1);
    };

    video.onseeked = () => {
      const vctx = canvas.getContext("2d");
      const scale = Math.min(640 / videoInfo.width, 400 / videoInfo.height, 1);
      canvas.width = Math.round(videoInfo.width * scale);
      canvas.height = Math.round(videoInfo.height * scale);
      vctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(video.src);

      selector = createCropSelector({
        canvas,
        videoWidth: videoInfo.width,
        videoHeight: videoInfo.height,
        onChange(c) {
          tctx.query("#crop-x").value = c.x;
          tctx.query("#crop-y").value = c.y;
          tctx.query("#crop-w").value = c.w;
          tctx.query("#crop-h").value = c.h;
        },
      });

      if (tctx.container._selector) tctx.container._selector.dispose();
      tctx.container._selector = selector;
    };

    video.src = URL.createObjectURL(tctx.container._currentFile);

    const syncFromInputs = () => {
      if (!selector) return;
      const x = parseInt(tctx.getValue("crop-x")) || 0;
      const y = parseInt(tctx.getValue("crop-y")) || 0;
      const w = parseInt(tctx.getValue("crop-w")) || 32;
      const h = parseInt(tctx.getValue("crop-h")) || 32;
      selector.setCrop({ x, y, w, h });
    };

    ["crop-x", "crop-y", "crop-w", "crop-h"].forEach((id) => {
      tctx.query(`#${id}`).addEventListener("input", syncFromInputs);
    });

    tctx.query("#aspect-presets").addEventListener("click", (e) => {
      const btn = e.target.closest(".aspect-btn");
      if (!btn || !selector) return;
      tctx
        .query("#aspect-presets")
        .querySelectorAll(".aspect-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selector.setAspect(btn.dataset.ratio);
    });
  },
  async onProcess(ffmpeg, inputName, videoInfo, tctx) {
    const selector = tctx.container._selector;
    const crop = selector
      ? selector.getCrop()
      : { x: 0, y: 0, w: videoInfo.width, h: videoInfo.height };

    const cw = crop.w % 2 === 0 ? crop.w : crop.w - 1;
    const ch = crop.h % 2 === 0 ? crop.h : crop.h - 1;

    const ext = inputName.split(".").pop();
    const outputName = `cropped.${ext}`;

    await ffmpeg.exec([
      "-i",
      inputName,
      "-vf",
      `crop=${cw}:${ch}:${crop.x}:${crop.y}`,
      "-c:a",
      "copy",
      outputName,
    ]);

    await downloadVideoOutput(ffmpeg, outputName, `cropped.${ext}`, ext);
  },
});

export function destroy(container) {
  container?._selector?.dispose?.();
}
