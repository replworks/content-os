import { describe, it, expect } from 'vitest';
import { generate } from './generate.ts';
import { MockContentGenerator } from '../../tests/mocks/mockContentGenerator.ts';

describe('Generator', () => {
  it('should generate blog json', async () => {
    const contentGenerator: MockContentGenerator = new MockContentGenerator();

    const result = await generate({
      type: 'blog',
      templateId: 'seo-v1',
      context: {
        topic: '강아지가 혀를 내미는 이유',
        audience: '초보 반려인',
      },
      generator: contentGenerator,
    });

    expect(result).toBeDefined();
    expect(result.title).toBeDefined();
    expect(result.body_markdown).toBeDefined();
  });
});
