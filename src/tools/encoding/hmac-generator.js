import { createBasicTool } from "../shared/basic-tool-factory.js";

const { toolConfig, render } = createBasicTool({
  toolConfig: {
    id: "hmac-generator",
    name: "HMAC Generator",
    category: "encoding",
    description: "Generate and verify HMAC signatures using SHA-1/256/384/512.",
    icon: "🔑",
    accept: null,
    maxSizeMB: null,
    keywords: ["hmac", "hmac generator", "hmac signature", "message authentication", "sha256 hmac"],
    steps: ["Enter message and secret key", "Choose algorithm", "Generate or verify HMAC"]
  },
  inputHTML: `
    <div class="hmac-modes">
      <button class="btn hmac-mode active" data-mode="generate">Generate</button>
      <button class="btn hmac-mode" data-mode="verify">Verify</button>
    </div>
    <textarea id="hmac-message" placeholder="Message to sign..."></textarea>
    <input type="text" id="hmac-secret" placeholder="Secret key..." />
    <div class="tool-buttons hash-buttons">
      <button class="btn hash-btn active" data-algo="SHA-256">SHA-256</button>
      <button class="btn hash-btn" data-algo="SHA-1">SHA-1</button>
      <button class="btn hash-btn" data-algo="SHA-384">SHA-384</button>
      <button class="btn hash-btn" data-algo="SHA-512">SHA-512</button>
    </div>
  `,
  outputHTML: `
    <div class="hash-output" id="generate-output">
      <div class="hmac-format-row">
        <label>Hex:</label>
        <textarea id="hmac-hex" readonly></textarea>
      </div>
      <div class="hmac-format-row">
        <label>Base64:</label>
        <textarea id="hmac-base64" readonly></textarea>
      </div>
      <button id="copy-hex" class="btn btn-secondary">Copy Hex</button>
      <button id="copy-base64" class="btn btn-secondary">Copy Base64</button>
    </div>
    <div class="hash-output hidden" id="verify-output">
      <input type="text" id="hmac-signature" placeholder="Paste signature (hex or base64) to verify..." />
      <div id="verify-result" class="verify-result"></div>
      <button id="verify-btn" class="btn btn-primary">Verify</button>
    </div>
  `,
  extraCSS: `
    .hmac-modes { display: flex; gap: var(--space-2); margin-bottom: var(--space-4); }
    .hmac-modes .btn { flex: 1; }
    #hmac-secret { width: 100%; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-family: monospace; margin-bottom: var(--space-3); }
    .hash-buttons { flex-wrap: wrap; }
    .hash-buttons .btn { flex: 1; min-width: 80px; }
    .hash-output textarea { background: var(--color-surface); min-height: 60px; font-family: monospace; }
    .hash-output { position: relative; display: flex; flex-direction: column; gap: var(--space-2); }
    .hmac-format-row { display: flex; flex-direction: column; gap: var(--space-1); }
    .hmac-format-row label { font-size: var(--text-sm); font-weight: 600; color: var(--color-text-secondary); }
    #generate-output .btn, #verify-output .btn { align-self: flex-start; }
    .verify-result { padding: var(--space-3); border-radius: var(--radius-md); font-weight: 600; text-align: center; }
    .verify-result.valid { background: #d1fae5; color: #065f46; }
    .verify-result.invalid { background: #fee2e2; color: #991b1b; }
    .hidden { display: none; }
  `,
  init(container) {
    const message = container.querySelector("#hmac-message");
    const secret = container.querySelector("#hmac-secret");
    const hexOutput = container.querySelector("#hmac-hex");
    const base64Output = container.querySelector("#hmac-base64");
    const signatureInput = container.querySelector("#hmac-signature");
    const verifyResult = container.querySelector("#verify-result");
    const algoBtns = container.querySelectorAll(".hash-btn");
    const modeBtns = container.querySelectorAll(".hmac-mode");
    const generateOutput = container.querySelector("#generate-output");
    const verifyOutput = container.querySelector("#verify-output");
    const copyHex = container.querySelector("#copy-hex");
    const copyBase64 = container.querySelector("#copy-base64");
    const verifyBtn = container.querySelector("#verify-btn");

    let currentAlgo = "SHA-256";
    let currentMode = "generate";

    async function importKey(keyStr) {
      const enc = new TextEncoder();
      return await crypto.subtle.importKey(
        "raw",
        enc.encode(keyStr),
        { name: "HMAC", hash: currentAlgo },
        false,
        ["sign", "verify"]
      );
    }

    async function generate() {
      const msg = message.value;
      const keyStr = secret.value;
      if (!msg || !keyStr) {
        hexOutput.value = "";
        base64Output.value = "";
        return;
      }
      try {
        const key = await importKey(keyStr);
        const enc = new TextEncoder();
        const sig = await crypto.subtle.sign("HMAC", key, enc.encode(msg));
        const bytes = new Uint8Array(sig);
        hexOutput.value = Array.from(bytes)
          .map(b => b.toString(16).padStart(2, "0"))
          .join("");
        base64Output.value = btoa(String.fromCharCode(...bytes));
      } catch (e) {
        hexOutput.value = "Error: " + e.message;
        base64Output.value = "";
      }
    }

    async function verify() {
      const msg = message.value;
      const keyStr = secret.value;
      const sigStr = signatureInput.value.trim();
      if (!msg || !keyStr || !sigStr) {
        verifyResult.textContent = "";
        verifyResult.className = "verify-result";
        return;
      }
      try {
        const key = await importKey(keyStr);
        const enc = new TextEncoder();
        let sigBytes;
        if (/^[0-9a-fA-F]+$/.test(sigStr)) {
          const hex = sigStr.padStart(Math.ceil(sigStr.length / 2) * 2, "0");
          sigBytes = new Uint8Array(hex.match(/.{1,2}/g).map(b => parseInt(b, 16)));
        } else {
          const bin = atob(sigStr);
          sigBytes = new Uint8Array([...bin].map(c => c.charCodeAt(0)));
        }
        const valid = await crypto.subtle.verify("HMAC", key, sigBytes, enc.encode(msg));
        verifyResult.textContent = valid ? "Signature is valid" : "Signature is invalid";
        verifyResult.className = "verify-result " + (valid ? "valid" : "invalid");
      } catch (e) {
        verifyResult.textContent = "Error: " + e.message;
        verifyResult.className = "verify-result invalid";
      }
    }

    modeBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        modeBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentMode = btn.dataset.mode;
        generateOutput.classList.toggle("hidden", currentMode !== "generate");
        verifyOutput.classList.toggle("hidden", currentMode !== "verify");
      });
    });

    algoBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        algoBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentAlgo = btn.dataset.algo;
        if (currentMode === "generate") generate();
      });
    });

    const debouncedGenerate = (() => {
      let t;
      return () => {
        clearTimeout(t);
        t = setTimeout(generate, 200);
      };
    })();

    message.addEventListener("input", debouncedGenerate);
    secret.addEventListener("input", debouncedGenerate);

    copyHex.addEventListener("click", () => {
      navigator.clipboard.writeText(hexOutput.value);
      copyHex.textContent = "Copied!";
      setTimeout(() => (copyHex.textContent = "Copy Hex"), 1500);
    });

    copyBase64.addEventListener("click", () => {
      navigator.clipboard.writeText(base64Output.value);
      copyBase64.textContent = "Copied!";
      setTimeout(() => (copyBase64.textContent = "Copy Base64"), 1500);
    });

    verifyBtn.addEventListener("click", verify);
    signatureInput.addEventListener("keydown", e => {
      if (e.key === "Enter") verify();
    });
  }
});

export { toolConfig, render };
