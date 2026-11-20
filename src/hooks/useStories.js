import { useQuery } from '@tanstack/react-query';
import { fetchStories } from '../api/publicContent.js';

export function useStories() {
  return useQuery({
    queryKey: ['public', 'stories'],
    queryFn: fetchStories,
    staleTime: 60 * 1000,
  });
}
