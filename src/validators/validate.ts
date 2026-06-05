import { loadSchema } from '../core/loadSchema.ts';
import { validateSchema } from './schemaValidator.ts';
import { evaluateQuality } from './qualityEvaluator.ts';
import type { ContentEvaluator } from '../interfaces/llm.interface.ts';
import { logInfo } from '../core/logger.ts';
import type { ContentType, Meta } from '../core/types.ts';

export async function validate<T>({
  type,
  data,
  evaluator,
  traceId,
}: {
  type: ContentType;
  data: T;
  evaluator: ContentEvaluator;
  traceId?: string;
}): Promise<{ valid: boolean; errors?: { message?: string }[]; meta?: Meta }> {
  const schema = loadSchema(type);

  // 1. Schema validation (Hard fail)
  const schemaResult = validateSchema(schema, data);

  if (!schemaResult.valid) {
    return {
      valid: false,
      errors: (schemaResult.errors ?? []) as { message?: string }[],
    };
  }

  // 2. Quality evaluation
  const quality = await evaluateQuality({
    data,
    evaluator,
  });

  logInfo('validate:done', {
    traceId,
    quality_score: quality.quality_score,
  });

  return {
    valid: true,
    meta: quality,
  };
}
