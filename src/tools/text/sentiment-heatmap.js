import { showToast } from "../../components/toast.js";
import { escapeHtml } from "../../utils/escape-html.js";

export const toolConfig = {
  id: "sentiment-heatmap",
  name: "Text Sentiment Heatmap",
  category: "text",
  description: "Visualize sentence-by-sentence sentiment as a color heatmap using DistilBERT.",
  icon: "🗺️",
  accept: ".txt",
  maxSizeMB: 1,
  keywords: ["sentiment", "heatmap", "text", "analyze", "positive", "negative"],
  steps: ["Paste text", "Click Analyze", "View color-coded sentiment heatmap"],
  faqs: [
    {
      question: "What do the colors mean?",
      answer:
        "Green indicates positive sentiment, red indicates negative, and yellow/white is neutral."
    },
    {
      question: "What types of text work best?",
      answer: "Reviews, feedback, opinions, and any text with emotional content."
    }
  ]
};

export function getSentimentColor(score) {
  if (score > 0.2) return { bg: "#22c55e", text: "#fff" };
  if (score < -0.2) return { bg: "#ef4444", text: "#fff" };
  if (score > 0.05) return { bg: "#86efac", text: "#000" };
  if (score < -0.05) return { bg: "#fca5a5", text: "#000" };
  return { bg: "#fef9c3", text: "#000" };
}

export function getSentimentLabel(score) {
  if (score > 0.2) return "Positive";
  if (score < -0.2) return "Negative";
  if (score > 0.05) return "Slightly Positive";
  if (score < -0.05) return "Slightly Negative";
  return "Neutral";
}

export function splitSentences(text) {
  return text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
}



export function render(container) {
  container.innerHTML = `
    <div class="tool-layout">
      <div class="form-group">
        <label for="input-text">Text to Analyze</label>
        <textarea id="input-text" class="text-input" rows="10" placeholder="Paste text to analyze sentiment (reviews, feedback, opinions)..."></textarea>
      </div>
      <button class="btn btn-primary btn-lg" id="analyze-btn" style="width:100%;">Analyze Sentiment</button>
      <div id="heatmap-area" style="display:none;margin-top:var(--space-3);"></div>
    </div>
  `;

  const inputText = container.querySelector("#input-text");
  const analyzeBtn = container.querySelector("#analyze-btn");
  const heatmapArea = container.querySelector("#heatmap-area");

  analyzeBtn.addEventListener("click", async () => {
    const text = inputText.value.trim();
    if (!text) {
      showToast({ message: "Enter text to analyze.", type: "error" });
      return;
    }

    analyzeBtn.disabled = true;
    analyzeBtn.textContent = "Loading model...";

    try {
      const { pipeline } =
        await import("https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.js");
      analyzeBtn.textContent = "Analyzing...";

      const classifier = await pipeline(
        "sentiment-analysis",
        "Xenova/distilbert-base-uncased-finetuned-sst-2-english"
      );
      const sentences = splitSentences(text);
      const results = await classifier(sentences);

      const scores = results.map(r => (r.label === "POSITIVE" ? r.score : -r.score));
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

      heatmapArea.innerHTML = `
        <div style="margin-bottom:var(--space-3);padding:var(--space-3);background:var(--color-bg-secondary);border-radius:var(--radius-md);">
          <div style="font-weight:600;margin-bottom:var(--space-2);">Overall Sentiment</div>
          <div style="display:flex;align-items:center;gap:var(--space-2);">
            <div style="width:100px;height:20px;background:linear-gradient(to right,#ef4444,#fef9c3,#22c55e);border-radius:var(--radius-sm);position:relative;">
              <div style="position:absolute;left:${((avgScore + 1) / 2) * 100}%;top:-2px;width:4px;height:24px;background:var(--color-text);border-radius:2px;transform:translateX(-50%);"></div>
            </div>
            <span style="font-size:var(--text-sm);color:var(--color-text-muted);">${getSentimentLabel(avgScore)} (${avgScore.toFixed(3)})</span>
          </div>
        </div>
        <div style="font-weight:600;margin-bottom:var(--space-2);">Sentence Breakdown</div>
        ${sentences
          .map((s, i) => {
            const color = getSentimentColor(scores[i]);
            return `
            <div style="padding:var(--space-2);margin-bottom:var(--space-1);background:${color.bg};color:${color.text};border-radius:var(--radius-sm);font-size:var(--text-sm);">
              <div style="display:flex;justify-content:space-between;margin-bottom:2px;">
                <span style="font-weight:600;">Sentence ${i + 1}</span>
                <span>${getSentimentLabel(scores[i])} (${scores[i].toFixed(3)})</span>
              </div>
              ${escapeHtml(s)}
            </div>
          `;
          })
          .join("")}
      `;
      heatmapArea.style.display = "block";
      showToast({ message: `Analyzed ${sentences.length} sentences.`, type: "success" });
    } catch (err) {
      showToast({ message: `Analysis failed: ${err.message}`, type: "error" });
    } finally {
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = "Analyze Sentiment";
    }
  });
}

export function destroy() {}
