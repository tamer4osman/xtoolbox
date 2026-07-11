import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { downloadBlob } from "../../utils/file.js";
import { escapeHtml } from "../../utils/escape-html.js";

export const toolConfig = {
  id: "resume-builder",
  name: "Resume Builder",
  category: "business",
  description: "Build professional resumes with live preview and PDF export.",
  icon: "📋",
  keywords: ["resume", "cv", "career", "job", "pdf", "cover letter"],
  accept: "",
  maxSizeMB: 10
};

const STORAGE_KEY = "resume-builder-data";

const defaultState = () => ({
  personal: {
    fullName: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    summary: ""
  },
  experience: [
    { company: "", role: "", startDate: "", endDate: "", current: false, bullets: [""] }
  ],
  education: [{ school: "", degree: "", field: "", startDate: "", endDate: "", gpa: "" }],
  skills: [{ category: "Technical", items: "" }],
  template: "classic"
});

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.personal) return { ...defaultState(), ...parsed };
    }
  } catch {}
  return defaultState();
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function render(container) {
  let state = loadState();
  let saveTimer = null;

  const debouncedSave = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveState(state), 500);
  };

  container.innerHTML = `
    <div class="tool-layout">
      <header class="tool-header">
        <span class="tool-icon" aria-hidden="true">${toolConfig.icon}</span>
        <h1>${toolConfig.name}</h1>
        <p class="tool-description">${toolConfig.description}</p>
      </header>

      <div class="rb-toolbar" role="toolbar" aria-label="Resume actions">
        <div class="rb-template-select">
          <label for="rb-template" class="rb-label">Template</label>
          <select id="rb-template" class="select-input">
            <option value="classic">Classic</option>
            <option value="modern">Modern</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>
        <div class="rb-actions">
          <button type="button" id="rb-import-btn" class="btn btn-secondary btn-sm" aria-label="Import resume data from JSON file">Import JSON</button>
          <button type="button" id="rb-export-btn" class="btn btn-secondary btn-sm" aria-label="Export resume data as JSON file">Export JSON</button>
          <button type="button" id="rb-pdf-btn" class="btn btn-primary" aria-label="Download resume as PDF">Download PDF</button>
        </div>
        <input type="file" id="rb-file-input" accept=".json" class="rb-file-input" aria-hidden="true" tabindex="-1" />
      </div>

      <div class="rb-main">
        <form class="rb-form" id="rb-form" aria-label="Resume editor">
          <fieldset class="rb-fieldset">
            <legend class="rb-legend">Personal Information</legend>
            <div class="rb-grid">
              <div class="form-group">
                <label for="rb-name" class="rb-label">Full Name <span aria-hidden="true">*</span></label>
                <input type="text" id="rb-name" class="text-input" required aria-required="true" placeholder="Jane Doe" />
              </div>
              <div class="form-group">
                <label for="rb-title" class="rb-label">Job Title</label>
                <input type="text" id="rb-title" class="text-input" placeholder="Senior Software Engineer" />
              </div>
              <div class="form-group">
                <label for="rb-email" class="rb-label">Email</label>
                <input type="email" id="rb-email" class="text-input" placeholder="jane@example.com" />
              </div>
              <div class="form-group">
                <label for="rb-phone" class="rb-label">Phone</label>
                <input type="tel" id="rb-phone" class="text-input" placeholder="+1 (555) 123-4567" />
              </div>
              <div class="form-group">
                <label for="rb-location" class="rb-label">Location</label>
                <input type="text" id="rb-location" class="text-input" placeholder="San Francisco, CA" />
              </div>
              <div class="form-group">
                <label for="rb-website" class="rb-label">Website</label>
                <input type="url" id="rb-website" class="text-input" placeholder="https://janedoe.dev" />
              </div>
            </div>
            <div class="form-group">
              <label for="rb-summary" class="rb-label">Professional Summary</label>
              <textarea id="rb-summary" class="textarea-input" rows="3" placeholder="Experienced engineer with 8+ years building scalable web applications..."></textarea>
            </div>
          </fieldset>

          <fieldset class="rb-fieldset">
            <legend class="rb-legend">Work Experience</legend>
            <div id="rb-experience-list"></div>
            <button type="button" id="rb-add-experience" class="btn btn-secondary btn-sm rb-add-btn">+ Add Experience</button>
          </fieldset>

          <fieldset class="rb-fieldset">
            <legend class="rb-legend">Education</legend>
            <div id="rb-education-list"></div>
            <button type="button" id="rb-add-education" class="btn btn-secondary btn-sm rb-add-btn">+ Add Education</button>
          </fieldset>

          <fieldset class="rb-fieldset">
            <legend class="rb-legend">Skills</legend>
            <div id="rb-skills-list"></div>
            <button type="button" id="rb-add-skill" class="btn btn-secondary btn-sm rb-add-btn">+ Add Skill Category</button>
          </fieldset>
        </form>

        <aside class="rb-preview" aria-label="Resume preview">
          <div class="rb-preview-header">
            <h2 class="rb-preview-title">Preview</h2>
          </div>
          <div id="rb-preview-content" class="rb-preview-content"></div>
        </aside>
      </div>
    </div>

    <style>
      .rb-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-4);
        padding: var(--space-4);
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        margin-bottom: var(--space-6);
        flex-wrap: wrap;
      }
      .rb-template-select { display: flex; align-items: center; gap: var(--space-2); }
      .rb-actions { display: flex; gap: var(--space-2); flex-wrap: wrap; }
      .rb-file-input { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }
      .rb-main {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--space-6);
        align-items: start;
      }
      .rb-form { min-width: 0; }
      .rb-fieldset {
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        padding: var(--space-6);
        margin-bottom: var(--space-6);
        background: var(--color-bg);
      }
      .rb-legend {
        font-size: var(--text-lg);
        font-weight: 600;
        color: var(--color-text);
        padding: 0 var(--space-2);
      }
      .rb-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--space-4);
      }
      .rb-label {
        display: block;
        font-size: var(--text-sm);
        font-weight: 500;
        color: var(--color-text);
        margin-bottom: var(--space-2);
      }
      .rb-add-btn { margin-top: var(--space-4); }
      .rb-entry {
        padding: var(--space-4);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        margin-bottom: var(--space-4);
        background: var(--color-surface);
        position: relative;
      }
      .rb-entry-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--space-3);
      }
      .rb-entry-title { font-weight: 600; font-size: var(--text-sm); color: var(--color-text-secondary); }
      .rb-remove-btn {
        background: none;
        border: none;
        color: var(--color-text-muted);
        cursor: pointer;
        padding: var(--space-1);
        font-size: var(--text-lg);
        line-height: 1;
        border-radius: var(--radius-sm);
        transition: color 0.2s, background 0.2s;
      }
      .rb-remove-btn:hover { color: var(--color-error); background: rgba(239,68,68,0.1); }
      .rb-bullet-row {
        display: flex;
        gap: var(--space-2);
        align-items: center;
        margin-bottom: var(--space-2);
      }
      .rb-bullet-row .text-input { flex: 1; }
      .rb-bullet-remove {
        background: none;
        border: none;
        color: var(--color-text-muted);
        cursor: pointer;
        font-size: var(--text-sm);
        padding: var(--space-1);
        border-radius: var(--radius-sm);
        transition: color 0.2s;
      }
      .rb-bullet-remove:hover { color: var(--color-error); }
      .rb-add-bullet {
        background: none;
        border: 1px dashed var(--color-border);
        color: var(--color-text-secondary);
        cursor: pointer;
        padding: var(--space-1) var(--space-3);
        font-size: var(--text-xs);
        border-radius: var(--radius-sm);
        transition: border-color 0.2s, color 0.2s;
      }
      .rb-add-bullet:hover { border-color: var(--color-primary); color: var(--color-primary); }
      .rb-checkbox-row {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        margin-bottom: var(--space-3);
      }
      .rb-checkbox-row label {
        font-size: var(--text-sm);
        color: var(--color-text);
        cursor: pointer;
        margin-bottom: 0;
      }
      .rb-checkbox-row input[type="checkbox"] {
        width: 16px;
        height: 16px;
        accent-color: var(--color-primary);
      }
      .rb-preview {
        position: sticky;
        top: var(--space-4);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        background: var(--color-bg);
        overflow: hidden;
      }
      .rb-preview-header {
        padding: var(--space-3) var(--space-4);
        border-bottom: 1px solid var(--color-border);
        background: var(--color-surface);
      }
      .rb-preview-title {
        font-size: var(--text-sm);
        font-weight: 600;
        color: var(--color-text-secondary);
        margin: 0;
      }
      .rb-preview-content {
        padding: var(--space-6);
        min-height: 400px;
        font-size: var(--text-sm);
        line-height: 1.5;
      }
      .rb-p-name { font-size: var(--text-2xl); font-weight: 700; color: var(--color-text); margin-bottom: var(--space-1); }
      .rb-p-title { font-size: var(--text-base); color: var(--color-text-secondary); margin-bottom: var(--space-2); }
      .rb-p-contact {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-3);
        font-size: var(--text-xs);
        color: var(--color-text-muted);
        margin-bottom: var(--space-4);
        padding-bottom: var(--space-4);
        border-bottom: 1px solid var(--color-border);
      }
      .rb-p-contact span { white-space: nowrap; }
      .rb-p-section { margin-bottom: var(--space-4); }
      .rb-p-section-title {
        font-size: var(--text-sm);
        font-weight: 700;
        color: var(--color-text);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: var(--space-2);
        padding-bottom: var(--space-1);
        border-bottom: 2px solid var(--color-primary);
      }
      .rb-p-summary { font-size: var(--text-sm); color: var(--color-text-secondary); margin-bottom: var(--space-4); }
      .rb-p-entry { margin-bottom: var(--space-3); }
      .rb-p-entry-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: var(--space-1); }
      .rb-p-entry-role { font-weight: 600; color: var(--color-text); }
      .rb-p-entry-dates { font-size: var(--text-xs); color: var(--color-text-muted); white-space: nowrap; }
      .rb-p-entry-company { font-size: var(--text-sm); color: var(--color-text-secondary); margin-bottom: var(--space-1); }
      .rb-p-entry-detail { font-size: var(--text-xs); color: var(--color-text-secondary); margin-left: var(--space-4); }
      .rb-p-entry-detail::before { content: "\\2022 "; color: var(--color-text-muted); }
      .rb-p-skills-grid { display: flex; flex-wrap: wrap; gap: var(--space-2); }
      .rb-p-skill-tag {
        font-size: var(--text-xs);
        background: var(--color-primary-light);
        color: var(--color-primary);
        padding: var(--space-1) var(--space-2);
        border-radius: var(--radius-sm);
        font-weight: 500;
      }
      .rb-p-empty { color: var(--color-text-muted); font-style: italic; text-align: center; padding: var(--space-8); }

      .rb-modern-layout { display: grid; grid-template-columns: 200px 1fr; gap: 0; }
      .rb-modern-sidebar {
        background: var(--color-primary);
        color: white;
        padding: var(--space-6);
      }
      .rb-modern-sidebar .rb-p-name { color: white; font-size: var(--text-xl); }
      .rb-modern-sidebar .rb-p-title { color: rgba(255,255,255,0.8); font-size: var(--text-sm); }
      .rb-modern-sidebar .rb-p-contact { flex-direction: column; gap: var(--space-2); border-bottom-color: rgba(255,255,255,0.2); padding-bottom: var(--space-4); margin-bottom: var(--space-4); }
      .rb-modern-sidebar .rb-p-contact span { color: rgba(255,255,255,0.9); }
      .rb-modern-sidebar .rb-p-section-title { color: white; border-bottom-color: rgba(255,255,255,0.3); }
      .rb-modern-sidebar .rb-p-skill-tag { background: rgba(255,255,255,0.2); color: white; }
      .rb-modern-sidebar .rb-p-summary { color: rgba(255,255,255,0.85); }
      .rb-modern-content { padding: var(--space-6); }

      .rb-minimal .rb-p-name { text-align: center; font-size: var(--text-3xl); letter-spacing: 0.02em; }
      .rb-minimal .rb-p-title { text-align: center; color: var(--color-text-secondary); }
      .rb-minimal .rb-p-contact { justify-content: center; border-bottom: none; padding-bottom: 0; margin-bottom: var(--space-6); }
      .rb-minimal .rb-p-section-title { border-bottom: 1px solid var(--color-border); text-align: left; }
      .rb-minimal .rb-p-section { border-left: none; padding-left: 0; }

      @media (max-width: 768px) {
        .rb-main { grid-template-columns: 1fr; }
        .rb-grid { grid-template-columns: 1fr; }
        .rb-toolbar { flex-direction: column; align-items: stretch; }
        .rb-actions { justify-content: center; }
        .rb-preview { position: static; }
        .rb-modern-layout { grid-template-columns: 1fr; }
        .rb-modern-sidebar { padding: var(--space-4); }
      }
    </style>
  `;

  const $ = sel => container.querySelector(sel);
  const $$ = sel => Array.from(container.querySelectorAll(sel));

  $("#rb-template").value = state.template;

  function syncPersonal() {
    state.personal.fullName = $("#rb-name").value;
    state.personal.title = $("#rb-title").value;
    state.personal.email = $("#rb-email").value;
    state.personal.phone = $("#rb-phone").value;
    state.personal.location = $("#rb-location").value;
    state.personal.website = $("#rb-website").value;
    state.personal.summary = $("#rb-summary").value;
  }

  function loadPersonal() {
    $("#rb-name").value = state.personal.fullName;
    $("#rb-title").value = state.personal.title;
    $("#rb-email").value = state.personal.email;
    $("#rb-phone").value = state.personal.phone;
    $("#rb-location").value = state.personal.location;
    $("#rb-website").value = state.personal.website;
    $("#rb-summary").value = state.personal.summary;
  }

  function renderExperience() {
    const list = $("#rb-experience-list");
    list.innerHTML = state.experience
      .map(
        (exp, i) => `
      <div class="rb-entry" data-idx="${i}">
        <div class="rb-entry-header">
          <span class="rb-entry-title">Experience ${i + 1}</span>
          <button type="button" class="rb-remove-btn" data-action="remove-exp" data-idx="${i}" aria-label="Remove experience entry ${i + 1}">&times;</button>
        </div>
        <div class="rb-grid">
          <div class="form-group">
            <label for="rb-exp-company-${i}" class="rb-label">Company</label>
            <input type="text" id="rb-exp-company-${i}" class="text-input exp-company" data-idx="${i}" value="${escapeHtml(exp.company)}" placeholder="Acme Corp" />
          </div>
          <div class="form-group">
            <label for="rb-exp-role-${i}" class="rb-label">Role</label>
            <input type="text" id="rb-exp-role-${i}" class="text-input exp-role" data-idx="${i}" value="${escapeHtml(exp.role)}" placeholder="Software Engineer" />
          </div>
          <div class="form-group">
            <label for="rb-exp-start-${i}" class="rb-label">Start Date</label>
            <input type="month" id="rb-exp-start-${i}" class="text-input exp-start" data-idx="${i}" value="${exp.startDate}" />
          </div>
          <div class="form-group">
            <label for="rb-exp-end-${i}" class="rb-label">End Date</label>
            <input type="month" id="rb-exp-end-${i}" class="text-input exp-end" data-idx="${i}" value="${exp.endDate}" ${exp.current ? "disabled" : ""} />
          </div>
        </div>
        <div class="rb-checkbox-row">
          <input type="checkbox" id="rb-exp-current-${i}" class="exp-current" data-idx="${i}" ${exp.current ? "checked" : ""} />
          <label for="rb-exp-current-${i}">Currently working here</label>
        </div>
        <div class="form-group">
          <label class="rb-label">Bullet Points</label>
          <div class="exp-bullets" data-idx="${i}">
            ${exp.bullets
              .map(
                (b, bi) => `
              <div class="rb-bullet-row">
                <input type="text" class="text-input exp-bullet" data-exp="${i}" data-bi="${bi}" value="${escapeHtml(b)}" placeholder="Describe your achievement..." />
                <button type="button" class="rb-bullet-remove" data-action="remove-bullet" data-exp="${i}" data-bi="${bi}" aria-label="Remove bullet point">&times;</button>
              </div>
            `
              )
              .join("")}
          </div>
          <button type="button" class="rb-add-bullet" data-action="add-bullet" data-idx="${i}">+ Add bullet</button>
        </div>
      </div>
    `
      )
      .join("");
    bindExperienceListeners();
  }

  function bindExperienceListeners() {
    $$(".exp-company").forEach(el =>
      el.addEventListener("input", e => {
        state.experience[Number(e.target.dataset.idx)].company = e.target.value;
        debouncedSave();
        renderPreview();
      })
    );
    $$(".exp-role").forEach(el =>
      el.addEventListener("input", e => {
        state.experience[Number(e.target.dataset.idx)].role = e.target.value;
        debouncedSave();
        renderPreview();
      })
    );
    $$(".exp-start").forEach(el =>
      el.addEventListener("input", e => {
        state.experience[Number(e.target.dataset.idx)].startDate = e.target.value;
        debouncedSave();
        renderPreview();
      })
    );
    $$(".exp-end").forEach(el =>
      el.addEventListener("input", e => {
        state.experience[Number(e.target.dataset.idx)].endDate = e.target.value;
        debouncedSave();
        renderPreview();
      })
    );
    $$(".exp-current").forEach(el =>
      el.addEventListener("change", e => {
        const idx = Number(e.target.dataset.idx);
        state.experience[idx].current = e.target.checked;
        const endInput = $(`#rb-exp-end-${idx}`);
        if (endInput) endInput.disabled = e.target.checked;
        if (e.target.checked) state.experience[idx].endDate = "";
        debouncedSave();
        renderPreview();
      })
    );
    $$(".exp-bullet").forEach(el =>
      el.addEventListener("input", e => {
        const ei = Number(e.target.dataset.exp);
        const bi = Number(e.target.dataset.bi);
        state.experience[ei].bullets[bi] = e.target.value;
        debouncedSave();
        renderPreview();
      })
    );
    $$('[data-action="remove-exp"]').forEach(el =>
      el.addEventListener("click", e => {
        const idx = Number(e.target.dataset.idx);
        state.experience.splice(idx, 1);
        if (state.experience.length === 0)
          state.experience.push({
            company: "",
            role: "",
            startDate: "",
            endDate: "",
            current: false,
            bullets: [""]
          });
        renderExperience();
        debouncedSave();
        renderPreview();
      })
    );
    $$('[data-action="add-bullet"]').forEach(el =>
      el.addEventListener("click", e => {
        const idx = Number(e.target.dataset.idx);
        state.experience[idx].bullets.push("");
        renderExperience();
        debouncedSave();
      })
    );
    $$('[data-action="remove-bullet"]').forEach(el =>
      el.addEventListener("click", e => {
        const ei = Number(e.target.dataset.exp);
        const bi = Number(e.target.dataset.bi);
        state.experience[ei].bullets.splice(bi, 1);
        if (state.experience[ei].bullets.length === 0) state.experience[ei].bullets.push("");
        renderExperience();
        debouncedSave();
        renderPreview();
      })
    );
  }

  function renderEducation() {
    const list = $("#rb-education-list");
    list.innerHTML = state.education
      .map(
        (edu, i) => `
      <div class="rb-entry" data-idx="${i}">
        <div class="rb-entry-header">
          <span class="rb-entry-title">Education ${i + 1}</span>
          <button type="button" class="rb-remove-btn" data-action="remove-edu" data-idx="${i}" aria-label="Remove education entry ${i + 1}">&times;</button>
        </div>
        <div class="rb-grid">
          <div class="form-group">
            <label for="rb-edu-school-${i}" class="rb-label">School</label>
            <input type="text" id="rb-edu-school-${i}" class="text-input edu-school" data-idx="${i}" value="${escapeHtml(edu.school)}" placeholder="MIT" />
          </div>
          <div class="form-group">
            <label for="rb-edu-degree-${i}" class="rb-label">Degree</label>
            <input type="text" id="rb-edu-degree-${i}" class="text-input edu-degree" data-idx="${i}" value="${escapeHtml(edu.degree)}" placeholder="B.S." />
          </div>
          <div class="form-group">
            <label for="rb-edu-field-${i}" class="rb-label">Field of Study</label>
            <input type="text" id="rb-edu-field-${i}" class="text-input edu-field" data-idx="${i}" value="${escapeHtml(edu.field)}" placeholder="Computer Science" />
          </div>
          <div class="form-group">
            <label for="rb-edu-gpa-${i}" class="rb-label">GPA</label>
            <input type="text" id="rb-edu-gpa-${i}" class="text-input edu-gpa" data-idx="${i}" value="${escapeHtml(edu.gpa)}" placeholder="3.8/4.0" />
          </div>
          <div class="form-group">
            <label for="rb-edu-start-${i}" class="rb-label">Start Date</label>
            <input type="month" id="rb-edu-start-${i}" class="text-input edu-start" data-idx="${i}" value="${edu.startDate}" />
          </div>
          <div class="form-group">
            <label for="rb-edu-end-${i}" class="rb-label">End Date</label>
            <input type="month" id="rb-edu-end-${i}" class="text-input edu-end" data-idx="${i}" value="${edu.endDate}" />
          </div>
        </div>
      </div>
    `
      )
      .join("");
    bindEducationListeners();
  }

  function bindEducationListeners() {
    $$(".edu-school").forEach(el =>
      el.addEventListener("input", e => {
        state.education[Number(e.target.dataset.idx)].school = e.target.value;
        debouncedSave();
        renderPreview();
      })
    );
    $$(".edu-degree").forEach(el =>
      el.addEventListener("input", e => {
        state.education[Number(e.target.dataset.idx)].degree = e.target.value;
        debouncedSave();
        renderPreview();
      })
    );
    $$(".edu-field").forEach(el =>
      el.addEventListener("input", e => {
        state.education[Number(e.target.dataset.idx)].field = e.target.value;
        debouncedSave();
        renderPreview();
      })
    );
    $$(".edu-gpa").forEach(el =>
      el.addEventListener("input", e => {
        state.education[Number(e.target.dataset.idx)].gpa = e.target.value;
        debouncedSave();
        renderPreview();
      })
    );
    $$(".edu-start").forEach(el =>
      el.addEventListener("input", e => {
        state.education[Number(e.target.dataset.idx)].startDate = e.target.value;
        debouncedSave();
        renderPreview();
      })
    );
    $$(".edu-end").forEach(el =>
      el.addEventListener("input", e => {
        state.education[Number(e.target.dataset.idx)].endDate = e.target.value;
        debouncedSave();
        renderPreview();
      })
    );
    $$('[data-action="remove-edu"]').forEach(el =>
      el.addEventListener("click", e => {
        const idx = Number(e.target.dataset.idx);
        state.education.splice(idx, 1);
        if (state.education.length === 0)
          state.education.push({
            school: "",
            degree: "",
            field: "",
            startDate: "",
            endDate: "",
            gpa: ""
          });
        renderEducation();
        debouncedSave();
        renderPreview();
      })
    );
  }

  function renderSkills() {
    const list = $("#rb-skills-list");
    list.innerHTML = state.skills
      .map(
        (sk, i) => `
      <div class="rb-entry" data-idx="${i}">
        <div class="rb-entry-header">
          <span class="rb-entry-title">Skill Category ${i + 1}</span>
          <button type="button" class="rb-remove-btn" data-action="remove-skill" data-idx="${i}" aria-label="Remove skill category ${i + 1}">&times;</button>
        </div>
        <div class="rb-grid">
          <div class="form-group">
            <label for="rb-skill-cat-${i}" class="rb-label">Category Name</label>
            <input type="text" id="rb-skill-cat-${i}" class="text-input skill-cat" data-idx="${i}" value="${escapeHtml(sk.category)}" placeholder="Technical" />
          </div>
          <div class="form-group">
            <label for="rb-skill-items-${i}" class="rb-label">Skills (comma-separated)</label>
            <input type="text" id="rb-skill-items-${i}" class="text-input skill-items" data-idx="${i}" value="${escapeHtml(sk.items)}" placeholder="JavaScript, React, Node.js" />
          </div>
        </div>
      </div>
    `
      )
      .join("");
    bindSkillListeners();
  }

  function bindSkillListeners() {
    $$(".skill-cat").forEach(el =>
      el.addEventListener("input", e => {
        state.skills[Number(e.target.dataset.idx)].category = e.target.value;
        debouncedSave();
        renderPreview();
      })
    );
    $$(".skill-items").forEach(el =>
      el.addEventListener("input", e => {
        state.skills[Number(e.target.dataset.idx)].items = e.target.value;
        debouncedSave();
        renderPreview();
      })
    );
    $$('[data-action="remove-skill"]').forEach(el =>
      el.addEventListener("click", e => {
        const idx = Number(e.target.dataset.idx);
        state.skills.splice(idx, 1);
        if (state.skills.length === 0) state.skills.push({ category: "Technical", items: "" });
        renderSkills();
        debouncedSave();
        renderPreview();
      })
    );
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    const [y, m] = dateStr.split("-");
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];
    return months[Number(m) - 1] + " " + y;
  }

  function renderPreview() {
    const p = state.personal;
    const hasContent =
      p.fullName ||
      p.title ||
      p.summary ||
      state.experience.some(e => e.company || e.role) ||
      state.education.some(e => e.school) ||
      state.skills.some(s => s.items);

    if (!hasContent) {
      $("#rb-preview-content").innerHTML =
        '<p class="rb-p-empty">Start filling in your details to see a live preview.</p>';
      return;
    }

    const isModern = state.template === "modern";
    const isMinimal = state.template === "minimal";

    const contactParts = [p.email, p.phone, p.location, p.website].filter(Boolean);
    const contactHtml = contactParts.length
      ? `<div class="rb-p-contact">${contactParts.map(c => `<span>${escapeHtml(c)}</span>`).join("")}</div>`
      : "";

    const summaryHtml = p.summary
      ? `<div class="rb-p-section"><div class="rb-p-section-title">Summary</div><p class="rb-p-summary">${escapeHtml(p.summary)}</p></div>`
      : "";

    const experienceHtml = state.experience.some(e => e.company || e.role)
      ? `<div class="rb-p-section"><div class="rb-p-section-title">Experience</div>${state.experience
          .filter(e => e.company || e.role)
          .map(
            exp => `
          <div class="rb-p-entry">
            <div class="rb-p-entry-header">
              <span class="rb-p-entry-role">${escapeHtml(exp.role || "Role")}</span>
              <span class="rb-p-entry-dates">${formatDate(exp.startDate)}${exp.startDate ? " - " : ""}${exp.current ? "Present" : formatDate(exp.endDate)}</span>
            </div>
            <div class="rb-p-entry-company">${escapeHtml(exp.company || "Company")}</div>
            ${exp.bullets
              .filter(b => b.trim())
              .map(b => `<div class="rb-p-entry-detail">${escapeHtml(b)}</div>`)
              .join("")}
          </div>
        `
          )
          .join("")}</div>`
      : "";

    const educationHtml = state.education.some(e => e.school)
      ? `<div class="rb-p-section"><div class="rb-p-section-title">Education</div>${state.education
          .filter(e => e.school)
          .map(
            edu => `
          <div class="rb-p-entry">
            <div class="rb-p-entry-header">
              <span class="rb-p-entry-role">${escapeHtml(edu.degree || "Degree")}${edu.field ? " in " + escapeHtml(edu.field) : ""}</span>
              <span class="rb-p-entry-dates">${formatDate(edu.startDate)}${edu.startDate ? " - " : ""}${formatDate(edu.endDate)}</span>
            </div>
            <div class="rb-p-entry-company">${escapeHtml(edu.school || "School")}${edu.gpa ? " | GPA: " + escapeHtml(edu.gpa) : ""}</div>
          </div>
        `
          )
          .join("")}</div>`
      : "";

    const allSkills = state.skills.filter(s => s.items.trim());
    const skillsHtml = allSkills.length
      ? `<div class="rb-p-section"><div class="rb-p-section-title">Skills</div><div class="rb-p-skills-grid">${allSkills
          .map(s =>
            s.items
              .split(",")
              .map(sk => sk.trim())
              .filter(Boolean)
              .map(sk => `<span class="rb-p-skill-tag">${escapeHtml(sk)}</span>`)
              .join("")
          )
          .join("")}</div></div>`
      : "";

    const headerHtml = `<div class="rb-p-name">${escapeHtml(p.fullName || "Your Name")}</div>${p.title ? `<div class="rb-p-title">${escapeHtml(p.title)}</div>` : ""}`;

    let html = "";
    if (isModern) {
      html = `<div class="rb-modern-layout"><div class="rb-modern-sidebar">${headerHtml}${contactHtml}${skillsHtml}</div><div class="rb-modern-content">${summaryHtml}${experienceHtml}${educationHtml}</div></div>`;
    } else {
      const wrapperClass = isMinimal ? "rb-minimal" : "";
      html = `<div class="${wrapperClass}">${headerHtml}${contactHtml}${summaryHtml}${experienceHtml}${educationHtml}${skillsHtml}</div>`;
    }

    $("#rb-preview-content").innerHTML = html;
  }

  function syncAllFromDOM() {
    syncPersonal();
    $$(".exp-company").forEach(el => {
      state.experience[Number(el.dataset.idx)].company = el.value;
    });
    $$(".exp-role").forEach(el => {
      state.experience[Number(el.dataset.idx)].role = el.value;
    });
    $$(".exp-start").forEach(el => {
      state.experience[Number(el.dataset.idx)].startDate = el.value;
    });
    $$(".exp-end").forEach(el => {
      state.experience[Number(el.dataset.idx)].endDate = el.value;
    });
    $$(".exp-current").forEach(el => {
      state.experience[Number(el.dataset.idx)].current = el.checked;
    });
    $$(".exp-bullet").forEach(el => {
      const ei = Number(el.dataset.exp);
      const bi = Number(el.dataset.bi);
      state.experience[ei].bullets[bi] = el.value;
    });
    $$(".edu-school").forEach(el => {
      state.education[Number(el.dataset.idx)].school = el.value;
    });
    $$(".edu-degree").forEach(el => {
      state.education[Number(el.dataset.idx)].degree = el.value;
    });
    $$(".edu-field").forEach(el => {
      state.education[Number(el.dataset.idx)].field = el.value;
    });
    $$(".edu-gpa").forEach(el => {
      state.education[Number(el.dataset.idx)].gpa = el.value;
    });
    $$(".edu-start").forEach(el => {
      state.education[Number(el.dataset.idx)].startDate = el.value;
    });
    $$(".edu-end").forEach(el => {
      state.education[Number(el.dataset.idx)].endDate = el.value;
    });
    $$(".skill-cat").forEach(el => {
      state.skills[Number(el.dataset.idx)].category = el.value;
    });
    $$(".skill-items").forEach(el => {
      state.skills[Number(el.dataset.idx)].items = el.value;
    });
  }

  async function generatePDF() {
    syncAllFromDOM();
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const { width, height } = page.getSize();
    const margin = 50;
    const contentWidth = width - margin * 2;
    let y = height - margin;

    const p = state.personal;

    if (state.template === "modern") {
      const sidebarWidth = 175;
      page.drawRectangle({
        x: 0,
        y: 0,
        width: sidebarWidth,
        height,
        color: rgb(0.145, 0.388, 0.922)
      });
      let sy = height - 40;
      const drawSidebar = (text, x, yPos, f, size, color) => {
        page.drawText(text, { x, y: yPos, size, font: f, color });
      };
      drawSidebar(p.fullName || "Your Name", 15, sy, fontBold, 14, rgb(1, 1, 1));
      sy -= 20;
      if (p.title) {
        drawSidebar(p.title, 15, sy, font, 9, rgb(0.9, 0.9, 0.9));
        sy -= 15;
      }
      sy -= 10;
      [p.email, p.phone, p.location, p.website].filter(Boolean).forEach(c => {
        const lines = wrapText(c, font, 8, sidebarWidth - 20);
        lines.forEach(line => {
          drawSidebar(line, 15, sy, font, 8, rgb(0.95, 0.95, 0.95));
          sy -= 12;
        });
      });
      sy -= 15;
      const allSkills = state.skills.filter(s => s.items.trim());
      if (allSkills.length) {
        drawSidebar("SKILLS", 15, sy, fontBold, 9, rgb(1, 1, 1));
        sy -= 15;
        allSkills.forEach(s => {
          drawSidebar(s.category, 15, sy, fontBold, 8, rgb(0.9, 0.9, 0.9));
          sy -= 12;
          s.items
            .split(",")
            .map(sk => sk.trim())
            .filter(Boolean)
            .forEach(sk => {
              drawSidebar(sk, 15, sy, font, 8, rgb(0.85, 0.85, 0.85));
              sy -= 11;
            });
          sy -= 3;
        });
      }

      let rx = sidebarWidth + 20;
      let ry = height - 40;
      if (p.summary) {
        page.drawText("SUMMARY", {
          x: rx,
          y: ry,
          size: 11,
          font: fontBold,
          color: rgb(0.145, 0.388, 0.922)
        });
        ry -= 3;
        page.drawRectangle({
          x: rx,
          y: ry,
          width: contentWidth - sidebarWidth - 20,
          height: 1.5,
          color: rgb(0.145, 0.388, 0.922)
        });
        ry -= 15;
        wrapText(p.summary, font, 9, contentWidth - sidebarWidth - 20).forEach(line => {
          page.drawText(line, { x: rx, y: ry, size: 9, font, color: rgb(0.2, 0.2, 0.2) });
          ry -= 13;
        });
        ry -= 10;
      }
      if (state.experience.some(e => e.company || e.role)) {
        page.drawText("EXPERIENCE", {
          x: rx,
          y: ry,
          size: 11,
          font: fontBold,
          color: rgb(0.145, 0.388, 0.922)
        });
        ry -= 3;
        page.drawRectangle({
          x: rx,
          y: ry,
          width: contentWidth - sidebarWidth - 20,
          height: 1.5,
          color: rgb(0.145, 0.388, 0.922)
        });
        ry -= 15;
        state.experience
          .filter(e => e.company || e.role)
          .forEach(exp => {
            page.drawText(exp.role || "Role", {
              x: rx,
              y: ry,
              size: 10,
              font: fontBold,
              color: rgb(0.1, 0.1, 0.1)
            });
            const dateStr =
              (exp.startDate ? formatDate(exp.startDate) : "") +
              (exp.startDate ? " - " : "") +
              (exp.current ? "Present" : formatDate(exp.endDate));
            page.drawText(dateStr, {
              x: width - margin - 100,
              y: ry,
              size: 8,
              font,
              color: rgb(0.5, 0.5, 0.5)
            });
            ry -= 13;
            page.drawText(exp.company || "Company", {
              x: rx,
              y: ry,
              size: 9,
              font,
              color: rgb(0.3, 0.3, 0.3)
            });
            ry -= 13;
            exp.bullets
              .filter(b => b.trim())
              .forEach(b => {
                wrapText(b, font, 8, contentWidth - sidebarWidth - 35).forEach((line, li) => {
                  page.drawText((li === 0 ? "\u2022 " : "  ") + line, {
                    x: rx + 5,
                    y: ry,
                    size: 8,
                    font,
                    color: rgb(0.25, 0.25, 0.25)
                  });
                  ry -= 11;
                });
              });
            ry -= 8;
          });
      }
      if (state.education.some(e => e.school)) {
        if (ry < 120) ry = 120;
        page.drawText("EDUCATION", {
          x: rx,
          y: ry,
          size: 11,
          font: fontBold,
          color: rgb(0.145, 0.388, 0.922)
        });
        ry -= 3;
        page.drawRectangle({
          x: rx,
          y: ry,
          width: contentWidth - sidebarWidth - 20,
          height: 1.5,
          color: rgb(0.145, 0.388, 0.922)
        });
        ry -= 15;
        state.education
          .filter(e => e.school)
          .forEach(edu => {
            page.drawText((edu.degree || "Degree") + (edu.field ? " in " + edu.field : ""), {
              x: rx,
              y: ry,
              size: 10,
              font: fontBold,
              color: rgb(0.1, 0.1, 0.1)
            });
            ry -= 13;
            page.drawText(edu.school || "School", {
              x: rx,
              y: ry,
              size: 9,
              font,
              color: rgb(0.3, 0.3, 0.3)
            });
            ry -= 13;
          });
      }
    } else {
      const isMinimal = state.template === "minimal";
      page.drawText(p.fullName || "Your Name", {
        x: isMinimal
          ? width / 2 - font.widthOfTextAtSize(p.fullName || "Your Name", 20) / 2
          : margin,
        y,
        size: 20,
        font: fontBold,
        color: rgb(0.1, 0.1, 0.1)
      });
      y -= 20;
      if (p.title) {
        page.drawText(p.title, {
          x: isMinimal ? width / 2 - font.widthOfTextAtSize(p.title, 11) / 2 : margin,
          y,
          size: 11,
          font,
          color: rgb(0.4, 0.4, 0.4)
        });
        y -= 18;
      }
      const contactParts = [p.email, p.phone, p.location, p.website].filter(Boolean);
      if (contactParts.length) {
        const contactStr = contactParts.join("  |  ");
        page.drawText(contactStr, {
          x: isMinimal ? width / 2 - font.widthOfTextAtSize(contactStr, 8) / 2 : margin,
          y,
          size: 8,
          font,
          color: rgb(0.5, 0.5, 0.5)
        });
        y -= 15;
      }
      y -= 5;
      if (!isMinimal) {
        page.drawRectangle({
          x: margin,
          y,
          width: contentWidth,
          height: 1,
          color: rgb(0.8, 0.8, 0.8)
        });
        y -= 15;
      } else {
        y -= 10;
      }

      const drawSection = title => {
        page.drawText(title.toUpperCase(), {
          x: margin,
          y,
          size: 10,
          font: fontBold,
          color: isMinimal ? rgb(0.1, 0.1, 0.1) : rgb(0.145, 0.388, 0.922)
        });
        y -= 3;
        page.drawRectangle({
          x: margin,
          y,
          width: contentWidth,
          height: isMinimal ? 0.5 : 1.5,
          color: isMinimal ? rgb(0.7, 0.7, 0.7) : rgb(0.145, 0.388, 0.922)
        });
        y -= 15;
      };

      if (p.summary) {
        drawSection("Summary");
        wrapText(p.summary, font, 9, contentWidth).forEach(line => {
          page.drawText(line, { x: margin, y, size: 9, font, color: rgb(0.2, 0.2, 0.2) });
          y -= 13;
        });
        y -= 10;
      }

      if (state.experience.some(e => e.company || e.role)) {
        drawSection("Experience");
        state.experience
          .filter(e => e.company || e.role)
          .forEach(exp => {
            page.drawText(exp.role || "Role", {
              x: margin,
              y,
              size: 10,
              font: fontBold,
              color: rgb(0.1, 0.1, 0.1)
            });
            const dateStr =
              (exp.startDate ? formatDate(exp.startDate) : "") +
              (exp.startDate ? " - " : "") +
              (exp.current ? "Present" : formatDate(exp.endDate));
            page.drawText(dateStr, {
              x: width - margin - 100,
              y,
              size: 8,
              font,
              color: rgb(0.5, 0.5, 0.5)
            });
            y -= 13;
            page.drawText(exp.company || "Company", {
              x: margin,
              y,
              size: 9,
              font,
              color: rgb(0.3, 0.3, 0.3)
            });
            y -= 13;
            exp.bullets
              .filter(b => b.trim())
              .forEach(b => {
                wrapText(b, font, 8, contentWidth - 15).forEach((line, li) => {
                  page.drawText((li === 0 ? "\u2022 " : "  ") + line, {
                    x: margin + 5,
                    y,
                    size: 8,
                    font,
                    color: rgb(0.25, 0.25, 0.25)
                  });
                  y -= 11;
                });
              });
            y -= 8;
          });
      }

      if (state.education.some(e => e.school)) {
        if (y < 120) {
          page.drawText("", { x: margin, y });
          y = height - margin;
        }
        drawSection("Education");
        state.education
          .filter(e => e.school)
          .forEach(edu => {
            page.drawText((edu.degree || "Degree") + (edu.field ? " in " + edu.field : ""), {
              x: margin,
              y,
              size: 10,
              font: fontBold,
              color: rgb(0.1, 0.1, 0.1)
            });
            const dateStr =
              (edu.startDate ? formatDate(edu.startDate) : "") +
              (edu.startDate ? " - " : "") +
              formatDate(edu.endDate);
            page.drawText(dateStr, {
              x: width - margin - 100,
              y,
              size: 8,
              font,
              color: rgb(0.5, 0.5, 0.5)
            });
            y -= 13;
            let eduLine = edu.school || "School";
            if (edu.gpa) eduLine += " | GPA: " + edu.gpa;
            page.drawText(eduLine, { x: margin, y, size: 9, font, color: rgb(0.3, 0.3, 0.3) });
            y -= 15;
          });
      }

      const allSkills = state.skills.filter(s => s.items.trim());
      if (allSkills.length && y > 100) {
        drawSection("Skills");
        allSkills.forEach(s => {
          const tagStr = s.category + ": " + s.items;
          wrapText(tagStr, font, 8, contentWidth).forEach((line, li) => {
            page.drawText(line, { x: margin, y, size: 8, font, color: rgb(0.2, 0.2, 0.2) });
            y -= 11;
          });
        });
      }
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const filename =
      (p.fullName || "resume")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") + "-resume.pdf";
    downloadBlob(blob, filename);
  }

  function wrapText(text, f, size, maxWidth) {
    const words = text.split(" ");
    const lines = [];
    let currentLine = "";
    words.forEach(word => {
      const testLine = currentLine ? currentLine + " " + word : word;
      const testWidth = f.widthOfTextAtSize(testLine, size);
      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    if (currentLine) lines.push(currentLine);
    return lines.length ? lines : [""];
  }

  $$("#rb-name, #rb-title, #rb-email, #rb-phone, #rb-location, #rb-website, #rb-summary").forEach(
    el => {
      el.addEventListener("input", () => {
        syncPersonal();
        debouncedSave();
        renderPreview();
      });
    }
  );

  $("#rb-template").addEventListener("change", e => {
    state.template = e.target.value;
    debouncedSave();
    renderPreview();
  });

  $("#rb-add-experience").addEventListener("click", () => {
    state.experience.push({
      company: "",
      role: "",
      startDate: "",
      endDate: "",
      current: false,
      bullets: [""]
    });
    renderExperience();
    debouncedSave();
  });

  $("#rb-add-education").addEventListener("click", () => {
    state.education.push({
      school: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      gpa: ""
    });
    renderEducation();
    debouncedSave();
  });

  $("#rb-add-skill").addEventListener("click", () => {
    state.skills.push({ category: "", items: "" });
    renderSkills();
    debouncedSave();
  });

  $("#rb-pdf-btn").addEventListener("click", async () => {
    try {
      await generatePDF();
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Error generating PDF: " + err.message);
    }
  });

  $("#rb-export-btn").addEventListener("click", () => {
    syncAllFromDOM();
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const name = (state.personal.fullName || "resume")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    downloadBlob(blob, name + "-resume.json");
  });

  $("#rb-import-btn").addEventListener("click", () => {
    $("#rb-file-input").click();
  });

  $("#rb-file-input").addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const imported = JSON.parse(ev.target.result);
        if (imported && imported.personal) {
          state = imported;
          loadPersonal();
          renderExperience();
          renderEducation();
          renderSkills();
          $("#rb-template").value = state.template;
          saveState(state);
          renderPreview();
        } else {
          alert("Invalid resume data file.");
        }
      } catch {
        alert("Could not parse JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  });

  loadPersonal();
  renderExperience();
  renderEducation();
  renderSkills();
  renderPreview();
}
