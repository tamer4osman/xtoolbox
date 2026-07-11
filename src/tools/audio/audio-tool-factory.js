import { createFileUpload } from "../../components/file-upload.js";
import { loadAudioFile } from "./audio-utils.js";

export function createAudioTool({ container, accept = "audio/*", maxSizeMB = 100, onFileLoaded }) {
  let audioBuffer = null;

  const upload = createFileUpload({
    accept,
    multiple: false,
    maxSizeMB,
    onFilesSelected: async files => {
      if (files.length === 0) return;
      audioBuffer = await loadAudioFile(files[0]);
      optionsArea.style.display = "block";
      onFileLoaded(audioBuffer);
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div class="tool-options" id="options-area" style="display:none;"></div>
    </div>
  `;

  container.querySelector("#upload-area").appendChild(upload.element);
  const optionsArea = container.querySelector("#options-area");

  return { getAudioBuffer: () => audioBuffer, optionsArea };
}
