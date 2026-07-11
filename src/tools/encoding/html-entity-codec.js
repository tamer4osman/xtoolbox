import { createCodecTool } from "./codec-tool-factory.js";

const encodeMap = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const decodeMap = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'" };

export const { toolConfig, render } = createCodecTool({
  toolConfig: {
    id: "html-entity-codec",
    name: "HTML Entity Encoder",
    category: "encoding",
    description: "Encode HTML entities.",
    icon: "🏷️",
    status: "done"
  },
  encodePlaceholder: "Text to encode...",
  encodeDefault: '<div>Hello & "World"',
  encodeLabel: "Encoded",
  decodePlaceholder: "HTML entities to decode...",
  decodeDefault: "&lt;div&gt;Hello &amp; &quot;World&quot;",
  decodeLabel: "Decoded",
  encode: s => s.replace(/[&<>"']/g, m => encodeMap[m]),
  decode: s => {
    let r = s;
    Object.entries(decodeMap).forEach(([k, v]) => (r = r.replace(new RegExp(k, "g"), v)));
    return r;
  }
});
