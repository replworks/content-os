import fs from 'fs';
import path from 'path';
import { AppError, ERROR_CODES } from './errors.ts';

export function loadTemplate(type: string, templateId: string) {
  const filePath = path.join(
    process.cwd(),
    'templates',
    type,
    `${templateId}.json`
  );

  if (!fs.existsSync(filePath)) {
    throw new AppError(
      ERROR_CODES.TEMPLATE_NOT_FOUND,
      `Template not found: ${type}/${templateId}`
    );
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}
