import { createFormatConverterTool } from "./format-converter-tool.js";

export const toolConfig = {
  id: "png-to-jpg",
  name: "PNG to JPG Converter",
  category: "image",
  description: "Convert PNG images to JPG with quality control.",
  icon: "",
  accept: ".png",
  maxSizeMB: 50,
  keywords: ["png to jpg", "png to jpeg", "convert png", "png converter"],
  steps: [
    "Upload PNG image(s)",
    "Adjust quality and background color",
    'Click "Convert to JPG"',
    "Download converted images"
  ],
  faqs: [
    {
      question: "What happens to transparency?",
      answer: "PNG transparency is replaced with the background color you choose (default: white)."
    },
    {
      question: "What quality should I use?",
      answer: "80-90% is good for most images. Lower for smaller files, higher for best quality."
    },
    {
      question: "Can I convert multiple PNGs?",
      answer: "Yes, upload multiple PNGs and they will all be converted."
    }
  ]
};

export const render = createFormatConverterTool({
  accept: toolConfig.accept,
  maxSizeMB: toolConfig.maxSizeMB,
  sourceFormatName: "PNG",
  sourceExtRegex: /\.png$/i,
  targetFormatName: "JPG",
  targetMime: "image/jpeg",
  targetExt: ".jpg",
  qualityDefault: 92,
  fillBackgroundColor: true
});

export function destroy() {}
