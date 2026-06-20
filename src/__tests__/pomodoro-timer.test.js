import { describe, it, expect } from 'vitest';
import { toolConfig } from '../tools/productivity/pomodoro-timer.js';
import { testToolConfig } from './tool-config-test.js';

describe('pomodoro-timer', () => {
  testToolConfig(toolConfig, {
    id: 'pomodoro-timer',
    name: 'Pomodoro Timer',
    category: 'productivity',
    minKeywords: 4,
    minFaqs: 2,
    minSteps: 3
  });

  it('has correct default durations in faqs', () => {
    const answer = toolConfig.faqs.find(f => f.question.includes('Pomodoro Technique'));
    expect(answer).toBeTruthy();
    expect(answer.answer).toContain('25');
    expect(answer.answer).toContain('5');
  });
});
