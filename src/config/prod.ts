import { baseConfig } from './base.ts';

export const prodConfig = {
  ...baseConfig,
  threshold: {
    blog: 75,
    sns: 65,
    default: 70,
  },
  generation: {
    count: 5,
    topK: 2,
  },
};
