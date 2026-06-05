import { describe, it, expect } from 'vitest';
import { runGenerate } from './runGenerate.ts';
import { runTransform } from './runTransform.ts';
import { ERROR_CODES } from './errors.ts';

import { MockContentGenerator } from '../../tests/mocks/mockContentGenerator.ts';
import { MockContentEvaluator } from '../../tests/mocks/mockContentEvaluator.ts';

describe('runTransform', () => {
  it('should throw LOW_QUALITY when transform score is below threshold', async () => {
    const generator = new MockContentGenerator();
    const highEvaluator = new MockContentEvaluator();
    const lowEvaluator = {
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

    const blog = await runGenerate({
      type: 'blog',
      templateId: 'seo-v1',
      context: {
        topic: '강아지가 혀를 내미는 이유',
        audience: '초보 반려인',
      },
      generator,
      evaluator: highEvaluator,
    });

    await expect(
      runTransform({
        from: 'blog',
        to: 'sns',
        templateId: 'sns-transform',
        input: blog.data,
        context: {
          tone: 'friendly',
          goal: 'engagement',
        },
        generator,
        evaluator: lowEvaluator,
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.LOW_QUALITY,
      message: 'Quality score 40 below threshold 60',
    });
  });

  it('should transform blog to sns with valid structure and meta', async () => {
    const generator = new MockContentGenerator();
    const evaluator = new MockContentEvaluator();

    // 1️⃣ blog 생성
    const blog = await runGenerate({
      type: 'blog',
      templateId: 'seo-v1',
      context: {
        topic: '강아지가 혀를 내미는 이유',
        audience: '초보 반려인',
      },
      generator,
      evaluator,
    });

    // sanity check
    expect(blog.type).toBe('blog');
    expect(blog.data.title).toBeDefined();

    // 2️⃣ transform → sns
    const sns = await runTransform({
      from: 'blog',
      to: 'sns',
      templateId: 'sns-transform',
      input: blog.data,
      context: {
        tone: 'friendly',
        goal: 'engagement',
      },
      generator,
      evaluator,
    });

    // 🔥 3️⃣ 구조 검증 (핵심)
    expect(sns.type).toBe('sns');
    expect(sns.data).toBeDefined();
    expect(sns.meta).toBeDefined();

    // 🔥 4️⃣ 데이터 검증
    expect(typeof sns.data.content).toBe('string');
    expect(sns.data.content.length).toBeGreaterThan(0);

    // hashtags optional이지만 배열이면 더 좋음
    if (sns.data.hashtags) {
      expect(Array.isArray(sns.data.hashtags)).toBe(true);
    }

    // 🔥 5️⃣ meta 검증 (Content OS 핵심)
    expect(typeof sns.meta.quality_score).toBe('number');
    expect(sns.meta.quality_score).toBeGreaterThanOrEqual(0);
    expect(sns.meta.quality_score).toBeLessThanOrEqual(100);

    expect(sns.meta.dimensions).toBeDefined();
    expect(typeof sns.meta.dimensions.readability).toBe('number');
  });
});
