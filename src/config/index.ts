export type ContentType = 'blog' | 'sns' | string;

type QualityThresholdConfig = {
  default: number;
  byType?: Record<string, number>;
};

type GenerationConfig = {
  defaultCount: number;
  defaultTopK: number;
};

const envThresholdValue = Number(process.env.QUALITY_THRESHOLD);

export const CONFIG = {
  quality: {
    default:
      process.env.QUALITY_THRESHOLD && !Number.isNaN(envThresholdValue)
        ? envThresholdValue
        : 65,
    byType: {
      blog: 70,
      sns: 60,
    },
  } as QualityThresholdConfig,

  generation: {
    defaultCount: 5,
    defaultTopK: 2,
  } as GenerationConfig,
};

export function getQualityThreshold(type: ContentType): number {
  return CONFIG.quality.byType?.[type] ?? CONFIG.quality.default;
}

export function getGenerationConfig() {
  return CONFIG.generation;
}
