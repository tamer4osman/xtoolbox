export function createCodecTool({
  inputId,
  outputId,
  encodeId,
  decodeId,
  copyId,
  clearId,
  encode,
  decode,
  onInput
}) {
  return function init() {
    const input = document.getElementById(inputId);
    const output = document.getElementById(outputId);
    const encodeBtn = document.getElementById(encodeId);
    const decodeBtn = document.getElementById(decodeId);
    const copyBtn = document.getElementById(copyId);
    const clearBtn = document.getElementById(clearId);

    if (!input || !output) return;

    if (encodeBtn)
      encodeBtn.addEventListener("click", () => {
        try {
          output.value = encode(input.value);
        } catch (e) {
          output.value = "Error: " + e.message;
        }
      });

    if (decodeBtn)
      decodeBtn.addEventListener("click", () => {
        try {
          output.value = decode(input.value);
        } catch (e) {
          output.value = "Error: " + e.message;
        }
      });

    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(output.value).then(() => {
          copyBtn.textContent = "Copied!";
          setTimeout(() => (copyBtn.textContent = "Copy"), 2000);
        });
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        input.value = "";
        output.value = "";
        input.focus();
      });
    }

    input.addEventListener("input", () => {
      if (encodeBtn && onInput !== "decode") {
        try {
          output.value = encode(input.value);
        } catch (e) {
          output.value = "Error: " + e.message;
        }
      } else if (onInput === "decode") {
        try {
          output.value = decode(input.value);
        } catch (e) {
          output.value = "Error: " + e.message;
        }
      }
    });
  };
}
