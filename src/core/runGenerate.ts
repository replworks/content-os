import { generate } from '../generator/generate.ts';
import { hardFilter } from '../validators/hardFilter.ts';
import { validate } from '../validators/validate.ts';
import { getQualityThreshold } from '../config/quality.ts';
import { mergeContext } from '../utils/context.ts';
import type {
  ContentGenerator,
  ContentEvaluator,
} from '../interfaces/llm.interface.ts';
import { AppError, ERROR_CODES } from './errors.ts';
import { logInfo } from './logger.ts';
import type { ContentDataMap, ContentType, Envelope } from './types.ts';

type RunGenerateInput<TType extends ContentType> = {
  type: TType;
  templateId: string;
  context: Record<string, unknown>;
  externalContext?: Record<string, any>;
  generator: ContentGenerator;
  evaluator: ContentEvaluator;
  traceId?: string;
};

export async function runGenerate<TType extends ContentType>({
  type,
  templateId,
  context,
  externalContext,
  generator,
  evaluator,
  traceId,
}: RunGenerateInput<TType>): Promise<Envelope<ContentDataMap[TType]>> {
  const resolvedTraceId = traceId ?? Math.random().toString(36).slice(2);
  logInfo('runGenerate:start', { traceId: resolvedTraceId, type, templateId });

  try {
    const mergedContext = mergeContext(context, externalContext);

    const data = await generate<TType>({
      type,
      templateId,
      context: mergedContext,
      generator,
      traceId: resolvedTraceId,
    });

    const filter = hardFilter(data);

    if (!filter.valid) {
      throw new AppError(ERROR_CODES.HARD_FILTER_FAILED, filter.reason);
    }

    const result = await validate({
      type,
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

    const threshold = getQualityThreshold(type);

    if (result.meta.quality_score < threshold) {
      throw new AppError(
        ERROR_CODES.LOW_QUALITY,
        `Quality score ${result.meta.quality_score} below threshold ${threshold}`
      );
    }

    return {
      type,
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
