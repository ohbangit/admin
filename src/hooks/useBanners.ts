import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApiDelete, adminApiGet, adminApiPatch, adminApiPost } from '../lib/apiClient'
import type { CreateBannerRequest, ListBannersResponse, UpdateBannerRequest } from '../types'

const BANNERS_QUERY_KEY = ['admin-banners'] as const

export function useBanners() {
    return useQuery({
        queryKey: BANNERS_QUERY_KEY,
        queryFn: async () => {
            const res = await adminApiGet<ListBannersResponse>('/api/admin/banners')
            return res.banners
        },
    })
}

export function useCreateBanner() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: CreateBannerRequest) => adminApiPost<{ id: number }>('/api/admin/banners', body),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: BANNERS_QUERY_KEY })
        },
    })
}

export function useUpdateBanner() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, body }: { id: number; body: UpdateBannerRequest }) =>
            adminApiPatch<{ id: number }>(`/api/admin/banners/${id}`, body),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: BANNERS_QUERY_KEY })
        },
    })
}

export function useDeleteBanner() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => adminApiDelete(`/api/admin/banners/${id}`),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: BANNERS_QUERY_KEY })
        },
    })
}
