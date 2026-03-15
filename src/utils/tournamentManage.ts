import type { F1DriverRole, F1DriversContent, PromotionPanelType, TournamentAdminPlayersResponse, TournamentMetaFormState } from '../types'

export const PANEL_LABELS: Record<PromotionPanelType, string> = {
    DRAFT: '드래프트',
    PLAYER_LIST: '참여자 목록',
    SCHEDULE: '일정 & 결과',
    FINAL_RESULT: '최종 결과',
    TEAMS: '팀 정보',
    F1_DRIVERS: '드라이버',
    F1_RACE_SCHEDULE: '레이스 일정',
    F1_RACE_RESULT: '레이스 결과',
    F1_STANDINGS: '챔피언십 순위',
    F1_QUALIFYING: '예선 결과',
    F1_CIRCUIT: '서킷 정보',
    F1_TEAM_DRAFT: '팀 드래프트',
}

export const PANEL_ICONS: Record<PromotionPanelType, string> = {
    DRAFT: '🎯',
    PLAYER_LIST: '👥',
    SCHEDULE: '🗓️',
    FINAL_RESULT: '🏆',
    TEAMS: '🛡️',
    F1_DRIVERS: '🏎️',
    F1_RACE_SCHEDULE: '🏁',
    F1_RACE_RESULT: '📊',
    F1_STANDINGS: '🥇',
    F1_QUALIFYING: '⏱️',
    F1_CIRCUIT: '🗺️',
    F1_TEAM_DRAFT: '📝',
}

export function isRacingGame(game: string): boolean {
    const normalized = game.trim().toUpperCase()
    return normalized === 'RACING'
}

export function isOverwatchGame(game: string): boolean {
    const normalized = game.trim().toUpperCase()
    return normalized === 'OVERWATCH' || normalized === 'OW'
}

export function toNumberOrNull(value: unknown): number | null {
    return typeof value === 'number' ? value : null
}

export function toStringOrNull(value: unknown): string | null {
    return typeof value === 'string' ? value : null
}

export function createEmptyTournamentMetaForm(): TournamentMetaFormState {
    return {
        name: '',
        startedAt: '',
        endedAt: '',
        bannerUrl: '',
        tags: [],
        isChzzkSupport: false,
        hostName: '',
        hostAvatarUrl: '',
        hostChannelUrl: '',
        hostIsPartner: false,
        hostStreamerId: null,
        links: [],
        description: '',
        showDescription: false,
        broadcasterName: '',
        broadcasterAvatarUrl: '',
        broadcasterChannelUrl: '',
        broadcasterIsPartner: false,
        broadcasterStreamerId: null,
        commentators: [],
    }
}

export function toF1DriversContentFromAdminPlayers(response: TournamentAdminPlayersResponse): F1DriversContent {
    const participants = [...response.players]
        .sort((a, b) => a.order - b.order)
        .map((player) => {
            const info = typeof player.info === 'object' && player.info !== null ? (player.info as Record<string, unknown>) : {}

            const driverRole: F1DriverRole = info.driverRole === 'SECOND' ? 'SECOND' : 'FIRST'
            const name = typeof info.name === 'string' && info.name.length > 0 ? info.name : player.nickname

            return {
                id: String(player.id),
                streamerId: player.streamerId,
                name,
                nickname: player.nickname,
                avatarUrl: player.avatarUrl,
                channelUrl: player.channelUrl,
                isPartner: player.isPartner,
                driverRole,
                tier: toStringOrNull(info.tier),
                ranking: toNumberOrNull(info.ranking),
                participationCount: toNumberOrNull(info.participationCount) ?? 0,
                winCount: toNumberOrNull(info.winCount) ?? 0,
                carNumber: toNumberOrNull(info.carNumber),
                secondGroup: player.secondGroup ?? (info.secondGroup === 'A' || info.secondGroup === 'B' ? info.secondGroup : null),
                qualifyingEliminated: player.qualifyingEliminated ?? info.qualifyingEliminated === true,
                order: player.order,
            }
        })

    return { participants }
}
