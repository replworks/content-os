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
* TopicGenerator 인터페이스
* JSON 파일 출력
* 테스트 포함
* **LLM 인터페이스 기반 (DI 구조)**

---

## Current Status

현재 핵심 기능은 구현되어 있습니다:

* Schema / template 로딩
* Generator / Validator / Transformer
* runGenerate / runTransform
* TopicGenerator 인터페이스 정의
* CLI 실행 + outputs 저장
* Mock 기반 테스트

안정화 단계(Day 9)는 여전히 작업이 필요합니다.

---

## Day 1 — Project Bootstrap

### 목표

개발 환경 + 기본 구조 완성

---

### 작업

* [x] Node 프로젝트 생성
* [x] TypeScript 설정
* [x] 필수 패키지 설치 (ajv, vitest)

---

### 디렉토리 구조 생성

```bash
content-os/
├── src/
│   ├── core/
│   ├── generator/
│   ├── transformer/
│   ├── validators/
│   ├── interfaces/
│   └── utils/
│
├── schemas/
├── templates/
├── outputs/
├── tests/
```

---

### 완료 조건

* ts-node 실행 가능
* 기본 구조 생성 완료

---

## Day 2 — Schema & Template Loader

### 목표

파일 기반 설정 로딩

---

### 작업

* [x] loadSchema(type)
* [x] loadTemplate(type, templateId)
* [x] 파일 없을 경우 throw

---

### 완료 조건

* schema/template 정상 로딩
* 에러 처리 동작

---

## Day 3 — Generator (DI 기반)

### 목표

LLM 추상화 기반 콘텐츠 생성

---

### 작업

* [x] ContentGenerator 인터페이스 정의
* [x] TopicGenerator 인터페이스 정의
* [x] generate() 구현 (generator 주입)
* [x] prompt builder 구현
* [x] JSON only output 강제
* [x] envelope/data/meta 구조 유지

---

### 핵심 규칙

* LLM 직접 호출 금지
* generator.generate(prompt) 사용

---

### 완료 조건

```ts
await generate({
  type,
  templateId,
  context,
  generator
})
```

---

## Day 4 — Validator (Schema + Quality)

### 목표

검증 + meta 생성

---

### 작업

* [x] AJV schema validator
* [x] ContentEvaluator 인터페이스 정의
* [x] quality evaluator (evaluator 주입)

---

### Quality 기준

* readability
* relevance
* tone_match
* originality

---

### 완료 조건

```ts
await validate({
  type,
  data,
  evaluator
})
```

---

## Day 5 — Generate Pipeline

### 목표

Generator + Validator 연결

---

### 작업

* [x] runGenerate() 구현

---

### 흐름

```ts
generate → validate → envelope
```

---

### 완료 조건

* envelope 구조 반환
* meta 포함

---

## Day 6 — Transformer (DI 기반)

### 목표

콘텐츠 변환 시스템 구축

---

### 작업

* [x] transform() 구현 (generator 주입)
* [x] transform prompt 작성
* [x] validator 재사용

---

### 흐름

```ts
blog → transform → validate → sns
```

---

### 완료 조건

* SNS 변환 성공
* schema 통과

---

## Day 7 — CLI + Output

### 목표

실행 가능 상태

---

### 작업

* [x] CLI 작성
* [x] generator / evaluator 구현체 연결
* [x] outputs 저장

---

### 완료 조건

* CLI 실행 → JSON 생성

---

## Day 8 — Testing (Mock 기반)

### 목표

LLM 없이 테스트 가능

---

### 작업

* [x] Mock ContentGenerator
* [x] Mock ContentEvaluator
* [x] generator 테스트
* [x] validator 테스트
* [x] pipeline 테스트

---

### 완료 조건

```bash
npx vitest
```

→ 모든 테스트 통과

---

## Day 9 — Stabilization

### 목표

실사용 안정성 확보

---

### 작업

* [ ] JSON parse retry
* [ ] 에러 코드 표준화
* [ ] logging

---

### 에러 타입

* VALIDATION_ERROR
* JSON_PARSE_ERROR
* LLM_ERROR

---

### 완료 조건

* 실패 시 재시도 가능
* 디버깅 가능

---

## Definition of Done

* CLI 실행 가능
* JSON schema 통과
* meta 포함
* SNS 변환 가능
* 테스트 통과

---

## Not Included

* 스케줄링 (Laravel 담당)
* API 서버 (core MVP에는 포함되지 않음; `src/api/server.ts`는 별도 스터브)
* DB
* deduplication

---

## Final Statement

이 문서의 목적은 단 하나다.

> **LLM에 의존하지 않고도 테스트 가능한 시스템을 만드는 것**
