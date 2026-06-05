import { loadSchema } from '../core/loadSchema.ts';
import { loadTemplate } from '../core/loadTemplate.ts';
import { buildPrompt } from './promptBuilder.ts';
import { parseJSON } from '../utils/parseJSON.ts';
import type { ContentGenerator } from '../interfaces/llm.interface.ts';

export async function generate({
  type,
  templateId,
  context,
  generator,
}: {
  type: string;
  templateId: string;
  context: any;
  generator: ContentGenerator;
}) {
  if (!generator || typeof generator.generate !== 'function') {
    throw new Error('ContentGenerator with a generate() function is required');
  }

  const schema = loadSchema(type);
  const template = loadTemplate(type, templateId);

  const prompt = buildPrompt({
    schema,
    template,
    context,
  });

  const text = await generator.generate(prompt);

  const data = parseJSON(text);

  return data;
}
