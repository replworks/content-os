import { loadTemplate } from '../core/loadTemplate.ts';
import { buildTransformPrompt } from './promptBuilder.ts';
import type { ContentGenerator } from '../interfaces/llm.interface';
import { loadSchema } from '../core/loadSchema.ts';
import { runLLMTask } from '../core/runLLMTask.ts';
import type { ContentDataMap, ContentType } from '../core/types.ts';

/* eslint-disable @typescript-eslint/no-unused-vars */
export async function transform<TType extends ContentType>({
  from,
  to,
  templateId,
  input,
  context,
  generator,
  traceId,
}: {
  from: ContentType;
  to: TType;
  templateId: string;
  input: unknown;
  context: Record<string, unknown>;
  generator: ContentGenerator;
  traceId?: string;
}): Promise<ContentDataMap[TType]> {
  const schema = loadSchema(to);
  const template = loadTemplate(to, templateId);

  return runLLMTask<ContentDataMap[TType]>({
    schema,
    template,
    context: {
      source: input,
      ...context,
    },
    generator,
    promptBuilder: buildTransformPrompt,
    traceId,
  });
}
