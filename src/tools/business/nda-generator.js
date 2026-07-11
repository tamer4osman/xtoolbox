import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { downloadBlob } from "../../utils/file.js";

export const toolConfig = {
  id: "nda-generator",
  name: "NDA Generator",
  category: "business",
  description: "Generate Non-Disclosure Agreements customized for unilateral/mutual situations.",
  icon: "📜",
  keywords: ["nda", "non-disclosure", "agreement", "legal", "contract"],
  accept: "",
  maxSizeMB: 10
};

export function render(container) {
  let state = {
    type: "unilateral",
    disclosingParty: "",
    receivingParty: "",
    companyName: "",
    purpose: "",
    effectiveDate: new Date().toISOString().split("T")[0],
    expirationDate: "",
    state: "California",
    governingLaw: "The laws of the State of [STATE]"
  };

  container.innerHTML = `
    <div class="tool-container">
      <h1>${toolConfig.name}</h1>
      <p>${toolConfig.description}</p>
      <div class="form-section">
        <label for="ndaType">NDA Type</label>
        <select id="ndaType">
          <option value="unilateral">Unilateral (One-way)</option>
          <option value="mutual">Mutual (Two-way)</option>
        </select>
        <p class="help-text">Unilateral: one party discloses, other receives. Mutual: both parties disclose to each other.</p>
      </div>
      <div class="form-section">
        <label for="disclosingParty">Disclosing Party Name</label>
        <input type="text" id="disclosingParty" placeholder="Company or Individual Name" />
      </div>
      <div class="form-section">
        <label for="receivingParty">Receiving Party Name</label>
        <input type="text" id="receivingParty" placeholder="Company or Individual Name" />
      </div>
      <div class="form-section">
        <label for="companyName">Your Company/Torganization Name</label>
        <input type="text" id="companyName" placeholder="[Your Company Name]" />
      </div>
      <div class="form-section">
        <label for="purpose">Purpose of Disclosure</label>
        <textarea id="purpose" rows="3" placeholder="Discussing a potential business opportunity, reviewing proprietary technology, etc."></textarea>
      </div>
      <div class="form-section">
        <label for="effectiveDate">Effective Date</label>
        <input type="date" id="effectiveDate" />
      </div>
      <div class="form-section">
        <label for="expirationDate">Expiration Date (optional)</label>
        <input type="date" id="expirationDate" placeholder="Leave blank for perpetual" />
      </div>
      <div class="form-section">
        <label for="state">Governing State</label>
        <select id="state">
          <option value="California">California</option>
          <option value="Delaware">Delaware</option>
          <option value="New York">New York</option>
          <option value="Texas">Texas</option>
        </select>
      </div>
      <button type="button" id="generatePdf" class="btn-primary">Generate NDA PDF</button>
    </div>
  `;

  const $ = id => container.querySelector(id);
  const el = sel => container.querySelector(sel);

  $("#effectiveDate").value = state.effectiveDate;

  el("#ndaType").addEventListener("change", e => {
    state.type = e.target.value;
    if (state.type === "mutual") {
      $("#receivingParty").parentElement.style.display = "none";
    } else {
      $("#receivingParty").parentElement.style.display = "block";
    }
  });

  el("#disclosingParty").addEventListener("input", e => {
    state.disclosingParty = e.target.value;
  });

  el("#receivingParty").addEventListener("input", e => {
    state.receivingParty = e.target.value;
  });

  el("#companyName").addEventListener("input", e => {
    state.companyName = e.target.value;
  });

  el("#purpose").addEventListener("input", e => {
    state.purpose = e.target.value;
  });

  el("#effectiveDate").addEventListener("change", e => {
    state.effectiveDate = e.target.value;
  });

  el("#expirationDate").addEventListener("change", e => {
    state.expirationDate = e.target.value;
  });

  el("#state").addEventListener("change", e => {
    state.state = e.target.value;
    state.governingLaw = `The laws of the State of ${e.target.value}`;
  });

  el("#generatePdf").addEventListener("click", async () => {
    if (!state.disclosingParty.trim() || !state.companyName.trim()) {
      alert("Please fill in both the disclosing party and your company name");
      return;
    }

    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([612, 792]);
      const { width, height } = page.getSize();

      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const title =
        state.type === "mutual" ? "MUTUAL NON-DISCLOSURE AGREEMENT" : "NON-DISCLOSURE AGREEMENT";

      page.drawText(title, {
        x: width / 2,
        y: height - 50,
        size: 16,
        font: helveticaBold,
        color: rgb(0.1, 0.1, 0.1),
        align: "center"
      });

      let y = height - 100;
      const addLine = (text, indent = 40, size = 10, font = helvetica) => {
        if (text.length > 80) {
          const words = text.split(" ");
          let line = "";
          words.forEach(word => {
            if ((line + word).length > 75) {
              page.drawText(line.trim(), { x: indent, y, size, font, color: rgb(0.2, 0.2, 0.2) });
              y -= 16;
              line = word + " ";
            } else {
              line += word + " ";
            }
          });
          if (line.trim()) {
            page.drawText(line.trim(), { x: indent, y, size, font, color: rgb(0.2, 0.2, 0.2) });
            y -= 16;
          }
        } else {
          page.drawText(text, { x: indent, y, size, font, color: rgb(0.2, 0.2, 0.2) });
          y -= 16;
        }
      };

      const effDate = new Date(state.effectiveDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });

      addLine(
        'This Non-Disclosure Agreement ("Agreement") is entered into as of ' +
          effDate +
          ' (the "Effective Date") by and between:'
      );
      y -= 10;

      addLine(
        state.companyName + ', a [COMPANY TYPE] with offices at [ADDRESS] ("Disclosing Party"); and'
      );
      y -= 10;

      if (state.type === "mutual") {
        addLine(state.companyName + ' (also a "Disclosing Party")');
      } else {
        addLine(state.receivingParty + ' ("Receiving Party")');
      }
      y -= 20;

      addLine("1. PURPOSE", 40, 12, helveticaBold);
      addLine("The parties wish to explore a potential business relationship concerning:");
      addLine(state.purpose || "[PURPOSE OF DISCLOSURE]");
      y -= 10;

      addLine("2. DEFINITION OF CONFIDENTIAL INFORMATION", 40, 12, helveticaBold);
      addLine(
        '"Confidential Information" means any information disclosed by either party that is:'
      );
      addLine("(a) marked as confidential or proprietary;");
      addLine("(b) disclosed orally and identified as confidential at the time;");
      addLine("(c) would reasonably be understood to be confidential given the nature.");
      y -= 10;

      addLine("3. OBLIGATIONS", 40, 12, helveticaBold);
      addLine("Receiving Party agrees to:");
      addLine("(a) hold Confidential Information in strict confidence;");
      addLine("(b) use it only for the Purpose stated above;");
      addLine("(c) protect it using at least the same degree of care as its own.");
      y -= 10;

      addLine("4. EXCLUSIONS", 40, 12, helveticaBold);
      addLine("Confidential Information does not include information that:");
      addLine("(a) is or becomes publicly available;");
      addLine("(b) was known to Receiving Party before disclosure;");
      addLine("(c) is independently developed;");
      addLine("(d) is disclosed with Disclosing Party's written consent.");
      y -= 10;

      addLine("5. TERM", 40, 12, helveticaBold);
      if (state.expirationDate) {
        const expDate = new Date(state.expirationDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric"
        });
        addLine("This Agreement expires on " + expDate + ".");
      } else {
        addLine(
          "This Agreement remains in effect until terminated by either party with 30 days written notice."
        );
      }
      y -= 10;

      addLine("6. GOVERNING LAW", 40, 12, helveticaBold);
      addLine("This Agreement shall be governed by " + state.governingLaw + ".");
      y -= 30;

      addLine("IN WITNESS WHEREOF, the parties have executed this Agreement.", 40);
      y -= 50;

      const sigY = y;
      page.drawLine({
        start: { x: 60, y: sigY },
        end: { x: 280, y: sigY },
        thickness: 1,
        color: rgb(0.3, 0.3, 0.3)
      });
      addLine("Disclosing Party:", 60, 9, helveticaBold);
      addLine("Signature: _______________________", 60);
      addLine("Name: " + state.disclosingParty, 60);
      addLine("Date: " + effDate, 60);

      y = sigY;
      page.drawLine({
        start: { x: 330, y: sigY },
        end: { x: 550, y: sigY },
        thickness: 1,
        color: rgb(0.3, 0.3, 0.3)
      });
      addLine("Receiving Party:", 330, 9, helveticaBold);
      addLine("Signature: _______________________", 330);
      addLine("Name: " + (state.type === "mutual" ? state.companyName : state.receivingParty), 330);
      addLine("Date: " + effDate, 330);

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const filename = `nda-${state.type}-${new Date().toISOString().split("T")[0]}.pdf`;
      downloadBlob(blob, filename);
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Error generating NDA: " + err.message);
    }
  });
}
