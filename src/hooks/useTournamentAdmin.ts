import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApiDelete, adminApiGet, adminApiPatch, adminApiPost } from '../lib/apiClient'
import type {
    CreateTournamentRequest,
    CreateTournamentTeamRequest,
    StreamerItem,
    TournamentAdminPlayersResponse,
    TournamentAdminTeamsResponse,
    TournamentListResponse,
    UpdateTournamentPlayersV2Request,
    UpdateTournamentRequest,
    UpdateTournamentTeamRequest,
    UpsertTournamentMemberRequest,
} from '../types'

type StreamerListResponse = {
    items: StreamerItem[]
    total: number
}

function tournamentTeamsKey(tournamentId: number) {
    return ['admin', 'tournaments', tournamentId, 'teams'] as const
}

function tournamentPlayersKey(tournamentId: number) {
    return ['admin', 'tournaments', tournamentId, 'players'] as const
}

export function useTournamentTeams(tournamentId: number | null) {
    return useQuery({
        queryKey: ['admin', 'tournaments', tournamentId, 'teams'],
        queryFn: () => adminApiGet<TournamentAdminTeamsResponse>(`/api/admin/tournaments/${tournamentId}/teams`),
        enabled: tournamentId !== null,
    })
}

export function useTournamentPlayers(tournamentId: number | null, enabled = true) {
    return useQuery({
        queryKey: tournamentId === null ? ['admin', 'tournaments', null, 'players'] : tournamentPlayersKey(tournamentId),
        queryFn: () => adminApiGet<TournamentAdminPlayersResponse>(`/api/admin/tournaments/${tournamentId}/players`),
        enabled: tournamentId !== null && enabled,
    })
}

export function useUpdateTournamentPlayersV2(tournamentId: number) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (body: UpdateTournamentPlayersV2Request) =>
            adminApiPatch<TournamentAdminPlayersResponse>(`/api/admin/tournaments/${tournamentId}/v2/players`, body),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: tournamentPlayersKey(tournamentId),
            })
        },
    })
}

export function useAdminStreamerSearch(keyword: string) {
    const trimmedKeyword = keyword.trim()
    return useQuery({
        queryKey: ['admin', 'streamers', 'search', trimmedKeyword],
        queryFn: async () => {
            const response = await adminApiGet<StreamerListResponse>('/api/admin/streamers', {
                nickname: trimmedKeyword,
                page: '1',
                size: '8',
                sort: 'name_asc',
            })
            return response.items
        },
        enabled: trimmedKeyword.length > 0,
    })
}

export function useCreateTournamentTeam(tournamentId: number) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (body: CreateTournamentTeamRequest) =>
            adminApiPost<{ id: number }>(`/api/admin/tournaments/${tournamentId}/teams`, body),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: tournamentTeamsKey(tournamentId),
            })
        },
    })
}

export function useUpdateTournamentTeam(tournamentId: number, teamId: number) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (body: UpdateTournamentTeamRequest) => adminApiPatch<{ id: number }>(`/api/admin/tournaments/teams/${teamId}`, body),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: tournamentTeamsKey(tournamentId),
            })
        },
    })
}

export function useDeleteTournamentTeam(tournamentId: number) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (teamId: number) => adminApiDelete(`/api/admin/tournaments/teams/${teamId}`),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: tournamentTeamsKey(tournamentId),
            })
        },
    })
}

type ReorderTournamentTeamInput = {
    readonly teamId: number
    readonly teamOrder: number
}

export function useReorderTournamentTeams(tournamentId: number) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (items: readonly ReorderTournamentTeamInput[]) => {
            await Promise.all(
                items.map((item) => adminApiPatch<void>(`/api/admin/tournaments/teams/${item.teamId}`, { teamOrder: item.teamOrder })),
            )
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: tournamentTeamsKey(tournamentId),
            })
        },
    })
}

export function useUpsertTournamentMember(tournamentId: number, teamId: number) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (body: UpsertTournamentMemberRequest) => adminApiPost<void>(`/api/admin/tournaments/teams/${teamId}/members`, body),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: tournamentTeamsKey(tournamentId),
            })
        },
    })
}

export function useDeleteTournamentMember(tournamentId: number, teamId: number) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ memberId }: { memberId: number }) => adminApiDelete(`/api/admin/tournaments/teams/${teamId}/members/${memberId}`),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: tournamentTeamsKey(tournamentId),
            })
        },
    })
}

function tournamentsKey() {
    return ['admin', 'tournaments'] as const
}

export function useAdminTournaments() {
    return useQuery({
        queryKey: tournamentsKey(),
        queryFn: () => adminApiGet<TournamentListResponse>('/api/admin/tournaments'),
    })
}

export function useCreateTournament() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (body: CreateTournamentRequest) => adminApiPost<{ slug: string }>('/api/admin/tournaments', body),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: tournamentsKey() })
        },
    })
}

export function useUpdateTournament(tournamentId: number | null) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (body: UpdateTournamentRequest) => adminApiPatch<{ id: number }>(`/api/admin/tournaments/${tournamentId}`, body),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: tournamentsKey() })
        },
    })
}

export function useDeleteTournament() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (targetTournamentId: number) => adminApiDelete(`/api/admin/tournaments/${targetTournamentId}`),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: tournamentsKey() })
        },
    })
}
