import { describe, it, expect } from 'vitest';
import {
  toolConfig,
  parseConventionalCommits,
  groupCommitsByType,
  generateChangelog,
  exportToJson,
  exportToCsv,
  render,
  destroy
} from '../tools/text/git-changelog-generator.js';

describe('git-changelog-generator', () => {
  it('has correct toolConfig', () => {
    expect(toolConfig.id).toBe('git-changelog-generator');
    expect(toolConfig.name).toContain('Changelog');
    expect(toolConfig.category).toBe('text');
    expect(toolConfig.icon).toBe('📜');
    expect(toolConfig.status).toBe('done');
    expect(toolConfig.keywords.length).toBeGreaterThan(3);
    expect(toolConfig.steps.length).toBeGreaterThan(2);
    expect(toolConfig.faqs.length).toBeGreaterThan(1);
  });

  describe('parseConventionalCommits', () => {
    it('parses full format commits with hash', () => {
      const text = 'abc1234 feat(auth): add login';
      const commits = parseConventionalCommits(text);
      expect(commits.length).toBe(1);
      expect(commits[0].hash).toBe('abc1234');
      expect(commits[0].type).toBe('feat');
      expect(commits[0].scope).toBe('auth');
      expect(commits[0].message).toBe('add login');
    });

    it('parses commits without hash', () => {
      const text = 'feat: add new feature';
      const commits = parseConventionalCommits(text);
      expect(commits.length).toBe(1);
      expect(commits[0].hash).toBeNull();
      expect(commits[0].type).toBe('feat');
      expect(commits[0].scope).toBeNull();
      expect(commits[0].message).toBe('add new feature');
    });

    it('parses multiple commits', () => {
      const text = `abc1234 feat(auth): add login
def5678 fix(api): handle null
abc9012 docs: update README`;
      const commits = parseConventionalCommits(text);
      expect(commits.length).toBe(3);
      expect(commits[0].type).toBe('feat');
      expect(commits[1].type).toBe('fix');
      expect(commits[2].type).toBe('docs');
    });

    it('ignores non-conventional commit lines', () => {
      const text = `abc1234 feat(auth): add login
Just a regular commit message
def5678 fix: handle bug`;
      const commits = parseConventionalCommits(text);
      expect(commits.length).toBe(2);
    });

    it('handles all supported commit types', () => {
      const types = ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert'];
      for (const type of types) {
        const commits = parseConventionalCommits(`${type}: commit`);
        expect(commits.length).toBe(1);
        expect(commits[0].type).toBe(type);
      }
    });
  });

  describe('groupCommitsByType', () => {
    it('groups commits by type', () => {
      const commits = [
        { type: 'feat', message: 'a' },
        { type: 'fix', message: 'b' },
        { type: 'feat', message: 'c' }
      ];
      const grouped = groupCommitsByType(commits);
      expect(grouped.feat.length).toBe(2);
      expect(grouped.fix.length).toBe(1);
    });
  });

  describe('generateChangelog', () => {
    it('generates markdown changelog', () => {
      const commits = [
        { hash: 'abc1234', type: 'feat', scope: 'auth', message: 'add login' },
        { hash: 'def5678', type: 'fix', scope: null, message: 'handle bug' }
      ];
      const changelog = generateChangelog(commits);
      expect(changelog).toContain('# Changelog');
      expect(changelog).toContain('## ✨ Features');
      expect(changelog).toContain('## 🐛 Bug Fixes');
      expect(changelog).toContain('abc1234');
      expect(changelog).toContain('add login');
    });

    it('respects includeHash option', () => {
      const commits = [{ hash: 'abc1234', type: 'feat', message: 'test' }];
      const withoutHash = generateChangelog(commits, { includeHash: false });
      expect(withoutHash).not.toContain('abc1234');
    });

    it('respects includeScope option', () => {
      const commits = [{ hash: 'abc1234', type: 'feat', scope: 'auth', message: 'test' }];
      const withoutScope = generateChangelog(commits, { includeScope: false });
      expect(withoutScope).not.toContain('auth');
    });

    it('uses custom title', () => {
      const commits = [{ hash: 'abc1234', type: 'feat', message: 'test' }];
      const changelog = generateChangelog(commits, { title: 'v2.0.0' });
      expect(changelog).toContain('# v2.0.0');
    });
  });

  describe('exportToJson', () => {
    it('exports commits as JSON', () => {
      const commits = [{ hash: 'abc1234', type: 'feat', scope: null, message: 'test' }];
      const json = exportToJson(commits);
      const parsed = JSON.parse(json);
      expect(parsed.length).toBe(1);
      expect(parsed[0].type).toBe('feat');
    });
  });

  describe('exportToCsv', () => {
    it('exports commits as CSV', () => {
      const commits = [{ hash: 'abc1234', type: 'feat', scope: 'auth', message: 'add login' }];
      const csv = exportToCsv(commits);
      expect(csv).toContain('hash,type,scope,message');
      expect(csv).toContain('abc1234');
      expect(csv).toContain('feat');
    });
  });

  describe('render', () => {
    it('appends content to container', () => {
      const container = document.createElement('div');
      render(container);
      expect(container.querySelector('.changelog-container')).toBeTruthy();
      expect(container.querySelector('#git-log-input')).toBeTruthy();
      expect(container.querySelector('#output')).toBeTruthy();
      expect(container.querySelector('#generate-btn')).toBeTruthy();
      expect(container.querySelector('#copy-btn')).toBeTruthy();
      expect(container.querySelector('#download-btn')).toBeTruthy();
      expect(container.querySelector('#clear-btn')).toBeTruthy();
    });

    it('creates output format options', () => {
      const container = document.createElement('div');
      render(container);
      const select = container.querySelector('#output-format');
      expect(select).toBeTruthy();
      expect(select.options.length).toBe(3);
    });

    it('creates checkbox options', () => {
      const container = document.createElement('div');
      render(container);
      expect(container.querySelector('#include-hash')).toBeTruthy();
      expect(container.querySelector('#include-scope')).toBeTruthy();
    });

    it('creates file upload input', () => {
      const container = document.createElement('div');
      render(container);
      const fileInput = container.querySelector('#file-upload');
      expect(fileInput).toBeTruthy();
      expect(fileInput.type).toBe('file');
    });
  });

  describe('destroy', () => {
    it('cleans up without throwing', () => {
      const container = document.createElement('div');
      render(container);
      expect(() => destroy()).not.toThrow();
    });
  });
});