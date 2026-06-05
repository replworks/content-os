import { describe, it, expect } from 'vitest';
import { buildPrompt } from './promptBuilder';

describe('buildPrompt', () => {
  it('should build a prompt string including schema, template, and context', () => {
    const schema = {
      type: 'object',
      properties: {
        title: { type: 'string' },
      },
    };

    const template = {
      style: 'seo',
    };

    const context = {
      topic: '강아지',
    };

    const prompt = buildPrompt({
      schema,
      template,
      context,
    });

    // 🔥 기본 구조 검증
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(0);

    // 🔥 핵심 키워드 포함 여부
    expect(prompt).toContain('You are a content generator');
    expect(prompt).toContain('STRICT RULES');
    expect(prompt).toContain('SCHEMA');
    expect(prompt).toContain('TEMPLATE');
    expect(prompt).toContain('CONTEXT');

    // 🔥 JSON stringify 포함 여부
    expect(prompt).toContain('"type": "object"');
    expect(prompt).toContain('"style": "seo"');
    expect(prompt).toContain('"topic": "강아지"');
  });

  it('should enforce strict JSON rules in prompt', () => {
    const prompt = buildPrompt({
      schema: {},
      template: {},
      context: {},
    });

    expect(prompt).toContain('Output ONLY valid JSON');
    expect(prompt).toContain('No explanation');
    expect(prompt).toContain('Follow schema exactly');
  });

  it('should serialize complex context correctly', () => {
    const context = {
      topic: '강아지',
      audience: '초보 반려인',
      options: {
        tone: 'friendly',
      },
    };

    const prompt = buildPrompt({
      schema: {},
      template: {},
      context,
    });

    expect(prompt).toContain('"topic": "강아지"');
    expect(prompt).toContain('"audience": "초보 반려인"');
    expect(prompt).toContain('"tone": "friendly"');
  });
});
