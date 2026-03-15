import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    adminApiDelete,
    adminApiGet,
    adminApiPost,
} from '../lib/apiClient'
import type {
    CreateStreamerExclusionRequest,
    CreateStreamerExclusionsRequest,
    DiscoveryCandidate,
    DiscoveryCursor,
    RegisterDiscoveryCandidatesRequest,
    RunDiscoveryRequest,
    StreamerExclusionItem,
} from '../types'

type RunDiscoveryResponse = {
    candidates: DiscoveryCandidate[]
    nextCursor: DiscoveryCursor | null
}

type ExclusionsResponse = {
    items: StreamerExclusionItem[]
}

type RegisterCandidatesResponse = {
    registeredCount: number
}

const EXCLUSIONS_KEY = ['admin', 'streamer-discovery', 'exclusions'] as const

export function useStreamerExclusions() {
    return useQuery<StreamerExclusionItem[]>({
        queryKey: EXCLUSIONS_KEY,
        queryFn: () =>
            adminApiGet<ExclusionsResponse>(
                '/api/admin/streamer-discovery/exclusions',
            ).then((response) => response.items),
    })
}

export function useRunDiscovery() {
    return useMutation<RunDiscoveryResponse, Error, RunDiscoveryRequest>({
        mutationFn: (body) =>
            adminApiPost<RunDiscoveryResponse>(
                '/api/admin/streamer-discovery/run',
                body,
            ),
    })
}

export function useRegisterDiscoveryCandidates() {
    const queryClient = useQueryClient()
    return useMutation<
        RegisterCandidatesResponse,
        Error,
        RegisterDiscoveryCandidatesRequest
    >({
        mutationFn: (body) =>
            adminApiPost<RegisterCandidatesResponse>(
                '/api/admin/streamer-discovery/register',
                body,
            ),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: ['admin', 'streamers'],
            })
        },
    })
}

export function useCreateStreamerExclusion() {
    const queryClient = useQueryClient()
    return useMutation<void, Error, CreateStreamerExclusionRequest>({
        mutationFn: (body) =>
            adminApiPost<void>(
                '/api/admin/streamer-discovery/exclusions',
                body,
            ),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: EXCLUSIONS_KEY })
        },
    })
}

export function useCreateStreamerExclusions() {
    const queryClient = useQueryClient()
    return useMutation<void, Error, CreateStreamerExclusionsRequest>({
        mutationFn: (body) =>
            adminApiPost<void>(
                '/api/admin/streamer-discovery/exclusions/bulk',
                body,
            ),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: EXCLUSIONS_KEY })
        },
    })
}

export function useDeleteStreamerExclusion() {
    const queryClient = useQueryClient()
    return useMutation<void, Error, string>({
        mutationFn: (channelId) =>
            adminApiDelete(
                `/api/admin/streamer-discovery/exclusions/${channelId}`,
            ),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: EXCLUSIONS_KEY })
        },
    })
}
