export function buildMeta(quality: {
  quality_score: number;
  dimensions: {
    readability: number;
    relevance: number;
    tone_match: number;
    originality: number;
  };
  warnings: string[];
}) {
  return {
    quality_score: quality.quality_score,
    dimensions: quality.dimensions,
    warnings: quality.warnings,
  };
}
