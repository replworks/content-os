import { generate } from '../generator/generate.ts';
import { validate } from '../validators/validate.ts';
import type {
  ContentGenerator,
  ContentEvaluator,
} from '../interfaces/llm.interface.ts';
import { AppError, ERROR_CODES } from './errors.ts';

export async function runGenerate({
  type,
  templateId,
  context,
  generator,
  evaluator,
}: {
  type: string;
  templateId: string;
  context: any;
  generator: ContentGenerator;
  evaluator: ContentEvaluator;
}) {
  const data = await generate({
    type,
    templateId,
    context,
    generator,
  });

  const result = await validate({
    type,
    data,
    evaluator,
  });

  if (!result.valid) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR);
  }

  return {
    type,
    data,
    meta: result.meta,
  };
}
