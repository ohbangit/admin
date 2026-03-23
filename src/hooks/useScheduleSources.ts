import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApiDelete, adminApiGet, adminApiPatch, adminApiPost } from '../lib/apiClient'
import type {
    CreateScheduleSourceRequest,
    ListScheduleSourcesResponse,
    ScheduleSourceItem,
    UpdateScheduleSourceRequest,
} from '../types'

const SCHEDULE_SOURCES_QUERY_KEY = ['schedule-sources'] as const

export function useScheduleSources(streamerId?: number) {
    return useQuery({
        queryKey: [...SCHEDULE_SOURCES_QUERY_KEY, streamerId],
        queryFn: async () => {
            const url = streamerId !== undefined ? `/api/admin/schedule-sources?streamer_id=${streamerId}` : '/api/admin/schedule-sources'
            const res = await adminApiGet<ListScheduleSourcesResponse>(url)
            return res.sources
        },
    })
}

export function useCreateScheduleSource() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (body: CreateScheduleSourceRequest) => adminApiPost<ScheduleSourceItem>('/api/admin/schedule-sources', body),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: SCHEDULE_SOURCES_QUERY_KEY })
        },
    })
}

export function useUpdateScheduleSource() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, body }: { id: number; body: UpdateScheduleSourceRequest }) =>
            adminApiPatch<ScheduleSourceItem>(`/api/admin/schedule-sources/${id}`, body),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: SCHEDULE_SOURCES_QUERY_KEY })
        },
    })
}

export function useDeleteScheduleSource() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => adminApiDelete(`/api/admin/schedule-sources/${id}`),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: SCHEDULE_SOURCES_QUERY_KEY })
        },
    })
}

export function useToggleScheduleSourceActive() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
            adminApiPatch<ScheduleSourceItem>(`/api/admin/schedule-sources/${id}`, { is_active }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: SCHEDULE_SOURCES_QUERY_KEY })
        },
    })
}
