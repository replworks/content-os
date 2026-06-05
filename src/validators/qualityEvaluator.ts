import type { ContentEvaluator } from '../interfaces/llm.interface.ts';
import { AppError, ERROR_CODES } from '../core/errors.ts';
import type { Meta } from '../core/types.ts';

export async function evaluateQuality({
  data,
  evaluator,
}: {
  data: unknown;
  evaluator: ContentEvaluator;
}): Promise<Meta> {
  if (!evaluator) {
    throw new AppError(ERROR_CODES.LLM_ERROR, 'QUALITY_LLM_REQUIRED');
  }

  const prompt = `
Evaluate the quality of this content.

Return ONLY JSON:

{
  "quality_score": number (0-100),
  "dimensions": {
    "readability": number,
    "relevance": number,
    "tone_match": number,
    "originality": number
  },
  "warnings": string[]
}

CONTENT:
${JSON.stringify(data)}
`;

  const text = await evaluator.evaluate(prompt);

  return JSON.parse(text) as Meta;
}
