import { transform } from '../transformer/transform.ts';
import { hardFilter } from '../validators/hardFilter.ts';
import { validate } from '../validators/validate.ts';
import type {
  ContentGenerator,
  ContentEvaluator,
} from '../interfaces/llm.interface.ts';
import { AppError, ERROR_CODES } from './errors.ts';
import { logInfo } from './logger.ts';

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
  const traceId = Math.random().toString(36).slice(2);
  logInfo('runTransform:start', { traceId, from, to });

  const data = await transform({
    from,
    to,
    templateId,
    input,
    context,
    generator,
    traceId,
  });

  const filter = hardFilter(data);

  if (!filter.valid) {
    throw new AppError(ERROR_CODES.HARD_FILTER_FAILED, filter.reason);
  }

  const result = await validate({
    type: to,
    data,
    evaluator,
    traceId,
  });

  if (!result.valid) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR);
  }

  return {
    type: to,
    data,
    meta: result.meta,
  };
}
