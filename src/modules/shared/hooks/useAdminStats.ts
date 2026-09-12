import { useQuery } from '@tanstack/react-query'
import { getAdminStats } from '@/modules/shared/lib/supabase'

export function useAdminStats() {
  return useQuery({
    queryKey: ['adminStats'],
    queryFn: getAdminStats,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  })
}
