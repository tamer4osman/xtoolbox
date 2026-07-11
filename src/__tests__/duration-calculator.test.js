import { describe } from "vitest";
import { toolConfig } from "../tools/math/duration-calculator.js";
import { testSimpleToolConfig } from "./tool-config-test.js";

describe("duration-calculator", () => {
  testSimpleToolConfig(toolConfig, "duration-calculator", "Time Duration Calculator", "math");
});
