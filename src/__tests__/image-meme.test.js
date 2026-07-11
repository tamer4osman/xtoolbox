import { describe, it, expect } from "vitest";

describe("image-meme", () => {
  it("has correct tool config", async () => {
    const { toolConfig } = await import("../tools/image/image-meme.js");
    expect(toolConfig.id).toBe("image-meme");
    expect(toolConfig.name).toBe("Meme Generator");
    expect(toolConfig.category).toBe("image");
    expect(toolConfig.accept).toBe("image/*");
  });

  it("exports render function", async () => {
    const { render } = await import("../tools/image/image-meme.js");
    expect(typeof render).toBe("function");
  });
});
