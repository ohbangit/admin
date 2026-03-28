import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApiDelete, adminApiGet, adminApiPatch, adminApiPost } from '../lib/apiClient'
import type {
    RegisterStreamerRequest,
    RegisterStreamerResponse,
    StreamerListParams,
    StreamerListResponse,
    UpdateStreamerRequest,
} from '../types'

const STREAMERS_QUERY_KEY = ['admin-streamers'] as const

function buildQueryParams(params: StreamerListParams): Record<string, string> {
    const result: Record<string, string> = {}
    if (params.name) result.name = params.name
    if (params.page) result.page = String(params.page)
    if (params.size) result.size = String(params.size)
    if (params.sort) result.sort = params.sort
    return result
}

export function useStreamers(params: StreamerListParams) {
    return useQuery({
        queryKey: [...STREAMERS_QUERY_KEY, params],
        queryFn: () => adminApiGet<StreamerListResponse>('/api/admin/streamers', buildQueryParams(params)),
    })
}

export function useRegisterStreamer() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (body: RegisterStreamerRequest) => adminApiPost<RegisterStreamerResponse>('/api/admin/streamers', body),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: STREAMERS_QUERY_KEY })
        },
    })
}

export function useRefreshStreamer() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => adminApiPost<RegisterStreamerResponse>(`/api/admin/streamers/${id}/refresh`, {}),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: STREAMERS_QUERY_KEY })
        },
    })
}

export function useDeleteStreamer() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => adminApiDelete(`/api/admin/streamers/${id}`),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: STREAMERS_QUERY_KEY })
        },
    })
}

export function useUpdateStreamer() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, body }: { id: number; body: UpdateStreamerRequest }) =>
            adminApiPatch<{ success: boolean }>(`/api/admin/streamers/${id}`, body),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: STREAMERS_QUERY_KEY })
        },
    })
}
