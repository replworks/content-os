import { describe, it, expect } from 'vitest';
import { mergeContext } from '../src/utils/context.ts';

describe('mergeContext', () => {
  it('merges base and external context', () => {
    const base = { topic: 'dog' };
    const external = { tone: 'casual' };

    const result = mergeContext(base, external);

    expect(result.topic).toBe('dog');
    expect(result.tone).toBe('casual');
  });

  it('merges arrays correctly', () => {
    const base = { preferred_patterns: ['short'] };
    const external = { preferred_patterns: ['list'] };

    const result = mergeContext(base, external);

    expect(result.preferred_patterns).toEqual(['short', 'list']);
  });
});
