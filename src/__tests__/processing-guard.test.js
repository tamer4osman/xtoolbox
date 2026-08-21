import { describe, it, expect, beforeEach } from "vitest";
import {
  beginProcessing,
  endProcessing,
  isProcessing,
  getProcessingLabel
} from "../utils/processing-guard.js";

describe("processing-guard", () => {
  beforeEach(() => {
    endProcessing();
  });

  it("starts idle", () => {
    expect(isProcessing()).toBe(false);
    expect(getProcessingLabel()).toBe(null);
  });

  it("reports active state with default label", () => {
    beginProcessing();
    expect(isProcessing()).toBe(true);
    expect(getProcessingLabel()).toBe("Processing");
  });

  it("accepts a custom label", () => {
    beginProcessing("Converting to GIF");
    expect(isProcessing()).toBe(true);
    expect(getProcessingLabel()).toBe("Converting to GIF");
  });

  it("coerces non-string labels to strings", () => {
    beginProcessing(42);
    expect(getProcessingLabel()).toBe("42");
  });

  it("returns to idle after endProcessing", () => {
    beginProcessing("Encoding");
    endProcessing();
    expect(isProcessing()).toBe(false);
    expect(getProcessingLabel()).toBe(null);
  });

  it("is safe to call endProcessing when idle", () => {
    expect(() => endProcessing()).not.toThrow();
    expect(isProcessing()).toBe(false);
  });

  it("latest begin wins", () => {
    beginProcessing("A");
    beginProcessing("B");
    expect(getProcessingLabel()).toBe("B");
  });
});
