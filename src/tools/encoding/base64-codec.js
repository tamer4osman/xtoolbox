import { createCodecTool } from "./codec-tool-factory.js";

export const { toolConfig, render } = createCodecTool({
  toolConfig: {
    id: "base64-codec",
    name: "Base64 Codec",
    category: "encoding",
    description: "Encode and decode Base64.",
    icon: "🔤",
    status: "done"
  },
  encodePlaceholder: "Text to encode...",
  encodeDefault: "Hello World",
  encodeLabel: "Base64",
  decodePlaceholder: "Base64 to decode...",
  decodeLabel: "Text",
  encode: s => btoa(s),
  decode: s => atob(s)
});
