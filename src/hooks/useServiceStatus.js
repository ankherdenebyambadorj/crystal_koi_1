import { useQuery } from '@tanstack/react-query';
import { fetchServiceStatus } from '../api/publicContent.js';

export function useServiceStatus() {
  return useQuery({
    queryKey: ['public', 'serviceStatus'],
    queryFn: fetchServiceStatus,
    staleTime: 60 * 1000,
  });
}
