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
* LLM 인터페이스 기반 (DI 구조)

---

## Current Status

현재 시스템은 MVP를 넘어 안정화 단계에 들어갔다.

구현 완료:

* Schema / Template 로딩
* Generator / Transformer / Validator
* runGenerate / runTransform
* JSON parse retry
* AppError (표준 에러 구조)
* Structured logging + traceId
* Hard Filter (TS 기반 1차 필터)
* 강타입 파이프라인 정리
* Mock 기반 테스트 (LLM 없이 실행 가능)

---

## Phase 1 — Core System (완료)

### 포함

* Generator
* Validator
* Transformer
* Pipeline (runGenerate / runTransform)

✅ 완료

---

## Phase 2 — Reliability Layer (완료)

### 목표

LLM 불안정성 대응 + 운영 안정성 확보

---

### 작업

* [x] JSON parse retry
* [x] AppError 표준화
* [x] Structured logging (traceId)
* [x] Hard Filter (TS-only validation)
* [x] Error / Retry 테스트

---

## Phase 3 — Testing (완료)

### 목표

LLM 없이 전체 테스트 가능

---

### 작업

* [x] MockContentGenerator
* [x] MockContentEvaluator
* [x] Generator 테스트
* [x] Transformer 테스트
* [x] Validator 테스트
* [x] Pipeline 테스트

---

## Phase 4 — Stabilization (진짜 마지막 단계)

### 목표

“운영 가능한 상태”로 마무리

---

### 4.1 CLI 안정화

* [ ] CLI 에러 출력 개선
* [ ] traceId 출력
* [ ] 실패 시 exit code 명확화

---

### 4.2 Docs 정합성

* [x] ARCHITECTURE.md ↔ 코드 일치 검증
* [x] SCHEMAS.md ↔ 실제 schema 검증
* [x] CONTEXT.md ↔ 실제 context 구조 확인
* [x] RULES.md ↔ Hard Filter 반영 여부 확인

---

### 4.3 Code Cleanup

* [ ] 불필요한 console.log 제거
* [ ] 에러 메시지 통일
* [x] 타입 정리 (any 최소화)

---

### 4.4 Optional (시간 남으면)

* [x] API layer traceId 연결
* [x] request-level logging
* [ ] config 기반 threshold (quality_score)

---

### 4.5 API Testing

* [x] `/generate` 성공 응답 테스트
* [x] `/transform` 성공 응답 테스트
* [x] API validation 에러 응답 테스트
* [x] AppError HTTP mapping 테스트
* [x] DI 기반 mock 서버 테스트 통과

---

## Definition of Done

다음이 모두 가능해야 한다:

* [x] CLI로 blog 생성
* [x] JSON schema 통과
* [x] quality_score 포함
* [x] SNS 변환 가능
* [x] outputs 저장
* [x] 테스트 통과
* [x] 에러 발생 시 안정적 복구
* [x] 로그 기반 디버깅 가능

---

## Not Included (명확히 제외)

* Laravel (Scheduler / Queue)
* API 인증 / 사용자 관리
* DB
* Deduplication (Embedding)
* SaaS 기능

---

## Final Statement

이 시스템은 단순한 LLM wrapper가 아니다.

> **“LLM을 안정적인 콘텐츠 생산 시스템으로 만드는 엔진”이다**
