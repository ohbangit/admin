// 해설진 타입 (어드민 내부에서 사용)
type CommentatorItem = {
    name: string
    avatarUrl: string | null
    channelUrl: string | null
    isPartner: boolean
    streamerId: number | null
}

type SlotType = 'TNK' | 'DPS' | 'SPT' | 'HEAD_COACH' | 'COACH'

type TournamentAdminMember = {
    id: number
    slot: SlotType
    streamerId: number | null
    name: string
    channelId: string | null
    isPartner: boolean
    isCaptain: boolean
    avatarUrl: string | null
    profileUrl: string | null
}

type TournamentItem = {
    id: number
    slug: string
    name: string
    game: string
    startedAt: string | null
    endedAt: string | null
    bannerUrl: string | null
    isActive: boolean
    createdAt: string
    tags: string[]
    isChzzkSupport: boolean
    hostName: string | null
    hostAvatarUrl: string | null
    hostChannelUrl: string | null
    hostIsPartner: boolean
    hostStreamerId: number | null
    links: { label: string; url: string }[]
    description: string | null
    showDescription: boolean
    broadcasterName: string | null
    broadcasterAvatarUrl: string | null
    broadcasterChannelUrl: string | null
    broadcasterIsPartner: boolean
    broadcasterStreamerId: number | null
    commentators: CommentatorItem[]
}

type TournamentListResponse = {
    tournaments: TournamentItem[]
}

type CreateTournamentRequest = {
    slug: string
    name: string
    game: string
    startedAt?: string
    endedAt?: string
    bannerUrl?: string
    isActive?: boolean
}

type UpdateTournamentRequest = {
    name?: string
    startedAt?: string
    endedAt?: string
    bannerUrl?: string
    isActive?: boolean
    tags?: string[]
    isChzzkSupport?: boolean
    hostName?: string | null
    hostAvatarUrl?: string | null
    hostChannelUrl?: string | null
    hostIsPartner?: boolean
    hostStreamerId?: number | null
    links?: { label: string; url: string }[]
    description?: string | null
    showDescription?: boolean
    broadcasterName?: string | null
    broadcasterAvatarUrl?: string | null
    broadcasterChannelUrl?: string | null
    broadcasterIsPartner?: boolean
    broadcasterStreamerId?: number | null
    commentators?: CommentatorItem[]
}

type TournamentAdminTeam = {
    id: number
    name: string
    logoUrl: string | null
    teamOrder: number
    members: TournamentAdminMember[]
}

type TournamentAdminTeamsResponse = {
    teams: TournamentAdminTeam[]
}

type TournamentAdminPlayerItem = {
    id: number
    nickname: string
    isPartner: boolean
    order: number
    avatarUrl: string | null
    channelUrl: string | null
    streamerId: number | null
    secondGroup: 'A' | 'B' | null
    qualifyingEliminated: boolean
    info: Record<string, unknown>
}

type TournamentAdminPlayersResponse = {
    players: TournamentAdminPlayerItem[]
}

type UpdateTournamentPlayersV2PlayerItem = {
    nickname: string
    isPartner: boolean
    order: number
    avatarUrl?: string | null
    channelUrl?: string | null
    streamerId?: number | null
    secondGroup?: 'A' | 'B' | null
    qualifyingEliminated?: boolean
    info?: Record<string, unknown>
}

type UpdateTournamentPlayersV2Request = {
    players: UpdateTournamentPlayersV2PlayerItem[]
}

type CreateTournamentTeamRequest = {
    name: string
    logoUrl?: string
    teamOrder?: number
}

type UpdateTournamentTeamRequest = {
    name?: string
    logoUrl?: string
    teamOrder?: number
}

type UpsertTournamentMemberRequest = {
    slot: SlotType
    streamerId?: number
    name?: string
    profileUrl?: string
    isCaptain?: boolean
}

export type {
    CommentatorItem,
    CreateTournamentRequest,
    CreateTournamentTeamRequest,
    SlotType,
    TournamentAdminMember,
    TournamentAdminPlayerItem,
    TournamentAdminPlayersResponse,
    TournamentAdminTeam,
    TournamentAdminTeamsResponse,
    TournamentItem,
    TournamentListResponse,
    UpdateTournamentPlayersV2PlayerItem,
    UpdateTournamentPlayersV2Request,
    UpdateTournamentRequest,
    UpdateTournamentTeamRequest,
    UpsertTournamentMemberRequest,
}
