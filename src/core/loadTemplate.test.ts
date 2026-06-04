import { describe, it, expect } from 'vitest';
import { loadTemplate } from './loadTemplate';

describe('Loaders', () => {
  it('should load blog template', () => {
    const template = loadTemplate('blog', 'seo-v1');

    expect(template).toBeDefined();
    expect(template.id).toBe('seo-v1');
  });

  it('should throw if template not found', () => {
    expect(() => loadTemplate('blog', 'invalid')).toThrow();
  });
});
