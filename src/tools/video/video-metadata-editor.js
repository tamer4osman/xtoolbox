import { createVideoTool } from "./video-tool-factory.js";
import { loadFFmpeg, readFFmpegFile, writeUploadedFile } from "./video-utils.js";
import { downloadBlob } from "../../utils/file.js";
import { escapeHtml } from "../../utils/escape-html.js";

export const toolConfig = {
  id: "video-metadata-editor",
  name: "Video Metadata Editor",
  category: "video",
  description: "View and edit video metadata tags including title, author, and dates.",
  icon: "🎬",
  accept: "video/*",
  maxSizeMB: 500,
  keywords: ["metadata", "tags", "video", "edit", "info", "title", "author"],
  steps: [
    "Upload a video file",
    "View current metadata tags",
    "Edit or add metadata fields",
    "Save and download the updated video"
  ],
  faqs: [
    {
      question: "What metadata fields can I edit?",
      answer:
        "Title, Artist, Album, Year, Genre, Description, Copyright, and custom key-value pairs. MP4 supports standard fields; WebM/MKV support arbitrary tags."
    },
    {
      question: "Will editing metadata affect video quality?",
      answer:
        "No. Metadata is stored in the container header. The video and audio streams are copied without re-encoding, so quality is preserved."
    },
    {
      question: "Which formats are supported?",
      answer: "MP4, WebM, MOV, AVI, MKV, and other common video formats supported by ffmpeg."
    }
  ]
};

export const STANDARD_FIELDS = [
  { key: "title", label: "Title", placeholder: "Video title" },
  { key: "artist", label: "Artist", placeholder: "Author or creator" },
  { key: "album", label: "Album", placeholder: "Album or collection" },
  { key: "date", label: "Year", placeholder: "2024" },
  { key: "genre", label: "Genre", placeholder: "Category or genre" },
  { key: "comment", label: "Description", placeholder: "Video description" },
  { key: "copyright", label: "Copyright", placeholder: "Copyright notice" }
];

const FIELD_MAP = Object.fromEntries(STANDARD_FIELDS.map(f => [f.key, f]));

function buildFieldsHTML() {
  return STANDARD_FIELDS.map(
    f => `
    <div class="form-group">
      <label for="meta-${f.key}">${escapeHtml(f.label)}</label>
      <input type="text" id="meta-${f.key}" class="form-control" placeholder="${escapeHtml(f.placeholder)}" />
    </div>
  `
  ).join("");
}

function buildCustomPairsHTML() {
  return `
    <div id="custom-pairs"></div>
    <button class="btn btn-sm btn-secondary" id="add-pair-btn" style="margin-top:var(--space-2);">+ Add Custom Tag</button>
  `;
}

function parseMetadataOutput(logOutput) {
  const tags = {};
  for (const line of logOutput.split("\n")) {
    const m = line.match(/^\s+(\w[\w\s]*?)\s*:\s*(.+)/);
    if (!m) continue;
    const key = m[1].trim().toLowerCase().replace(/\s+/g, "_");
    const val = m[2].trim();
    if (val && val !== "N/A" && FIELD_MAP[key]) {
      tags[key] = val;
    }
  }
  return tags;
}

function addCustomPair(pairsContainer, ctx, key, val) {
  const id = ++ctx.pairCount;
  const row = document.createElement("div");
  row.style.cssText =
    "display:flex;gap:var(--space-2);margin-bottom:var(--space-2);align-items:center;";
  row.innerHTML = `
    <input type="text" id="custom-key-${id}" class="form-control" placeholder="Tag name" style="flex:1;" value="${escapeHtml(key || "")}" />
    <input type="text" id="custom-val-${id}" class="form-control" placeholder="Value" style="flex:2;" value="${escapeHtml(val || "")}" />
    <button class="btn btn-sm btn-danger" data-remove="${id}" title="Remove">✕</button>
  `;
  pairsContainer.appendChild(row);
  row.querySelector(`[data-remove="${id}"]`).addEventListener("click", () => row.remove());
}

