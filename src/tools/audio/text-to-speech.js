import { showToast } from "../../components/toast.js";

export const toolConfig = {
  id: "text-to-speech",
  name: "Text to Speech",
  category: "audio",
  description: "Convert text to spoken audio. Choose voice, rate, and pitch.",
  icon: "🗣️",
  accept: null,
  maxSizeMB: null,
  keywords: ["text to speech", "tts", "text reader"],
  steps: [
    "Enter your text",
    "Choose a voice",
    "Adjust rate and pitch",
    'Click "Speak" or "Download"'
  ],
  faqs: [
    {
      question: "Can I download the audio?",
      answer:
        "Some browsers support recording the speech output. Otherwise, use the browser's built-in playback."
    }
  ]
};

export function render(container) {
  let voices = [];

  function loadVoices() {
    voices = speechSynthesis.getVoices();
    voiceSelect.innerHTML = voices
      .map(
        (v, i) =>
          `<option value="${i}">${v.name} (${v.lang})${v.default ? " — Default" : ""}</option>`
      )
      .join("");
  }

  speechSynthesis.onvoiceschanged = loadVoices;
  loadVoices();

  container.innerHTML = `
    <div class="tool-layout">
      <div class="form-group">
        <label>Text</label>
        <textarea id="text-input" class="textarea-input" rows="6" placeholder="Enter text to speak...">Hello! This is a text-to-speech demo. Type anything you want to hear.</textarea>
      </div>
      <div class="form-group">
        <label>Voice</label>
        <select id="voice-select" class="select-input"></select>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);">
        <div class="form-group">
          <label>Rate: <strong id="rate-display">1.0</strong>x</label>
          <input type="range" id="rate-slider" min="25" max="300" value="100" step="5" class="range-slider-input">
        </div>
        <div class="form-group">
          <label>Pitch: <strong id="pitch-display">1.0</strong></label>
          <input type="range" id="pitch-slider" min="0" max="200" value="100" step="5" class="range-slider-input">
        </div>
      </div>
      <div style="display:flex;gap:var(--space-3);">
        <button class="btn btn-primary btn-lg" id="speak-btn" style="flex:1;">🔊 Speak</button>
        <button class="btn btn-secondary btn-lg" id="stop-btn" style="flex:1;">⏹️ Stop</button>
      </div>
    </div>
  `;

  const textInput = container.querySelector("#text-input");
  const voiceSelect = container.querySelector("#voice-select");
  const rateSlider = container.querySelector("#rate-slider");
  const rateDisplay = container.querySelector("#rate-display");
  const pitchSlider = container.querySelector("#pitch-slider");
  const pitchDisplay = container.querySelector("#pitch-display");
  const speakBtn = container.querySelector("#speak-btn");
  const stopBtn = container.querySelector("#stop-btn");

  rateSlider.addEventListener("input", () => {
    rateDisplay.textContent = (parseInt(rateSlider.value) / 100).toFixed(1);
  });
  pitchSlider.addEventListener("input", () => {
    pitchDisplay.textContent = (parseInt(pitchSlider.value) / 100).toFixed(1);
  });

  speakBtn.addEventListener("click", () => {
    const text = textInput.value.trim();
    if (!text) {
      showToast({ message: "Enter some text first", type: "warning" });
      return;
    }

    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voiceIdx = parseInt(voiceSelect.value);
    if (voices[voiceIdx]) utterance.voice = voices[voiceIdx];
    utterance.rate = parseInt(rateSlider.value) / 100;
    utterance.pitch = parseInt(pitchSlider.value) / 100;

    utterance.onstart = () => {
      speakBtn.textContent = "🔊 Speaking...";
    };
    utterance.onend = () => {
      speakBtn.textContent = "🔊 Speak";
    };
    utterance.onerror = () => {
      speakBtn.textContent = "🔊 Speak";
    };

    speechSynthesis.speak(utterance);
  });

  stopBtn.addEventListener("click", () => {
    speechSynthesis.cancel();
    speakBtn.textContent = "🔊 Speak";
  });
}

export function destroy() {
  speechSynthesis.cancel();
}
