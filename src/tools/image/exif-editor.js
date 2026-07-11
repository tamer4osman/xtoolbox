import { createFileUpload } from "../../components/file-upload.js";
import { showToast } from "../../components/toast.js";
import { downloadBlob } from "../../utils/file.js";

let piexif = null;

async function loadPiexif() {
  if (piexif) return piexif;
  const module = await import("https://cdn.jsdelivr.net/npm/piexifjs@1.0.6/piexif.js");
  piexif = module.default || module.piexif || window.piexif;
  return piexif;
}

const FIELDS = {
  "0th": {
    271: "Make",
    272: "Model",
    274: "Orientation",
    282: "XResolution",
    283: "YResolution",
    296: "ResolutionUnit",
    305: "Software",
    306: "DateTime",
    33432: "Copyright"
  },
  Exif: {
    33434: "ExposureTime",
    33437: "FNumber",
    36867: "DateTimeOriginal",
    36868: "DateTimeDigitized",
    37377: "ShutterSpeedValue",
    37378: "ApertureValue",
    37380: "ExposureBiasValue",
    37381: "MaxApertureValue",
    37383: "MeteringMode",
    37385: "Flash",
    37386: "FocalLength",
    41486: "FocalPlaneXResolution",
    41488: "FocalPlaneResolutionUnit",
    42016: "ImageUniqueID",
    42036: "LensModel",
    42037: "LensSerialNumber"
  },
  GPS: {
    1: "GPSVersionID",
    2: "GPSLatitudeRef",
    3: "GPSLatitude",
    4: "GPSLongitudeRef",
    5: "GPSLongitude",
    6: "GPSAltitudeRef",
    7: "GPSAltitude",
    29: "GPSDateStamp"
  }
};

const FIELD_NAMES = {};
Object.entries(FIELDS).forEach(([ifd, fields]) => {
  Object.entries(fields).forEach(([tag, name]) => {
    FIELD_NAMES[`${ifd}.${tag}`] = { ifd, tag: Number(tag), name };
  });
});

export const toolConfig = {
  id: "exif-editor",
  name: "EXIF Data Editor",
  category: "image",
  description: "View and edit EXIF metadata in JPEG images: camera, date, GPS, and more.",
  icon: "🏷️",
  accept: "image/jpeg",
  maxSizeMB: 50,
  keywords: ["exif editor", "edit exif", "metadata editor", "change camera info", "modify exif"],
  steps: ["Upload a JPEG image", "Edit metadata fields", "Download modified image"],
  faqs: [
    {
      question: "What EXIF fields can I edit?",
      answer:
        "Camera make/model, date/time, GPS coordinates, exposure settings, lens info, copyright, and more."
    },
    {
      question: "What image formats are supported?",
      answer:
        "JPEG only. PNG, HEIF, and WebP use different metadata formats not supported by this tool."
    }
  ]
};

function formatValue(ifd, tag, value) {
  if (value === undefined || value === null) return "";
  if (ifd === "GPS") {
    if (tag === 2 || tag === 4) return value === "N" || value === "E" ? "N/E" : "S/W";
    if (tag === 3 || tag === 5) {
      if (Array.isArray(value) && value.length === 3) {
        const d = value[0][0] / value[0][1];
        const m = value[1][0] / value[1][1];
        const s = value[2][0] / value[2][1];
        return `${d}° ${m}' ${s}"`;
      }
      return String(value);
    }
    if (tag === 6) return value === 0 ? "Below sea level" : "Above sea level";
  }
  if (Array.isArray(value)) {
    if (value.length === 2 && typeof value[0] === "number") {
      return value[1] === 0 ? "0" : `${value[0]}/${value[1]}`;
    }
    return value.join(", ");
  }
  return String(value);
}

