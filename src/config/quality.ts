export const QUALITY_THRESHOLD = {
  blog: 70,
  sns: 60,
  default: 65,
} as const;

export type QualityThresholdType = keyof typeof QUALITY_THRESHOLD;

export function getQualityThreshold(type: string) {
  if (type === 'blog' || type === 'sns') {
    return QUALITY_THRESHOLD[type];
  }

  return QUALITY_THRESHOLD.default;
}
