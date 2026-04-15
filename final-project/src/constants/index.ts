import type { Company, Region } from '../types';

export const COMPANIES: Company[] = ['Toyota', 'Volkswagen', 'Hyundai', 'GM', 'Stellantis'];

export const REGIONS: Region[] = ['americas', 'europe', 'asia_pacific', 'mea'];

export const COMPANY_COLORS: Record<Company, string> = {
  Toyota: '#EB0A1E',
  Volkswagen: '#001E50',
  Hyundai: '#002C5F',
  GM: '#0170CE',
  Stellantis: '#243971',
};

export const REGION_COLORS: Record<Region, string> = {
  americas: '#0073E6',
  europe: '#00825A',
  asia_pacific: '#F59E0B',
  mea: '#7C3AED',
};

export const SEVERITY_COLORS = {
  high: '#D32F2F',
  medium: '#F59E0B',
  low: '#999999',
};

export const MIN_YEAR = 2020;
export const MAX_YEAR = 2025;