function parseInput(ifd, tag, raw) {
  if (!raw || !raw.trim()) return undefined;
  const val = raw.trim();
  if (ifd === "GPS") {
    if (tag === 2 || tag === 4)
      return val.toUpperCase().startsWith("N") || val.toUpperCase().startsWith("E") ? val[0] : "S";
    if (tag === 3 || tag === 5) {
      const match = val.match(/(\d+)[°d]\s*(\d+)[′']\s*([\d.]+)[″"]/);
      if (match) {
        const d = parseInt(match[1]);
        const m = parseInt(match[2]);
        const s = parseFloat(match[3]);
        return [
          [d, 1],
          [m, 1],
          [Math.round(s * 100), 100]
        ];
      }
      const num = parseFloat(val);
      if (!isNaN(num))
        return [
          [Math.round(num * 10000), 10000],
          [0, 1],
          [0, 1]
        ];
      return undefined;
    }
    if (tag === 6) return val.toLowerCase().includes("below") ? 1 : 0;
  }
  if (
    tag === 33434 ||
    tag === 33437 ||
    tag === 37377 ||
    tag === 37378 ||
    tag === 37380 ||
    tag === 37381 ||
    tag === 37386 ||
    tag === 41486
  ) {
    if (val.includes("/")) {
      const [n, d] = val.split("/").map(Number);
      if (!isNaN(n) && !isNaN(d) && d !== 0) return [n, d];
    }
    const num = parseFloat(val);
    if (!isNaN(num)) return [Math.round(num * 100), 100];
    return undefined;
  }
  if (tag === 274 || tag === 296 || tag === 37383 || tag === 37385 || tag === 41488) {
    const num = parseInt(val);
    if (!isNaN(num)) return num;
    return undefined;
  }
  return val;
}

export function render(container) {
  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="exif-upload-area"></div>
      <div id="exif-editor" style="display:none;margin-top:var(--space-6);"></div>
    </div>
  `;

  const uploadArea = container.querySelector("#exif-upload-area");
  const editorArea = container.querySelector("#exif-editor");
  let currentDataUrl = null;
  let currentExifObj = null;

  const upload = createFileUpload({
    accept: "image/jpeg",
    multiple: false,
    maxSizeMB: 50,
    onFilesSelected: async files => {
      if (files.length === 0) return;
      editorArea.style.display = "block";
      editorArea.innerHTML =
        '<div style="text-align:center;padding:var(--space-4);"><div class="spinner"></div><p>Reading EXIF data...</p></div>';

      try {
        const piexifLib = await loadPiexif();
        const dataUrl = await readFileAsDataUrl(files[0]);
        currentDataUrl = dataUrl;
        currentExifObj = piexifLib.load(dataUrl);

        const sections = [];
        Object.entries(FIELDS).forEach(([ifd, fieldMap]) => {
          const exifData = currentExifObj[ifd];
          if (!exifData || Object.keys(exifData).length === 0) return;

          const rows = Object.entries(fieldMap)
            .filter(([tag]) => exifData[Number(tag)] !== undefined)
            .map(([tag, name]) => {
              const numTag = Number(tag);
              const raw = exifData[numTag];
              const display = formatValue(ifd, numTag, raw);
              const inputId = `exif-${ifd}-${numTag}`;
              return `
                <div class="exif-field-row">
                  <label for="${inputId}" class="exif-field-label">${name}</label>
                  <input type="text" id="${inputId}" class="exif-field-input" data-ifd="${ifd}" data-tag="${numTag}" value="${escapeAttr(display)}" />
                </div>`;
            })
            .join("");

          if (rows) {
            sections.push(`<div class="exif-section"><h3>${ifd} IFD</h3>${rows}</div>`);
          }
        });

        if (sections.length === 0) {
          editorArea.innerHTML =
            '<div style="text-align:center;padding:var(--space-8);color:var(--color-text-muted);">No EXIF data found in this image.</div>';
          return;
        }

        editorArea.innerHTML = `
          <style>
            .exif-section { margin-bottom: var(--space-6); }
            .exif-section h3 { font-size: var(--text-lg); font-weight: 600; margin-bottom: var(--space-3); color: var(--color-text-secondary); }
            .exif-field-row { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-2); padding: var(--space-2); border-radius: var(--radius-md); }
            .exif-field-row:hover { background: var(--color-surface); }
            .exif-field-label { min-width: 160px; font-weight: 600; font-size: var(--text-sm); color: var(--color-text-secondary); }
            .exif-field-input { flex: 1; padding: var(--space-2) var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-family: monospace; font-size: var(--text-sm); }
            .exif-field-input:focus { outline: 2px solid var(--color-primary); border-color: transparent; }
            .exif-actions { display: flex; gap: var(--space-3); margin-top: var(--space-4); }
          </style>
          ${sections.join("")}
          <div class="exif-actions">
            <button class="btn btn-primary" id="exif-save">💾 Download Modified Image</button>
            <button class="btn btn-secondary" id="exif-reset">↩️ Reset Fields</button>
          </div>
        `;

        editorArea.querySelector("#exif-save").addEventListener("click", async () => {
          try {
            const pi = await loadPiexif();
            const modified = {
              "0th": { ...currentExifObj["0th"] },
              Exif: { ...currentExifObj["Exif"] },
              GPS: { ...currentExifObj["GPS"] }
            };

            editorArea.querySelectorAll(".exif-field-input").forEach(input => {
              const ifd = input.dataset.ifd;
              const tag = Number(input.dataset.tag);
              const newVal = parseInput(ifd, tag, input.value);
              if (newVal === undefined) {
                delete modified[ifd][tag];
              } else {
                modified[ifd][tag] = newVal;
              }
            });

            Object.keys(modified["0th"]).forEach(k => {
              if (modified["0th"][k] === undefined) delete modified["0th"][k];
            });
            Object.keys(modified["Exif"]).forEach(k => {
              if (modified["Exif"][k] === undefined) delete modified["Exif"][k];
            });
            Object.keys(modified["GPS"]).forEach(k => {
              if (modified["GPS"][k] === undefined) delete modified["GPS"][k];
            });

            const exifStr = pi.dump(modified);
            const newDataUrl = pi.insert(exifStr, currentDataUrl);
            const blob = dataUrlToBlob(newDataUrl);
            downloadBlob(blob, "modified-image.jpg");
            showToast({ message: "Image downloaded with updated EXIF data!", type: "success" });
          } catch (e) {
            showToast({ message: "Error saving: " + e.message, type: "error" });
          }
        });

        editorArea.querySelector("#exif-reset").addEventListener("click", () => {
          editorArea.querySelectorAll(".exif-field-input").forEach(input => {
            const ifd = input.dataset.ifd;
            const tag = Number(input.dataset.tag);
            const raw = currentExifObj[ifd]?.[tag];
            input.value = formatValue(ifd, tag, raw);
          });
          showToast({ message: "Fields reset to original values.", type: "info" });
        });
      } catch (err) {
        editorArea.innerHTML = `<div style="color:var(--color-error);">Error: ${err.message}</div>`;
      }
    }
  });

  uploadArea.appendChild(upload.element);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function dataUrlToBlob(dataUrl) {
  const [header, data] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(data);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
  return new Blob([array], { type: mime });
}

function escapeAttr(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
