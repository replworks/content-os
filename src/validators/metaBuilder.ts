export function buildMeta(quality: any) {
  return {
    quality_score: quality.quality_score,
    dimensions: quality.dimensions,
    warnings: quality.warnings,
  };
}
