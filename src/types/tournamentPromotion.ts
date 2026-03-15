export type PromotionPanelType =
    | 'DRAFT'
    | 'TEAMS'
    | 'PLAYER_LIST'
    | 'SCHEDULE'
    | 'FINAL_RESULT'
    | 'F1_DRIVERS'
    | 'F1_RACE_SCHEDULE'
    | 'F1_RACE_RESULT'
    | 'F1_STANDINGS'
    | 'F1_QUALIFYING'
    | 'F1_CIRCUIT'
    | 'F1_TEAM_DRAFT'
export type PromotionConfigStatus = 'draft' | 'published'

export interface PromotionPanel {
    id: number
    configId: number
    type: PromotionPanelType
    enabled: boolean
    hidden: boolean
    orderIndex: number
    titleOverride: string | null
    content: Record<string, unknown>
}

export interface PromotionConfig {
    id: number
    tournamentSlug: string
    status: PromotionConfigStatus
    version: number
    publishedAt: string | null
    panels: PromotionPanel[]
}

// DRAFT 패널 content 타입
export type OverwatchRole = 'TNK' | 'DPS' | 'SPT'

export interface DraftParticipant {
    id: string
    streamerId: number | null
    name: string
    channelId: string | null
    teamId: number | null
    position: OverwatchRole | null
    avatarUrl: string | null
    isPartner: boolean
    isCaptain: boolean
    order: number
}

export interface DraftContent {
    startsOn: string | null
    meta: string
    participants: DraftParticipant[]
}

// SCHEDULE 패널 content 타입
export type MatchStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
export type TournamentOverwatchMapType = '쟁탈' | '혼합' | '밀기' | '호위' | '플레시포인트'

export interface OverwatchSetMap {
    setNumber: number
    mapType: TournamentOverwatchMapType
    mapName: string | null
    scoreA: number | null
    scoreB: number | null
}

export interface ScheduleMatch {
    id: string
    teamAId: number
    teamBId: number
    mvpPlayerIds: number[]
    status: MatchStatus
    scoreA: number | null
    scoreB: number | null
    mapType?: TournamentOverwatchMapType | null
    mapName?: string | null
    setMaps?: OverwatchSetMap[]
    order: number
}

export interface ScheduleGroup {
    id: string
    title: string
    groupDate: string | null
    order: number
    matches: ScheduleMatch[]
}

export interface ScheduleContent {
    groups: ScheduleGroup[]
}

// FINAL_RESULT 패널 content 타입
export interface StandingEntry {
    teamId: number
    rank: number
    wins: number | null
    losses: number | null
    points: number | null
    note: string
}

export interface FinalResultContent {
    standings: StandingEntry[]
    mvpPlayerId: number | null
}

// API 요청 타입
export interface CreatePromotionConfigRequest {
    panels?: Array<{
        type: PromotionPanelType
        enabled?: boolean
        hidden?: boolean
        orderIndex?: number
        titleOverride?: string
    }>
}

export interface UpdatePromotionPanelItem {
    id: number
    enabled?: boolean
    hidden?: boolean
    orderIndex?: number
    titleOverride?: string | null
    content?: Record<string, unknown>
}

export interface UpdatePromotionPanelsRequest {
    panels: UpdatePromotionPanelItem[]
}

export interface ReorderPromotionPanelsRequest {
    panelIdsInOrder: number[]
}

// API 응답 타입 (BE raw → FE mapped)
export interface PromotionConfigRaw {
    id: number
    tournament_slug: string
    status: PromotionConfigStatus
    version: number
    published_at: string | null
    panels: Array<{
        id: number
        config_id: number
        type: PromotionPanelType
        enabled: boolean
        hidden: boolean
        order_index: number
        title_override: string | null
        content: Record<string, unknown>
    }>
}

// ── F1_DRIVERS 패널 content 타입 ──────────────────────────
export type F1DriverRole = 'FIRST' | 'SECOND'
export type F1SecondGroup = 'A' | 'B'

export interface F1Driver {
    id: string
    streamerId: number | null
    name: string
    nickname?: string
    avatarUrl: string | null
    channelUrl: string | null
    isPartner: boolean
    driverRole: F1DriverRole
    tier: string | null
    ranking: number | null
    participationCount: number
    winCount: number
    carNumber: number | null
    secondGroup?: F1SecondGroup | null
    qualifyingEliminated?: boolean
    order: number
}

export interface F1DriversContent {
    participants: F1Driver[]
}

// ── F1_RACE_SCHEDULE 패널 content 타입 ────────────────────
export type F1RaceStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'

export interface F1RaceEvent {
    id: string
    title: string
    circuit: string
    scheduledAt: string | null
    status: F1RaceStatus
    order: number
}

export interface F1RaceScheduleContent {
    races: F1RaceEvent[]
}

// ── F1_RACE_RESULT 패널 content 타입 ──────────────────────
export interface F1DriverRaceResult {
    driverId: string
    name: string
    position: number | null
    points: number | null
    dnf: boolean
    fastestLap: boolean
}

export interface F1SingleRaceResult {
    id: string
    raceId: string
    raceTitle: string
    results: F1DriverRaceResult[]
}

export interface F1RaceResultContent {
    races: F1SingleRaceResult[]
}

// ── F1_STANDINGS 패널 content 타입 ────────────────────────
export interface F1StandingEntry {
    driverId: string
    name: string
    avatarUrl: string | null
    rank: number
    totalPoints: number
    wins: number
    podiums: number
    fastestLaps: number
    note: string
}

export interface F1StandingsContent {
    standings: F1StandingEntry[]
}

// ── F1_QUALIFYING 패널 content 타입 ────────────────────────
export interface F1QualifyingDriver {
    driverId: string
    name: string
    avatarUrl: string | null
    isPartner: boolean
    position: number | null
    lapTime: string | null
    qualified: boolean
}

export interface F1QualifyingContent {
    description: string
    firstDriverResults: F1QualifyingDriver[]
    secondDriverResults: F1QualifyingDriver[]
}

// ── F1_CIRCUIT 패널 content 타입 ────────────────────────
export interface F1CircuitContent {
    circuits: F1CircuitItem[]
}

export interface F1CircuitItem {
    id: string
    circuitName: string
    description: string
    country: string | null
    layoutImageUrl: string | null
    length: string | null
    corners: number | null
    lapRecord: string | null
    order: number
}

// ── F1_TEAM_DRAFT 패널 content 타입 ───────────────────────
export interface F1DraftTeamDriver {
    driverId: string
    name: string
    avatarUrl: string | null
    isPartner: boolean
    driverRole: F1DriverRole
}

export interface F1DraftTeamOperator {
    driverId: string
    name: string
    avatarUrl: string | null
    isPartner: boolean
}

export interface F1DraftTeam {
    id: string
    teamName: string
    firstDriver: F1DraftTeamDriver
    secondDriver: F1DraftTeamDriver
    operator: F1DraftTeamOperator | null
    order: number
}

export interface F1TeamDraftContent {
    teams: F1DraftTeam[]
}
