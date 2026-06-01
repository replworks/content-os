# IDEAS.md

# Content OS

## Why

새로운 서비스를 만들 때마다 반복되는 문제가 있다.

처음에는 블로그를 만든다.

서비스 소개 글을 작성한다.

몇 개의 콘텐츠를 발행한다.

하지만 몇 개월이 지나면 운영 우선순위에서 밀려나고,
블로그는 방치된다.

결과적으로 서비스는 살아있는데,
외부에서 보기에는 죽어있는 것처럼 보인다.

이 문제는 글쓰기 능력의 문제가 아니다.

지속적인 콘텐츠 운영의 문제다.

Content OS는 콘텐츠를 생성하는 도구가 아니라,
콘텐츠 운영을 자동화하는 인프라를 목표로 한다.

---

# Problem

서비스 운영자는 바쁘다.

우선순위는 항상 다음과 같다.

* 제품 개발
* 고객 지원
* 영업
* 운영
* 채용

콘텐츠는 중요하다고 생각하지만,
지속적으로 작성하지 못한다.

결국 대부분의 서비스는 다음과 같은 상태가 된다.

* 블로그 마지막 글이 1년 전
* 공지사항 마지막 업데이트가 8개월 전
* SNS 운영 중단

사용자가 서비스에 방문했을 때
활동이 멈춘 것처럼 보인다.

---

# Goal

새로운 프로젝트를 생성하면
1시간 안에 콘텐츠 자동화 환경을 연결할 수 있어야 한다.

프로젝트 운영자는 초기 설정만 수행한다.

이후 콘텐츠 계획,
콘텐츠 생성,
콘텐츠 발행은 시스템이 담당한다.

---

# Core Concept

사용자는 브랜드 컨텍스트만 정의한다.

예시:

* 우리는 애견 기부 서비스다.
* 유기견 입양을 장려한다.
* 따뜻한 어조를 사용한다.
* 자극적인 표현은 금지한다.
* 교육적 콘텐츠를 선호한다.

AI는 이 컨텍스트를 기반으로
콘텐츠 전략을 수립한다.

---

# Content Sources

## Internal Context

프로젝트가 제공하는 정보

* 브랜드 설명
* 미션
* 서비스 소개
* FAQ
* 운영 정책

## External Context

웹에서 수집하는 정보

* 최신 뉴스
* 업계 이슈
* 계절성 이벤트
* 트렌드
* 검색 수요

예시:

애견 기부 서비스의 경우

* 유기견 관련 뉴스
* 동물보호 캠페인
* 반려견 건강 정보
* 반려동물 행동 정보

등을 활용한다.

---

# Content Types

## Evergreen Content

시간이 지나도 가치가 유지되는 콘텐츠

예시

* 강아지가 혀를 내미는 이유
* 유기견 입양 전 준비사항
* 반려견 사회화 방법

## Current Content

현재 이슈 기반 콘텐츠

예시

* 최근 동물보호 정책 변화
* 사회적 이슈
* 캠페인 소개

## Brand Content

서비스 자체와 관련된 콘텐츠

예시

* 운영 철학
* 프로젝트 업데이트
* 사용자 사례

---

# Publishing Modes

## Auto Publish

AI가 생성 후 즉시 발행

적합한 경우

* 정보성 콘텐츠
* SEO 콘텐츠

## Approval Workflow

AI 생성

↓

Draft 저장

↓

에디터 검토

↓

발행

적합한 경우

* 브랜드 메시지
* 공지사항
* 민감한 주제

---

# Architecture

Content Planner

↓

Topic Generator

↓

Research Agent

↓

Writer Agent

↓

Editor Agent

↓

Publisher

모든 외부 서비스 연결은 MCP 기반으로 추상화한다.

---

# Initial Integrations

Publishing

* WordPress
* Ghost
* GitHub Pages (Jekyll)

Research

* Search
* RSS

Notifications

* Email
* Slack

---

# MVP

목표는 SaaS가 아니다.

내 프로젝트에서 실제 사용 가능한 수준을 만드는 것이다.

MVP 조건

* 프로젝트 생성
* 브랜드 컨텍스트 입력
* 하루 2회 스케줄
* 자동 주제 생성
* 자동 글 생성
* GitHub Pages 발행

이 단계에서 30일 이상 실제 운영한다.

---

# Success Metrics

* 발행 중단 없이 30일 운영
* 최소 60개 콘텐츠 생성
* 사람 개입 최소화
* 신규 프로젝트 연결 시간 1시간 이하

---

# Non Goals

현재 목표가 아니다.

* Multi-tenancy
* Billing
* Team Collaboration
* Marketplace
* Public SaaS

필요성이 확인되면 이후 추가한다.

---

# Future

Content OS가 안정화되면
외부 고객을 위한 SaaS로 확장할 수 있다.

하지만 현재 목표는 사업화가 아니다.

모든 신규 프로젝트에 재사용 가능한
콘텐츠 운영 인프라를 만드는 것이 우선이다.
