# Content OS

> **LLM을 “콘텐츠 생성 도구”가 아니라  
> “멈추지 않는 콘텐츠 운영 시스템”으로 만드는 엔진**

---

## 🚀 What is Content OS?

Content OS는 단순한 글 생성기가 아니다.

> **콘텐츠가 멈추지 않게 만드는 자동 생산 엔진이다**

핵심은:

* 한 번 잘 만드는 것이 아니라
* **지속적으로 생성 → 검증 → 필터링하는 구조**

---

## ⚙️ Core Concept

```text
Generate → Validate → Filter → Output
              ↓
         Transform → Validate
```

---

## 🧠 Key Features

* Schema 기반 콘텐츠 생성 (JSON-first)
* LLM 추상화 (DI 구조)
* 자동 품질 평가 (LLM evaluator)
* Quality threshold 기반 필터링
* Hard Filter (TS 기반 안전 필터)
* JSON parse retry (안정성)
* Structured logging + traceId
* Multi-generation (N개 생성 + 선택)
* 테스트 (LLM 없이 실행 가능)

---

## 📦 Project Structure

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

## 🛠 Installation

```bash
npm install
```

---

## ▶️ Usage (CLI)

### 1. Blog 생성

```bash
npx ts-node src/cli.ts generate \
  --type=blog \
  --template=seo-v1 \
  --context='{"topic":"강아지가 혀를 내미는 이유"}'
```

---

### 2. Blog → SNS 변환

```bash
npx ts-node src/cli.ts transform \
  --from=blog \
  --to=sns \
  --template=sns-transform \
  --input='{"title":"강아지 행동"}'
```

---

### 3. Multi-generation (추천)

```bash
npx ts-node src/cli.ts generateMany \
  --type=blog \
  --template=seo-v1 \
  --context='{"topic":"강아지 행동"}' \
  --count=5 \
  --topK=2
```

설명:

* count: 생성 후보 수
* topK: 검증 대상 수
* 최종 결과는 quality_score 기준으로 선택됨

---

## 📤 Output Format

```json
{
  "type": "blog",
  "data": {},
  "meta": {
    "quality_score": 85,
    "dimensions": {
      "readability": 90,
      "relevance": 80,
      "tone_match": 85,
      "originality": 75
    },
    "warnings": []
  }
}
```

---

## 🔒 Quality Control

저품질 콘텐츠는 자동 차단된다.

```ts
if (quality_score < threshold) {
  throw LOW_QUALITY
}
```

### Threshold 설정

```ts
export const QUALITY_THRESHOLD = {
  blog: 70,
  sns: 60,
  default: 65,
};
```

---

## ⚙️ Config System (Environment-based Settings)

Content OS는 실행 파라미터를 코드에 하드코딩하지 않고
**환경별 설정(config)** 으로 관리한다.

---

### 📁 Config 구조

```bash
src/config/
├── base.ts
├── dev.ts
├── prod.ts
└── index.ts
```

---

### 🧩 설정 항목

```ts
export const config = {
  qualityThreshold: {
    blog: 70,
    sns: 60,
    default: 65,
  },
  generation: {
    count: 5,
    topK: 2,
  },
};
```

---

### 🌍 환경별 설정

환경에 따라 자동으로 config가 변경된다.

```bash
NODE_ENV=development
NODE_ENV=production
```

#### dev

```ts
export const devConfig = {
  generation: {
    count: 2,
    topK: 1,
  },
};
```

👉 빠른 테스트 / 저비용

---

#### prod

```ts
export const prodConfig = {
  generation: {
    count: 5,
    topK: 2,
  },
};
```

👉 품질 최적화

---

### 🔌 실행 시 동작

```ts
import { config } from "../config";
```

```ts
const threshold = config.qualityThreshold[type];
const count = config.generation.count;
const topK = config.generation.topK;
```

👉 모든 파이프라인에서 자동 적용됨

---

### 🧪 CLI에서 환경 지정

```bash
NODE_ENV=development npx ts-node src/cli.ts generate ...
```

```bash
NODE_ENV=production npx ts-node src/cli.ts generateMany ...
```

---

### 🎯 왜 중요한가?

이 구조 덕분에:

* 코드 수정 없이 운영 정책 변경 가능
* 비용 / 품질 트레이드오프 조절 가능
* 실험 (A/B 테스트) 가능
* 운영 환경에 맞게 자동 최적화

---

### ❗ 설계 원칙

* config는 **전역 단일 source of truth**
* runtime 로직에서 **직접 숫자 사용 금지**
* 모든 threshold / count / topK는 config 통해서만 접근

---

> Content OS는 "코드"가 아니라
> **"설정으로 제어되는 엔진"이다**

---

## 🧪 Testing

LLM 없이 테스트 가능:

```bash
npx vitest
```

---

## 🔌 LLM Integration

LLM은 직접 호출하지 않는다.

```ts
ContentGenerator
ContentEvaluator
```

예시:

```ts
const generator = new GeminiContentGenerator();
```

---

## 🧱 Architecture (요약)

Content OS는 **순수 실행 엔진**이다.

### Core Flow

```text
runGenerate -> generate -> runLLMTask -> hardFilter -> validate -> envelope
runGenerateMany -> generateMany -> hardFilter -> topK -> validate -> select
runTransform -> transform -> runLLMTask -> hardFilter -> validate
```

---

## ❗ 중요한 책임 분리 (VERY IMPORTANT)

### ✅ Content OS (TS)

역할:

* 콘텐츠 생성
* 검증
* 필터링
* 품질 평가
* 최종 결과 선택

---

### 🚫 Content OS가 하지 않는 것

* 성과 수집 (조회수, CTR 등)
* DB 저장
* 스케줄링
* 발행 (publish)
* 성과 기반 최적화

---

## 🔁 Feedback Loop (외부 시스템)

> ❗ **이건 TS가 아니라 Laravel / Worker에서 수행된다**

### 전체 흐름

```text
[Content OS]
Generate → Output(JSON)
               ↓
        (외부 시스템)
        Publish → Performance 수집
               ↓
        Feedback 저장 (DB / JSON)
               ↓
        Context 생성
               ↓
[Content OS 재호출]
Generate(context 포함)
```

---

### 핵심 원칙

* Content OS는 “학습하지 않는다”
* 대신 **입력(context)** 이 개선된다

---

### 적용 방식 (예시)

```ts
context = {
  topic: "강아지 행동",
  preferred_patterns: ["리스트형", "짧은 문장"],
  avoid_patterns: ["긴 문단"]
}
```

---

## ❗ Important Design Principle

> LLM은 결과를 만드는 존재가 아니다  
> → **후보를 만드는 존재다**

Content OS는:

* 여러 개 생성하고
* 검증하고
* 가장 좋은 것만 선택한다

---

## 🚫 Not Included

* Laravel (Scheduler / Queue / Worker)
* DB
* API 인증
* 성과 분석 시스템
* Deduplication

---

## 🧭 Roadmap

외부 시스템에서 진행:

* Feedback loop 자동화
* Topic 최적화
* 성과 기반 ranking 개선

---

## 📌 Final Statement

> Content OS의 목적은 단 하나다

**“콘텐츠가 멈추지 않게 만드는 것”**
