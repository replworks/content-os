import { generate } from './generate.ts';
import { hardFilter } from '../validators/hardFilter.ts';
import type { ContentGenerator } from '../interfaces/llm.interface.ts';
import type { ContentDataMap, ContentType } from '../core/types.ts';

const DEFAULT_GENERATION_COUNT = 5;

type Candidate<T> = {
  data: T;
  cheapScore: number;
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
      } as Candidate<ContentDataMap[TType]>;
    })
  );

  return rawCandidates.filter(
    (candidate): candidate is Candidate<ContentDataMap[TType]> =>
      candidate !== null
  );
}
