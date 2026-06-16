import { describe, it, expect } from 'vitest';
import { toolConfig } from '../tools/productivity/wireframe-sketcher.js';
import { testSimpleToolConfig } from './tool-config-test.js';

describe('wireframe-sketcher', () => {
  testSimpleToolConfig(toolConfig, 'wireframe-sketcher', 'Wireframe & Mockup Sketcher', 'productivity');
});