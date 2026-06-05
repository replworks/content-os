import { transform } from '../transformer/transform.ts';
import { hardFilter } from '../validators/hardFilter.ts';
import { validate } from '../validators/validate.ts';
import type {
  ContentGenerator,
  ContentEvaluator,
} from '../interfaces/llm.interface.ts';
import { AppError, ERROR_CODES } from './errors.ts';
import { logInfo } from './logger.ts';
import type { ContentDataMap, ContentType, Envelope } from './types.ts';

export async function runTransform<TType extends ContentType>({
  from,
  to,
  templateId,
  input,
  context,
  generator,
  evaluator,
}: {
  from: ContentType;
  to: TType;
  templateId: string;
  input: unknown;
  context?: Record<string, unknown>;
  generator: ContentGenerator;
  evaluator: ContentEvaluator;
}): Promise<Envelope<ContentDataMap[TType]>> {
  const traceId = Math.random().toString(36).slice(2);
  logInfo('runTransform:start', { traceId, from, to });

  const data = await transform<TType>({
    from,
    to,
    templateId,
    input,
    context: context ?? {},
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

  if (!result.meta) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR);
  }

  return {
    type: to,
    data,
    meta: result.meta,
  };
}
