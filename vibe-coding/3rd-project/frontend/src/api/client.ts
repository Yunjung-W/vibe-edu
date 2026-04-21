import axios from 'axios';
import { ApiResponse, SalesRecord, EventRecord, MetaInfo } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

export interface SalesFilters {
  year?: string;
  region?: string;
  company?: string;
  quarter?: string;
}

export interface EventsFilters {
  from?: string;
  to?: string;
  category?: string;
  severity?: string;
}

export async function fetchSales(filters?: SalesFilters): Promise<ApiResponse<SalesRecord>> {
  const { data } = await api.get<ApiResponse<SalesRecord>>('/api/sales', {
    params: filters,
  });
  return data;
}

export async function fetchEvents(filters?: EventsFilters): Promise<ApiResponse<EventRecord>> {
  const { data } = await api.get<ApiResponse<EventRecord>>('/api/events', {
    params: filters,
  });
  return data;
}

export async function fetchMeta(): Promise<MetaInfo> {
  const { data } = await api.get<MetaInfo>('/api/meta');
  return data;
}

export async function triggerRefresh(): Promise<void> {
  await api.post('/api/refresh');
}
