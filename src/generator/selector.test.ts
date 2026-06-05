import { describe, it, expect } from 'vitest';
import {
  computeScore,
  selectBest,
  similarity,
  repetitionPenalty,
} from './selector.ts';

describe('selector', () => {
  it('computes similarity between similar content', () => {
    const a = { title: 'Hello world', body: 'This is a test story' };
    const b = { title: 'Hello world', body: 'This is another story' };

    expect(similarity(a, b)).toBeGreaterThan(0.5);
  });

  it('returns zero similarity for unrelated content', () => {
    const a = { title: 'Hello world' };
    const b = { title: 'Deep sea fishing' };

    expect(similarity(a, b)).toBeLessThan(0.2);
  });

  it('penalizes repeated words in content', () => {
    const value = 'repeat repeat repeat hello hello';

    expect(repetitionPenalty(value)).toBeGreaterThan(0);
    expect(repetitionPenalty(value)).toBeLessThanOrEqual(1);
  });

  it('computes higher score for better readability and tone', () => {
    const meta = {
      quality_score: 70,
      dimensions: {
        readability: 90,
        relevance: 70,
        tone_match: 95,
        originality: 60,
      },
      warnings: [],
    };

    const score = computeScore(meta, { text: 'some story content' }, []);

    expect(score).toBeGreaterThan(80);
  });

  it('selects the best candidate by composite scoring', () => {
    const candidates = [
      {
        data: { title: 'A', body: 'Unique narrative content' },
        meta: {
          quality_score: 80,
          dimensions: {
            readability: 90,
            relevance: 70,
            tone_match: 95,
            originality: 70,
          },
          warnings: [],
        },
      },
      {
        data: { title: 'B', body: 'Very similar content to A' },
        meta: {
          quality_score: 90,
          dimensions: {
            readability: 50,
            relevance: 70,
            tone_match: 50,
            originality: 80,
          },
          warnings: [],
        },
      },
    ];

    const winner = selectBest(candidates);

    expect(winner).not.toBeNull();
    expect(winner?.data.title).toBe('A');
  });
});
