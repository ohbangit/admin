import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApiDelete, adminApiGet, adminApiPatch, adminApiPost } from '../lib/apiClient'
import type { CreateNoticeRequest, ListNoticesResponse, UpdateNoticeRequest } from '../types'

const NOTICES_QUERY_KEY = ['admin-notices'] as const

export function useNotices() {
    return useQuery({
        queryKey: NOTICES_QUERY_KEY,
        queryFn: async () => {
            const res = await adminApiGet<ListNoticesResponse>('/api/admin/notices')
            return res.notices
        },
    })
}

export function useCreateNotice() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: CreateNoticeRequest) => adminApiPost<{ id: number }>('/api/admin/notices', body),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: NOTICES_QUERY_KEY })
        },
    })
}

export function useUpdateNotice() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, body }: { id: number; body: UpdateNoticeRequest }) =>
            adminApiPatch<{ id: number }>(`/api/admin/notices/${id}`, body),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: NOTICES_QUERY_KEY })
        },
    })
}

export function useDeleteNotice() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => adminApiDelete(`/api/admin/notices/${id}`),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: NOTICES_QUERY_KEY })
        },
    })
}
