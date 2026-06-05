import { loadTemplate } from '../core/loadTemplate.ts';
import { buildTransformPrompt } from './promptBuilder.ts';
import type { ContentGenerator } from '../interfaces/llm.interface';
import { loadSchema } from '../core/loadSchema.ts';
import { runLLMTask } from '../core/runLLMTask.ts';
import type { ContentDataMap, ContentType } from '../core/types.ts';
import { AppError, ERROR_CODES } from '../core/errors.ts';
import { loadAllPerformance } from '../feedback/performanceStore.ts';
import { extractRules } from '../feedback/ruleExtractor.ts';

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
  const pastPerformance = await loadAllPerformance(to);
  const learnedRules = extractRules(pastPerformance).rules;
  const schema = loadSchema(to);
  const template = loadTemplate(to, templateId);

  return runLLMTask<ContentDataMap[TType]>({
    schema,
    template,
    context: {
      source: input,
      ...context,
      learned_rules: learnedRules,
    },
    generator,
    promptBuilder: buildTransformPrompt,
    traceId,
  }).catch((err) => {
    if (err instanceof AppError) {
      throw err;
    }

    throw new AppError(
      ERROR_CODES.UNKNOWN_ERROR,
      err instanceof Error ? err.message : String(err)
    );
  });
}
