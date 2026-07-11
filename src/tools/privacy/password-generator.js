import { showToast } from "../../components/toast.js";
import { copyToClipboard } from "../../utils/clipboard.js";

export const toolConfig = {
  id: "password-generator",
  name: "Password Generator",
  category: "privacy",
  description:
    "Generate cryptographically secure passwords. Customize length, uppercase, lowercase, numbers, and symbols.",
  icon: "🔑",
  accept: null,
  maxSizeMB: null,
  keywords: ["password", "generator", "secure", "random", "strong password"],
  steps: [
    "Set the desired password length using the slider",
    "Choose which character types to include",
    'Click "Generate Password"',
    'Click "Copy" to copy to clipboard'
  ],
  faqs: [
    {
      question: "Is this password generator secure?",
      answer:
        "Yes. It uses the Web Crypto API (crypto.getRandomValues) which provides cryptographically secure random numbers."
    },
    {
      question: "Are my generated passwords stored anywhere?",
      answer:
        "No. Passwords are generated entirely in your browser and are never sent to any server."
    }
  ]
};

export function render(container) {
  let password = "";

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-options">
        <div class="form-group">
          <label>Password Length: <strong id="length-display">16</strong></label>
          <input type="range" id="length-slider" min="4" max="128" value="16" class="range-slider-input">
        </div>
        <div class="form-group" style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2);">
          <label class="checkbox-label"><input type="checkbox" id="opt-uppercase" checked> Uppercase (A-Z)</label>
          <label class="checkbox-label"><input type="checkbox" id="opt-lowercase" checked> Lowercase (a-z)</label>
          <label class="checkbox-label"><input type="checkbox" id="opt-numbers" checked> Numbers (0-9)</label>
          <label class="checkbox-label"><input type="checkbox" id="opt-symbols" checked> Symbols (!@#$%^&*)</label>
        </div>
        <button class="btn btn-primary" id="generate-btn">Generate Password</button>
      </div>
      <div class="tool-results" id="results" style="display:none;">
        <div class="password-output">
          <input type="text" id="password-display" readonly class="password-field">
          <button class="btn btn-secondary" id="copy-btn">Copy</button>
        </div>
        <div id="strength-display"></div>
      </div>
    </div>
  `;

  const lengthSlider = container.querySelector("#length-slider");
  const lengthDisplay = container.querySelector("#length-display");
  const generateBtn = container.querySelector("#generate-btn");
  const copyBtn = container.querySelector("#copy-btn");
  const results = container.querySelector("#results");
  const passwordDisplay = container.querySelector("#password-display");
  const strengthDisplay = container.querySelector("#strength-display");

  lengthSlider.addEventListener("input", () => {
    lengthDisplay.textContent = lengthSlider.value;
  });

  generateBtn.addEventListener("click", () => {
    const length = parseInt(lengthSlider.value);
    const useUpper = container.querySelector("#opt-uppercase").checked;
    const useLower = container.querySelector("#opt-lowercase").checked;
    const useNumbers = container.querySelector("#opt-numbers").checked;
    const useSymbols = container.querySelector("#opt-symbols").checked;

    password = generateSecurePassword(length, useUpper, useLower, useNumbers, useSymbols);
    passwordDisplay.value = password;
    strengthDisplay.innerHTML = getPasswordStrengthHTML(password);
    results.style.display = "block";
  });

  copyBtn.addEventListener("click", async () => {
    const success = await copyToClipboard(password);
    if (success) {
      showToast({ message: "Password copied to clipboard!", type: "success" });
    }
  });

  // Auto-generate on load
  generateBtn.click();
}

export function destroy() {}

// ===== Helpers =====

function generateSecurePassword(length, upper, lower, numbers, symbols) {
  let chars = "";
  if (upper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (lower) chars += "abcdefghijklmnopqrstuvwxyz";
  if (numbers) chars += "0123456789";
  if (symbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";
  if (chars.length === 0) chars = "abcdefghijklmnopqrstuvwxyz";

  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, x => chars[x % chars.length]).join("");
}

function getPasswordStrengthHTML(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
  const colors = ["#EF4444", "#F59E0B", "#F59E0B", "#10B981", "#10B981"];
  const level = Math.min(Math.floor(score / 1.5), 4);

  return `
    <div class="strength-meter"><div class="strength-bar" style="width:${(level + 1) * 20}%;background:${colors[level]};"></div></div>
    <span style="color:${colors[level]};font-weight:600;">${levels[level]}</span>
  `;
}
