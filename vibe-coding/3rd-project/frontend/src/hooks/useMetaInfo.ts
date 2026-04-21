import { useQuery } from '@tanstack/react-query';
import { fetchMeta } from '../api/client';

export function useMetaInfo() {
  return useQuery({
    queryKey: ['meta'],
    queryFn: fetchMeta,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    retry: 2,
  });
}
