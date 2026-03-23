import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApiDelete, adminApiGet, adminApiPatch, adminApiPost } from '../lib/apiClient'
import type {
    CreateBroadcastRequest,
    InsertCrawledBroadcastsRequest,
    InsertCrawledBroadcastsResponse,
    ReviewQueueResponse,
    RunBroadcastCrawlRequest,
    RunBroadcastCrawlResponse,
    ScheduleParams,
    ScheduleResponse,
    UpdateBroadcastRequest,
} from '../types'

const SCHEDULE_QUERY_KEY = ['admin-schedule'] as const
const REVIEW_QUEUE_KEY = ['admin-review-queue'] as const

function buildScheduleParams(params: ScheduleParams): Record<string, string> {
    const result: Record<string, string> = { view: params.view, date: params.date }
    if (params.tz) result.tz = params.tz
    return result
}

export function useAdminSchedule(params: ScheduleParams) {
    return useQuery({
        queryKey: [...SCHEDULE_QUERY_KEY, params],
        queryFn: () => adminApiGet<ScheduleResponse>('/api/admin/schedule', buildScheduleParams(params)),
    })
}

export function useCreateBroadcast() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (body: CreateBroadcastRequest) => adminApiPost<{ id: string }>('/api/admin/broadcasts', body),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: SCHEDULE_QUERY_KEY })
        },
    })
}

export function useUpdateBroadcast() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, body }: { id: number; body: UpdateBroadcastRequest }) =>
            adminApiPatch<{ id: string }>(`/api/admin/broadcasts/${id}`, body),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: SCHEDULE_QUERY_KEY })
        },
    })
}

export function useDeleteBroadcast() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => adminApiDelete(`/api/admin/broadcasts/${id}`),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: SCHEDULE_QUERY_KEY })
        },
    })
}

export function useReviewQueue() {
    return useQuery({
        queryKey: [...REVIEW_QUEUE_KEY],
        queryFn: () => adminApiGet<ReviewQueueResponse>('/api/admin/broadcasts/review'),
    })
}

export function useApproveReview() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) =>
            adminApiPatch<{ id: string }>(`/api/admin/broadcasts/${id}/approve`, {}),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: REVIEW_QUEUE_KEY })
            void queryClient.invalidateQueries({ queryKey: SCHEDULE_QUERY_KEY })
        },
    })
}

export function useBulkApprove() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (ids: string[]) =>
            adminApiPost<{ approvedCount: number }>('/api/admin/broadcasts/bulk-approve', { ids }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: REVIEW_QUEUE_KEY })
            void queryClient.invalidateQueries({ queryKey: SCHEDULE_QUERY_KEY })
        },
    })
}

export function useRunBroadcastCrawl() {
    return useMutation({
        mutationFn: (body: RunBroadcastCrawlRequest) =>
            adminApiPost<RunBroadcastCrawlResponse>('/api/admin/broadcast-crawl/run', body),
    })
}

export function useInsertCrawledBroadcasts() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (body: InsertCrawledBroadcastsRequest) =>
            adminApiPost<InsertCrawledBroadcastsResponse>('/api/admin/broadcast-crawl/insert', body),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: SCHEDULE_QUERY_KEY })
        },
    })
}
