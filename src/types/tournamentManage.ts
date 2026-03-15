import type {
    CommentatorItem,
    DraftContent,
    F1DriversContent,
    F1QualifyingContent,
    F1RaceResultContent,
    F1RaceScheduleContent,
    F1StandingsContent,
    F1TeamDraftContent,
    FinalResultContent,
    ScheduleContent,
    PromotionPanelType,
} from './index'

export type TournamentManageMode = 'overwatch' | 'racing'

export interface TournamentManagePageProps {
    mode?: TournamentManageMode
}

export interface TournamentMetaLink {
    label: string
    url: string
}

export interface TournamentMetaFormState {
    name: string
    startedAt: string
    endedAt: string
    bannerUrl: string
    tags: string[]
    isChzzkSupport: boolean
    hostName: string
    hostAvatarUrl: string
    hostChannelUrl: string
    hostIsPartner: boolean
    hostStreamerId: number | null
    links: TournamentMetaLink[]
    description: string
    showDescription: boolean
    broadcasterName: string
    broadcasterAvatarUrl: string
    broadcasterChannelUrl: string
    broadcasterIsPartner: boolean
    broadcasterStreamerId: number | null
    commentators: CommentatorItem[]
}

export type TournamentPanelContent =
    | DraftContent
    | ScheduleContent
    | FinalResultContent
    | F1DriversContent
    | F1RaceScheduleContent
    | F1RaceResultContent
    | F1StandingsContent
    | F1QualifyingContent
    | F1TeamDraftContent

export interface TournamentPromotionPanel {
    id: number
    type: PromotionPanelType
    enabled: boolean
    hidden: boolean
    content: Record<string, unknown>
}
