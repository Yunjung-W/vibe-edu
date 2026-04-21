import { useQuery } from '@tanstack/react-query';
import { fetchSales, SalesFilters } from '../api/client';
import { DashboardFilters } from '../types';

export function useSalesData(filters: DashboardFilters) {
  const params: SalesFilters = {
    year: `${filters.yearRange[0]},${filters.yearRange[0] + 1},${filters.yearRange[0] + 2},${filters.yearRange[0] + 3},${filters.yearRange[0] + 4},${filters.yearRange[1]}`.split(',').filter((y) => {
      const n = parseInt(y);
      return n >= filters.yearRange[0] && n <= filters.yearRange[1];
    }).join(','),
    region: filters.regions.length > 0 ? filters.regions.join(',') : undefined,
    company: filters.companies.length > 0 ? filters.companies.join(',') : undefined,
  };

  // Build year range string
  const years: number[] = [];
  for (let y = filters.yearRange[0]; y <= filters.yearRange[1]; y++) {
    years.push(y);
  }
  params.year = years.join(',');

  return useQuery({
    queryKey: ['sales', params],
    queryFn: () => fetchSales(params),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    retry: 2,
  });
}
