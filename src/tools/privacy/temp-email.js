import { safeFetch } from "../../utils/safe-fetch.js";
import { escapeHtml } from "../../utils/escape-html.js";
import { copyToClipboard } from "../../utils/clipboard.js";
import { showToast } from "../../components/toast.js";

const API_BASE = "https://api.mail.tm";
const POLL_INTERVAL_MS = 8000;

export function generateUsername() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const arr = new Uint8Array(10);
  crypto.getRandomValues(arr);
  return Array.from(arr, x => chars[x % chars.length]).join("");
}

export function generatePassword() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr, x => chars[x % chars.length]).join("");
}

export const toolConfig = {
  id: "temp-email",
  name: "Temp Email",
  category: "privacy",
  description:
    "Create a temporary disposable email address. Receive emails instantly without revealing your real address.",
  icon: "📧",
  accept: null,
  maxSizeMB: null,
  keywords: ["temp", "email", "disposable", "temporary", "anonymous", "privacy", "throwaway"],
  steps: [
    'Click "Create Temp Email" to generate a random address',
    "Copy the email address and use it on any site",
    "Watch the inbox for incoming messages",
    "Click a message to read its full content"
  ],
  faqs: [
    {
      question: "Are temp emails really anonymous?",
      answer:
        "Yes. We don't collect any personal data. The email address is created via a public API with no signup required."
    },
    {
      question: "How long do temp emails last?",
      answer:
        "Accounts persist as long as the mail.tm service keeps them. They are not permanently guaranteed — use them for quick signups, not long-term storage."
    },
    {
      question: "Is my email content secure?",
      answer:
        "Emails are fetched over HTTPS. We don't store any email data — it lives only in your browser session."
    }
  ]
};

let activeState = null;

