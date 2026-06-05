import { generateMany } from '../generator/generateMany.ts';
import { validate } from '../validators/validate.ts';
import { getQualityThreshold, getGenerationConfig } from '../config/index.ts';
import { mergeContext } from '../utils/context.ts';
import type {
  ContentGenerator,
  ContentEvaluator,
} from '../interfaces/llm.interface.ts';
import { AppError, ERROR_CODES } from './errors.ts';
import { logInfo } from './logger.ts';
import type {
  ContentDataMap,
  ContentType,
  Envelope,
  Candidate,
  CandidateSelectionResult,
} from './types.ts';

export type RunGenerateManyMode = 'single' | 'candidates';

export type SelectionFn<TType extends ContentType> = (
  candidates: ReadonlyArray<Candidate<ContentDataMap[TType]>>
) => number;

export type RunGenerateManyInput<TType extends ContentType> = {
  type: TType;
  templateId: string;
  context: Record<string, unknown>;
  externalContext?: Record<string, any>;
  generator: ContentGenerator;
  evaluator: ContentEvaluator;
  traceId?: string;
  count?: number;
  topK?: number;
  mode?: RunGenerateManyMode;
  selectionFn?: SelectionFn<TType>;
};

function getDefaultWinnerIndex<TType extends ContentType>(
  candidates: ReadonlyArray<Candidate<ContentDataMap[TType]>>
): number {
  return candidates.reduce((bestIndex, candidate, index) => {
    const currentQuality = candidate.meta.quality_score;
    const bestQuality = candidates[bestIndex].meta.quality_score;

    if (currentQuality > bestQuality) {
      return index;
    }

    return bestIndex;
  }, 0);
}

function normalizeWinnerIndex(
  index: number,
  length: number,
  fallback: number
): number {
  if (!Number.isFinite(index)) {
    return fallback;
  }

  const normalized = Math.trunc(index);

  if (normalized < 0 || normalized >= length) {
    return fallback;
  }

  return normalized;
}

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
  mode = 'single',
  selectionFn,
}: RunGenerateManyInput<TType>): Promise<
  | Envelope<ContentDataMap[TType]>
  | CandidateSelectionResult<ContentDataMap[TType]>
> {
  const resolvedTraceId = traceId ?? Math.random().toString(36).slice(2);
  const { count: defaultCount, topK: defaultTopK } = getGenerationConfig();
  const finalCount = count ?? defaultCount;
  const finalTopK = topK ?? defaultTopK;

  logInfo('runGenerateMany:start', {
    traceId: resolvedTraceId,
    type,
    templateId,
    count: finalCount,
    topK: finalTopK,
    mode,
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
      .slice(0, finalTopK) as Array<{
      data: ContentDataMap[TType];
      initialScore: number;
      scores?: Candidate<ContentDataMap[TType]>['scores'];
    }>;

    if (rankedCandidates.length === 0) {
      throw new AppError(
        ERROR_CODES.HARD_FILTER_FAILED,
        'No candidates passed hard filter'
      );
    }

    const validated = (await Promise.all(
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
          ...(candidate.scores ? { scores: candidate.scores } : {}),
        };
      })
    )) as Array<Candidate<ContentDataMap[TType]> | null>;

    const filtered = validated.filter(
      (candidate): candidate is Candidate<ContentDataMap[TType]> =>
        candidate !== null
    );

    if (filtered.length === 0) {
      throw new AppError(
        ERROR_CODES.LOW_QUALITY,
        'No candidates passed quality threshold'
      );
    }

    const defaultWinnerIndex = getDefaultWinnerIndex(filtered);
    const selectedIndex = selectionFn
      ? normalizeWinnerIndex(
          selectionFn(filtered),
          filtered.length,
          defaultWinnerIndex
        )
      : defaultWinnerIndex;

    if (mode === 'candidates') {
      return {
        type,
        candidates: filtered,
        defaultWinnerIndex,
      };
    }

    return {
      type,
      data: filtered[selectedIndex].data,
      meta: filtered[selectedIndex].meta,
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
