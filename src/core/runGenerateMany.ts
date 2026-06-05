import { generateMany } from '../generator/generateMany.ts';
import { selectBest } from '../generator/selector.ts';
import { validate } from '../validators/validate.ts';
import { getQualityThreshold, getGenerationConfig } from '../config/index.ts';
import { mergeContext } from '../utils/context.ts';
import type {
  ContentGenerator,
  ContentEvaluator,
} from '../interfaces/llm.interface.ts';
import { AppError, ERROR_CODES } from './errors.ts';
import { logInfo } from './logger.ts';
import type { ContentDataMap, ContentType, Envelope } from './types.ts';

export async function runGenerateMany<TType extends ContentType>({
  type,
  templateId,
  context,
  generator,
  evaluator,
  traceId,
  count,
  externalContext,
  topK,
}: {
  type: TType;
  templateId: string;
  context: Record<string, unknown>;
  externalContext?: Record<string, any>;
  generator: ContentGenerator;
  evaluator: ContentEvaluator;
  traceId?: string;
  count?: number;
  topK?: number;
}): Promise<Envelope<ContentDataMap[TType]>> {
  const resolvedTraceId = traceId ?? Math.random().toString(36).slice(2);
  const { defaultCount, defaultTopK } = getGenerationConfig();
  const finalCount = count ?? defaultCount;
  const finalTopK = topK ?? defaultTopK;

  logInfo('runGenerateMany:start', {
    traceId: resolvedTraceId,
    type,
    templateId,
    count: finalCount,
    topK: finalTopK,
  });

  try {
    const mergedContext = mergeContext(context, externalContext);

    const candidates = await generateMany<TType>({
      type,
      templateId,
      context: mergedContext,
      generator,
      traceId: resolvedTraceId,
      count: finalCount,
    });

    const rankedCandidates = candidates
      .sort((a, b) => b.initialScore - a.initialScore)
      .slice(0, finalTopK);

    if (rankedCandidates.length === 0) {
      throw new AppError(
        ERROR_CODES.HARD_FILTER_FAILED,
        'No candidates passed hard filter'
      );
    }

    const validated = await Promise.all(
      rankedCandidates.map(async (candidate) => {
        const result = await validate({
          type,
          data: candidate.data,
          evaluator,
          traceId: resolvedTraceId,
        });

        if (!result.valid || !result.meta) {
          return null;
        }

        const threshold = getQualityThreshold(type);

        if (result.meta.quality_score < threshold) {
          return null;
        }

        return {
          data: candidate.data,
          meta: result.meta,
        };
      })
    );

    const bestCandidate = selectBest(
      validated.filter(
        (
          candidate
        ): candidate is {
          data: ContentDataMap[TType];
          meta: Envelope<ContentDataMap[TType]>['meta'];
        } => candidate !== null
      )
    );

    if (!bestCandidate) {
      throw new AppError(
        ERROR_CODES.LOW_QUALITY,
        'No candidates passed quality threshold'
      );
    }

    return {
      type,
      data: bestCandidate.data,
      meta: bestCandidate.meta,
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
