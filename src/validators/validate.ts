import { loadSchema } from '../core/loadSchema.ts';
import { validateSchema } from './schemaValidator.ts';
import { evaluateQuality } from './qualityEvaluator.ts';
import { ContentEvaluator } from '../interfaces/llm.interface.ts';

export async function validate({
  type,
  data,
  evaluator,
}: {
  type: string;
  data: any;
  evaluator: ContentEvaluator; // ✅ 필수로 변경
}) {
  const schema = loadSchema(type);

  // 1. Schema validation (Hard fail)
  const schemaResult = validateSchema(schema, data);

  if (!schemaResult.valid) {
    throw new Error('VALIDATION_ERROR');
  }

  // 2. Quality evaluation
  const quality = await evaluateQuality({
    data,
    evaluator,
  });

  return {
    meta: quality,
  };
}
