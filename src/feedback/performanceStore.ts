import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

export type PerformanceRecord = {
  content_id: string;
  type: string;
  data: unknown;
  meta: unknown;
  metrics: {
    views: number;
    clicks: number;
    ctr: number;
    shares: number;
  };
  created_at: string;
};

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../'
);

const defaultPerformanceDir = path.join(projectRoot, 'outputs', 'performance');

function performanceDirectory(baseDir?: string) {
  return baseDir
    ? path.join(baseDir, 'outputs', 'performance')
    : defaultPerformanceDir;
}

export async function savePerformance(
  record: PerformanceRecord,
  baseDir?: string
): Promise<string> {
  const directory = performanceDirectory(baseDir);
  await fs.mkdir(directory, { recursive: true });

  const fileName = `${Date.now()}-${record.content_id}.json`;
  const filePath = path.join(directory, fileName);
  await fs.writeFile(filePath, JSON.stringify(record, null, 2), 'utf-8');

  return filePath;
}

export async function loadAllPerformance(
  type?: string,
  baseDir?: string
): Promise<PerformanceRecord[]> {
  const directory = performanceDirectory(baseDir);

  try {
    const entries = await fs.readdir(directory);
    const records: PerformanceRecord[] = [];

    for (const entry of entries) {
      if (!entry.endsWith('.json')) {
        continue;
      }

      try {
        const content = await fs.readFile(path.join(directory, entry), 'utf-8');
        const record = JSON.parse(content) as PerformanceRecord;

        if (!type || record.type === type) {
          records.push(record);
        }
      } catch {
        continue;
      }
    }

    return records;
  } catch (err) {
    if ((err as { code?: string }).code === 'ENOENT') {
      return [];
    }
    throw err;
  }
}
