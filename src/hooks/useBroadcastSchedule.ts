import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    adminApiGet,
    adminApiPost,
    adminApiPatch,
    adminApiDelete,
} from '../lib/apiClient'
import type {
    CreateBroadcastRequest,
    UpdateBroadcastRequest,
    BroadcastMutationResponse,
} from '../types'
import type {
    ScheduleWeeklyResponse,
    ScheduleMonthlyResponse,
    Broadcast,
} from '../types'
import type { BroadcastDateGroup, ViewMode } from '../types/broadcastSchedule'
import { collectBroadcasts, toDateString } from '../utils/broadcastSchedule'

type ScheduleView = 'weekly' | 'monthly'

type UseScheduleParams = {
    view: ScheduleView
    date: string
    tz?: string
}

const SCHEDULE_KEY = ['admin', 'schedule'] as const

export function useScheduleBroadcasts({ view, date, tz }: UseScheduleParams) {
    const params: Record<string, string> = { view, date }
    if (tz !== undefined) params['tz'] = tz
    return useQuery<ScheduleWeeklyResponse | ScheduleMonthlyResponse>({
        queryKey: [...SCHEDULE_KEY, view, date],
        queryFn: () =>
            adminApiGet<ScheduleWeeklyResponse | ScheduleMonthlyResponse>(
                '/api/admin/schedule',
                params,
            ),
    })
}

export function useCreateBroadcast() {
    const queryClient = useQueryClient()
    return useMutation<
        BroadcastMutationResponse,
        Error,
        CreateBroadcastRequest
    >({
        mutationFn: (body) =>
            adminApiPost<BroadcastMutationResponse>(
                '/api/admin/broadcasts',
                body,
            ),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: SCHEDULE_KEY })
        },
    })
}

export function useUpdateBroadcast(broadcastId: string) {
    const queryClient = useQueryClient()
    return useMutation<
        BroadcastMutationResponse,
        Error,
        UpdateBroadcastRequest
    >({
        mutationFn: (body) =>
            adminApiPatch<BroadcastMutationResponse>(
                `/api/admin/broadcasts/${broadcastId}`,
                body,
            ),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: SCHEDULE_KEY })
        },
    })
}

export function useDeleteBroadcast() {
    const queryClient = useQueryClient()
    return useMutation<void, Error, string>({
        mutationFn: (broadcastId) =>
            adminApiDelete(`/api/admin/broadcasts/${broadcastId}`),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: SCHEDULE_KEY })
        },
    })
}

export function useBroadcastSchedule() {
    const [view, setView] = useState<ViewMode>('weekly')
    const [baseDate, setBaseDate] = useState<Date>(() => new Date())
    const [pendingScrollDate, setPendingScrollDate] = useState<string | null>(null)
    const [editingBroadcast, setEditingBroadcast] = useState<Broadcast | null>(null)
    const [deletingBroadcast, setDeletingBroadcast] = useState<Broadcast | null>(null)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [overwatchBroadcast, setOverwatchBroadcast] = useState<Broadcast | null>(null)
    const [showHiddenOnly, setShowHiddenOnly] = useState(false)

    const { data, isLoading, refetch } = useScheduleBroadcasts({
        view,
        date: toDateString(baseDate),
    })

    const dateGroups = collectBroadcasts(data)
    const filteredDateGroups: BroadcastDateGroup[] = showHiddenOnly
        ? dateGroups
              .map((group) => ({
                  ...group,
                  broadcasts: group.broadcasts.filter((broadcast) => !(broadcast.isVisible ?? true)),
              }))
              .filter((group) => group.broadcasts.length > 0)
        : dateGroups

    const totalCount = filteredDateGroups.reduce((acc, group) => acc + group.broadcasts.length, 0)

    useEffect(() => {
        if (pendingScrollDate === null || isLoading) {
            return
        }
        const target = document.querySelector<HTMLElement>(`[data-date="${pendingScrollDate}"]`)
        if (target !== null) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
        setPendingScrollDate(null)
    }, [pendingScrollDate, isLoading, dateGroups])

    function navigatePrev(): void {
        setBaseDate((prev) => {
            const next = new Date(prev)
            next.setDate(next.getDate() - (view === 'weekly' ? 7 : 30))
            return next
        })
    }

    function navigateNext(): void {
        setBaseDate((prev) => {
            const next = new Date(prev)
            next.setDate(next.getDate() + (view === 'weekly' ? 7 : 30))
            return next
        })
    }

    function moveToToday(): void {
        const today = new Date()
        setBaseDate(today)
        setPendingScrollDate(toDateString(today))
    }

    function refreshSchedule(): void {
        void refetch()
    }

    return {
        view,
        setView,
        navigatePrev,
        navigateNext,
        moveToToday,
        isLoading,
        filteredDateGroups,
        totalCount,
        showHiddenOnly,
        setShowHiddenOnly,
        showCreateModal,
        setShowCreateModal,
        editingBroadcast,
        setEditingBroadcast,
        deletingBroadcast,
        setDeletingBroadcast,
        overwatchBroadcast,
        setOverwatchBroadcast,
        refreshSchedule,
    }
}
