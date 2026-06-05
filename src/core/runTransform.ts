import { transform } from '../transformer/transform.ts';
import { validate } from '../validators/validate.ts';
import type {
  ContentGenerator,
  ContentEvaluator,
} from '../interfaces/llm.interface.ts';

export async function runTransform({
  from,
  to,
  templateId,
  input,
  context,
  generator,
  evaluator,
}: {
  from: string;
  to: string;
  templateId: string;
  input: any;
  context: any;
  generator: ContentGenerator;
  evaluator: ContentEvaluator;
}) {
  const data = await transform({
    from,
    to,
    templateId,
    input,
    context,
    generator,
  });

  const result = await validate({
    type: to,
    data,
    evaluator,
  });

  if (!result.valid) {
    throw new Error('VALIDATION_ERROR');
  }

  return {
    type: to,
    data,
    meta: result.meta,
  };
}
