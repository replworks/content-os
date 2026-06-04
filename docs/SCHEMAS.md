# SCHEMAS.md

# Content OS — Schemas

---

## 1. Overview

Content OS의 모든 콘텐츠는 다음 구조를 따른다:

```json
{
  "type": "...",
  "data": { ... },
  "meta": { ... }
}
```

이 문서는 **`data` 필드의 구조 (schema)** 를 정의한다.

---

## 2. Design Principles

### 2.1 Strict Structure

* 모든 필드는 명확히 정의되어야 한다
* optional 필드는 최소화한다

---

### 2.2 Markdown First

* 모든 긴 콘텐츠는 `*_markdown` 필드 사용
* plain text 금지

---

### 2.3 No Free-form

* 구조 없는 텍스트 금지
* 가능한 모든 것은 필드로 분리

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

## 4. FAQ Schema

파일: `schemas/faq.schema.json`

```json
{
  "type": "object",
  "required": ["question", "answer_markdown"],
  "properties": {
    "question": {
      "type": "string",
      "minLength": 10
    },
    "answer_markdown": {
      "type": "string",
      "minLength": 50
    },
    "tags": {
      "type": "array",
      "items": { "type": "string" }
    }
  }
}
```

---

## 5. Docs Schema

파일: `schemas/docs.schema.json`

```json
{
  "type": "object",
  "required": ["title", "sections"],
  "properties": {
    "title": {
      "type": "string"
    },
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
    },
    "difficulty": {
      "type": "string",
      "enum": ["beginner", "intermediate", "advanced"]
    }
  }
}
```

---

## 6. SNS Schema

파일: `schemas/sns.schema.json`

```json
{
  "type": "object",
  "required": ["content", "platform"],
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

## 7. Announcement Schema

파일: `schemas/announcement.schema.json`

```json
{
  "type": "object",
  "required": ["title", "body_markdown"],
  "properties": {
    "title": {
      "type": "string"
    },
    "body_markdown": {
      "type": "string"
    },
    "priority": {
      "type": "string",
      "enum": ["low", "medium", "high"]
    }
  }
}
```

---

## 8. Schema Evolution Rules

### 8.1 Backward Compatibility

* 기존 필드는 삭제하지 않는다
* 새로운 필드는 optional로 추가

---

### 8.2 Versioning

필요 시:

```json
{
  "version": "v1"
}
```

---

## 9. Validation Rules

Validator는 다음을 반드시 검사한다:

* required 필드 존재 여부
* 타입 일치
* 길이 제한
* enum 값

---

## 10. Anti-Patterns

금지:

* 하나의 string에 모든 정보 넣기
* markdown 없이 긴 텍스트 작성
* schema 없는 콘텐츠 생성
* optional 필드 남용

---

## 11. Final Statement

Schema는 단순한 데이터 정의가 아니다.

> **콘텐츠의 품질을 강제하는 시스템이다**
