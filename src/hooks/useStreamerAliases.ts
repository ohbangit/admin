import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApiDelete, adminApiGet, adminApiPost } from '../lib/apiClient'
import type {
    CreateStreamerAliasRequest,
    CreateStreamerAliasResponse,
    ListStreamerAliasesResponse,
    StreamerAlias,
} from '../types'

const STREAMER_ALIASES_QUERY_KEY = ['streamer-aliases'] as const

export function useStreamerAliases(streamerId?: number) {
    return useQuery({
        queryKey: [...STREAMER_ALIASES_QUERY_KEY, streamerId],
        queryFn: async () => {
            if (streamerId === undefined) return [] as StreamerAlias[]
            const res = await adminApiGet<ListStreamerAliasesResponse>(
                `/api/admin/streamers/${streamerId}/aliases`,
            )
            return res.items
        },
        enabled: streamerId !== undefined,
    })
}

export function useCreateStreamerAlias() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ streamerId, alias }: { streamerId: number; alias: string }) => {
            const body: CreateStreamerAliasRequest = { alias }
            return adminApiPost<CreateStreamerAliasResponse>(
                `/api/admin/streamers/${streamerId}/aliases`,
                body,
            )
        },
        onSuccess: (_data, variables) => {
            void queryClient.invalidateQueries({
                queryKey: [...STREAMER_ALIASES_QUERY_KEY, variables.streamerId],
            })
        },
    })
}

export function useDeleteStreamerAlias() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ streamerId, aliasId }: { streamerId: number; aliasId: number }) =>
            adminApiDelete(`/api/admin/streamers/${streamerId}/aliases/${aliasId}`),
        onSuccess: (_data, variables) => {
            void queryClient.invalidateQueries({
                queryKey: [...STREAMER_ALIASES_QUERY_KEY, variables.streamerId],
            })
        },
    })
}
