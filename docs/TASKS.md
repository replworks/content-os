# Content OS — Implementation Tasks

---

## 0. Goal

목표:

> **7~9일 내 실제 동작하는 Content OS MVP 완성 → 운영 가능한 상태까지 확장**

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

현재 시스템은 MVP를 넘어 **운영 직전 단계**에 도달했다.

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
* API DI 분리 (Gemini 키 없이 테스트 가능)
* Multi-generation pipeline 추가

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
* [x] API DI 기반 테스트 (Gemini 호출 없음)

---

## Phase 4 — Stabilization (운영 준비 단계)

### 목표

“운영 가능한 상태”로 마무리

---

## 4.1 CLI 안정화

* [x] CLI 에러 출력 개선 (AppError 기반)
* [x] traceId CLI 출력
* [x] 실패 시 exit code 명확화 (0 / 1)
* [x] lint 통과

---

## 4.2 Docs 정합성

* [x] ARCHITECTURE.md ↔ 코드 일치 검증
* [x] SCHEMAS.md ↔ 실제 schema 검증
* [x] CONTEXT.md ↔ 실제 context 구조 확인
* [x] RULES.md ↔ Hard Filter 반영 여부 확인

---

## 4.3 Code Cleanup

* [x] 불필요한 console.log 제거 (CLI 사용자 출력 제외)
* [x] 에러 메시지 통일 (AppError 중심)
* [x] 타입 정리 (any 최소화)

---

## 4.4 Runtime Quality Control (🔥 필수)

### 목표

저품질 콘텐츠가 시스템을 통과하지 못하도록 차단

---

### 작업

* [x] config 기반 quality_score threshold 도입
* [x] threshold 미달 시 AppError 발생
* [x] 콘텐츠 discard 처리
* [x] threshold 테스트 추가

---

## 4.5 Multi-generation Pipeline

* [x] generateMany() 추가
* [x] top K 검증 전략 적용
* [x] evaluator 호출 수 제한
* [x] 최종 후보 선택 테스트 추가

---

### 예시

```ts
if (meta.quality_score < threshold) {
  throw new AppError('LOW_QUALITY', 'Content below threshold');
}
```

---

## 4.6 API Layer

* [x] traceId 응답 포함
* [x] request-level logging
* [x] AppError → HTTP mapping
* [x] DI 기반 mock 테스트
* [x] Gemini 없이 테스트 가능

---

## Phase 5 — Feedback Loop (성과 기반 진화)

### 목표

콘텐츠 성과 데이터를 기반으로
다음 generation 품질을 자동으로 개선한다.

---

### 5.1 Feedback Storage

* [x] outputs에 content_id 추가
* [x] performance JSON 저장 구조 정의
* [x] feedback 저장 경로 결정 및 `outputs/performance/` 구현
* [x] 과거 성과를 로드하고 prompt에 주입하는 구조 설계

---

### 5.2 Performance Data Ingestion

* [x] 외부 데이터 입력 포맷 정의 (views, ctr 등)
* [ ] CLI 또는 script로 performance 업데이트 가능하게 구현
* [ ] 운영용 성과 업로드/매핑 워크플로우 구체화

---

### 5.3 Feedback Analyzer (low-cost)

* [ ] rule 기반 분석기 구현
* [ ] high-performing 패턴 추출
* [ ] low-performing 패턴 제거

---

### 5.4 Context Injection

* [ ] generate 시 feedback 기반 context merge
* [ ] preferred / avoid 패턴 적용

---

### 5.5 Topic Selection 개선 (선택)

* [ ] TopicGenerator에 feedback 반영
* [ ] 잘 되는 topic 강화

---

### 완료 조건

* 성과 데이터 저장 가능
* 다음 generation에 반영됨
* 품질 개선 루프 확인 가능

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
* [x] **low quality 콘텐츠 자동 차단 (threshold 적용)**

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
