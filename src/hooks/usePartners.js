import { useQuery } from '@tanstack/react-query';
import { fetchPartners } from '../api/publicContent.js';

export function usePartners() {
  return useQuery({
    queryKey: ['public', 'partners'],
    queryFn: fetchPartners,
    staleTime: 60 * 1000,
  });
}
