import { it, expect } from "vitest";

/**
 * Reusable tool configuration tests
 * @param {Object} toolConfig - The tool configuration object
 * @param {Object} options - Test options
 * @param {string} options.id - Expected tool ID
 * @param {string} options.name - Expected tool name
 * @param {string} options.category - Expected category
 * @param {number} [options.minKeywords=3] - Minimum keywords count
 * @param {number} [options.minFaqs=1] - Minimum FAQs count
 * @param {number} [options.minSteps=2] - Minimum steps count
 */
export function testToolConfig(toolConfig, options) {
  const { id, name, category, minKeywords = 3, minFaqs = 1, minSteps = 2 } = options;

  it("has correct id", () => {
    expect(toolConfig.id).toBe(id);
  });

  it("has correct name", () => {
    expect(toolConfig.name).toBe(name);
  });

  it("has correct category", () => {
    expect(toolConfig.category).toBe(category);
  });

  if (toolConfig.keywords) {
    it(`has at least ${minKeywords} keywords`, () => {
      expect(toolConfig.keywords.length).toBeGreaterThan(minKeywords - 1);
    });
  }

  if (minFaqs > 0 && toolConfig.faqs) {
    it(`has at least ${minFaqs} faqs`, () => {
      expect(toolConfig.faqs.length).toBeGreaterThan(minFaqs - 1);
      expect(toolConfig.faqs[0].question).toBeTruthy();
      expect(toolConfig.faqs[0].answer).toBeTruthy();
    });
  }

  if (minSteps > 0 && toolConfig.steps) {
    it(`has at least ${minSteps} steps`, () => {
      expect(toolConfig.steps.length).toBeGreaterThan(minSteps - 1);
    });
  }
}

/**
 * Quick config test for simple tools
 * @param {Object} toolConfig - The tool configuration object
 * @param {string} id - Expected tool ID
 * @param {string} name - Expected tool name
 * @param {string} category - Expected category
 */
export function testSimpleToolConfig(toolConfig, id, name, category) {
  testToolConfig(toolConfig, { id, name, category });
}

/**
 * Test render and destroy functions
 * @param {Function} render - The render function
 * @param {Function} destroy - The destroy function
 * @param {string[]} selectors - CSS selectors to check in render
 */
export function testRenderAndDestroy(render, destroy, selectors) {
  it("render appends content to container", () => {
    const container = document.createElement("div");
    render(container);
    selectors.forEach(sel => {
      expect(container.querySelector(sel)).toBeTruthy();
    });
  });

  if (destroy) {
    it("destroy cleans up without throwing", () => {
      const container = document.createElement("div");
      render(container);
      expect(() => destroy()).not.toThrow();
    });
  }
}

/**
 * Test slider/input interaction
 * @param {Function} render - The render function
 * @param {string} sliderId - Slider element ID
 * @param {string} outputId - Output element ID
 * @param {string} testValue - Value to set on slider
 * @param {string} expectedText - Expected text in output
 */
export function testSliderInteraction(render, sliderId, outputId, testValue, expectedText) {
  it("slider updates output", () => {
    const container = document.createElement("div");
    render(container);
    const slider = container.querySelector(`#${sliderId}`);
    slider.value = testValue;
    slider.dispatchEvent(new Event("input"));
    const output = container.querySelector(`#${outputId}`).value;
    expect(output).toContain(expectedText);
  });
}

/**
 * Test tool config with custom validators
 * @param {Object} toolConfig - The tool configuration object
 * @param {Object} validators - Custom validation functions
 */
export function testToolConfigCustom(toolConfig, validators) {
  if (validators.id) {
    it("has correct id", () => {
      expect(toolConfig.id).toBe(validators.id);
    });
  }

  if (validators.name) {
    it("has correct name", () => {
      expect(toolConfig.name).toBe(validators.name);
    });
  }

  if (validators.category) {
    it("has correct category", () => {
      expect(toolConfig.category).toBe(validators.category);
    });
  }

  if (validators.keywords) {
    it("has keywords", () => {
      expect(toolConfig.keywords.length).toBeGreaterThan(validators.keywords - 1);
    });
  }

  if (validators.faqs) {
    it("has faqs", () => {
      expect(toolConfig.faqs.length).toBeGreaterThan(validators.faqs - 1);
    });
  }

  if (validators.steps) {
    it("has steps", () => {
      expect(toolConfig.steps.length).toBeGreaterThan(validators.steps - 1);
    });
  }

  if (validators.custom) {
    validators.custom(toolConfig);
  }
}
