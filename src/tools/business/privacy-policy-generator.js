import { downloadBlob } from "../../utils/file.js";

export const toolConfig = {
  id: "privacy-policy-generator",
  name: "Privacy Policy Generator",
  category: "business",
  description: "Generate privacy policies customized for GDPR, CCPA, and similar regulations.",
  icon: "🔒",
  keywords: ["privacy", "policy", "gdpr", "ccpa", "legal", "compliance"],
  accept: "",
  maxSizeMB: 10
};

export function render(container) {
  let state = {
    companyName: "",
    websiteUrl: "",
    contactEmail: "",
    collectsNames: true,
    collectsEmail: true,
    collectsPhone: false,
    collectsAddress: false,
    collectsPayment: false,
    collectsCookies: true,
    collectsAnalytics: true,
    hasAccount: false,
    targetAudience: "general",
    complianceFramework: "gdpr"
  };

  container.innerHTML = `
    <div class="tool-container">
      <h1>${toolConfig.name}</h1>
      <p>${toolConfig.description}</p>
      <div class="form-section">
        <h3>Company Information</h3>
        <div class="form-field">
          <label for="companyName">Company Name</label>
          <input type="text" id="companyName" placeholder="Your Company Name" />
        </div>
        <div class="form-field">
          <label for="websiteUrl">Website URL</label>
          <input type="url" id="websiteUrl" placeholder="https://example.com" />
        </div>
        <div class="form-field">
          <label for="contactEmail">Contact Email</label>
          <input type="email" id="contactEmail" placeholder="privacy@example.com" />
        </div>
      </div>
      <div class="form-section">
        <h3>Data Collected</h3>
        <label class="checkbox-label">
          <input type="checkbox" id="collectsNames" checked /> Names
        </label>
        <label class="checkbox-label">
          <input type="checkbox" id="collectsEmail" checked /> Email addresses
        </label>
        <label class="checkbox-label">
          <input type="checkbox" id="collectsPhone" /> Phone numbers
        </label>
        <label class="checkbox-label">
          <input type="checkbox" id="collectsAddress" /> Physical addresses
        </label>
        <label class="checkbox-label">
          <input type="checkbox" id="collectsPayment" /> Payment information
        </label>
        <label class="checkbox-label">
          <input type="checkbox" id="collectsCookies" checked /> Cookies
        </label>
        <label class="checkbox-label">
          <input type="checkbox" id="collectsAnalytics" checked /> Analytics data
        </label>
      </div>
      <div class="form-section">
        <h3>Account & Users</h3>
        <label class="checkbox-label">
          <input type="checkbox" id="hasAccount" /> Users create accounts
        </label>
      </div>
      <div class="form-section">
        <h3>Target Audience</h3>
        <select id="targetAudience">
          <option value="general">General audience (no special category)</option>
          <option value="children">Includes children under 13</option>
          <option value="eu">EU residents</option>
          <option value="ca">California residents</option>
        </select>
      </div>
      <div class="form-section">
        <h3>Compliance Framework</h3>
        <select id="complianceFramework">
          <option value="gdpr">GDPR (EU)</option>
          <option value="ccpa">CCPA (California)</option>
          <option value="both">Both GDPR + CCPA</option>
          <option value="basic">Basic (no specific framework)</option>
        </select>
      </div>
      <button type="button" id="generate" class="btn-primary">Generate Privacy Policy</button>
      <div id="preview" class="preview-area" style="display:none;">
        <h3>Privacy Policy Preview</h3>
        <pre id="policyContent" style="white-space: pre-wrap; font-size: 12px; max-height: 400px; overflow-y: auto; background: #f5f5f5; padding: 15px; border-radius: 4px;"></pre>
        <button type="button" id="downloadTxt" class="btn-secondary">Download as Text</button>
      </div>
    </div>
  `;

  const el = sel => container.querySelector(sel);
  const formatDate = () =>
    new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  [
    "#companyName input",
    "#websiteUrl input",
    "#contactEmail input",
    "#targetAudience change",
    "#complianceFramework change"
  ].forEach(s => {
    const [sel, event] = s.split(" ");
    el(sel).addEventListener(event, generate);
  });

  [
    "collectsNames",
    "collectsEmail",
    "collectsPhone",
    "collectsAddress",
    "collectsPayment",
    "collectsCookies",
    "collectsAnalytics",
    "hasAccount"
  ].forEach(id => {
    el("#" + id).addEventListener("change", e => {
      state[id] = e.target.checked;
      generate();
    });
  });

  function generate() {
    state.companyName = el("#companyName").value || "[Company Name]";
    state.websiteUrl = el("#websiteUrl").value || "[Website URL]";
    state.contactEmail = el("#contactEmail").value || "[Contact Email]";
    state.targetAudience = el("#targetAudience").value;
    state.complianceFramework = el("#complianceFramework").value;

    const dataTypes = [];
    if (state.collectsNames) dataTypes.push("names");
    if (state.collectsEmail) dataTypes.push("email addresses");
    if (state.collectsPhone) dataTypes.push("phone numbers");
    if (state.collectsAddress) dataTypes.push("physical addresses");
    if (state.collectsPayment) dataTypes.push("payment information");
    if (state.collectsCookies) dataTypes.push("cookies");
    if (state.collectsAnalytics) dataTypes.push("analytics data");

    let policy = `${state.companyName}
Privacy Policy
Effective Date: ${formatDate()}

1. INTRODUCTION
${state.companyName} ("we", "us", or "our") operates ${state.websiteUrl}. This Privacy Policy describes how we collect, use, and share your information when you use our website.

2. INFORMATION WE COLLECT
We collect the following types of information:
${dataTypes.map(d => "- " + d.charAt(0).toUpperCase() + d.slice(1)).join("\n")}

3. HOW WE USE YOUR INFORMATION
We use the information we collect to:
- Provide and maintain our services
- Improve and personalize your experience
- Communicate with you about updates and promotions
- Comply with legal obligations

`;

    if (state.hasAccount || state.collectsAnalytics) {
      policy += `
4.Cookies and Tracking Technologies
${state.collectsCookies ? "We use cookies to improve your experience. You can instruct your browser to refuse cookies." : "We do not use cookies."}
`;
    }

    policy += `
5. SHARING YOUR INFORMATION
We do not sell your personal information. We may share data with:
- Service providers who assist our operations
- Legal authorities when required by law

`;

    if (state.complianceFramework === "gdpr" || state.complianceFramework === "both") {
      policy += `6. GDPR RIGHTS (EU Residents)
If you are located in the EU, you have the right to:
- Access your personal data
- Request correction or deletion
- Object to processing
- Request data portability
To exercise these rights, contact us at ${state.contactEmail}

`;
    }

    if (state.complianceFramework === "ccpa" || state.complianceFramework === "both") {
      policy += `${state.complianceFramework === "both" ? "7" : "6"}. CCPA RIGHTS (California Residents)
If you are a California resident, you have the right to:
- Know what personal information we collect
- Request deletion of your data
- Opt-out of the sale of your data
We do not sell your personal information.

`;
    }

    policy += `${Math.max(state.complianceFramework === "both" ? 7 : 6, 7)}. CHILDREN'S PRIVACY
${state.targetAudience === "children" ? "Our services are intended for children under 13. We do not knowingly collect information from children." : "We do not knowingly collect information from children under 13."}

${Math.max(state.complianceFramework === "both" ? 8 : 7, 8)}. CHANGES TO THIS POLICY
We may update this policy periodically. We will notify you of material changes.

${Math.max(state.complianceFramework === "both" ? 9 : 8, 9)}. CONTACT US
For questions about this policy, contact:
${state.contactEmail}
`;

    el("#policyContent").textContent = policy;
    el("#preview").style.display = "block";
  }

  el("#generate").addEventListener("click", generate);

  el("#downloadTxt").addEventListener("click", () => {
    const content = el("#policyContent").textContent;
    const blob = new Blob([content], { type: "text/plain" });
    downloadBlob(blob, "privacy-policy.txt");
  });
}
