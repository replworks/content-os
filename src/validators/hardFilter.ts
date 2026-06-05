const FORBIDDEN_PATTERNS = [
  'lorem ipsum',
  'test test',
  'dummy',
  'asdf',
  '1234',
];

function collectStrings(value: unknown, seen = new Set<unknown>()): string[] {
  if (value == null) return [];
  if (typeof value === 'string') return [value];
  if (typeof value !== 'object') return [];
  if (seen.has(value)) return [];

  seen.add(value);

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectStrings(item, seen));
  }

  return Object.values(value).flatMap((item) => collectStrings(item, seen));
}

export function hardFilter(data: unknown): {
  valid: boolean;
  reason?: string;
} {
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    return { valid: false, reason: 'NOT_OBJECT' };
  }

  const hasRequiredField =
    'title' in data || 'content' in data || 'body_markdown' in data;

  if (!hasRequiredField) {
    return { valid: false, reason: 'MISSING_REQUIRED_FIELD' };
  }

  const strings = collectStrings(data);

  for (const value of strings) {
    if (value.length < 5) {
      return { valid: false, reason: 'TOO_SHORT' };
    }

    if (value.length > 10000) {
      return { valid: false, reason: 'TOO_LONG' };
    }

    const normalized = value.toLowerCase();

    if (normalized.includes('undefined')) {
      return { valid: false, reason: 'BROKEN_JSON_SUSPECTED' };
    }

    if (
      (normalized.includes('{') || normalized.includes('}')) &&
      (value.match(/[{}]/g)?.length ?? 0) > 4
    ) {
      return { valid: false, reason: 'BROKEN_JSON_SUSPECTED' };
    }

    if (FORBIDDEN_PATTERNS.some((pattern) => normalized.includes(pattern))) {
      return { valid: false, reason: 'FORBIDDEN_PATTERN' };
    }
  }

  return { valid: true };
}
