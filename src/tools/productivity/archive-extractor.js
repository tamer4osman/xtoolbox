import JSZip from "jszip";
import { downloadBlob } from "../../utils/file.js";

export const toolConfig = {
  id: "archive-extractor",
  name: "Archive Extractor",
  category: "productivity",
  description: "Extract files from ZIP and TAR archives directly in the browser.",
  icon: "📦",
  keywords: ["archive", "extract", "zip", "tar", "gzip", "unzip"],
  accept: ".zip,.tar,.gz,.bz2",
  maxSizeMB: 100
};

function parseTar(arrayBuffer) {
  const files = [];
  const dataView = new DataView(arrayBuffer);
  let offset = 0;
  const totalSize = arrayBuffer.byteLength;

  while (offset < totalSize) {
    if (offset + 512 > totalSize) break;

    let nameBytes = [];
    for (let i = 0; i < 100; i++) {
      const byte = dataView.getUint8(offset + i);
      if (byte === 0) break;
      nameBytes.push(byte);
    }
    const name = String.fromCharCode(...nameBytes);

    let sizeStr = "";
    for (let i = 124; i < 136; i++) {
      const byte = dataView.getUint8(offset + i);
      if (byte === 32) break;
      sizeStr += String.fromCharCode(byte);
    }

    const size = parseInt(sizeStr.trim(), 8);
    if (isNaN(size) || size < 0) break;

    const paddedSize = Math.ceil(size / 512) * 512;
    const contentOffset = offset + 512;

    if (size > 0 && contentOffset + size <= totalSize) {
      files.push({
        name: name.trim(),
        size: size,
        data: arrayBuffer.slice(contentOffset, contentOffset + size)
      });
    }

    offset += 512 + paddedSize;
    if (offset === 0 && size === 0) break;
  }

  return files;
}

export function render(container) {
  let state = {
    files: [],
    archive: null,
    archiveType: null
  };

  container.innerHTML = `
    <div class="tool-container">
      <h1>${toolConfig.name}</h1>
      <p>${toolConfig.description}</p>
      <div class="upload-area" id="dropZone">
        <p>Drag & drop an archive file here</p>
        <p>or</p>
        <input type="file" id="fileInput" accept=".zip,.tar" />
        <p class="help-text">Supports: ZIP, TAR</p>
      </div>
      <div id="results" class="results-section" style="display: none;">
        <h3>Extracted Files</h3>
        <table id="filesTable">
          <thead>
            <tr>
              <th>Filename</th>
              <th>Size</th>
              <th>Type</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="filesBody"></tbody>
        </table>
        <button type="button" id="downloadAll" class="btn-secondary">Download All as ZIP</button>
      </div>
    </div>
  `;

  const $ = id => container.querySelector(id);
  const el = sel => container.querySelector(sel);
  const formatSize = bytes => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleFile = async file => {
    try {
      const ext = file.name.split(".").pop().toLowerCase();
      state.archive = null;
      state.files = [];

      if (ext === "zip") {
        const arrayBuffer = await file.arrayBuffer();
        state.archive = await JSZip.loadAsync(arrayBuffer);
        state.archiveType = "zip";
        state.files = Object.keys(state.archive.files)
          .filter(name => !name.endsWith("/"))
          .map(name => ({ name, data: state.archive.files[name] }));
      } else if (ext === "tar") {
        const arrayBuffer = await file.arrayBuffer();
        state.archiveType = "tar";
        state.files = parseTar(arrayBuffer);
      } else {
        alert("Unsupported format: " + ext + ". Supports ZIP and TAR.");
        return;
      }

      if (state.files.length === 0) {
        alert("No files found in archive");
        return;
      }

      renderFileList();
    } catch (err) {
      console.error("Extraction error:", err);
      alert("Error extracting archive: " + err.message);
    }
  };

  const renderFileList = () => {
    const tbody = $("#filesBody");
    tbody.innerHTML = state.files
      .map(file => {
        const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name);
        const isPdf = /\.pdf$/i.test(file.name);
        const type = isImage ? "image" : isPdf ? "pdf" : "file";

        return `
        <tr>
          <td>${file.name}</td>
          <td>${formatSize(file.size)}</td>
          <td>${type}</td>
          <td>
            <button type="button" class="btn-small extract-single" data-name="${file.name}">Extract</button>
          </td>
        </tr>
      `;
      })
      .join("");

    container.querySelectorAll(".extract-single").forEach(btn => {
      btn.addEventListener("click", e => {
        const filename = e.target.dataset.name;
        const file = state.files.find(f => f.name === filename);
        if (!file) return;

        if (state.archiveType === "zip") {
          file.data.async("blob").then(blob => {
            downloadBlob(blob, filename);
          });
        } else {
          const ext = filename.split(".").pop();
          const mimeType =
            ext === "pdf"
              ? "application/pdf"
              : ext === "png"
                ? "image/png"
                : ext === "txt"
                  ? "text/plain"
                  : "application/octet-stream";
          downloadBlob(new Blob([file.data], { type: mimeType }), filename);
        }
      });
    });

    $("#results").style.display = "block";
  };

  const dropZone = $("#dropZone");

  dropZone.addEventListener("dragover", e => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
  });

  dropZone.addEventListener("drop", async e => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await handleFile(files[0]);
    }
  });

  el("#fileInput").addEventListener("change", async e => {
    const files = e.target.files;
    if (files.length > 0) {
      await handleFile(files[0]);
    }
  });

  el("#downloadAll").addEventListener("click", async () => {
    if (!state.files.length) return;

    const newZip = new JSZip();
    for (const file of state.files) {
      if (state.archiveType === "zip") {
        const blob = await file.data.async("blob");
        newZip.file(file.name, blob);
      } else {
        newZip.file(file.name, file.data);
      }
    }

    const content = await newZip.generateAsync({ type: "blob" });
    downloadBlob(content, "extracted-files.zip");
  });
}
