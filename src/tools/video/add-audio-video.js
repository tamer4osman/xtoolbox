import { createFileUpload } from "../../components/file-upload.js";
import { showToast } from "../../components/toast.js";
import { downloadBlob } from "../../utils/file.js";
import { loadFFmpeg, writeUploadedFile, readFFmpegFile } from "./video-utils.js";

export const toolConfig = {
  id: "add-audio-video",
  name: "Add Audio to Video",
  category: "video",
  description: "Merge audio track onto a video file.",
  icon: "🔊",
  accept: "video/*,audio/*",
  maxSizeMB: 500,
  keywords: ["add audio to video", "merge audio video", "music on video"],
  steps: [
    "Upload a video",
    "Upload an audio file",
    "Choose replace or merge",
    "Download combined video"
  ],
  faqs: [
    {
      question: "Can I replace the existing audio?",
      answer: 'Yes. Choose "Replace" to remove existing audio and use the new track.'
    }
  ]
};

export function render(container) {
  let videoFile = null;
  let audioFile = null;

  const videoUpload = createFileUpload({
    accept: "video/*",
    multiple: false,
    maxSizeMB: 500,
    onFilesSelected: files => {
      videoFile = files[0] || null;
      videoStatus.textContent = videoFile ? `✅ ${videoFile.name}` : "No file";
      checkReady();
    }
  });

  const audioUpload = createFileUpload({
    accept: "audio/*",
    multiple: false,
    maxSizeMB: 200,
    onFilesSelected: files => {
      audioFile = files[0] || null;
      audioStatus.textContent = audioFile ? `✅ ${audioFile.name}` : "No file";
      checkReady();
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);">
        <div>
          <h3 style="margin-bottom:var(--space-3);">🎬 Video</h3>
          <div id="video-upload-area"></div>
          <div id="video-status" style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-top:var(--space-2);">No file</div>
        </div>
        <div>
          <h3 style="margin-bottom:var(--space-3);">🎵 Audio</h3>
          <div id="audio-upload-area"></div>
          <div id="audio-status" style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-top:var(--space-2);">No file</div>
        </div>
      </div>
      <div class="tool-options" id="options-area" style="display:none;margin-top:var(--space-6);">
        <div class="form-group">
          <label>Mode</label>
          <select id="mode-select" class="select-input">
            <option value="replace" selected>Replace existing audio</option>
            <option value="merge">Merge (mix with existing audio)</option>
          </select>
        </div>
        <button class="btn btn-primary btn-lg" id="combine-btn" style="width:100%;">Combine Audio + Video</button>
      </div>
      <div class="tool-processing" id="processing" style="display:none;"><div class="spinner"></div><p>Combining...</p></div>
    </div>
  `;

  container.querySelector("#video-upload-area").appendChild(videoUpload.element);
  container.querySelector("#audio-upload-area").appendChild(audioUpload.element);
  const optionsArea = container.querySelector("#options-area");
  const videoStatus = container.querySelector("#video-status");
  const audioStatus = container.querySelector("#audio-status");
  const combineBtn = container.querySelector("#combine-btn");
  const processing = container.querySelector("#processing");

  function checkReady() {
    optionsArea.style.display = videoFile && audioFile ? "block" : "none";
  }

  combineBtn.addEventListener("click", async () => {
    if (!videoFile || !audioFile) return;
    const mode = container.querySelector("#mode-select").value;

    processing.style.display = "block";
    combineBtn.style.display = "none";

    try {
      const ffmpeg = await loadFFmpeg();
      await writeUploadedFile(ffmpeg, videoFile, "video.mp4");
      await writeUploadedFile(ffmpeg, audioFile, "audio.mp3");

      const args = ["-i", "video.mp4", "-i", "audio.mp3"];
      if (mode === "replace") {
        args.push("-c:v", "copy", "-map", "0:v:0", "-map", "1:a:0", "-shortest", "output.mp4");
      } else {
        args.push(
          "-filter_complex",
          "[0:a][1:a]amix=inputs=2:duration=first",
          "-c:v",
          "copy",
          "output.mp4"
        );
      }

      await ffmpeg.exec(args);

      const blob = await readFFmpegFile(ffmpeg, "output.mp4", "video/mp4");
      downloadBlob(blob, "combined.mp4");
      showToast({ message: "Audio added to video!", type: "success" });

      await ffmpeg.deleteFile("video.mp4");
      await ffmpeg.deleteFile("audio.mp3");
      await ffmpeg.deleteFile("output.mp4");
    } catch (err) {
      showToast({ message: "Error: " + err.message, type: "error" });
    } finally {
      processing.style.display = "none";
      combineBtn.style.display = "inline-flex";
    }
  });
}

export function destroy() {}
