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
  lastUpdated: string;
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

export interface SalesFilter {
  year?: string;
  region?: string;
  company?: string;
  quarter?: string;
}

export interface EventsFilter {
  from?: string;
  to?: string;
  category?: string;
  severity?: string;
}
