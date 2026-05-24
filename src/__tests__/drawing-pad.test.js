import { describe, it, expect } from 'vitest';
import { setupCanvas } from '../tools/productivity/drawing-pad.js';

describe('drawing-pad', () => {
  describe('setupCanvas', () => {
    it('returns control object with expected methods', () => {
      const canvas = document.createElement('canvas');
      const ctrl = setupCanvas(canvas, '#ffffff');
      expect(ctrl).toHaveProperty('setColor');
      expect(ctrl).toHaveProperty('setSize');
      expect(ctrl).toHaveProperty('setTool');
      expect(ctrl).toHaveProperty('clear');
      expect(ctrl).toHaveProperty('resize');
      expect(ctrl).toHaveProperty('getCtx');
      expect(typeof ctrl.setColor).toBe('function');
      expect(typeof ctrl.setSize).toBe('function');
      expect(typeof ctrl.clear).toBe('function');
    });

    it('getCtx returns a value', () => {
      const canvas = document.createElement('canvas');
      const ctrl = setupCanvas(canvas, '#ffffff');
      expect(typeof ctrl.getCtx).toBe('function');
    });

    it('setColor and setTool do not throw', () => {
      const canvas = document.createElement('canvas');
      const ctrl = setupCanvas(canvas, '#ffffff');
      expect(() => ctrl.setColor('#ff0000')).not.toThrow();
      expect(() => ctrl.setTool('eraser')).not.toThrow();
      expect(() => ctrl.setTool('pen')).not.toThrow();
    });

    it('clear does not throw', () => {
      const canvas = document.createElement('canvas');
      const ctrl = setupCanvas(canvas, '#ffffff');
      expect(() => ctrl.clear()).not.toThrow();
    });
  });
});
