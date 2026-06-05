import { describe, it, expect } from 'vitest';
import { getQualityThreshold } from '../src/config/index.ts';

describe('config', () => {
  it('returns type-specific threshold', () => {
    expect(getQualityThreshold('blog')).toBe(70);
  });

  it('falls back to default', () => {
    expect(getQualityThreshold('unknown')).toBe(65);
  });
});
