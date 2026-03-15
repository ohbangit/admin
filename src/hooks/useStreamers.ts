import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    adminApiGet,
    adminApiPost,
    adminApiPatch,
    adminApiDelete,
} from '../lib/apiClient'
import type {
    StreamerItem,
    RegisterStreamerRequest,
    UpdateChannelRequest,
    UpdateYoutubeUrlRequest,
    UpdateFanCafeUrlRequest,
    UpdateNicknameRequest,
} from '../types'

type StreamerListResponse = {
    items: StreamerItem[]
    total: number
    page?: number
    size?: number
}

type StreamersParams = {
    nickname?: string
    hasChannel?: boolean
    page?: number
    size?: number
    sort?: 'name_asc' | 'name_desc' | 'follower_desc'
}

const STREAMERS_KEY = ['admin', 'streamers'] as const

export function useStreamers(params: StreamersParams = {}) {
    const queryParams: Record<string, string> = {}
    if (params.nickname !== undefined && params.nickname.trim().length > 0) {
        queryParams['nickname'] = params.nickname.trim()
    }
    if (params.hasChannel === false) {
        queryParams['hasChannel'] = 'false'
    }
    if (params.page !== undefined) {
        queryParams['page'] = String(params.page)
    }
    if (params.size !== undefined) {
        queryParams['size'] = String(params.size)
    }
    if (params.sort !== undefined) {
        queryParams['sort'] = params.sort
    }
    return useQuery<StreamerListResponse>({
        queryKey: [...STREAMERS_KEY, queryParams],
        queryFn: () =>
            adminApiGet<StreamerListResponse>(
                '/api/admin/streamers',
                queryParams,
            ),
    })
}

export function useRegisterStreamer() {
    const queryClient = useQueryClient()
    return useMutation<StreamerItem, Error, RegisterStreamerRequest>({
        mutationFn: (body) =>
            adminApiPost<StreamerItem>('/api/admin/streamers', body),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: STREAMERS_KEY })
        },
    })
}

export function useSyncStreamer(streamerId: number) {
    const queryClient = useQueryClient()
    return useMutation<StreamerItem, Error, UpdateChannelRequest>({
        mutationFn: (body) =>
            adminApiPatch<StreamerItem>(
                `/api/admin/streamers/${streamerId}/channel`,
                body,
            ),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: STREAMERS_KEY })
        },
    })
}

export function useUpdateYoutubeUrl(channelId: string) {
    const queryClient = useQueryClient()
    return useMutation<StreamerItem, Error, UpdateYoutubeUrlRequest>({
        mutationFn: (body) =>
            adminApiPatch<StreamerItem>(
                `/api/admin/streamers/${channelId}/youtube-url`,
                body,
            ),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: STREAMERS_KEY })
        },
    })
}

export function useUpdateFanCafeUrl(channelId: string) {
    const queryClient = useQueryClient()
    return useMutation<StreamerItem, Error, UpdateFanCafeUrlRequest>({
        mutationFn: (body) =>
            adminApiPatch<StreamerItem>(
                `/api/admin/streamers/${channelId}/fan-cafe-url`,
                body,
            ),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: STREAMERS_KEY })
        },
    })
}

export function useRefreshStreamer(streamerId: number) {
    const queryClient = useQueryClient()
    return useMutation<StreamerItem, Error, void>({
        mutationFn: () =>
            adminApiPost<StreamerItem>(
                `/api/admin/streamers/${streamerId}/refresh`,
                {},
            ),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: STREAMERS_KEY })
        },
    })
}

export function useDeleteStreamer() {
    const queryClient = useQueryClient()
    return useMutation<void, Error, number>({
        mutationFn: (streamerId) =>
            adminApiDelete(`/api/admin/streamers/${streamerId}`),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: STREAMERS_KEY })
        },
    })
}

export function useUpdateNickname(streamerId: number) {
    const queryClient = useQueryClient()
    return useMutation<StreamerItem, Error, UpdateNicknameRequest>({
        mutationFn: (body) =>
            adminApiPatch<StreamerItem>(
                `/api/admin/streamers/${streamerId}/nickname`,
                body,
            ),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: STREAMERS_KEY })
        },
    })
}
