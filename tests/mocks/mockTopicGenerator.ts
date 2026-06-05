import type { TopicGenerator } from '../../src/interfaces/llm.interface.ts';

export class MockTopicGenerator implements TopicGenerator {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  async generate(prompt: string): Promise<string> {
    return JSON.stringify({
      topic: '강아지가 혀를 내미는 이유',
      intent: 'education',
      keywords: ['강아지', '행동', '혀'],
    });
  }
}
