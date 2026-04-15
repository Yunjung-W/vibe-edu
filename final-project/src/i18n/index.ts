import type { Language, Region, Category } from '../types';

type I18nStrings = {
  // Header
  dashboardTitle: string;
  dashboardSubtitle: string;
  // Filter
  period: string;
  region: string;
  company: string;
  viewMode: string;
  quarterly: string;
  annual: string;
  all: string;
  // Regions
  americas: string;
  europe: string;
  asia_pacific: string;
  mea: string;
  // Summary cards
  totalSales: string;
  yoyGrowth: string;
  topGroup: string;
  // Chart
  salesVolume: string;
  unit: string;
  mainChartTitle: string;
  yoyChangeTitle: string;
  // Timeline
  timelineTitle: string;
  // Categories
  allEvents: string;
  trade_policy: string;
  geopolitics: string;
  supply_chain: string;
  regulation: string;
  labor: string;
  pandemic: string;
  // Severity
  high: string;
  medium: string;
  low: string;
  // Rankings
  rankingsTitle: string;
  rankingsSuffix: string;
  // Actions
  exportPNG: string;
  exportCSV: string;
  // Affected regions label
  affectedRegions: string;
  // Footer
  footerNote: string;
  // Tooltip
  tooltipSales: string;
  tooltipYoY: string;
};

const strings: Record<Language, I18nStrings> = {
  ko: {
    dashboardTitle: 'Global Auto Industry Intelligence',
    dashboardSubtitle: '국제 정세 변화와 글로벌 자동차 그룹 판매량 트렌드 분석',
    period: '기간',
    region: '지역',
    company: '자동차 그룹',
    viewMode: '표시 단위',
    quarterly: '분기별',
    annual: '연간',
    all: '전체',
    americas: '미주',
    europe: '유럽',
    asia_pacific: '아시아태평양',
    mea: '중동·아프리카',
    totalSales: '총 판매량',
    yoyGrowth: '전년 대비',
    topGroup: '1위 그룹',
    salesVolume: '판매량',
    unit: '만 대',
    mainChartTitle: '자동차 그룹별 판매량 추이',
    yoyChangeTitle: '전년동기대비 성장률',
    timelineTitle: '국제 정세 이벤트 타임라인',
    allEvents: '전체',
    trade_policy: '무역정책',
    geopolitics: '지정학',
    supply_chain: '공급망',
    regulation: '규제',
    labor: '노동',
    pandemic: '팬데믹',
    high: '높음',
    medium: '중간',
    low: '낮음',
    rankingsTitle: '글로벌 순위 변동',
    rankingsSuffix: '위',
    exportPNG: 'PNG 저장',
    exportCSV: 'CSV 내보내기',
    affectedRegions: '영향 지역',
    footerNote: 'Data sources may not reflect actual figures. For demonstration purposes only.',
    tooltipSales: '판매량',
    tooltipYoY: '전년 대비',
  },
  en: {
    dashboardTitle: 'Global Auto Industry Intelligence',
    dashboardSubtitle: 'Tracking Sales Performance & Geopolitical Impact on Global Automakers',
    period: 'Period',
    region: 'Region',
    company: 'Auto Group',
    viewMode: 'View',
    quarterly: 'Quarterly',
    annual: 'Annual',
    all: 'All',
    americas: 'Americas',
    europe: 'Europe',
    asia_pacific: 'Asia-Pacific',
    mea: 'Middle East & Africa',
    totalSales: 'Total Sales',
    yoyGrowth: 'YoY Growth',
    topGroup: 'Top Group',
    salesVolume: 'Sales Volume',
    unit: '10K units',
    mainChartTitle: 'Sales Volume by Auto Group',
    yoyChangeTitle: 'Year-over-Year Change (%)',
    timelineTitle: 'Geopolitical Events Timeline',
    allEvents: 'All',
    trade_policy: 'Trade Policy',
    geopolitics: 'Geopolitics',
    supply_chain: 'Supply Chain',
    regulation: 'Regulation',
    labor: 'Labor',
    pandemic: 'Pandemic',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    rankingsTitle: 'Rankings Shift',
    rankingsSuffix: '',
    exportPNG: 'Save PNG',
    exportCSV: 'Export CSV',
    affectedRegions: 'Affected Regions',
    footerNote: 'Data sources may not reflect actual figures. For demonstration purposes only.',
    tooltipSales: 'Sales',
    tooltipYoY: 'YoY',
  },
};

export function t(lang: Language, key: keyof I18nStrings): string {
  return strings[lang][key];
}

export function getRegionLabel(lang: Language, region: Region): string {
  return strings[lang][region];
}

export function getCategoryLabel(lang: Language, category: Category | 'all'): string {
  if (category === 'all') return strings[lang].allEvents;
  return strings[lang][category];
}
