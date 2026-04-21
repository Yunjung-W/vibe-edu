import { useQuery } from '@tanstack/react-query';
import { fetchEvents, EventsFilters } from '../api/client';
import { DashboardFilters } from '../types';

export function useEventsData(filters: DashboardFilters, category?: string) {
  const params: EventsFilters = {
    from: `${filters.yearRange[0]}-01`,
    to: `${filters.yearRange[1]}-12`,
    category: category && category !== 'all' ? category : undefined,
  };

  return useQuery({
    queryKey: ['events', params],
    queryFn: () => fetchEvents(params),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    retry: 2,
  });
}
