import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApiDelete, adminApiGet, adminApiPatch, adminApiPost, adminApiPut } from '../lib/apiClient'
import type {
    RegisterStreamerRequest,
    RegisterStreamerResponse,
    StreamerListParams,
    StreamerListResponse,
    UpdateFanCafeUrlRequest,
    UpdateNicknameRequest,
    UpdateNicknameResponse,
    UpdateStreamerAffiliationsRequest,
    UpdateStreamerAffiliationsResponse,
    UpdateYoutubeUrlRequest,
} from '../types'

const STREAMERS_QUERY_KEY = ['admin-streamers'] as const

function buildQueryParams(params: StreamerListParams): Record<string, string> {
    const result: Record<string, string> = {}
    if (params.name) result.name = params.name
    if (params.hasChannel !== undefined) result.hasChannel = String(params.hasChannel)
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

export function useUpdateNickname() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, body }: { id: number; body: UpdateNicknameRequest }) =>
            adminApiPatch<UpdateNicknameResponse>(`/api/admin/streamers/${id}/nickname`, body),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: STREAMERS_QUERY_KEY })
        },
    })
}

export function useUpdateYoutubeUrl() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ channelId, body }: { channelId: string; body: UpdateYoutubeUrlRequest }) =>
            adminApiPatch<void>(`/api/admin/streamers/${channelId}/youtube-url`, body),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: STREAMERS_QUERY_KEY })
        },
    })
}

export function useUpdateFanCafeUrl() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ channelId, body }: { channelId: string; body: UpdateFanCafeUrlRequest }) =>
            adminApiPatch<void>(`/api/admin/streamers/${channelId}/fan-cafe-url`, body),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: STREAMERS_QUERY_KEY })
        },
    })
}

export function useUpdateStreamerAffiliations() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, body }: { id: number; body: UpdateStreamerAffiliationsRequest }) =>
            adminApiPut<UpdateStreamerAffiliationsResponse>(`/api/admin/streamers/${id}/affiliations`, body),
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
