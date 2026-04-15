# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

이 저장소는 **Claude Code 바이브코딩 실습 교재**입니다. 빌드 시스템이 없는 정적 HTML 단일 파일(`docs/workbook.html`)과 PowerPoint 발표자료(`docs/바이브코딩_실습교재_프레젠테이션.pptx`)로 구성됩니다.

`docs/workbook.html`을 브라우저에서 직접 열면 됩니다. 별도 서버나 빌드 과정이 필요하지 않습니다.

## 교재 구조 (workbook.html)

### 섹션 ID 목록 (사이드바 내비게이션 기준)
| ID | 내용 | 대상 |
|---|---|---|
| `#overview` | 히어로 / 전체 개요 | 수강생 |
| `#flow` | 기술 흐름 (내부 동작 설명) | 강사전용 |
| `#sites` | 데이터 사이트 참고 | 강사전용 |
| `#p1` ~ `#p4` | 1부 따라하기 프롬프트 (4개, 각 10분) | 수강생 |
| `#tracks` | 2부 자유 탐구 (A/B/C/D 트랙, 30분) | 수강생 |
| `#agent` | 3부 에이전트 실습 (ag1~ag4, 20분) | 수강생 |
| `#finish` | 마무리 프롬프트 | 수강생 |
| `#help` | 막혔을 때 보조 프롬프트 | 수강생 |
| `#teacher` | 강사 타임라인 (90분) | 강사전용 |

강사전용 섹션은 CSS 클래스 `.snum.setup`으로 시각적으로 구분됩니다.

### 다국어 처리 방식
언어는 JavaScript로 전환하며, 텍스트 요소에 `data-lg="ko|en|de|es"` 속성으로 구분합니다.
기본 언어는 한국어(`data-lang="ko"`). `.plang.show` 클래스로 활성 언어 표시.

### 인터랙티브 컴포넌트
- **트랙 전환**: `switchTrack('a'|'b'|'c'|'d')` → `#tc-{a~d}` 패널 토글
- **에이전트 전환**: `switchAgent('ag1'|...|'ag4')` → `#ag-ag{1~4}` 패널 토글
- **복사**: `cp(btn)` — `.pb-text` 요소의 텍스트를 클립보드에 복사 (`.pb-copy` 버튼에 연결)
- **진행률**: `IntersectionObserver`로 방문 섹션 추적 → 사이드바 하단 진행 바

### CSS 설계
모든 색상은 `:root` CSS 변수로 정의(`--amber`, `--blue`, `--green` 등). 다크 배경 기반 디자인.
강조 색상별 구역 의미:
- 앰버(amber): 수강생 실습 섹션
- 레드(red): 강사전용 섹션
- 블루(blue): 2부 섹션
- 오렌지(orange): 3부 에이전트 섹션

## 워크샵 교육 흐름

수강생이 경험하는 흐름: `프롬프트 입력 → Claude가 Python 자동 생성 → Wikipedia 데이터 수집 → JSON 저장 → HTML 보고서 생성`

- **1부 P1~2**: Claude가 브라우저에서 직접 데이터 fetch
- **1부 P3~4**: `crawler.py` 자동 생성 후 터미널에서 실행 (핵심 전환점)
- **2부**: A(디자인)/B(데이터 추가)/C(분석 변경)/D(페이지 확장) 4가지 트랙 자유 선택
- **3부**: ag1(브리핑)/ag2(키워드)/ag3(국가카드)/ag4(자동갱신) 중 1개 에이전트 구현
- 크롤링 실패 시 `datas/` 폴더의 JSON을 자동으로 사용하는 플랜 B 흐름 내장

## 데이터 파일

| 파일 | 원본명 |
|---|---|
| `datas/hyundai_kia_sales_jan_feb_wholesale_retail.csv` | 현대기아차 1,2월 판매실적 (도매,소매).csv |

컬럼: `월`, `회사`, `권역`, `지역`, `국가`, `차종`, `판매구분`, `사업계획`, `실적`, `판매진도율`, `전년대비`

## 용어 정리

| 용어 | 영문 | 설명 |
|---|---|---|
| 권역 | Region | 북미/중남미/유럽 등 대륙(continent) 급의 구분 |
| 지역 | Area | 권역을 조금 더 세분한 단위. 국가가 단위가 되기도 하고 법인이 단위가 되기도 하며, 비즈니스 상황에 따라 실적을 보고 싶은 단위로 재편됨 (연간 1~2회 재편) |
| 회사 | Company | 현대/제네시스는 모두 "현대"로 분류 |
| 판매진도율 | Sales Achievement Rate | 당월 사업계획 대비 실적 비율 |
| 전년대비 (YoY) | Year-over-Year | 작년 대비 당해년도 실적 비율 |
