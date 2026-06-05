# SCHEMAS.md

# Content OS — Schemas

---

## 1. Overview

Content OS의 모든 콘텐츠는 **공통 Envelope 구조**를 따른다:

```json
{
  "type": "...",
  "data": { ... },
  "meta": { ... }
}
```

이 문서는 **`data` 필드의 구조 (schema)** 를 정의한다.

> schema는 Generator가 생성해야 할 JSON 구조를 강제한다

---

## 2. Design Principles

### 2.1 Strict Structure

* 모든 필드는 명확히 정의되어야 한다
* required 중심 설계
* optional 최소화

---

### 2.2 Markdown First

* 긴 콘텐츠는 반드시 `*_markdown`
* plain text 금지

---

### 2.3 JSON Only

* 모든 출력은 JSON
* 자유 텍스트 금지

---

### 2.4 Schema = Contract

* Generator는 schema를 반드시 따라야 한다
* Validator는 schema 위반 시 즉시 실패한다

---

## 3. Blog Schema

파일: `schemas/blog.schema.json`

```json
{
  "type": "object",
  "required": ["title", "summary", "body_markdown"],
  "properties": {
    "title": {
      "type": "string",
      "minLength": 10
    },
    "summary": {
      "type": "string",
      "minLength": 30,
      "maxLength": 200
    },
    "body_markdown": {
      "type": "string",
      "minLength": 300
    },
    "tags": {
      "type": "array",
      "items": { "type": "string" }
    },
    "category": {
      "type": "string"
    },
    "seo": {
      "type": "object",
      "required": ["meta_title", "meta_description"],
      "properties": {
        "meta_title": { "type": "string" },
        "meta_description": { "type": "string" }
      }
    }
  }
}
```

---

## 4. SNS Schema

파일: `schemas/sns.schema.json`

```json
{
  "type": "object",
  "required": ["platform", "content"],
  "properties": {
    "platform": {
      "type": "string",
      "enum": ["twitter", "facebook", "instagram", "linkedin"]
    },
    "content": {
      "type": "string",
      "maxLength": 500
    },
    "hashtags": {
      "type": "array",
      "items": { "type": "string" }
    }
  }
}
```

---

## 5. FAQ Schema

```json
{
  "type": "object",
  "required": ["question", "answer_markdown"],
  "properties": {
    "question": { "type": "string" },
    "answer_markdown": { "type": "string" }
  }
}
```

---

## 6. Docs Schema

```json
{
  "type": "object",
  "required": ["title", "sections"],
  "properties": {
    "title": { "type": "string" },
    "sections": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["heading", "content_markdown"],
        "properties": {
          "heading": { "type": "string" },
          "content_markdown": { "type": "string" }
        }
      }
    }
  }
}
```

---

## 7. Schema Evolution Rules

### 7.1 Backward Compatibility

* 기존 필드는 삭제하지 않는다
* 새로운 필드는 optional로 추가

---

### 7.2 Versioning (필요 시)

```json
{
  "version": "v1"
}
```

---

## 8. Validation Responsibility

Schema는 다음을 강제한다:

* 필드 존재 여부
* 타입
* 길이
* enum 값

→ 실제 검증은 Validator가 수행한다

---

## 9. Anti-Patterns

금지:

* schema 없는 콘텐츠 생성
* markdown 없는 긴 텍스트
* 하나의 string에 모든 정보 넣기
* JSON 외 출력

---

## 10. Final Statement

Schema는 단순 구조 정의가 아니다.

> **LLM의 출력을 제어하는 가장 강력한 수단이다**
