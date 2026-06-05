import { loadSchema } from '../core/loadSchema.ts';
import { validateSchema } from './schemaValidator.ts';
import { evaluateQuality } from './qualityEvaluator.ts';
import type { ContentEvaluator } from '../interfaces/llm.interface.ts';

export async function validate({
  type,
  data,
  evaluator,
}: {
  type: string;
  data: any;
  evaluator: ContentEvaluator;
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

  return {
    valid: true,
    meta: quality,
  };
}
