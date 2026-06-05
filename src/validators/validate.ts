import { loadSchema } from '../core/loadSchema.ts';
import { validateSchema } from './schemaValidator.ts';
import { evaluateQuality } from './qualityEvaluator.ts';
import type { ContentEvaluator } from '../interfaces/llm.interface.ts';
import { logInfo } from '../core/logger.ts';

export async function validate({
  type,
  data,
  evaluator,
  traceId,
}: {
  type: string;
  data: any;
  evaluator: ContentEvaluator;
  traceId?: string;
}) {
  const schema = loadSchema(type);

  // 1. Schema validation (Hard fail)
  const schemaResult = validateSchema(schema, data);

  if (!schemaResult.valid) {
    return {
      valid: false,
      errors: schemaResult.errors,
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
