export const ERROR_CODES = {
  JSON_PARSE_ERROR: 'JSON_PARSE_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  LLM_ERROR: 'LLM_ERROR',
  SCHEMA_NOT_FOUND: 'SCHEMA_NOT_FOUND',
  TEMPLATE_NOT_FOUND: 'TEMPLATE_NOT_FOUND',
  HARD_FILTER_FAILED: 'HARD_FILTER_FAILED',
  LOW_QUALITY: 'LOW_QUALITY',
} as const;

export class AppError extends Error {
  code: string;

  constructor(code: string, message?: string) {
    super(message ?? code);
    this.name = 'AppError';
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
