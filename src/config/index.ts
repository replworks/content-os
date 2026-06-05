import { ENV } from './env.ts';
import { baseConfig } from './base.ts';
import { devConfig } from './dev.ts';
import { prodConfig } from './prod.ts';

export type ContentType = 'blog' | 'sns' | string;

type ConfigShape = typeof baseConfig;

export function getConfig(): ConfigShape {
  if (ENV === 'production') {
    return prodConfig;
  }

  if (ENV === 'development') {
    return devConfig;
  }

  return baseConfig;
}

export function getQualityThreshold(type: ContentType): number {
  const config = getConfig();
  return config.threshold[type] ?? config.threshold.default;
}

export function getGenerationConfig() {
  return getConfig().generation;
}
