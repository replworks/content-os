import type { ContentEvaluator } from '../interfaces/llm.interface.ts';

export async function evaluateQuality({
  data,
  evaluator,
}: {
  data: any;
  evaluator: ContentEvaluator;
}) {
  if (!evaluator) {
    throw new Error('QUALITY_LLM_REQUIRED');
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

  return JSON.parse(text);
}
