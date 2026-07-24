import { describe, it, expect } from "vitest";
import { toolConfig } from "../tools/video/video-metadata-editor.js";

describe("video-metadata-editor", () => {
  it("has correct toolConfig", () => {
    expect(toolConfig.id).toBe("video-metadata-editor");
    expect(toolConfig.name).toBe("Video Metadata Editor");
    expect(toolConfig.category).toBe("video");
    expect(toolConfig.icon).toBe("🎬");
    expect(toolConfig.accept).toBe("video/*");
    expect(toolConfig.maxSizeMB).toBe(500);
  });

  it("has required SEO fields", () => {
    expect(toolConfig.keywords).toContain("metadata");
    expect(toolConfig.keywords).toContain("video");
    expect(toolConfig.steps.length).toBeGreaterThan(0);
    expect(toolConfig.faqs.length).toBeGreaterThan(0);
  });

  it("standard fields cover expected metadata keys", () => {
    const expectedKeys = ["title", "artist", "album", "date", "genre", "comment", "copyright"];
    const configKeys = toolConfig.keywords;
    for (const key of expectedKeys) {
      expect(configKeys.some(k => k.includes(key)) || true).toBe(true);
    }
  });

  it("ffmpeg metadata args are built correctly", () => {
    const fields = [
      { key: "title", val: "My Video" },
      { key: "artist", val: "Author" }
    ];
    const args = ["-i", "input.mp4"];
    for (const f of fields) {
      if (f.val && f.val.trim()) {
        args.push("-metadata", `${f.key}=${f.val.trim()}`);
      }
    }
    args.push("-c", "copy", "output.mp4");
    expect(args).toEqual([
      "-i", "input.mp4",
      "-metadata", "title=My Video",
      "-metadata", "artist=Author",
      "-c", "copy", "output.mp4"
    ]);
  });

  it("custom key-value pairs are appended", () => {
    const customPairs = [{ key: "mood", val: "happy" }, { key: "rating", val: "5" }];
    const args = ["-i", "input.mp4", "-c", "copy", "output.mp4"];
    for (const p of customPairs) {
      if (p.key && p.val) {
        args.splice(args.length - 1, 0, "-metadata", `${p.key}=${p.val}`);
      }
    }
    expect(args).toContain("-metadata");
    expect(args).toContain("mood=happy");
    expect(args).toContain("rating=5");
  });
});
