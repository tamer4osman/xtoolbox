import { escapeHtml } from "../../utils/escape-html.js";

export const STOPWORDS = new Set(
  "a an and are as at be been but by can could do does for from had has have how i if in into is it its may might must of on or our ours shall should so some such than that the their theirs them then there these they this those to us was we were what when where which while who whom will with would you your yours about after all also any because before being between both during each either every few here him his however just like many more most much need no not now often once only other over own per same since still through too under until up use used using very via well within without work working works team teams role roles job jobs company companies year years experience experiences strong ability able across help helps helping ensure ensures ensuring etc plus join hiring deep five four six seven ten own aa".split(
    " "
  )
);

const TOKEN_SPLIT = /[^a-z0-9+#./-]+/;
const NUMERIC_RE = /^[\d./-]+$/;
const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const PHONE_RE = /(\+?\(?\d[\d\s().-]{7,}\d)/;

export function normalizeToken(raw) {
  let w = raw.replace(/^[./]+|[./]+$/g, "");
  if (!w || w.length < 2 || STOPWORDS.has(w)) return null;
  if (NUMERIC_RE.test(w)) return null;
  if (/^[a-z]{3,}s$/.test(w) && !w.endsWith("ss") && !w.endsWith("us") && !w.endsWith("is")) {
    w = w.slice(0, -1);
  }
  return w;
}

export function tokenize(text) {
  const out = [];
  for (const raw of String(text).toLowerCase().split(TOKEN_SPLIT)) {
    const w = normalizeToken(raw);
    if (w) out.push(w);
  }
  return out;
}

export function extractJobTerms(jdText, limit = 40) {
  const freq = new Map();
  const display = new Map();
  for (const raw of String(jdText).toLowerCase().split(TOKEN_SPLIT)) {
    const key = normalizeToken(raw);
    if (!key) continue;
    freq.set(key, (freq.get(key) ?? 0) + 1);
    if (!display.has(key)) display.set(key, raw.replace(/^[.+]+|[.+]+$/g, ""));
  }
  return [...freq.entries()]
    .map(([key, count]) => ({ key, term: display.get(key), weight: Math.min(count, 3), count }))
    .sort((a, b) => b.weight - a.weight || a.key.localeCompare(b.key))
    .slice(0, limit);
}

export const ACTION_VERBS = new Set(
  "led built managed designed developed launched improved created delivered implemented optimized reduced increased owned drove shipped architected automated mentored negotiated analyzed migrated scaled rebuilt streamlined coordinated established founded grew saved cut accelerated unified consolidated standardized spearheaded transformed introduced expanded integrated".split(
    " "
  )
);

export function extractEmail(text) {
  const m = String(text).match(EMAIL_RE);
  return m ? m[0].toLowerCase() : "";
}

export function extractPhone(text) {
  const m = String(text).match(PHONE_RE);
  return m ? m[1].trim() : "";
}

export function analyzeMatch(resumeText, jdText) {
  const jobTerms = extractJobTerms(jdText);
  const resumeTokens = tokenize(resumeText);
  const resumeSet = new Set(resumeTokens);
  const matched = [];
  const missing = [];
  let hitWeight = 0;
  let totalWeight = 0;
  for (const t of jobTerms) {
    totalWeight += t.weight;
    if (resumeSet.has(t.key)) {
      hitWeight += t.weight;
      matched.push(t);
    } else {
      missing.push(t);
    }
  }
  const words = String(resumeText).trim() ? String(resumeText).trim().split(/\s+/).length : 0;
  const email = extractEmail(resumeText);
  const phone = extractPhone(resumeText);
  const actionVerbCount = [...resumeTokens].filter(w => ACTION_VERBS.has(w)).length;
  return {
    score: totalWeight ? Math.round((hitWeight / totalWeight) * 100) : 0,
    matched,
    missing,
    stats: {
      words,
      email,
      phone,
      actionVerbs: actionVerbCount,
      jobTermCount: jobTerms.length
    }
  };
}

function bandFor(score) {
  if (score >= 75) return { label: "Strong match", color: "#10b981" };
  if (score >= 50) return { label: "Decent match", color: "#f59e0b" };
  if (score >= 25) return { label: "Weak match", color: "#f97316" };
  return { label: "Poor match", color: "#dc2626" };
}

export function buildMarkdownReport(result) {
  const L = ["# Resume ↔ Job Match Report", "", `- Fit score: **${result.score}%**`];
  L.push(`- Matched keywords: ${result.matched.length}`);
  L.push(`- Missing keywords: ${result.missing.length}`);
  if (result.missing.length) {
    L.push("", "## Missing keywords to consider", "");
    L.push(result.missing.map(m => `\`${m.term}\``).join(", "));
  }
  L.push(
    "",
    "## Resume health",
    "",
    `- Word count: ${result.stats.words} (ATS sweet spot ≈ 400–800)`
  );
  L.push(
    `- Contact: email ${result.stats.email || "not found"}, phone ${result.stats.phone || "not found"}`
  );
  L.push(`- Action verbs detected: ${result.stats.actionVerbs}`);
  return L.join("\n") + "\n";
}

export const SAMPLE_RESUME = `Jane Doe — jane@example.com — (555) 010-2030

Senior frontend engineer with six years building accessible web applications.
Led migration of a legacy React dashboard to TypeScript, cutting bundle size 40%.
Built design system components adopted by four product squads.
Automated release pipeline with GitHub Actions and Docker.
Mentored three junior engineers and ran the accessibility guild.`;

export const SAMPLE_JD = `We are hiring a Senior Frontend Engineer to join our platform team.

Responsibilities:
- Build performant React interfaces with TypeScript
- Own accessibility (WCAG 2.1 AA) across the product
- Improve testing culture: unit tests, Playwright end-to-end coverage
- Collaborate with designers on our design system
- Optimize performance and bundle size

Requirements:
- Five plus years frontend experience
- Deep React and TypeScript knowledge
- Experience with GraphQL and REST APIs
- CI/CD pipelines (GitHub Actions or similar)
- Kubernetes exposure is a plus`;

export const toolConfig = {
  id: "resume-job-matcher",
  name: "Resume Job Matcher",
  category: "business",
  description: "Match your resume against job descriptions for fit score.",
  icon: "📄",
  keywords: ["resume", "job", "match", "ats", "career"],
  steps: [
    "Paste your resume text on the left and the job description on the right.",
    "Press Analyze to compute a keyword-weighted fit score out of 100.",
    "Review missing keywords — these are the JD terms your resume never mentions.",
    "Check resume health stats: word count, contact details, and action verbs."
  ],
  faqs: [
    {
      question: "How is the fit score calculated?",
      answer:
        "The tool extracts up to 40 significant terms from the job description (stopwords removed, frequency-weighted, capped at 3). Your score is the share of that total weight whose terms also appear in your resume."
    },
    {
      question: "Does it send my documents anywhere?",
      answer:
        "No. Everything runs locally in your browser — nothing is uploaded, stored, or analyzed by AI services."
    },
    {
      question: "Why did a keyword I clearly have show as missing?",
      answer:
        "Matching folds simple plurals ('builds' → 'build') but not synonyms or rewordings. If the JD says 'CI/CD pipelines' and you wrote 'continuous integration', add the exact phrasing recruiters search for."
    },
    {
      question: "Is this a real ATS?",
      answer:
        "No — it approximates the keyword-screening stage of applicant tracking systems so you can close obvious gaps before applying. Human review always follows."
    }
  ]
};

export function cleanup() {}

export function render(container) {
  container.innerHTML = `
    <style>
      .rjm-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-3); }
      @media (max-width: 800px) { .rjm-grid { grid-template-columns: 1fr; } }
      .rjm-col h3 { margin: 0 0 var(--space-2); font-size: var(--text-sm); }
      .rjm-textarea { width: 100%; min-height: 240px; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-family: ui-monospace, monospace; font-size: 13px; resize: vertical; box-sizing: border-box; }
      .rjm-actions { display: flex; gap: var(--space-2); flex-wrap: wrap; margin-bottom: var(--space-4); }
      .rjm-result { max-width: 820px; }
      .rjm-top { display: flex; gap: var(--space-4); align-items: center; background: var(--color-surface); border-radius: var(--radius-md); padding: var(--space-4); margin-bottom: var(--space-3); flex-wrap: wrap; }
      .rjm-ring { --p: 0; width: 110px; height: 110px; border-radius: 50%; background: conic-gradient(var(--ring-color) calc(var(--p)*1%), rgba(127,127,127,.15) 0); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
      .rjm-ring-inner { width: 82px; height: 82px; border-radius: 50%; background: var(--color-surface, #fff); display: flex; flex-direction: column; align-items: center; justify-content: center; }
      .rjm-score { font-size: 26px; font-weight: 700; line-height: 1; }
      .rjm-band { font-size: var(--text-xs); margin-top: 4px; color: var(--color-text-muted, #777); }
      .rjm-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: var(--space-2); }
      .rjm-chip { font-size: var(--text-xs); padding: 3px 10px; border-radius: 999px; font-weight: 600; }
      .rjm-chip.hit { background: rgba(16,185,129,.14); color: #059669; }
      .rjm-chip.miss { background: rgba(220,38,38,.1); color: #dc2626; }
      .rjm-section h4 { margin: var(--space-3) 0 var(--space-1); font-size: var(--text-sm); }
      .rjm-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--space-2); }
      .rjm-stat { background: var(--color-surface); border-radius: var(--radius-md); padding: var(--space-2) var(--space-3); font-size: var(--text-sm); }
      .rjm-copy { margin-left: auto; }
    </style>
    <div class="rjm-grid">
      <div class="rjm-col">
        <h3>Resume</h3>
        <textarea class="rjm-textarea" id="rjm-resume" placeholder="Paste your resume text…" spellcheck="false"></textarea>
      </div>
      <div class="rjm-col">
        <h3>Job Description</h3>
        <textarea class="rjm-textarea" id="rjm-jd" placeholder="Paste the job description…" spellcheck="false"></textarea>
      </div>
    </div>
    <div class="rjm-actions">
      <button type="button" class="btn-primary" id="rjm-go">Analyze</button>
      <button type="button" class="btn-secondary" id="rjm-sample">Load sample</button>
    </div>
    <div id="rjm-out"></div>
  `;
  const $ = id => container.querySelector("#" + id);
  const outEl = $("rjm-out");

  function chips(list, cls) {
    return `<div class="rjm-chips">${list
      .map(
        t => `<span class="rjm-chip ${cls}" title="weight ${t.weight}">${escapeHtml(t.term)}</span>`
      )
      .join("")}</div>`;
  }

  function renderResult(r) {
    const band = bandFor(r.score);
    outEl.innerHTML = `
      <div class="rjm-result">
        <div class="rjm-top">
          <div class="rjm-ring" style="--p:${r.score};--ring-color:${band.color}">
            <div class="rjm-ring-inner">
              <span class="rjm-score">${r.score}%</span>
              <span class="rjm-band">${escapeHtml(band.label)}</span>
            </div>
          </div>
          <div style="flex:1;min-width:240px">
            <div class="rjm-section"><h4>✅ Matched keywords (${r.matched.length})</h4>${
              r.matched.length ? chips(r.matched, "hit") : "<p class='pbc-loading'>None</p>"
            }</div>
            <div class="rjm-section"><h4>🎯 Missing keywords (${r.missing.length})</h4>${
              r.missing.length
                ? chips(r.missing.slice(0, 24), "miss")
                : "<p class='pbc-loading'>None — full coverage!</p>"
            }</div>
          </div>
        </div>
        <div class="rjm-stats">
          <div class="rjm-stat">📝 Words: <strong>${r.stats.words}</strong></div>
          <div class="rjm-stat">📧 ${r.stats.email ? escapeHtml(r.stats.email) : "Email not found"}</div>
          <div class="rjm-stat">📞 ${r.stats.phone ? escapeHtml(r.stats.phone) : "Phone not found"}</div>
          <div class="rjm-stat">💪 Action verbs: <strong>${r.stats.actionVerbs}</strong></div>
        </div>
        <div class="rjm-actions" style="margin-top:var(--space-3)">
          <button type="button" class="btn-secondary rjm-copy" id="rjm-report">Copy Markdown report</button>
        </div>
      </div>`;
    $("rjm-report").addEventListener("click", async e => copyReport(e.target));
  }

  async function copyReport(btn) {
    const { copyToClipboard } = await import("../../utils/clipboard.js");
    await copyToClipboard(
      buildMarkdownReport(analyzeMatch($("rjm-resume").value, $("rjm-jd").value)),
      btn
    );
  }

  function run() {
    const resume = $("rjm-resume").value.trim();
    const jd = $("rjm-jd").value.trim();
    if (!resume || !jd) {
      outEl.innerHTML = `<div class="rjm-stat">⚠️ Paste both a resume and a job description.</div>`;
      return;
    }
    renderResult(analyzeMatch(resume, jd));
  }

  $("rjm-go").addEventListener("click", run);
  $("rjm-sample").addEventListener("click", () => {
    $("rjm-resume").value = SAMPLE_RESUME;
    $("rjm-jd").value = SAMPLE_JD;
    run();
  });
}
