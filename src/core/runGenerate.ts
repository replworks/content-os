import { generate } from '../generator/generate.ts';
import { hardFilter } from '../validators/hardFilter.ts';
import { validate } from '../validators/validate.ts';
import type {
  ContentGenerator,
  ContentEvaluator,
} from '../interfaces/llm.interface.ts';
import { AppError, ERROR_CODES } from './errors.ts';
import { logInfo } from './logger.ts';

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
  const traceId = Math.random().toString(36).slice(2);
  logInfo('runGenerate:start', { traceId, type, templateId });

  const data = await generate({
    type,
    templateId,
    context,
    generator,
    traceId,
  });

  const filter = hardFilter(data);

  if (!filter.valid) {
    throw new AppError(ERROR_CODES.HARD_FILTER_FAILED, filter.reason);
  }

  const result = await validate({
    type,
    data,
    evaluator,
    traceId,
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
