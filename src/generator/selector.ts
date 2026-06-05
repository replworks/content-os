import type { Meta } from '../core/types.ts';

export type SelectionCandidate<T> = {
  data: T;
  meta: Meta;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\uAC00-\uD7A3]+/g, ' ')
    .trim();

const extractText = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(extractText).join(' ');
  }

  if (value && typeof value === 'object') {
    return Object.values(value).map(extractText).join(' ');
  }

  return '';
};

const tokenize = (text: string) =>
  normalizeText(text).split(/\s+/).filter(Boolean);

const toTokenSet = (value: unknown) => new Set(tokenize(extractText(value)));

export function similarity(a: unknown, b: unknown): number {
  const aTokens = toTokenSet(a);
  const bTokens = toTokenSet(b);

  if (aTokens.size === 0 || bTokens.size === 0) {
    return 0;
  }

  let intersectionCount = 0;

  for (const token of aTokens) {
    if (bTokens.has(token)) {
      intersectionCount += 1;
    }
  }

  const unionCount = new Set([...aTokens, ...bTokens]).size;

  return unionCount === 0 ? 0 : intersectionCount / unionCount;
}

export function repetitionPenalty(value: unknown): number {
  const tokens = tokenize(extractText(value));

  if (tokens.length === 0) {
    return 0;
  }

  const unique = new Set(tokens);
  const duplicateCount = tokens.length - unique.size;

  return clamp(duplicateCount / tokens.length, 0, 1);
}

const averageSimilarity = (candidate: unknown, peers: unknown[]) => {
  const comparisons = peers.filter((peer) => peer !== candidate);

  if (comparisons.length === 0) {
    return 0;
  }

  const similaritySum = comparisons.reduce<number>(
    (sum, peer) => sum + similarity(candidate, peer),
    0
  );

  return similaritySum / comparisons.length;
};

export function computeScore<T>(meta: Meta, data: T, peers: T[] = []): number {
  const qualityBase = clamp(meta.quality_score, 0, 100);
  const toneBonus = clamp(meta.dimensions.tone_match, 0, 100) * 0.15;
  const readabilityBonus = clamp(meta.dimensions.readability, 0, 100) * 0.1;
  const diversityBonus = (1 - averageSimilarity(data, peers)) * 15;
  const penalty = repetitionPenalty(data) * 20;

  return clamp(
    qualityBase + toneBonus + readabilityBonus + diversityBonus - penalty,
    0,
    Number.POSITIVE_INFINITY
  );
}

export function selectBest<T>(
  candidates: SelectionCandidate<T>[]
): SelectionCandidate<T> | null {
  if (candidates.length === 0) {
    return null;
  }

  const scored = candidates.map((candidate) => ({
    candidate,
    score: computeScore(
      candidate.meta,
      candidate.data,
      candidates.map((item) => item.data)
    ),
  }));

  return scored.reduce((best, current) => {
    if (current.score !== best.score) {
      return current.score > best.score ? current : best;
    }

    return current.candidate.meta.quality_score >
      best.candidate.meta.quality_score
      ? current
      : best;
  }).candidate;
}
