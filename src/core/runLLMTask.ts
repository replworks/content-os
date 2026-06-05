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

  const text = await generator.generate(prompt);

  const data = parseJSON(text);

  return data;
}
