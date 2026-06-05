export const baseConfig = {
  threshold: {
    default: 65,
    blog: 70,
    sns: 60,
  } as Record<string, number>,
  generation: {
    count: 5,
    topK: 2,
  },
};
