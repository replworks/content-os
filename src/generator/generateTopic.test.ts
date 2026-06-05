import { describe, it, expect } from 'vitest';
import { generateTopic } from './generateTopic';
import { MockTopicGenerator } from '../../tests/mocks/mockTopicGenerator';

describe('Topic Generator', () => {
  it('should generate topic', async () => {
    const generator = new MockTopicGenerator();

    const result = await generateTopic({
      context: {
        brand: '애견 서비스',
        audience: '초보 반려인',
      },
      generator,
    });

    expect(result.topic).toBeDefined();
    expect(result.intent).toBe('education');
  });
});
