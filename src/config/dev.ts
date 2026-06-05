import { baseConfig } from './base.ts';

export const devConfig = {
  ...baseConfig,
  threshold: {
    blog: 60,
    sns: 50,
    default: 55,
  },
  generation: {
    count: 3,
    topK: 1,
  },
};
