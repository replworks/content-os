# Content OS

> **Stop writing content. Start running it.**

---

## What is Content OS?

Content OS는 콘텐츠 생성 도구가 아니다.

> **콘텐츠가 멈추지 않도록 만드는 운영 시스템이다.**

대부분의 서비스는 이렇게 죽는다:

1. 블로그를 만든다
2. 몇 개 글을 쓴다
3. 바빠진다
4. 콘텐츠가 멈춘다

결과:

> 서비스는 살아있지만
> 밖에서는 죽은 서비스처럼 보인다

---

## The Idea

Content OS는 문제를 이렇게 정의한다:

> ❌ 글을 잘 못 써서 문제가 아니다
> ✅ 콘텐츠를 계속 만들 수 있는 시스템이 없다

그래서 접근을 바꾼다:

```text
1개 작성 → 발행 ❌
10개 생성 → 검증 → 선택 → 발행 ✅
```

---

## Core Concept

Content OS는 LLM을 이렇게 사용한다:

> ❌ 글쓰기 도구
> ✅ JSON 생성 함수

모든 콘텐츠는 다음 구조를 가진다:

```json
{
  "type": "blog",
  "data": { ... },
  "meta": { ... }
}
```

---

## How It Works

```text
Generate → Validate → Output
              ↓
        Transform (SNS)
              ↓
           Validate
```

---

## Key Components

### 1. Generator

* JSON 생성만 담당
* 판단하지 않음
* Stateless

---

### 2. Validator

* Schema 검증
* Quality 평가 (LLM)
* Meta 생성

---

### 3. Transformer

* Blog → SNS 변환
* JSON → JSON

---

### 4. Pipeline

* 재시도
* 폐기
* 최종 결정

---

## Example Output

```json
{
  "type": "blog",
  "data": {
    "title": "강아지가 혀를 내미는 이유",
    "summary": "...",
    "body_markdown": "..."
  },
  "meta": {
    "quality_score": 0.82,
    "dimensions": {
      "readability": 0.9,
      "relevance": 0.8,
      "tone_match": 0.85,
      "originality": 0.75
    }
  }
}
```

---

## Why This Works

기존 방식:

* 사람이 직접 작성
* 품질 높음
* 지속 불가능

Content OS:

* AI 대량 생성
* Validator 필터링
* 지속 가능

---

## Design Principles

* JSON First
* Schema Driven
* LLM Abstraction (DI)
* Separation of Concerns
* Testable by Design

---

## Project Structure

```bash
content-os/
├── src/
├── schemas/
├── templates/
├── outputs/
├── tests/
```

---

## Getting Started

### 1. Install

```bash
npm install
```

---

### 2. Run

```bash
node cli/generate-blog.ts
```

---

### 3. Output

```bash
outputs/blog-*.json
```

---

## Testing

```bash
npx vitest
```

LLM 없이도 테스트 가능하다.

---

## What’s Included (MVP)

* Blog 콘텐츠 생성
* Blog → SNS 변환
* Schema validation
* Quality scoring
* CLI 실행
* JSON output

---

## What’s NOT Included

* API 서버
* 스케줄링 (Laravel에서 처리)
* DB
* SaaS 기능

---

## Philosophy

이 시스템은 완벽한 콘텐츠를 만들지 않는다.

> **대신, 나쁜 콘텐츠를 걸러낸다**

그리고 그것이 더 중요하다.

---

## Status

🚧 MVP in progress

---

## Future

* SaaS 확장
* Multi-project
* 자동 학습
* 퍼포먼스 기반 최적화

---

## Final Thought

> 콘텐츠는 “작성”이 아니라
> “운영”이다
