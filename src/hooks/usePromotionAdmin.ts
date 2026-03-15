import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    adminApiGet,
    adminApiPost,
    adminApiPatch,
    adminApiPut,
} from '../lib/apiClient'
import type {
    CreatePromotionConfigRequest,
    PromotionConfigRaw,
    ReorderPromotionPanelsRequest,
    UpdatePromotionPanelsRequest,
} from '../types'

function promotionKey(tournamentId: number) {
    return ['admin', 'tournaments', tournamentId, 'promotion'] as const
}

/** 대회 프로모션 설정을 조회한다 */
export function usePromotionConfig(tournamentId: number | null) {
    return useQuery({
        queryKey: ['admin', 'tournaments', tournamentId, 'promotion'],
        queryFn: () =>
            adminApiGet<PromotionConfigRaw>(
                `/api/admin/tournaments/${tournamentId}/promotion`,
            ),
        retry: false,
        enabled: tournamentId !== null,
    })
}

/** 대회 프로모션 설정을 생성한다 */
export function useCreatePromotionConfig(tournamentId: number) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (dto: CreatePromotionConfigRequest) =>
            adminApiPost<PromotionConfigRaw>(
                `/api/admin/tournaments/${tournamentId}/promotion`,
                dto,
            ),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: promotionKey(tournamentId),
            })
        },
    })
}

/** 대회 프로모션 패널들을 일괄 수정한다 */
export function useUpdatePromotionPanels(tournamentId: number) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (dto: UpdatePromotionPanelsRequest) =>
            adminApiPatch<PromotionConfigRaw>(
                `/api/admin/tournaments/${tournamentId}/promotion/panels`,
                dto,
            ),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: promotionKey(tournamentId),
            })
        },
    })
}

/** 대회 프로모션 패널 순서를 변경한다 */
export function useReorderPromotionPanels(tournamentId: number) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (dto: ReorderPromotionPanelsRequest) =>
            adminApiPut<PromotionConfigRaw>(
                `/api/admin/tournaments/${tournamentId}/promotion/panels/reorder`,
                dto,
            ),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: promotionKey(tournamentId),
            })
        },
    })
}