export const render = createVideoTool({
  maxSizeMB: 500,
  processingText: "Saving metadata...",
  actionBtnLabel: "💾 Save Metadata & Download",
  optionsHTML: `
    <div id="metadata-display" style="margin-bottom:var(--space-4);"></div>
    <h3 style="font-size:1rem;margin-bottom:var(--space-3);">Edit Metadata</h3>
    ${buildFieldsHTML()}
    <h3 style="font-size:1rem;margin:var(--space-4) 0 var(--space-3);">Custom Tags</h3>
    ${buildCustomPairsHTML()}
  `,
  onRender(tctx) {
    const pairsContainer = tctx.query("#custom-pairs");
    const ctx = { pairCount: 0 };
    tctx.container._metaCtx = ctx;

    tctx.query("#add-pair-btn").addEventListener("click", () => {
      addCustomPair(pairsContainer, ctx);
    });
  },
  onFileLoaded(videoInfo, tctx, currentFile) {
    const display = tctx.query("#metadata-display");
    display.innerHTML = `
      <div class="file-info" style="padding:var(--space-3);background:var(--color-bg-secondary);border-radius:var(--radius-md);margin-bottom:var(--space-3);">
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:var(--space-2);">
          <span><strong>File:</strong> ${escapeHtml(videoInfo.name)}</span>
          <span><strong>Size:</strong> ${escapeHtml(videoInfo.sizeFormatted)}</span>
          <span><strong>Type:</strong> ${escapeHtml(videoInfo.type || "unknown")}</span>
        </div>
      </div>
    `;

    const pairsContainer = tctx.query("#custom-pairs");
    pairsContainer.innerHTML = "";
    const ctx = tctx.container._metaCtx;
    ctx.pairCount = 0;

    for (const field of STANDARD_FIELDS) {
      const input = tctx.query(`#meta-${field.key}`);
      if (input) input.value = "";
    }

    const probeMetadata = async () => {
      try {
        const ffmpeg = await loadFFmpeg();
        const ext = videoInfo.name.split(".").pop() || "mp4";
        const inputName = `meta-probe.${ext}`;
        await writeUploadedFile(ffmpeg, currentFile, inputName);

        let logOutput = "";
        const onLog = ({ message }) => {
          logOutput += message + "\n";
        };
        ffmpeg.on("log", onLog);
        try {
          await ffmpeg.exec(["-i", inputName], 5000);
        } catch {}
        ffmpeg.off("log", onLog);
        await ffmpeg.deleteFile(inputName);

        const tags = parseMetadataOutput(logOutput);
        for (const [key, val] of Object.entries(tags)) {
          const input = tctx.query(`#meta-${key}`);
          if (input) input.value = val;
        }

        if (Object.keys(tags).length > 0) {
          display.insertAdjacentHTML(
            "beforeend",
            `<p style="font-size:0.875rem;color:var(--color-text-secondary);margin-top:var(--space-2);">Existing metadata loaded — edit fields below.</p>`
          );
        }
      } catch {}
    };

    probeMetadata();
  },
  async onProcess(ffmpeg, inputName, videoInfo, tctx) {
    const ext = inputName.split(".").pop() || "mp4";
    const outputName = `output.${ext}`;

    const args = ["-i", inputName];

    for (const field of STANDARD_FIELDS) {
      const val = tctx.getValue(`meta-${field.key}`);
      if (val && val.trim()) {
        args.push("-metadata", `${field.key}=${val.trim()}`);
      }
    }

    const pairsContainer = tctx.query("#custom-pairs");
    const keyInputs = pairsContainer.querySelectorAll("input[id^='custom-key-']");
    for (const keyInput of keyInputs) {
      const id = keyInput.id.replace("custom-key-", "");
      const valInput = tctx.query(`#custom-val-${id}`);
      const key = keyInput.value.trim();
      const val = valInput?.value.trim();
      if (key && val) {
        args.push("-metadata", `${key}=${val}`);
      }
    }

    if (args.length <= 2) {
      throw new Error("Please fill in at least one metadata field to save.");
    }

    args.push("-c", "copy", outputName);

    await ffmpeg.exec(args);

    const blob = await readFFmpegFile(ffmpeg, outputName, `video/${ext}`);
    const baseName = videoInfo.name.replace(/\.[^.]+$/, "");
    downloadBlob(blob, `${baseName}-metadata.${ext}`);
    await ffmpeg.deleteFile(outputName);
  }
});

export function destroy() {}
