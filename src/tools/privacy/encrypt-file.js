import { TABS_CSS } from "../shared/tabs-css.js";
import { wireTabSwitching } from "../shared/tab-switching.js";

export const toolConfig = {
  id: "encrypt-file",
  name: "File Encryption",
  category: "privacy",
  description: "Encrypt or decrypt files with AES-GCM password protection.",
  icon: "🔐",
  status: "done"
};

export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <div class="tool-content">
        <div class="tabs">
          <button class="tab active" data-tab="encrypt">Encrypt</button>
          <button class="tab" data-tab="decrypt">Decrypt</button>
        </div>
        <div class="tab-panel active" id="encrypt-panel">
          <div class="input-section">
            <label>File to Encrypt</label>
            <div class="upload-zone" id="encrypt-upload">
              <p>Drop file here or <label class="upload-link">browse<input type="file" id="encrypt-file" hidden /></label></p>
            <p class="upload-hint" id="encrypt-filename"></p>
            </div>
          </div>
          <div class="input-section">
            <label>Password</label>
            <input type="password" id="encrypt-password" class="tool-input" placeholder="Enter encryption password" />
          </div>
          <button id="encrypt-btn" class="tool-button primary">Encrypt File</button>
        </div>
        <div class="tab-panel" id="decrypt-panel">
          <div class="input-section">
            <label>File to Decrypt</label>
            <div class="upload-zone" id="decrypt-upload">
              <p>Drop .enc file or <label class="upload-link">browse<input type="file" id="decrypt-file" accept=".enc" hidden /></label></p>
              <p class="upload-hint" id="decrypt-filename"></p>
            </div>
          </div>
          <div class="input-section">
            <label>Password</label>
            <input type="password" id="decrypt-password" class="tool-input" placeholder="Enter decryption password" />
          </div>
          <button id="decrypt-btn" class="tool-button primary">Decrypt File</button>
        </div>
        <div id="result-section" class="result-section hidden">
          <p id="result-message"></p>
        </div>
      </div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .tool-container { max-width: 500px; margin: 0 auto; }
    .tool-header { text-align: center; margin-bottom: var(--space-8); }
    .tool-icon { font-size: 4rem; margin-bottom: var(--space-4); }
    .tool-description { color: var(--color-text-secondary); }
    .upload-link { color: var(--color-primary); cursor: pointer; text-decoration: underline; }
    .upload-hint { font-size: var(--text-sm); color: var(--color-text-muted); margin-top: var(--space-2); }
    .result-section.success { background: #dcfce7; color: #166534; }
    .result-section.error { background: #fef2f2; color: var(--color-error); }
    ${TABS_CSS}
  `;
  container.appendChild(style);

  const encryptFile = container.querySelector("#encrypt-file");
  const decryptFile = container.querySelector("#decrypt-file");
  const encryptFilename = container.querySelector("#encrypt-filename");
  const resultSection = container.querySelector("#result-section");
  const resultMessage = container.querySelector("#result-message");

  wireTabSwitching(container);

  encryptFile.addEventListener("change", () => {
    if (encryptFile.files[0]) encryptFilename.textContent = encryptFile.files[0].name;
  });

  async function encryptFileFn() {
    const file = encryptFile.files[0];
    const password = container.querySelector("#encrypt-password").value;
    if (!file || !password) {
      alert("Please select a file and enter password");
      return;
    }

    try {
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const keyMaterial = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        "PBKDF2",
        false,
        ["deriveKey"]
      );
      const key = await crypto.subtle.deriveKey(
        { name: "PBKDF2", salt, iterations: 200000, hash: "SHA-256" },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt"]
      );
      const data = await file.arrayBuffer();
      const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);

      const blob = new Blob([salt, iv, encrypted], { type: "application/octet-stream" });
      downloadBlob(blob, file.name + ".enc");
      resultMessage.textContent = "File encrypted successfully!";
      resultSection.className = "result-section success";
      resultSection.classList.remove("hidden");
    } catch (err) {
      alert("Encryption failed: " + err.message);
    }
  }

  async function decryptFileFn() {
    const file = decryptFile.files[0];
    const password = container.querySelector("#decrypt-password").value;
    if (!file || !password) {
      alert("Please select a file and enter password");
      return;
    }

    try {
      const data = await file.arrayBuffer();
      const salt = new Uint8Array(data.slice(0, 16));
      const iv = new Uint8Array(data.slice(16, 28));
      const encrypted = data.slice(28);
      const keyMaterial = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        "PBKDF2",
        false,
        ["deriveKey"]
      );
      const key = await crypto.subtle.deriveKey(
        { name: "PBKDF2", salt, iterations: 200000, hash: "SHA-256" },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"]
      );
      const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encrypted);
      const blob = new Blob([decrypted]);
      const name = file.name.replace(".enc", "");
      downloadBlob(blob, "decrypted_" + name);
      resultMessage.textContent = "File decrypted successfully!";
      resultSection.className = "result-section success";
      resultSection.classList.remove("hidden");
    } catch (err) {
      alert("Decryption failed. Wrong password?");
    }
  }

  container.querySelector("#encrypt-btn").addEventListener("click", encryptFileFn);
  container.querySelector("#decrypt-btn").addEventListener("click", decryptFileFn);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
