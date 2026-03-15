import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApiPost } from '../lib/apiClient'
import type {
    CrawlBroadcastsRequest,
    CrawlBroadcastsResponse,
    InsertBroadcastsRequest,
    InsertBroadcastsResponse,
} from '../types'

export function useCrawlBroadcasts() {
    return useMutation<CrawlBroadcastsResponse, Error, CrawlBroadcastsRequest>({
        mutationFn: (body) =>
            adminApiPost<CrawlBroadcastsResponse>(
                '/api/admin/broadcast-crawl/run',
                body,
            ),
    })
}

export function useInsertBroadcasts() {
    const queryClient = useQueryClient()
    return useMutation<
        InsertBroadcastsResponse,
        Error,
        InsertBroadcastsRequest
    >({
        mutationFn: (body) =>
            adminApiPost<InsertBroadcastsResponse>(
                '/api/admin/broadcast-crawl/insert',
                body,
            ),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: ['schedule'],
            })
        },
    })
}
