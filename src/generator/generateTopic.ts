import { parseJSON } from '../utils/parseJSON.ts';
import { TopicGenerator } from '../interfaces/llm.interface.ts';

export async function generateTopic({
  context,
  generator,
}: {
  context: any;
  generator: TopicGenerator;
}) {
  if (!generator || typeof generator.generate !== 'function') {
    throw new Error('TopicGenerator with a generate() function is required');
  }

  const prompt = `
You are a content strategist.

Generate ONE blog topic.

Return JSON ONLY:

{
  "topic": string,
  "intent": "seo | education | awareness",
  "keywords": string[]
}

CONTEXT:
${JSON.stringify(context, null, 2)}
`;

  const text = await generator.generate(prompt);

  const data = parseJSON(text);

  return data;
}
