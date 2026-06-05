import { loadTemplate } from '../core/loadTemplate.ts';
import { buildTransformPrompt } from './promptBuilder.ts';
import type { ContentGenerator } from '../interfaces/llm.interface';
import { loadSchema } from '../core/loadSchema.ts';
import { runLLMTask } from '../core/runLLMTask.ts';

/* eslint-disable @typescript-eslint/no-unused-vars */
export async function transform({
  from,
  to,
  templateId,
  input,
  context,
  generator,
  traceId,
}: {
  from: string;
  to: string;
  templateId: string;
  input: any;
  context: any;
  generator: ContentGenerator;
  traceId?: string;
}) {
  const schema = loadSchema(to);
  const template = loadTemplate(to, templateId);

  return runLLMTask({
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
