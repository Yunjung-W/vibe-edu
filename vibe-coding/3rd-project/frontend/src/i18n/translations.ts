export const translations = {
  ko: {
    header: {
      title: 'Global Auto Industry Intelligence',
      subtitle: '국제 정세 변화와 5대 자동차 그룹 판매량 추적',
      langToggle: 'EN',
    },
    filters: {
      period: '기간',
      region: '지역',
      company: '자동차 그룹',
      granularity: '표시 단위',
      all: '전체',
      quarterly: '분기별',
      annual: '연간',
    },
    regions: {
      americas: '미주',
      europe: '유럽',
      asia_pacific: '아시아태평양',
      mea: '중동·아프리카',
    },
    summary: {
      topGroup: '1위 그룹',
      salesTotal: '총 판매량',
      yoyChange: '전년 대비',
    },
    chart: {
      salesVolume: '판매량 (천 대)',
      yoyChange: 'YoY 변화율 (%)',
      tooltip: {
        sales: '판매량',
        yoy: '전년비',
      },
    },
    events: {
      title: '지정학적 이벤트 타임라인',
      categories: {
        all: '전체',
        pandemic: '팬데믹',
        trade_policy: '무역정책',
        geopolitics: '지정학',
        supply_chain: '공급망',
        regulation: '규제',
        labor: '노동',
      },
      severity: {
        high: '높음',
        medium: '중간',
        low: '낮음',
      },
    },
    rankings: {
      title: '순위 변동',
      subtitle: '2020–2025 연간 글로벌 판매량 기준',
    },
    meta: {
      live: 'Live',
      cached: 'Cached · 폴백 데이터',
      updatedAgo: '분 전 업데이트',
      tooltip: '마지막 수집 시각',
    },
    export: {
      png: 'PNG 저장',
      csv: 'CSV 다운로드',
    },
    footer: {
      disclaimer:
        'Data sources may not reflect actual figures. For demonstration purposes only.',
    },
    loading: '불러오는 중...',
    error: '데이터를 불러오지 못했습니다.',
    retry: '다시 시도',
  },
  en: {
    header: {
      title: 'Global Auto Industry Intelligence',
      subtitle: 'Tracking Sales Performance & Geopolitical Impact',
      langToggle: 'KR',
    },
    filters: {
      period: 'Period',
      region: 'Region',
      company: 'Auto Group',
      granularity: 'View By',
      all: 'All',
      quarterly: 'Quarterly',
      annual: 'Annual',
    },
    regions: {
      americas: 'Americas',
      europe: 'Europe',
      asia_pacific: 'Asia-Pacific',
      mea: 'MEA',
    },
    summary: {
      topGroup: 'Top Group',
      salesTotal: 'Total Sales',
      yoyChange: 'YoY Change',
    },
    chart: {
      salesVolume: 'Sales Volume (k units)',
      yoyChange: 'YoY Change (%)',
      tooltip: {
        sales: 'Sales',
        yoy: 'YoY',
      },
    },
    events: {
      title: 'Geopolitical Events Timeline',
      categories: {
        all: 'All',
        pandemic: 'Pandemic',
        trade_policy: 'Trade Policy',
        geopolitics: 'Geopolitics',
        supply_chain: 'Supply Chain',
        regulation: 'Regulation',
        labor: 'Labor',
      },
      severity: {
        high: 'High',
        medium: 'Medium',
        low: 'Low',
      },
    },
    rankings: {
      title: 'Rankings Shift',
      subtitle: '2020–2025 Global Annual Sales',
    },
    meta: {
      live: 'Live',
      cached: 'Cached · Fallback data',
      updatedAgo: 'min ago',
      tooltip: 'Last collection time',
    },
    export: {
      png: 'Save PNG',
      csv: 'Download CSV',
    },
    footer: {
      disclaimer:
        'Data sources may not reflect actual figures. For demonstration purposes only.',
    },
    loading: 'Loading...',
    error: 'Failed to load data.',
    retry: 'Retry',
  },
} as const;

export type Translations = typeof translations.ko;
export type TranslationKey = keyof Translations;
