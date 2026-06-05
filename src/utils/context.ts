export function mergeContext(
  base: Record<string, any>,
  external?: Record<string, any>
): Record<string, any> {
  if (!external) {
    return base;
  }

  return {
    ...base,
    ...external,
    preferred_patterns: [
      ...(Array.isArray(base?.preferred_patterns)
        ? base.preferred_patterns
        : []),
      ...(Array.isArray(external.preferred_patterns)
        ? external.preferred_patterns
        : []),
    ],
    avoid_patterns: [
      ...(Array.isArray(base?.avoid_patterns) ? base.avoid_patterns : []),
      ...(Array.isArray(external.avoid_patterns)
        ? external.avoid_patterns
        : []),
    ],
  };
}
