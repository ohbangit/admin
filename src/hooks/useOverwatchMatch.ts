import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApiDelete, adminApiPut, adminApiGet } from '../lib/apiClient'
import type { OverwatchMatchInput } from '../types'
import type { OverwatchMatchInfo } from '../types'

const SCHEDULE_KEY = ['admin', 'schedule'] as const

function overwatchMatchKey(broadcastId: string) {
    return ['admin', 'overwatch-match', broadcastId] as const
}

export function useOverwatchMatch(broadcastId: string, enabled = true) {
    return useQuery<OverwatchMatchInfo | null>({
        queryKey: overwatchMatchKey(broadcastId),
        queryFn: () => adminApiGet<OverwatchMatchInfo | null>(`/api/admin/broadcasts/${broadcastId}/overwatch-match`),
        enabled: enabled && broadcastId.length > 0,
    })
}

export function useUpsertOverwatchMatch(broadcastId: string) {
    const queryClient = useQueryClient()
    return useMutation<OverwatchMatchInfo, Error, OverwatchMatchInput>({
        mutationFn: (body) => adminApiPut<OverwatchMatchInfo>(`/api/admin/broadcasts/${broadcastId}/overwatch-match`, body),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: SCHEDULE_KEY })
            void queryClient.invalidateQueries({
                queryKey: overwatchMatchKey(broadcastId),
            })
        },
    })
}

export function useDeleteOverwatchMatch(broadcastId: string) {
    const queryClient = useQueryClient()
    return useMutation<void, Error, void>({
        mutationFn: () => adminApiDelete(`/api/admin/broadcasts/${broadcastId}/overwatch-match`),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: SCHEDULE_KEY })
            void queryClient.invalidateQueries({
                queryKey: overwatchMatchKey(broadcastId),
            })
        },
    })
}
