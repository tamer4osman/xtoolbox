import { createFileUpload } from "../../components/file-upload.js";

export function createOnnxTool(config) {
  return {
    toolConfig: config.toolConfig,
    render(container) {
      const upload = createFileUpload({
        accept: config.accept || "image/jpeg,image/png",
        multiple: false,
        maxSizeMB: config.maxSizeMB || 20,
        onFilesSelected: async files => {
          if (files.length === 0) return;
          resultArea.style.display = "block";
          resultArea.innerHTML = `
            <div style="text-align:center;padding:var(--space-8);">
              <div style="font-size:3rem;margin-bottom:var(--space-4);">${config.icon}</div>
              <h3 style="font-size:var(--text-xl);font-weight:600;margin-bottom:var(--space-2);">${config.toolConfig.name}</h3>
              <p style="color:var(--color-text-secondary);margin-bottom:var(--space-4);max-width:500px;margin-left:auto;margin-right:auto;">
                This tool requires the ${config.modelName} ONNX model (~${config.modelSize}) to be hosted at <code>/models/${config.modelFile}</code>. 
                The model runs entirely in your browser — no data is sent to any server.
              </p>
              <div style="background:var(--color-surface);padding:var(--space-4);border-radius:var(--radius-md);text-align:left;font-size:var(--text-sm);color:var(--color-text-secondary);">
                <strong>To enable:</strong> Download the ${config.modelName} ONNX model and place it in <code>public/models/${config.modelFile}</code>. 
                Then rebuild the project.
              </div>
            </div>
          `;
        }
      });

      container.innerHTML = `
        <div class="tool-layout">
          <div class="tool-upload-area" id="upload-area"></div>
          <div id="result-area" style="display:none;margin-top:var(--space-6);"></div>
        </div>
      `;

      container.querySelector("#upload-area").appendChild(upload.element);
      const resultArea = container.querySelector("#result-area");
    },
    destroy() {}
  };
}
