import { loadSchema } from '../core/loadSchema.ts';
import { loadTemplate } from '../core/loadTemplate.ts';
import { buildPrompt } from './promptBuilder.ts';
import type { ContentGenerator } from '../interfaces/llm.interface.ts';
import { runLLMTask } from '../core/runLLMTask.ts';
import type { ContentDataMap, ContentType } from '../core/types.ts';

export async function generate<TType extends ContentType>({
  type,
  templateId,
  context,
  generator,
  traceId,
}: {
  type: TType;
  templateId: string;
  context: Record<string, unknown>;
  generator: ContentGenerator;
  traceId?: string;
}): Promise<ContentDataMap[TType]> {
  if (!generator || typeof generator.generate !== 'function') {
    throw new Error('ContentGenerator with a generate() function is required');
  }

  const schema = loadSchema(type);
  const template = loadTemplate(type, templateId);

  return runLLMTask<ContentDataMap[TType]>({
    schema,
    template,
    context,
    generator,
    promptBuilder: buildPrompt,
    traceId,
  });
}
