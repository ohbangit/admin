import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    adminApiGet,
    adminApiPost,
    adminApiPatch,
    adminApiDelete,
} from '../lib/apiClient'
import type {
    AdminBanner,
    CreateBannerPayload,
    UpdateBannerPayload,
} from '../types/banner'

const BANNERS_KEY = ['admin', 'banners'] as const

interface AdminBannersResponse {
    banners: AdminBanner[]
}

interface BannerMutationResponse {
    id: number
}

export function useBanners() {
    return useQuery<AdminBannersResponse>({
        queryKey: [...BANNERS_KEY],
        queryFn: () => adminApiGet<AdminBannersResponse>('/api/admin/banners'),
    })
}

export function useCreateBanner() {
    const queryClient = useQueryClient()
    return useMutation<BannerMutationResponse, Error, CreateBannerPayload>({
        mutationFn: (body) =>
            adminApiPost<BannerMutationResponse>('/api/admin/banners', body),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: BANNERS_KEY })
        },
    })
}

export function useUpdateBanner(bannerId: number) {
    const queryClient = useQueryClient()
    return useMutation<BannerMutationResponse, Error, UpdateBannerPayload>({
        mutationFn: (body) =>
            adminApiPatch<BannerMutationResponse>(
                `/api/admin/banners/${bannerId}`,
                body,
            ),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: BANNERS_KEY })
        },
    })
}

export function useDeleteBanner() {
    const queryClient = useQueryClient()
    return useMutation<void, Error, number>({
        mutationFn: (bannerId) =>
            adminApiDelete(`/api/admin/banners/${bannerId}`),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: BANNERS_KEY })
        },
    })
}
