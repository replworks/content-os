import { describe, it, expect } from 'vitest';
import { hardFilter } from './hardFilter.ts';

describe('hardFilter', () => {
  it('should pass valid data', () => {
    const result = hardFilter({
      title: 'Valid title',
      body_markdown: 'This is a valid body content.',
    });

    expect(result.valid).toBe(true);
  });

  it('should reject too short strings', () => {
    const result = hardFilter({
      title: 'Good title',
      body_markdown: 'hey',
    });

    expect(result.valid).toBe(false);
    expect(result.reason).toBe('TOO_SHORT');
  });

  it('should reject forbidden patterns', () => {
    const result = hardFilter({
      title: 'Valid title',
      body_markdown: 'This contains lorem ipsum text.',
    });

    expect(result.valid).toBe(false);
    expect(result.reason).toBe('FORBIDDEN_PATTERN');
  });

  it('should reject non-object values', () => {
    const result = hardFilter('not-an-object');

    expect(result.valid).toBe(false);
    expect(result.reason).toBe('NOT_OBJECT');
  });
});
