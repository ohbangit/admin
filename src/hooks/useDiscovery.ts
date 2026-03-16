import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApiDelete, adminApiGet, adminApiPost } from '../lib/apiClient'
import type {
    CreateExclusionRequest,
    CreateExclusionsRequest,
    ListExclusionsResponse,
    RegisterCandidatesRequest,
    RegisterCandidatesResponse,
    RunDiscoveryRequest,
    RunDiscoveryResponse,
    StreamerExclusion,
} from '../types'

const EXCLUSIONS_QUERY_KEY = ['admin-exclusions'] as const

export function useRunDiscovery() {
    return useMutation({
        mutationFn: (body: RunDiscoveryRequest) =>
            adminApiPost<RunDiscoveryResponse>('/api/admin/streamer-discovery/run', body),
    })
}

export function useRegisterCandidates() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (body: RegisterCandidatesRequest) =>
            adminApiPost<RegisterCandidatesResponse>('/api/admin/streamer-discovery/register', body),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['admin-streamers'] })
        },
    })
}

export function useExclusions() {
    return useQuery({
        queryKey: EXCLUSIONS_QUERY_KEY,
        queryFn: async () => {
            const res = await adminApiGet<ListExclusionsResponse>('/api/admin/streamer-discovery/exclusions')
            return res.items
        },
    })
}

export function useCreateExclusion() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (body: CreateExclusionRequest) =>
            adminApiPost<void>('/api/admin/streamer-discovery/exclusions', body),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: EXCLUSIONS_QUERY_KEY })
        },
    })
}

export function useCreateExclusions() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (body: CreateExclusionsRequest) =>
            adminApiPost<void>('/api/admin/streamer-discovery/exclusions/bulk', body),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: EXCLUSIONS_QUERY_KEY })
        },
    })
}

export function useDeleteExclusion() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (channelId: string) =>
            adminApiDelete(`/api/admin/streamer-discovery/exclusions/${channelId}`),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: EXCLUSIONS_QUERY_KEY })
        },
    })
}

export type { StreamerExclusion }
