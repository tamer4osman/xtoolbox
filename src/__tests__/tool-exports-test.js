import { it, expect } from 'vitest';

/**
 * Reusable tool exports tests
 * @param {Object} toolExports - The tool exports object
 * @param {Object} options - Test options
 * @param {boolean} [options.requireToolConfig=true] - Whether toolConfig is required
 * @param {boolean} [options.requireRender=false] - Whether render function is required
 * @param {boolean} [options.requireProcess=false] - Whether process function is required
 */
export function testToolExports(toolExports, options = {}) {
  const {
    requireToolConfig = true,
    requireRender = false,
    requireProcess = false
  } = options;

  if (requireToolConfig) {
    it('exports toolConfig', () => {
      expect(toolExports.toolConfig).toBeDefined();
      expect(toolExports.toolConfig.id).toBeTruthy();
      expect(toolExports.toolConfig.name).toBeTruthy();
      expect(toolExports.toolConfig.category).toBeTruthy();
    });
  }

  if (requireRender) {
    it('exports render function', () => {
      expect(typeof toolExports.render).toBe('function');
    });
  }

  if (requireProcess) {
    it('exports process function', () => {
      expect(typeof toolExports.process).toBe('function');
    });
  }
}

/**
 * Test that tool exports required functions
 * @param {Object} toolExports - The tool exports object
 * @param {string[]} requiredFunctions - List of required function names
 */
export function testRequiredFunctions(toolExports, requiredFunctions) {
  requiredFunctions.forEach(funcName => {
    it(`exports ${funcName} function`, () => {
      expect(typeof toolExports[funcName]).toBe('function');
    });
  });
}

/**
 * Test that tool exports optional functions
 * @param {Object} toolExports - The tool exports object
 * @param {string[]} optionalFunctions - List of optional function names
 */
export function testOptionalFunctions(toolExports, optionalFunctions) {
  optionalFunctions.forEach(funcName => {
    it(`exports ${funcName} function if present`, () => {
      if (toolExports[funcName]) {
        expect(typeof toolExports[funcName]).toBe('function');
      }
    });
  });
}

/**
 * Test tool with factory pattern
 * @param {Object} toolExports - The tool exports object
 * @param {Function} factoryFunction - The factory function to test
 */
export function testFactoryPattern(toolExports, factoryFunction) {
  it('exports factory function', () => {
    expect(typeof factoryFunction).toBe('function');
  });

  it('factory returns object with render and process', () => {
    const result = factoryFunction({});
    expect(result).toHaveProperty('render');
    expect(result).toHaveProperty('process');
    expect(typeof result.render).toBe('function');
    expect(typeof result.process).toBe('function');
  });
}
