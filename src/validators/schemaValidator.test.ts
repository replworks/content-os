import { describe, it, expect } from 'vitest';
import { validateSchema } from './schemaValidator';

describe('validateSchema', () => {
  const schema = {
    type: 'object',
    required: ['title', 'body_markdown'],
    properties: {
      title: { type: 'string', minLength: 5 },
      body_markdown: { type: 'string', minLength: 10 },
      tags: {
        type: 'array',
        items: { type: 'string' },
      },
    },
    additionalProperties: false,
  };

  it('should return valid for correct data', () => {
    const data = {
      title: '강아지 이유 설명',
      body_markdown: '이것은 충분히 긴 마크다운 내용입니다.',
      tags: ['강아지', '행동'],
    };

    const result = validateSchema(schema, data);

    expect(result.valid).toBe(true);
    expect(result.errors).toBeUndefined();
  });

  it('should fail when required field is missing', () => {
    const data = {
      title: '제목만 있음',
    };

    const result = validateSchema(schema, data);

    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it('should fail when type is incorrect', () => {
    const data = {
      title: 123, // ❌ string이어야 함
      body_markdown: '정상 텍스트',
    };

    const result = validateSchema(schema, data);

    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it('should fail when string length is too short', () => {
    const data = {
      title: '짧음',
      body_markdown: '짧다',
    };

    const result = validateSchema(schema, data);

    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it('should fail when additional properties exist', () => {
    const data = {
      title: '정상 제목입니다',
      body_markdown: '충분히 긴 본문입니다.',
      extra: '허용되지 않은 필드', // ❌
    };

    const result = validateSchema(schema, data);

    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it('should include detailed AJV errors', () => {
    const data = {};

    const result = validateSchema(schema, data);

    expect(result.valid).toBe(false);
    expect(Array.isArray(result.errors)).toBe(true);

    // 🔥 AJV 에러 구조 확인
    expect(result.errors?.[0]).toHaveProperty('message');
    expect(result.errors?.[0]).toHaveProperty('instancePath');
  });
});
