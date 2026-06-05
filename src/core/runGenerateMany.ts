import { generateMany } from '../generator/generateMany.ts';
import { validate } from '../validators/validate.ts';
import { getQualityThreshold } from '../config/quality.ts';
import type {
  ContentGenerator,
  ContentEvaluator,
} from '../interfaces/llm.interface.ts';
import { AppError, ERROR_CODES } from './errors.ts';
import { logInfo } from './logger.ts';
import type { ContentDataMap, ContentType, Envelope } from './types.ts';

const DEFAULT_TOP_COUNT = 2;

export async function runGenerateMany<TType extends ContentType>({
  type,
  templateId,
  context,
  generator,
  evaluator,
  traceId,
  count,
  topK = DEFAULT_TOP_COUNT,
}: {
  type: TType;
  templateId: string;
  context: Record<string, unknown>;
  generator: ContentGenerator;
  evaluator: ContentEvaluator;
  traceId?: string;
  count?: number;
  topK?: number;
}): Promise<Envelope<ContentDataMap[TType]>> {
  const resolvedTraceId = traceId ?? Math.random().toString(36).slice(2);
  logInfo('runGenerateMany:start', {
    traceId: resolvedTraceId,
    type,
    templateId,
    topK,
  });

  try {
    const candidates = await generateMany<TType>({
      type,
      templateId,
      context,
      generator,
      traceId: resolvedTraceId,
      count,
    });

    const rankedCandidates = candidates
      .sort((a, b) => b.cheapScore - a.cheapScore)
      .slice(0, topK);

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
          qualityScore: result.meta.quality_score,
          cheapScore: candidate.cheapScore,
          meta: result.meta,
        };
      })
    );

    const bestCandidate = validated
      .filter(
        (
          candidate
        ): candidate is {
          data: ContentDataMap[TType];
          qualityScore: number;
          cheapScore: number;
          meta: Envelope<ContentDataMap[TType]>['meta'];
        } => candidate !== null
      )
      .sort((a, b) => {
        if (b.qualityScore !== a.qualityScore) {
          return b.qualityScore - a.qualityScore;
        }

        return b.cheapScore - a.cheapScore;
      })[0];

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
