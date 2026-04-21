# Global Auto Industry Intelligence Dashboard

글로벌 자동차 산업 인사이트 대시보드 — 국제 정세 변화와 세계 5대 자동차 그룹의 지역별 판매량 변화를 한 화면에서 확인할 수 있는 인터랙티브 대시보드.

---

## 빠른 시작

```bash
# 1. 프로젝트 루트에서 전체 의존성 설치
cd 3rd-project
npm install            # 루트 (concurrently)
npm install --prefix backend
npm install --prefix frontend

# 2. 백엔드 환경 변수 설정
cp backend/.env.example backend/.env

# 3. 개발 서버 동시 실행
npm run dev
```

- **백엔드**: http://localhost:4000  
- **프론트엔드**: http://localhost:5173

---

## 데이터 수집 방식

| 항목 | 내용 |
|------|------|
| 초기 실행 시 | 서버 시작과 동시에 1회 즉시 수집 |
| 이후 주기 | 매시 정각 (`0 * * * *`) 자동 반복 |
| 외부 소스 실패 시 | 자동으로 `backend/data/fallback/` 데이터 사용 |
| 상태 확인 | 헤더 우측 🟢 Live / 🟡 Cached 인디케이터 |

---

## API 엔드포인트

### GET /api/sales
판매량 데이터 반환

**쿼리 파라미터**
- `year` — 연도 (복수: `2023,2024,2025`)
- `region` — 지역 (`americas`, `europe`, `asia_pacific`, `mea`)
- `company` — 회사명 (`Toyota`, `VW`, `Hyundai`, `GM`, `Stellantis`)
- `quarter` — 분기 (`Q1`, `Q2`, `Q3`, `Q4`)

**응답 예시**
```json
{
  "data": [
    {
      "company": "Toyota",
      "year": 2025,
      "quarter": "Q1",
      "region": "americas",
      "sales": 601,
      "yoy_change": 7.1
    }
  ],
  "meta": {
    "lastUpdated": "2026-04-18T12:00:00Z",
    "source": "fallback",
    "count": 480
  }
}
```

---

### GET /api/events
지정학적 이벤트 데이터 반환

**쿼리 파라미터**
- `from` — 시작 날짜 (`2020-01`)
- `to` — 종료 날짜 (`2025-12`)
- `category` — 카테고리 (`pandemic`, `trade_policy`, `geopolitics`, `supply_chain`, `regulation`, `labor`)
- `severity` — 심각도 (`high`, `medium`, `low`)

---

### GET /api/meta
마지막 수집 시각 및 상태 확인

```json
{
  "lastUpdated": "2026-04-18T12:00:00Z",
  "source": "live",
  "status": "ok",
  "salesCount": 480,
  "eventsCount": 18,
  "nextUpdate": "2026-04-18T13:00:00Z"
}
```

---

### POST /api/refresh
수동으로 데이터 수집 즉시 트리거 (개발용)

---

## 폴더 구조

```
3rd-project/
├── package.json              # 루트 — concurrently로 동시 실행
├── README.md
├── frontend/
│   ├── src/
│   │   ├── App.tsx           # 메인 앱
│   │   ├── components/       # UI 컴포넌트
│   │   ├── hooks/            # TanStack Query 훅
│   │   ├── api/              # Axios 클라이언트
│   │   ├── i18n/             # 한국어/영어 번역
│   │   └── types/            # TypeScript 타입
│   └── .env                  # VITE_API_BASE_URL=http://localhost:4000
└── backend/
    ├── src/
    │   ├── index.ts          # Express 서버
    │   ├── routes/           # API 라우터
    │   ├── collectors/       # 데이터 수집 로직
    │   ├── scheduler/        # node-cron 스케줄러
    │   ├── storage/          # JSON 파일 read/write 추상화
    │   └── utils/            # logger, retry
    ├── data/
    │   ├── cache/            # 수집된 최신 데이터
    │   └── fallback/         # 시드 데이터 (수집 실패 시 사용)
    └── .env.example          # 환경 변수 예시
```

---

## 수록 데이터

### 5대 자동차 그룹 (2025년 글로벌 판매량 순위)
| 순위 | 그룹 | 국가 | 2025년 판매량 |
|------|------|------|--------------|
| 1 | Toyota | 일본 | ~1,132만대 |
| 2 | Volkswagen | 독일 | ~910만대 |
| 3 | Hyundai Motor | 한국 | ~730만대 |
| 4 | General Motors | 미국 | ~600만대 |
| 5 | Stellantis | 네덜란드/이탈리아 | ~540만대 |

### 주요 이벤트 (2020–2025)
- COVID-19 팬데믹, 글로벌 반도체 부족, 러-우 전쟁
- 중국 제로코로나, 미국 IRA법, 중국 EV 가격전쟁
- UAW 파업, EU 중국산 EV 관세, 트럼프 자동차 관세 25%
- 중국 희토류 수출통제, 미-중 관세 145% 유예 등

---

> **면책 고지**: 이 대시보드의 데이터는 실제 수치와 다를 수 있습니다. 교육·데모 목적으로만 사용하세요.
