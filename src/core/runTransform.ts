import { transform } from '../transformer/transform.ts';
import { hardFilter } from '../validators/hardFilter.ts';
import { validate } from '../validators/validate.ts';
import { getQualityThreshold } from '../config/index.ts';
import { mergeContext } from '../utils/context.ts';
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
  context = {},
  externalContext,
  generator,
  evaluator,
  traceId,
}: {
  from: ContentType;
  to: TType;
  templateId: string;
  input: unknown;
  context?: Record<string, unknown>;
  externalContext?: Record<string, any>;
  generator: ContentGenerator;
  evaluator: ContentEvaluator;
  traceId?: string;
}): Promise<Envelope<ContentDataMap[TType]>> {
  const resolvedTraceId = traceId ?? Math.random().toString(36).slice(2);
  logInfo('runTransform:start', { traceId: resolvedTraceId, from, to });

  try {
    const mergedContext = mergeContext(context, externalContext);

    const data = await transform<TType>({
      from,
      to,
      templateId,
      input,
      context: mergedContext,
      generator,
      traceId: resolvedTraceId,
    });

    const filter = hardFilter(data);

    if (!filter.valid) {
      throw new AppError(ERROR_CODES.HARD_FILTER_FAILED, filter.reason);
    }

    const result = await validate({
      type: to,
      data,
      evaluator,
      traceId: resolvedTraceId,
    });

    if (!result.valid) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR);
    }

    if (!result.meta) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR);
    }

    const threshold = getQualityThreshold(to);

    if (result.meta.quality_score < threshold) {
      throw new AppError(
        ERROR_CODES.LOW_QUALITY,
        `Quality score ${result.meta.quality_score} below threshold ${threshold}`
      );
    }

    return {
      type: to,
      data,
      meta: result.meta,
    };
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }

    throw new AppError(
      ERROR_CODES.UNKNOWN_ERROR,
      err instanceof Error ? err.message : String(err)
    );
  }
}