export function render(container) {
  let state = {
    accountId: null,
    address: null,
    token: null,
    messages: [],
    pollTimer: null,
    selectedMessage: null,
    loading: false
  };
  activeState = state;

  container.innerHTML = `
    <div class="tool-container">
      <div class="tool-header">
        <div class="tool-icon">${toolConfig.icon}</div>
        <h1>${toolConfig.name}</h1>
        <p class="tool-description">${toolConfig.description}</p>
      </div>
      <div class="tool-content">
        <div id="setup-panel" class="temp-email-setup">
          <button class="btn btn-primary" id="create-btn">Create Temp Email</button>
          <div id="email-display" class="temp-email-display" style="display:none;">
            <div class="temp-email-address">
              <span id="email-text"></span>
              <button class="btn btn-secondary btn-sm" id="copy-btn">Copy</button>
            </div>
            <button class="btn btn-secondary btn-sm" id="new-email-btn">New Address</button>
          </div>
        </div>
        <div id="inbox-panel" class="temp-email-inbox" style="display:none;">
          <div class="temp-email-inbox-header">
            <h2>Inbox</h2>
            <div class="temp-email-inbox-actions">
              <span id="msg-count" class="temp-email-count">0 messages</span>
              <button class="btn btn-secondary btn-sm" id="refresh-btn">Refresh</button>
              <button class="btn btn-secondary btn-sm" id="stop-btn">Stop</button>
            </div>
          </div>
          <div id="message-list" class="temp-email-message-list">
            <p class="temp-email-empty">No messages yet. Waiting for incoming mail...</p>
          </div>
        </div>
        <div id="message-view" class="temp-email-message-view" style="display:none;">
          <div class="temp-email-message-view-header">
            <button class="btn btn-secondary btn-sm" id="back-btn">← Back to Inbox</button>
            <button class="btn btn-secondary btn-sm" id="delete-msg-btn">Delete</button>
          </div>
          <div id="message-view-content" class="temp-email-message-content"></div>
        </div>
        <div id="loading" class="loading hidden">Loading...</div>
        <div id="error" class="error hidden"></div>
      </div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .temp-email-setup { text-align: center; padding: var(--space-4) 0; }
    .temp-email-display { margin-top: var(--space-4); }
    .temp-email-address {
      display: flex; align-items: center; justify-content: center;
      gap: var(--space-2); margin-bottom: var(--space-3);
      font-size: 1.25rem; font-weight: 600; color: var(--color-text);
      background: var(--color-bg-secondary); padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md); border: 1px solid var(--color-border);
      word-break: break-all;
    }
    .temp-email-inbox { margin-top: var(--space-4); }
    .temp-email-inbox-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: var(--space-3); flex-wrap: wrap; gap: var(--space-2);
    }
    .temp-email-inbox-header h2 { margin: 0; font-size: 1.1rem; }
    .temp-email-inbox-actions { display: flex; align-items: center; gap: var(--space-2); }
    .temp-email-count { color: var(--color-text-secondary); font-size: 0.875rem; }
    .temp-email-message-list {
      border: 1px solid var(--color-border); border-radius: var(--radius-md);
      overflow: hidden; max-height: 400px; overflow-y: auto;
    }
    .temp-email-message-item {
      display: flex; flex-direction: column; gap: 2px;
      padding: var(--space-3); cursor: pointer;
      border-bottom: 1px solid var(--color-border);
      transition: background 0.15s;
    }
    .temp-email-message-item:hover { background: var(--color-bg-secondary); }
    .temp-email-message-item:last-child { border-bottom: none; }
    .temp-email-msg-from { font-weight: 600; font-size: 0.875rem; color: var(--color-text); }
    .temp-email-msg-subject { font-size: 0.875rem; color: var(--color-text); }
    .temp-email-msg-intro { font-size: 0.8rem; color: var(--color-text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .temp-email-msg-time { font-size: 0.75rem; color: var(--color-text-secondary); }
    .temp-email-msg-meta { display: flex; justify-content: space-between; align-items: center; }
    .temp-email-msg-unread .temp-email-msg-subject { font-weight: 700; }
    .temp-email-empty { text-align: center; color: var(--color-text-secondary); padding: var(--space-6); }
    .temp-email-message-view { margin-top: var(--space-4); }
    .temp-email-message-view-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: var(--space-3);
    }
    .temp-email-message-content {
      border: 1px solid var(--color-border); border-radius: var(--radius-md);
      overflow: hidden;
    }
    .temp-email-msg-detail-header {
      padding: var(--space-3); border-bottom: 1px solid var(--color-border);
      background: var(--color-bg-secondary);
    }
    .temp-email-msg-detail-header p { margin: 2px 0; font-size: 0.875rem; }
    .temp-email-msg-detail-header strong { color: var(--color-text); }
    .temp-email-msg-detail-header span { color: var(--color-text-secondary); }
    .temp-email-msg-body { padding: 0; }
    .temp-email-msg-body iframe {
      width: 100%; min-height: 400px; border: none; display: block;
    }
    .temp-email-msg-text { padding: var(--space-4); white-space: pre-wrap; font-family: inherit; }
  `;
  container.appendChild(style);

  const emailDisplay = container.querySelector("#email-display");
  const emailText = container.querySelector("#email-text");
  const createBtn = container.querySelector("#create-btn");
  const copyBtn = container.querySelector("#copy-btn");
  const newEmailBtn = container.querySelector("#new-email-btn");
  const inboxPanel = container.querySelector("#inbox-panel");
  const messageList = container.querySelector("#message-list");
  const msgCount = container.querySelector("#msg-count");
  const refreshBtn = container.querySelector("#refresh-btn");
  const stopBtn = container.querySelector("#stop-btn");
  const messageView = container.querySelector("#message-view");
  const messageViewContent = container.querySelector("#message-view-content");
  const backBtn = container.querySelector("#back-btn");
  const deleteMsgBtn = container.querySelector("#delete-msg-btn");
  const loading = container.querySelector("#loading");
  const error = container.querySelector("#error");

  function showLoading(msg) {
    loading.textContent = msg || "Loading...";
    loading.classList.remove("hidden");
  }

  function hideLoading() {
    loading.classList.add("hidden");
  }

  function showError(msg) {
    error.textContent = msg;
    error.classList.remove("hidden");
  }

  function hideError() {
    error.classList.add("hidden");
  }

  async function fetchDomains() {
    const res = await safeFetch(`${API_BASE}/domains`, {
      rateLimit: { maxRequests: 5, windowMs: 60_000 }
    });
    if (!res.ok) throw new Error("Failed to fetch available domains");
    const data = await res.json();
    const domains = data["hydra:member"] || [];
    return domains.filter(d => d.isActive && !d.isPrivate);
  }

  async function createAccount(domain, password) {
    const username = generateUsername();
    const address = `${username}@${domain}`;
    const res = await safeFetch(`${API_BASE}/accounts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, password }),
      rateLimit: { maxRequests: 5, windowMs: 60_000 }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err["hydra:description"] || "Failed to create account");
    }
    return { address, id: (await res.json()).id };
  }

  async function getToken(address, password) {
    const res = await safeFetch(`${API_BASE}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, password }),
      rateLimit: { maxRequests: 5, windowMs: 60_000 }
    });
    if (!res.ok) throw new Error("Failed to authenticate");
    const data = await res.json();
    return data.token;
  }

  async function fetchMessages(token) {
    const res = await safeFetch(`${API_BASE}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
      rateLimit: { maxRequests: 8, windowMs: 60_000 }
    });
    if (!res.ok) throw new Error("Failed to fetch messages");
    const data = await res.json();
    return data["hydra:member"] || [];
  }

  async function fetchMessage(token, id) {
    const res = await safeFetch(`${API_BASE}/messages/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      rateLimit: { maxRequests: 8, windowMs: 60_000 }
    });
    if (!res.ok) throw new Error("Failed to fetch message");
    return res.json();
  }

  async function deleteMessage(token, id) {
    const res = await safeFetch(`${API_BASE}/messages/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      rateLimit: { maxRequests: 5, windowMs: 60_000 }
    });
    return res.ok;
  }

  function renderMessageList(messages) {
    if (!messages.length) {
      messageList.innerHTML =
        '<p class="temp-email-empty">No messages yet. Waiting for incoming mail...</p>';
      msgCount.textContent = "0 messages";
      return;
    }
    msgCount.textContent = `${messages.length} message${messages.length !== 1 ? "s" : ""}`;
    messageList.innerHTML = messages
      .map(
        m => `
      <div class="temp-email-message-item${m.seen ? "" : " temp-email-msg-unread"}" data-id="${escapeHtml(m.id)}">
        <div class="temp-email-msg-meta">
          <span class="temp-email-msg-from">${escapeHtml(m.from?.name || m.from?.address || "Unknown")}</span>
          <span class="temp-email-msg-time">${escapeHtml(new Date(m.createdAt).toLocaleString())}</span>
        </div>
        <div class="temp-email-msg-subject">${escapeHtml(m.subject || "(no subject)")}</div>
        <div class="temp-email-msg-intro">${escapeHtml(m.intro || "")}</div>
      </div>
    `
      )
      .join("");

    messageList.querySelectorAll(".temp-email-message-item").forEach(el => {
      el.addEventListener("click", () => openMessage(el.dataset.id));
    });
  }

  async function openMessage(id) {
    showLoading("Loading message...");
    hideError();
    try {
      const msg = await fetchMessage(state.token, id);
      state.selectedMessage = msg;
      inboxPanel.style.display = "none";
      messageView.style.display = "block";

      const htmlParts = (msg.html || []).join("\n");
      const hasHtml = htmlParts.trim().length > 0;

      messageViewContent.innerHTML = `
        <div class="temp-email-msg-detail-header">
          <p><strong>From:</strong> <span>${escapeHtml(msg.from?.name || "")} &lt;${escapeHtml(msg.from?.address || "")}&gt;</span></p>
          <p><strong>To:</strong> <span>${escapeHtml((msg.to || []).map(t => t.address).join(", "))}</span></p>
          <p><strong>Subject:</strong> <span>${escapeHtml(msg.subject || "(no subject)")}</span></p>
          <p><strong>Date:</strong> <span>${escapeHtml(new Date(msg.createdAt).toLocaleString())}</span></p>
        </div>
        <div class="temp-email-msg-body">
          ${
            hasHtml
              ? `<iframe sandbox="allow-same-origin" srcdoc="${escapeHtml(htmlParts)}" title="Email content"></iframe>`
              : `<div class="temp-email-msg-text">${escapeHtml(msg.text || "(no content)")}</div>`
          }
        </div>
      `;
    } catch (e) {
      showError(e.message);
    } finally {
      hideLoading();
    }
  }

  function startPolling() {
    if (state.pollTimer) return;
    poll();
    state.pollTimer = setInterval(poll, POLL_INTERVAL_MS);
  }

  function stopPolling() {
    if (state.pollTimer) {
      clearInterval(state.pollTimer);
      state.pollTimer = null;
    }
  }

  async function poll() {
    if (!state.token) return;
    try {
      const msgs = await fetchMessages(state.token);
      state.messages = msgs;
      renderMessageList(msgs);
    } catch {
      // silent on poll errors
    }
  }

  async function handleCreate() {
    hideError();
    showLoading("Creating temp email...");
    createBtn.disabled = true;
    try {
      const domains = await fetchDomains();
      if (!domains.length) throw new Error("No domains available. Try again later.");
      const domain = domains[0].domain;
      const password = generatePassword();
      const account = await createAccount(domain, password);
      state.accountId = account.id;
      state.address = account.address;
      const token = await getToken(account.address, password);
      state.token = token;

      emailText.textContent = state.address;
      emailDisplay.style.display = "flex";
      emailDisplay.style.flexDirection = "column";
      emailDisplay.style.alignItems = "center";
      createBtn.style.display = "none";
      inboxPanel.style.display = "block";
      startPolling();
    } catch (e) {
      showError(e.message);
    } finally {
      hideLoading();
      createBtn.disabled = false;
    }
  }

  function handleNewEmail() {
    stopPolling();
    state.accountId = null;
    state.address = null;
    state.token = null;
    state.messages = [];
    state.selectedMessage = null;
    emailDisplay.style.display = "none";
    createBtn.style.display = "";
    inboxPanel.style.display = "none";
    messageView.style.display = "none";
    messageList.innerHTML = "";
    hideError();
  }

  function handleBack() {
    messageView.style.display = "none";
    inboxPanel.style.display = "block";
    state.selectedMessage = null;
  }

  async function handleDeleteMessage() {
    if (!state.selectedMessage) return;
    showLoading("Deleting...");
    try {
      const ok = await deleteMessage(state.token, state.selectedMessage.id);
      if (!ok) throw new Error("Failed to delete message");
      state.selectedMessage = null;
      handleBack();
      await poll();
      showToast({ message: "Message deleted", type: "success" });
    } catch (e) {
      showError(e.message);
    } finally {
      hideLoading();
    }
  }

  createBtn.addEventListener("click", handleCreate);
  newEmailBtn.addEventListener("click", handleNewEmail);
  copyBtn.addEventListener("click", async () => {
    const ok = await copyToClipboard(state.address);
    if (ok) showToast({ message: "Email copied!", type: "success" });
  });
  refreshBtn.addEventListener("click", poll);
  stopBtn.addEventListener("click", () => {
    stopPolling();
    showToast({ message: "Polling stopped", type: "info" });
  });
  backBtn.addEventListener("click", handleBack);
  deleteMsgBtn.addEventListener("click", handleDeleteMessage);
}

export function destroy() {
  if (activeState?.pollTimer) {
    clearInterval(activeState.pollTimer);
    activeState.pollTimer = null;
  }
  activeState = null;
}
