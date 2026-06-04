# TASKS.md

# Content OS — Implementation Tasks

---

## 0. Goal

목표:

> **7~9일 내 실제 동작하는 Content OS MVP 완성**

---

## Scope (확정)

* CLI 기반 실행
* Blog 콘텐츠 생성
* Blog → SNS 변환
* Validator (schema + quality)
* JSON 파일 출력
* 테스트 포함
* Gemini 공식 SDK 사용

---

## Day 1 — Project Bootstrap

### 목표

개발 환경 + 기본 구조 완성

---

### 작업

* [ ] Node 프로젝트 생성

```bash
npm init -y
```

* [ ] TypeScript 설정

```bash
npm install -D typescript ts-node @types/node
npx tsc --init
```

* [ ] 필수 패키지 설치

```bash
npm install ajv @google/generative-ai
npm install -D vitest
```

---

### 디렉토리 구조 생성

```bash
content-os/
├── src/
│   ├── core/
│   ├── generator/
│   ├── transformer/
│   ├── validators/
│
├── schemas/
├── templates/
├── outputs/
├── tests/
```

---

### 완료 조건

* `ts-node`로 파일 실행 가능
* 기본 구조 생성 완료

---

## Day 2 — Schema & Template Loader

### 목표

파일 기반 설정 로딩

---

### 작업

* [ ] `loadSchema(type)` 구현
* [ ] `loadTemplate(type, templateId)` 구현
* [ ] 파일 존재 여부 체크 (없으면 throw)

---

### 예시

```ts
const schema = loadSchema("blog")
const template = loadTemplate("blog", "seo-v1")
```

---

### 완료 조건

* schema / template 정상 로딩
* 에러 처리 동작 확인

---

## Day 3 — Gemini Client & Generator

### 목표

LLM 호출 + JSON 생성

---

### 작업

* [ ] Gemini client 구현

```ts
import { GoogleGenerativeAI } from "@google/generative-ai"
```

* [ ] prompt builder 구현
* [ ] JSON only output 강제

---

### 핵심 규칙

* 설명 금지
* JSON 외 출력 금지
* schema 강제 포함

---

### 작업 추가

* [ ] `parseJSON()` 안전 처리
* [ ] JSON 파싱 실패 시 throw

---

### 완료 조건

```ts
await generate({
  type: "blog",
  templateId: "seo-v1",
  context
})
```

→ JSON 반환

---

## Day 4 — Validator (Schema + Quality)

### 목표

콘텐츠 검증 + meta 생성

---

### 작업

* [ ] AJV schema validator 구현
* [ ] quality evaluator 구현 (Gemini 사용)

---

### Quality 기준

* readability
* relevance
* tone_match
* originality

---

### meta 생성

```ts
{
  quality_score: number,
  dimensions: {...},
  warnings: []
}
```

---

### 완료 조건

* valid / invalid 구분 가능
* meta 생성됨

---

## Day 5 — Generate Pipeline

### 목표

Generator + Validator 연결

---

### 작업

* [ ] `runGenerate()` 구현

---

### 흐름

```ts
generate → validate → envelope 생성
```

---

### envelope 구조

```ts
{
  type,
  data,
  meta
}
```

---

### 완료 조건

* 최종 JSON 완성
* 에러 처리 동작

---

## Day 6 — Transformer (Blog → SNS)

### 목표

콘텐츠 변환 시스템 구축

---

### 작업

* [ ] transform 함수 구현
* [ ] transform prompt 작성
* [ ] validator 재사용

---

### 흐름

```ts
blog → transform → validate → sns
```

---

### 완료 조건

* blog → sns 변환 성공
* schema 통과

---

## Day 7 — CLI + Output

### 목표

실제 실행 가능 상태

---

### 작업

* [ ] CLI 파일 작성

```bash
node cli/generate-blog.ts
```

* [ ] outputs 디렉토리에 저장

---

### 파일 규칙

```bash
outputs/
├── blog-2026-01-01-001.json
├── sns-2026-01-01-001.json
```

---

### 완료 조건

* CLI 실행 → 파일 생성

---

## Day 8 — Testing

### 목표

CI 가능한 테스트 구축

---

### Generator Test

* [ ] JSON 반환 확인
* [ ] schema 통과 여부

---

### Validator Test

* [ ] invalid data → 실패
* [ ] meta 생성 확인

---

### Pipeline Test

* [ ] 전체 flow 테스트
* [ ] blog → sns 변환 테스트

---

### 완료 조건

```bash
npx vitest
```

→ 통과

---

## Day 9 — Stabilization

### 목표

실사용 가능한 안정성 확보

---

### 작업

* [ ] JSON 파싱 retry (max 2~3회)
* [ ] logging 추가
* [ ] 에러 코드 표준화

---

### 에러 타입

* VALIDATION_ERROR
* JSON_PARSE_ERROR
* LLM_ERROR

---

### 완료 조건

* 실패 시 안정적 재시도
* 로그 확인 가능

---

## Definition of Done

다음이 모두 가능해야 한다:

* [ ] CLI로 blog 생성
* [ ] JSON schema 통과
* [ ] quality_score 포함
* [ ] SNS 변환 가능
* [ ] outputs 저장
* [ ] 테스트 통과

---

## Not Included (지금 안 함)

* API 서버
* 스케줄링
* deduplication
* DB
* multi-project

---

## Final Statement

이 문서의 목적은 단 하나다.

> **고민 없이 구현할 수 있는 상태를 만드는 것**
