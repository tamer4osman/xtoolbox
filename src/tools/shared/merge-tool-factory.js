import { createFileUpload } from "../../components/file-upload.js";
import { showToast } from "../../components/toast.js";
import { downloadBlob } from "../../utils/file.js";
import { createFileList } from "../../utils/file-list.js";

export function createMergeTool({
  id,
  name,
  category,
  icon,
  accept,
  maxSizeMB,
  keywords,
  steps,
  faqs,
  mergeFiles
}) {
  return {
    id,
    name,
    category,
    description: `Combine multiple ${accept.replace(".", "")} files into one.`,
    icon,
    accept,
    maxSizeMB: maxSizeMB || 100,
    keywords,
    steps: steps || ["Upload files", "Reorder if needed", 'Click "Merge"', "Download merged file"],
    faqs,
    render: container => {
      let files = [];

      const upload = createFileUpload({
        accept,
        multiple: true,
        maxSizeMB,
        maxFiles: 20,
        onFilesSelected: f => {
          files = f;
          renderFileList();
          mergeBtn.style.display = f.length > 1 ? "inline-flex" : "none";
        }
      });

      container.innerHTML = `
        <div class="tool-layout">
          <div class="tool-upload-area" id="upload-area"></div>
          <div id="file-list" style="margin:var(--space-4) 0;"></div>
          <button class="btn btn-primary btn-lg" id="merge-btn" style="display:none;width:100%;">Merge ${name}</button>
          <div class="tool-processing" id="processing" style="display:none;"><div class="spinner"></div><p>Merging...</p></div>
        </div>
      `;

      container.querySelector("#upload-area").appendChild(upload.element);
      const fileList = container.querySelector("#file-list");
      const mergeBtn = container.querySelector("#merge-btn");
      const processing = container.querySelector("#processing");

      function renderFileList() {
        fileList.innerHTML = createFileList(files);
      }

      mergeBtn.addEventListener("click", async () => {
        if (files.length < 2) return;
        processing.style.display = "block";
        mergeBtn.style.display = "none";

        try {
          await mergeFiles(files, downloadBlob);
          showToast({ message: `${files.length} files merged!`, type: "success" });
        } catch (err) {
          showToast({ message: "Error: " + err.message, type: "error" });
        } finally {
          processing.style.display = "none";
          mergeBtn.style.display = "inline-flex";
        }
      });
    },
    destroy() {}
  };
}
