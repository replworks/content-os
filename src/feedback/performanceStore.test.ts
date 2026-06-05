import { describe, it, expect, afterEach } from 'vitest';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { loadAllPerformance, savePerformance } from './performanceStore.ts';
import type { PerformanceRecord } from './performanceStore.ts';

let tempDir = '';

describe('performanceStore', () => {
  afterEach(async () => {
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true });
      tempDir = '';
    }
  });

  it('saves a performance record and loads it back', async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'content-os-'));

    const record: PerformanceRecord = {
      content_id: 'test-1',
      type: 'blog',
      data: { title: 'Test' },
      meta: { quality_score: 80 },
      metrics: {
        views: 100,
        clicks: 20,
        ctr: 0.2,
        shares: 5,
      },
      created_at: new Date().toISOString(),
    };

    const filePath = await savePerformance(record, tempDir);
    expect(filePath).toContain('outputs/performance/');

    const records = await loadAllPerformance(undefined, tempDir);
    expect(records).toHaveLength(1);
    expect(records[0].content_id).toBe('test-1');
    expect(records[0].metrics.ctr).toBe(0.2);
  });

  it('filters performance records by type', async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'content-os-'));

    const blogRecord: PerformanceRecord = {
      content_id: 'blog-1',
      type: 'blog',
      data: { title: 'Blog Test' },
      meta: {},
      metrics: {
        views: 100,
        clicks: 10,
        ctr: 0.1,
        shares: 1,
      },
      created_at: new Date().toISOString(),
    };

    const snsRecord: PerformanceRecord = {
      content_id: 'sns-1',
      type: 'sns',
      data: { content: 'SNS' },
      meta: {},
      metrics: {
        views: 150,
        clicks: 15,
        ctr: 0.12,
        shares: 2,
      },
      created_at: new Date().toISOString(),
    };

    await savePerformance(blogRecord, tempDir);
    await savePerformance(snsRecord, tempDir);

    const blogRecords = await loadAllPerformance('blog', tempDir);
    expect(blogRecords).toHaveLength(1);
    expect(blogRecords[0].type).toBe('blog');
  });
});
