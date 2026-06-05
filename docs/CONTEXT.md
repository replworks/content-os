# Content OS — Context Specification (CONTEXT.md)

---

## 1. Overview

Context는 Content OS에서 **콘텐츠의 의미를 결정하는 입력 데이터**다.

```text
schema + template + context → prompt → LLM → data
```

* **schema**: 출력 구조
* **template**: 출력 방식
* **context**: 콘텐츠 내용

> Context는 “무엇을 쓸 것인가”를 정의한다.

---

## 2. Design Principles

### 2.1 Structured Input Only

* 모든 context는 구조화된 JSON이어야 한다
* free-form 텍스트 금지

---

### 2.2 Predictability

* 동일한 context는 유사한 결과를 만들어야 한다
* 테스트 가능해야 한다

---

### 2.3 Minimal but Sufficient

* 최소한의 필드만 사용
* 하지만 의미 전달에 충분해야 한다

---

## 3. Base Context (공통 구조)

모든 콘텐츠 타입은 다음 기본 구조를 따른다:

```json
{
  "topic": "string",
  "audience": "string",
  "goal": "string",
  "tone": "string",
  "constraints": []
}
```

---

### 필드 설명

| 필드          | 설명                              |
| ----------- | ------------------------------- |
| topic       | 콘텐츠 주제                          |
| audience    | 대상 사용자                          |
| goal        | 콘텐츠 목적 (SEO, SNS, conversion 등) |
| tone        | 글의 톤 & 스타일                      |
| constraints | 금지 사항 / 제한 조건                   |

---

## 4. Blog Context

파일: 내부 정의 (별도 파일 없음)

```json
{
  "topic": "강아지가 혀를 내미는 이유",
  "audience": "초보 반려인",
  "goal": "SEO",
  "tone": "친절하고 설명형",
  "keywords": ["강아지", "헥헥", "행동"]
}
```

---

### 추가 필드

| 필드       | 설명      |
| -------- | ------- |
| keywords | SEO 키워드 |

---

## 5. SNS Context (Transform)

SNS는 단독 생성이 아니라 **Transform 결과**로 주로 생성된다.

```json
{
  "source": { ...blogData },
  "platform": "twitter",
  "goal": "클릭 유도",
  "tone": "간결하고 흥미롭게"
}
```

---

### 필드 설명

| 필드       | 설명                       |
| -------- | ------------------------ |
| source   | 원본 콘텐츠 (blog.data)       |
| platform | SNS 플랫폼                  |
| goal     | 목적 (engagement, click 등) |
| tone     | 표현 방식                    |

---

## 6. Transform Context 규칙

Transform 시 context는 다음 구조를 따른다:

```json
{
  "source": { ... },
  "...additional context"
}
```

---

### 규칙

* `source` 필드는 반드시 포함
* 원본 데이터는 `data`만 포함 (meta 제외)
* template이 변환 방식을 결정

---

## 7. Context vs Template

이 둘은 완전히 다른 역할이다.

| 구분       | 역할     |
| -------- | ------ |
| context  | 무엇을 쓸지 |
| template | 어떻게 쓸지 |

---

### 예시

```json
// context
{
  "topic": "강아지 건강",
  "audience": "초보"
}
```

```json
// template
{
  "structure": ["intro", "problem", "solution"]
}
```

---

## 8. Validation Rules

Validator는 context를 직접 검증하지 않는다.

하지만 다음을 가정한다:

* 필수 필드 존재
* 의미적으로 일관성 있음

---

## 9. Anti-Patterns

금지:

* 긴 설명을 하나의 string으로 넣는 것
* schema 대신 context로 구조를 표현하는 것
* template 역할을 context에 넣는 것
* source 없이 transform 수행

---

## 10. Future Extensions

향후 추가 가능:

```json
{
  "brand": {
    "voice": "...",
    "values": []
  },
  "history": [...],
  "performance_hint": {...}
}
```

---

## 11. Final Statement

Context는 단순 입력이 아니다.

> **Content OS에서 context는
> 콘텐츠의 “의미”를 정의하는 핵심 계약이다**
