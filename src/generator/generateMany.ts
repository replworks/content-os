import { generate } from './generate.ts';
import { hardFilter } from '../validators/hardFilter.ts';
import { similarity, repetitionPenalty } from './selector.ts';
import type { ContentGenerator } from '../interfaces/llm.interface.ts';
import type { ContentDataMap, ContentType } from '../core/types.ts';

const DEFAULT_GENERATION_COUNT = 5;

export type Candidate<T> = {
  data: T;
  cheapScore: number;
  initialScore: number;
};

function cheapScore(value: unknown) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return 0;
  }

  const record = value as Record<string, unknown>;
  let score = 0;

  for (const field of ['title', 'summary', 'content', 'body_markdown']) {
    const text = record[field];

    if (typeof text === 'string') {
      score += Math.min(text.length, 500);
    }
  }

  return score;
}

function computeInitialScore<T>(
  candidate: Candidate<T>,
  peers: Candidate<T>[]
) {
  if (peers.length <= 1) {
    return candidate.cheapScore;
  }

  const similarities = peers
    .filter((peer) => peer !== candidate)
    .map((peer) => similarity(candidate.data, peer.data));

  const avgSimilarity =
    similarities.reduce((sum, value) => sum + value, 0) / similarities.length;

  const diversityBonus = (1 - avgSimilarity) * 10;
  const penalty = repetitionPenalty(candidate.data) * 10;

  return candidate.cheapScore + diversityBonus - penalty;
}

export async function generateMany<TType extends ContentType>({
  type,
  templateId,
  context,
  generator,
  traceId,
  count = DEFAULT_GENERATION_COUNT,
}: {
  type: TType;
  templateId: string;
  context: Record<string, unknown>;
  generator: ContentGenerator;
  traceId?: string;
  count?: number;
}): Promise<Candidate<ContentDataMap[TType]>[]> {
  const rawCandidates = await Promise.all(
    Array.from({ length: count }, async () => {
      const data = await generate<TType>({
        type,
        templateId,
        context,
        generator,
        traceId,
      });

      const filter = hardFilter(data);

      if (!filter.valid) {
        return null;
      }

      return {
        data,
        cheapScore: cheapScore(data),
        initialScore: 0,
      } as Candidate<ContentDataMap[TType]>;
    })
  );

  const candidates = rawCandidates.filter(
    (candidate): candidate is Candidate<ContentDataMap[TType]> =>
      candidate !== null
  );

  const scoredCandidates = candidates.map((candidate) => ({
    ...candidate,
    initialScore: computeInitialScore(candidate, candidates),
  }));

  return scoredCandidates.sort((a, b) => b.initialScore - a.initialScore);
}
