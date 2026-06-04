import { loadSchema } from '../core/loadSchema';
import { loadTemplate } from '../core/loadTemplate';
import { buildPrompt } from './promptBuilder';
import { parseJSON } from '../utils/parseJSON';
import { ContentGenerator } from '../interfaces/llm.interface';

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
