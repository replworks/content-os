import { AppError, ERROR_CODES } from '../core/errors.ts';

export function parseJSON<T>(text: string): T {
  try {
    return JSON.parse(text) as T;
  } catch (e) {
    console.error(
      JSON.stringify({
        level: 'error',
        message: 'parseJSON:failed',
        context: { text, error: e instanceof Error ? e.message : String(e) },
      })
    );

    throw new AppError(ERROR_CODES.JSON_PARSE_ERROR, 'JSON_PARSE_ERROR');
  }
}
