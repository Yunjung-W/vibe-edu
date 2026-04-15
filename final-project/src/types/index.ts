export type Region = 'americas' | 'europe' | 'asia_pacific' | 'mea';
export type Company = 'Toyota' | 'Volkswagen' | 'Hyundai' | 'GM' | 'Stellantis';
export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';
export type Severity = 'high' | 'medium' | 'low';
export type Category = 'pandemic' | 'trade_policy' | 'geopolitics' | 'supply_chain' | 'regulation' | 'labor';
export type ViewMode = 'quarterly' | 'annual';
export type Language = 'ko' | 'en';

export interface SalesRecord {
  company: Company;
  year: number;
  quarter: Quarter;
  region: Region;
  sales: number;
  yoy_change: number;
}

export interface GeopoliticalEvent {
  id: string;
  date: string; // "YYYY-MM"
  title: string;
  title_en: string;
  description: string;
  description_en: string;
  severity: Severity;
  affected_regions: Region[];
  category: Category;
}

export interface ChartDataPoint {
  period: string; // "2020 Q1"
  year: number;
  quarter?: Quarter;
  Toyota?: number;
  Volkswagen?: number;
  Hyundai?: number;
  GM?: number;
  Stellantis?: number;
  [key: string]: string | number | undefined;
}

export interface YoYDataPoint {
  period: string;
  year: number;
  quarter?: Quarter;
  Toyota?: number;
  Volkswagen?: number;
  Hyundai?: number;
  GM?: number;
  Stellantis?: number;
  [key: string]: string | number | undefined;
}

export interface RegionSummary {
  region: Region;
  totalSales: number;
  yoyChange: number;
  topGroup: Company;
  color: string;
}

export interface RankingData {
  year: number;
  rankings: { company: Company; rank: number; sales: number }[];
}

export interface FilterState {
  yearRange: [number, number];
  regions: Region[];
  companies: Company[];
  viewMode: ViewMode;
  selectedCategory: Category | 'all';
}
