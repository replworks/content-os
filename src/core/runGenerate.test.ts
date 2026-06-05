import { describe, it, expect } from 'vitest';
import { runGenerate } from './runGenerate.ts';
import { ERROR_CODES } from './errors.ts';

import { MockContentGenerator } from '../../tests/mocks/mockContentGenerator.ts';
import { MockContentEvaluator } from '../../tests/mocks/mockContentEvaluator.ts';

describe('runGenerate', () => {
  it('should throw LOW_QUALITY when score is below threshold', async () => {
    const generator = new MockContentGenerator();
    const evaluator = {
      evaluate: async () =>
        JSON.stringify({
          quality_score: 40,
          dimensions: {
            readability: 40,
            relevance: 40,
            tone_match: 40,
            originality: 40,
          },
          warnings: [],
        }),
    };

    await expect(
      runGenerate({
        type: 'blog',
        templateId: 'seo-v1',
        context: {
          topic: '강아지가 혀를 내미는 이유',
          audience: '초보 반려인',
        },
        generator,
        evaluator,
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.LOW_QUALITY,
      message: 'Quality score 40 below threshold 70',
    });
  });

  it('should generate blog content with valid structure and meta', async () => {
    const generator = new MockContentGenerator();
    const evaluator = new MockContentEvaluator();

    const result = await runGenerate({
      type: 'blog',
      templateId: 'seo-v1',
      context: {
        topic: '강아지가 혀를 내미는 이유',
        audience: '초보 반려인',
      },
      generator,
      evaluator,
    });

    // 🔥 1. envelope 구조 검증
    expect(result).toBeDefined();
    expect(result.type).toBe('blog');
    expect(result.data).toBeDefined();
    expect(result.meta).toBeDefined();

    // 🔥 2. blog schema 핵심 필드 검증
    expect(typeof result.data.title).toBe('string');
    expect(result.data.title.length).toBeGreaterThan(0);

    expect(typeof result.data.summary).toBe('string');
    expect(result.data.summary.length).toBeGreaterThan(0);

    expect(typeof result.data.body_markdown).toBe('string');
    expect(result.data.body_markdown.length).toBeGreaterThan(0);

    // optional 필드 (있으면 검증)
    if (result.data.tags) {
      expect(Array.isArray(result.data.tags)).toBe(true);
    }

    if (result.data.seo) {
      expect(typeof result.data.seo.meta_title).toBe('string');
      expect(typeof result.data.seo.meta_description).toBe('string');
    }

    // 🔥 3. meta (Content OS 핵심)
    expect(typeof result.meta.quality_score).toBe('number');
    expect(result.meta.quality_score).toBeGreaterThanOrEqual(0);
    expect(result.meta.quality_score).toBeLessThanOrEqual(100);

    expect(result.meta.dimensions).toBeDefined();
    expect(typeof result.meta.dimensions.readability).toBe('number');
    expect(typeof result.meta.dimensions.relevance).toBe('number');

    // 🔥 4. warnings 구조
    if (result.meta.warnings) {
      expect(Array.isArray(result.meta.warnings)).toBe(true);
    }
  });
});
