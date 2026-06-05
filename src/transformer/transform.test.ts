import { describe, it, expect } from 'vitest';
import { runGenerate } from '../core/runGenerate';
import { runTransform } from '../core/runTransform';
import { MockContentGenerator } from '../../tests/mocks/mockContentGenerator';
import { MockContentEvaluator } from '../../tests/mocks/mockContentEvaluator';

describe('Transform', () => {
  it('should convert blog to sns', async () => {
    const generator = new MockContentGenerator();
    const evaluator = new MockContentEvaluator();

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

    // 🔥 구조 검증
    expect(sns.type).toBe('sns');

    // 🔥 데이터 검증
    expect(typeof sns.data.content).toBe('string');
    expect(sns.data.content.length).toBeGreaterThan(0);

    // 🔥 schema 관련
    expect(Array.isArray(sns.data.hashtags)).toBe(true);

    // 🔥 meta 검증
    expect(typeof sns.meta.quality_score).toBe('number');
    expect(sns.meta.quality_score).toBeGreaterThan(0);
  });
});
