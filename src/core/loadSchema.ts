import fs from 'fs';
import path from 'path';

export function loadSchema(type: string) {
  const filePath = path.join(process.cwd(), 'schemas', `${type}.schema.json`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Schema not found: ${type}`);
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}
