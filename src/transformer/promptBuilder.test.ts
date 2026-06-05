import { describe, it, expect } from 'vitest';
import { buildTransformPrompt } from './promptBuilder';

describe('buildTransformPrompt', () => {
  it('should build a prompt including input and template', () => {
    const input = {
      title: '강아지가 혀를 내미는 이유',
      body_markdown: '# 내용\n설명...',
    };

    const template = {
      platform: 'twitter',
      style: 'short',
    };

    const prompt = buildTransformPrompt({
      schema: { type: 'object' },
      template,
      input,
      context: {},
    });

    // 🔥 기본 구조
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(0);

    // 🔥 역할 정의
    expect(prompt).toContain('You are a content transformer');

    // 🔥 핵심 섹션 존재
    expect(prompt).toContain('INPUT CONTENT');
    expect(prompt).toContain('TEMPLATE');

    // 🔥 JSON 포함 확인
    expect(prompt).toContain('"title": "강아지가 혀를 내미는 이유"');
    expect(prompt).toContain('"platform": "twitter"');
  });

  it('should enforce strict JSON output rules', () => {
    const prompt = buildTransformPrompt({
      schema: { type: 'object' },
      template: {},
      input: {},
      context: {},
    });

    expect(prompt).toContain('Output ONLY valid JSON');
    expect(prompt).toContain('No explanation');
    expect(prompt).toContain('Follow schema');
  });

  it('should correctly serialize nested input data', () => {
    const input = {
      title: '테스트',
      meta: {
        tags: ['강아지', '반려견'],
      },
    };

    const prompt = buildTransformPrompt({
      schema: { type: 'object' },
      template: {},
      input,
      context: {},
    });

    expect(prompt).toContain('"tags": [');
    expect(prompt).toContain('"강아지"');
    expect(prompt).toContain('"반려견"');
  });

  it('should not lose markdown content', () => {
    const input = {
      body_markdown: '# 제목\n\n내용입니다.',
    };

    const prompt = buildTransformPrompt({
      schema: { type: 'object' },
      template: {},
      input,
      context: {},
    });

    expect(prompt).toContain('# 제목');
    expect(prompt).toContain('내용입니다.');
  });
});
