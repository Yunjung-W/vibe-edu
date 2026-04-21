export type Region = 'americas' | 'europe' | 'asia_pacific' | 'mea';
export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';
export type Severity = 'high' | 'medium' | 'low';
export type EventCategory =
  | 'pandemic'
  | 'trade_policy'
  | 'geopolitics'
  | 'supply_chain'
  | 'regulation'
  | 'labor';

export interface SalesRecord {
  company: string;
  year: number;
  quarter: Quarter;
  region: Region;
  sales: number;
  yoy_change: number;
  is_estimate?: boolean;
}

export interface EventRecord {
  id: string;
  date: string;
  title: string;
  title_en: string;
  description: string;
  description_en: string;
  severity: Severity;
  affected_regions: Region[];
  category: EventCategory;
}

export interface MetaInfo {
  lastUpdated: string | null;
  source: 'live' | 'fallback';
  status: 'ok' | 'error' | 'collecting';
  salesCount: number;
  eventsCount: number;
  nextUpdate?: string;
}

export interface ApiResponse<T> {
  data: T[];
  meta: {
    lastUpdated: string;
    source: 'live' | 'fallback';
    count: number;
  };
}

export interface DashboardFilters {
  yearRange: [number, number];
  regions: Region[];
  companies: string[];
  granularity: 'quarterly' | 'annual';
}

export type Language = 'ko' | 'en';

export const COMPANIES = ['Toyota', 'VW', 'Hyundai', 'GM', 'Stellantis'] as const;
export type CompanyName = typeof COMPANIES[number];

export const REGIONS: { id: Region; label_ko: string; label_en: string }[] = [
  { id: 'americas', label_ko: '미주', label_en: 'Americas' },
  { id: 'europe', label_ko: '유럽', label_en: 'Europe' },
  { id: 'asia_pacific', label_ko: '아시아태평양', label_en: 'Asia-Pacific' },
  { id: 'mea', label_ko: '중동·아프리카', label_en: 'MEA' },
];

export const COMPANY_COLORS: Record<string, string> = {
  Toyota: '#EB0A1E',
  VW: '#001E50',
  Hyundai: '#002C5F',
  GM: '#0170CE',
  Stellantis: '#243971',
};

export const REGION_COLORS: Record<Region, string> = {
  americas: '#0170CE',
  europe: '#00825A',
  asia_pacific: '#F59E0B',
  mea: '#7C3AED',
};

export const CATEGORY_LABELS: Record<EventCategory, { ko: string; en: string }> = {
  pandemic: { ko: '팬데믹', en: 'Pandemic' },
  trade_policy: { ko: '무역정책', en: 'Trade Policy' },
  geopolitics: { ko: '지정학', en: 'Geopolitics' },
  supply_chain: { ko: '공급망', en: 'Supply Chain' },
  regulation: { ko: '규제', en: 'Regulation' },
  labor: { ko: '노동', en: 'Labor' },
};
