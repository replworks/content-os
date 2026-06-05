import { parseJSON } from '../utils/parseJSON.ts';
import type { ContentGenerator } from '../interfaces/llm.interface.ts';

export async function runLLMTask({
  schema,
  template,
  context,
  input,
  generator,
  promptBuilder,
}: {
  schema: any;
  template: any;
  context: any;
  input?: any;
  generator: ContentGenerator;
  promptBuilder: (args: any) => string;
}) {
  const prompt = promptBuilder({
    schema,
    template,
    context,
    input,
  });

  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const text = await generator.generate(prompt);

    try {
      return parseJSON(text);
    } catch {
      if (attempt === maxAttempts) {
        throw new Error('JSON_PARSE_ERROR');
      }

      console.warn(
        `[runLLMTask] JSON parse failed, retrying... (${attempt}/${maxAttempts})`
      );
    }
  }

  throw new Error('JSON_PARSE_ERROR');
}
