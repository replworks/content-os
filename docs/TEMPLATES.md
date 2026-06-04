# TEMPLATES.md

# Content OS — Templates

---

## 1. Overview

Template는 콘텐츠 생성 방식을 정의한다.

* 구조 (sections)
* 작성 방식 (style)
* 목표 (intent)

Template는 schema와 매칭된다.

> schema : template = 1 : N

---

## 2. Template Structure

모든 템플릿은 다음 구조를 따른다:

```json
{
  "id": "template-id",
  "type": "blog | sns | docs | faq",
  "intent": "...",
  "structure": [],
  "writing_rules": [],
  "constraints": {}
}
```

---

## 3. Blog — SEO Template (seo-v1)

파일: `templates/blog/seo-v1.json`

```json
{
  "id": "seo-v1",
  "type": "blog",
  "intent": "검색 유입을 극대화하는 정보성 콘텐츠",
  "structure": [
    "hook",
    "problem_definition",
    "core_explanation",
    "detailed_sections",
    "practical_tips",
    "summary"
  ],
  "writing_rules": [
    "첫 문장은 독자의 궁금증을 자극해야 한다",
    "각 섹션은 명확한 소제목을 포함한다",
    "문장은 짧고 명확하게 작성한다",
    "불필요한 감정 표현을 제거한다",
    "정보 전달을 최우선으로 한다"
  ],
  "constraints": {
    "min_sections": 5,
    "target_length": "long",
    "keyword_inclusion": true
  }
}
```

---

## 4. Blog — List Template (list-v1)

파일: `templates/blog/list-v1.json`

```json
{
  "id": "list-v1",
  "type": "blog",
  "intent": "가독성이 높은 리스트형 콘텐츠",
  "structure": [
    "hook",
    "list_intro",
    "list_items",
    "summary"
  ],
  "writing_rules": [
    "리스트는 최소 5개 이상 포함한다",
    "각 항목은 동일한 구조로 작성한다",
    "항목 제목은 명확하고 짧게 작성한다",
    "각 항목은 독립적으로 이해 가능해야 한다",
    "불필요한 중복 설명을 제거한다"
  ],
  "constraints": {
    "min_items": 5,
    "max_items": 15,
    "target_length": "medium"
  }
}
```

---

## 5. SNS Transform Template (sns-transform)

파일: `templates/sns/sns-transform.json`

```json
{
  "id": "sns-transform",
  "type": "sns",
  "intent": "블로그 콘텐츠를 SNS에 맞게 재구성",
  "structure": [
    "hook",
    "core_message",
    "call_to_action"
  ],
  "writing_rules": [
    "첫 문장은 강한 관심을 유도해야 한다",
    "핵심 메시지는 한 가지로 압축한다",
    "문장은 짧고 간결하게 작성한다",
    "불필요한 설명은 제거한다",
    "SNS 플랫폼 특성에 맞게 톤을 조정한다"
  ],
  "constraints": {
    "max_length": 300,
    "include_hashtags": true,
    "max_hashtags": 5
  }
}
```

---

## 6. Template Usage Rules

### 6.1 Template Required

* templateId 없으면 생성 실패
* 자동 선택 없음 (명시적 선택)

---

### 6.2 Template is Deterministic

* 동일 입력 + 동일 템플릿 → 유사한 구조
* 출력 품질은 템플릿에 의해 결정됨

---

### 6.3 Template ≠ Prompt

Template는:

* 구조 정의
* 작성 규칙

Prompt는:

* Template + Context + Schema 조합 결과

---

## 7. Anti-Patterns

금지:

* template 없이 생성
* structure 없는 템플릿
* writing_rules 없는 템플릿
* 너무 추상적인 규칙

---

## 8. Future Extensions

* A/B 테스트용 템플릿
* 자동 템플릿 추천
* 성과 기반 템플릿 랭킹

---

## 9. Final Statement

Template는 콘텐츠의 스타일이 아니다.

> **Template는 결과를 결정하는 알고리즘이다**
