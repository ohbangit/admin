import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApiGet, adminApiPost, adminApiPatch, adminApiDelete, adminApiPut } from '../lib/apiClient'
import type {
    AffiliationItem,
    ListAffiliationsResponse,
    CreateAffiliationRequest,
    UpdateAffiliationRequest,
    UpdateStreamerAffiliationsRequest,
    UpdateStreamerAffiliationsResponse,
} from '../types'

const AFFILIATIONS_KEY = ['admin', 'affiliations'] as const

export function useAffiliations() {
    return useQuery({
        queryKey: AFFILIATIONS_KEY,
        queryFn: () => adminApiGet<ListAffiliationsResponse>('/api/admin/affiliations'),
    })
}

export function useCreateAffiliation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (body: CreateAffiliationRequest) => adminApiPost<AffiliationItem>('/api/admin/affiliations', body),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: AFFILIATIONS_KEY })
        },
    })
}

export function useUpdateAffiliation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, body }: { id: number; body: UpdateAffiliationRequest }) =>
            adminApiPatch<AffiliationItem>(`/api/admin/affiliations/${id}`, body),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: AFFILIATIONS_KEY })
        },
    })
}

export function useDeleteAffiliation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => adminApiDelete(`/api/admin/affiliations/${id}`),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: AFFILIATIONS_KEY })
        },
    })
}

export function useUpdateStreamerAffiliations(streamerId: number) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (body: UpdateStreamerAffiliationsRequest) =>
            adminApiPut<UpdateStreamerAffiliationsResponse>(`/api/admin/streamers/${streamerId}/affiliations`, body),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['admin', 'streamers'] })
        },
    })
}
