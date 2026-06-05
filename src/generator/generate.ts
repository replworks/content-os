import { loadSchema } from '../core/loadSchema.ts';
import { loadTemplate } from '../core/loadTemplate.ts';
import { buildPrompt } from './promptBuilder.ts';
import type { ContentGenerator } from '../interfaces/llm.interface.ts';
import { runLLMTask } from '../core/runLLMTask.ts';

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

  return runLLMTask({
    schema,
    template,
    context,
    generator,
    promptBuilder: buildPrompt,
  });
}
