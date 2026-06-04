import { model } from "../core/gemini";
import { parseJSON } from "../utils/parseJSON";

export async function evaluateQuality(data: any) {
  const prompt = `
Evaluate the quality of this content.

Return JSON ONLY.

{
  "readability": number (0~1),
  "relevance": number (0~1),
  "tone_match": number (0~1),
  "originality": number (0~1),
  "warnings": string[]
}

Content:
${JSON.stringify(data)}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const parsed = parseJSON(text);

  const score =
    (parsed.readability +
      parsed.relevance +
      parsed.tone_match +
      parsed.originality) /
    4;

  return {
    quality_score: score,
    dimensions: {
      readability: parsed.readability,
      relevance: parsed.relevance,
      tone_match: parsed.tone_match,
      originality: parsed.originality,
    },
    warnings: parsed.warnings || [],
  };
}
