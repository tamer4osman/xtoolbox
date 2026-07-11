import { createFormatConverterTool } from "./format-converter-tool.js";

export const toolConfig = {
  id: "jpg-to-png",
  name: "JPG to PNG Converter",
  category: "image",
  description: "Convert JPG images to lossless PNG format.",
  icon: "",
  accept: ".jpg,.jpeg",
  maxSizeMB: 50,
  keywords: ["jpg to png", "jpeg to png", "convert jpg", "jpg converter"],
  steps: [
    "Upload JPG image(s)",
    "Optionally resize",
    'Click "Convert to PNG"',
    "Download converted images"
  ],
  faqs: [
    {
      question: "Why convert to PNG?",
      answer:
        "PNG is lossless, supports transparency, and is better for graphics, logos, and screenshots."
    },
    {
      question: "Will quality improve?",
      answer: "No, JPG artifacts are preserved. PNG prevents further quality loss from re-saving."
    },
    {
      question: "Can I convert multiple JPGs?",
      answer: "Yes, upload multiple JPGs and they will all be converted."
    }
  ]
};

export const render = createFormatConverterTool({
  accept: toolConfig.accept,
  maxSizeMB: toolConfig.maxSizeMB,
  sourceFormatName: "JPG",
  sourceExtRegex: /\.(jpe?g)$/i,
  targetFormatName: "PNG",
  targetMime: "image/png",
  targetExt: ".png"
});

export function destroy() {}
