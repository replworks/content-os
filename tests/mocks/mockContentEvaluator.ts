import { ContentEvaluator } from '../../src/interfaces/llm.interface';

export class MockContentEvaluator implements ContentEvaluator {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  async evaluate(prompt: string): Promise<string> {
    return JSON.stringify({
      quality_score: 85,
      dimensions: {
        readability: 80,
        relevance: 90,
        tone_match: 85,
        originality: 75,
      },
      warnings: ['Some minor grammar issues.'],
    });
  }
}
