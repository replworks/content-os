import { describe, it, expect } from 'vitest';
import { extractRules } from './ruleExtractor.ts';

const now = new Date().toISOString();

describe('ruleExtractor', () => {
  it('returns no rules when there are no performance records', () => {
    const result = extractRules([]);

    expect(result.rules).toEqual([]);
  });

  it('extracts learned rules from performance data', () => {
    const records = [
      {
        content_id: '1',
        type: 'blog',
        data: {
          title: 'Why does this work?',
          summary: 'A summary with a question mark?',
          body_markdown: 'A'.repeat(1000),
        },
        meta: {},
        metrics: {
          views: 2000,
          clicks: 500,
          ctr: 0.25,
          shares: 40,
        },
        created_at: now,
      },
    ];

    const result = extractRules(records);

    expect(result.rules).toContain('Prefer question-style titles.');
    expect(result.rules).toContain(
      'Keep content shorter for better engagement.'
    );
    expect(result.rules).toContain(
      'Encourage shareable language and calls to action.'
    );
    expect(result.rules).toContain('Use question-style headlines or hooks.');
  });
});
