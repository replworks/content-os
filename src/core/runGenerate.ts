import { generate } from '../generator/generate.ts';
import { hardFilter } from '../validators/hardFilter.ts';
import { validate } from '../validators/validate.ts';
import type {
  ContentGenerator,
  ContentEvaluator,
} from '../interfaces/llm.interface.ts';
import { AppError, ERROR_CODES } from './errors.ts';
import { logInfo } from './logger.ts';
import type { ContentDataMap, ContentType, Envelope } from './types.ts';

export async function runGenerate<TType extends ContentType>({
  type,
  templateId,
  context,
  generator,
  evaluator,
}: {
  type: TType;
  templateId: string;
  context: Record<string, unknown>;
  generator: ContentGenerator;
  evaluator: ContentEvaluator;
}): Promise<Envelope<ContentDataMap[TType]>> {
  const traceId = Math.random().toString(36).slice(2);
  logInfo('runGenerate:start', { traceId, type, templateId });

  const data = await generate<TType>({
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

  if (!result.meta) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR);
  }

  return {
    type,
    data,
    meta: result.meta,
  };
}
