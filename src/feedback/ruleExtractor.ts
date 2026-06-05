import type { PerformanceRecord } from './performanceStore.ts';

const normalizeText = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(normalizeText).join(' ');
  }

  if (value && typeof value === 'object') {
    return Object.values(value).map(normalizeText).join(' ');
  }

  return '';
};

const containsQuestion = (value: unknown) => normalizeText(value).includes('?');

const average = (numbers: number[]) =>
  numbers.length === 0
    ? 0
    : numbers.reduce((sum, item) => sum + item, 0) / numbers.length;

export function extractRules(records: PerformanceRecord[]): {
  rules: string[];
} {
  if (records.length === 0) {
    return { rules: [] };
  }

  const ctrs = records.map((record) => record.metrics.ctr);
  const views = records.map((record) => record.metrics.views);
  const shares = records.map((record) => record.metrics.shares);
  const bodies = records.map((record) => normalizeText(record.data));

  const avgCtr = average(ctrs);
  const avgShares = average(shares);
  const avgViews = average(views);
  const avgBodyLength = average(bodies.map((body) => body.length));

  const rules: string[] = [];

  if (avgCtr > 0.2) {
    rules.push('Prefer question-style titles.');
  }

  if (avgBodyLength > 900) {
    rules.push('Keep content shorter for better engagement.');
  }

  if (avgBodyLength < 300) {
    rules.push('Use longer content for more detail.');
  }

  if (avgShares > 25) {
    rules.push('Encourage shareable language and calls to action.');
  }

  const topPerformers = records.filter(
    (record) => record.metrics.ctr >= 0.2 || record.metrics.shares >= 10
  );

  if (topPerformers.some((record) => containsQuestion(record.data))) {
    rules.push('Use question-style headlines or hooks.');
  }

  if (
    avgViews > 1000 &&
    !rules.includes('Keep content shorter for better engagement.')
  ) {
    rules.push('Lead with a strong first sentence.');
  }

  return { rules };
}
