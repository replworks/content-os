import { describe, it, expect, vi } from 'vitest';
import { getQualityThreshold } from '../src/config/index.ts';

describe('config', () => {
  it('returns type-specific threshold', () => {
    expect(getQualityThreshold('blog')).toBe(70);
  });

  it('falls back to default', () => {
    expect(getQualityThreshold('unknown')).toBe(65);
  });

  it('loads dev config when NODE_ENV=development', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    vi.resetModules();

    const { getConfig } = await import('../src/config/index.ts');
    expect(getConfig().threshold.default).toBe(55);

    process.env.NODE_ENV = originalEnv;
    vi.resetModules();
  });

  it('loads prod config when NODE_ENV=production', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    vi.resetModules();

    const { getConfig } = await import('../src/config/index.ts');
    expect(getConfig().threshold.default).toBe(70);

    process.env.NODE_ENV = originalEnv;
    vi.resetModules();
  });
});
