import fs from 'fs';
import path from 'path';
import { AppError, ERROR_CODES } from './errors.ts';

export function loadSchema(type: string) {
  const filePath = path.join(process.cwd(), 'schemas', `${type}.schema.json`);

  if (!fs.existsSync(filePath)) {
    throw new AppError(
      ERROR_CODES.SCHEMA_NOT_FOUND,
      `Schema not found: ${type}`
    );
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}
