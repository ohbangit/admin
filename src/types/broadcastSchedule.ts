import type { AffiliationItem } from './affiliation'
import type { Broadcast } from './schedule'

export type BroadcastType = '합방' | '대회' | '콘텐츠' | '내전'

export interface AdminScheduleParticipant {
    id?: string
    name: string
    nickname?: string
    avatarUrl: string | null
    channelUrl: string | null
    streamerId?: number | null
    isHost?: boolean
    isPartner?: boolean
    affiliations?: AffiliationItem[] | null
}

export interface AdminBroadcastItem {
    id: string
    title: string
    broadcastType: string | null
    streamerName: string
    streamerNickname: string
    streamerId: number | null
    streamerProfileUrl: string | null
    streamerChannelUrl: string | null
    streamerIsPartner: boolean
    categoryId: number | null
    categoryName: string | null
    tags: string[]
    participants: AdminScheduleParticipant[]
    startTime: string
    endTime: string | null
    thumbnailUrl: string | null
    isLive: boolean
    isCollab: boolean
    source: string | null
    isChzzkSupport?: boolean
}

export interface AdminScheduleResponse {
    view: string
    startDate: string
    endDate: string
    dates: AdminScheduleDateGroup[]
}

export interface AdminScheduleDateGroup {
    date: string
    broadcasts: AdminBroadcastItem[]
}

export interface CreateBroadcastRequest {
    title: string
    streamerId?: number
    broadcastType?: string
    categoryId?: number
    startTime: string
    endTime?: string
    thumbnailUrl?: string
    participantIds?: number[]
    participants?: AdminBroadcastParticipantInput[]
    tags?: string[]
    source?: string
    externalId?: string
    isVisible?: boolean
    isChzzkSupport?: boolean
}

export interface UpdateBroadcastRequest {
    title?: string
    streamerId?: number
    broadcastType?: string
    categoryId?: number
    startTime?: string
    endTime?: string | null
    thumbnailUrl?: string
    participantIds?: number[]
    participants?: AdminBroadcastParticipantInput[]
    tags?: string[]
    isVisible?: boolean
    isChzzkSupport?: boolean
}

export interface AdminBroadcastParticipantInput {
    name: string
    streamerId?: number
    isHost?: boolean
}

export interface BroadcastMutationResponse {
    id: string
}

export type ViewMode = 'weekly' | 'monthly'

export type BroadcastDraftParticipant = {
    name: string
    streamerId?: number
    isHost?: boolean
    avatarUrl?: string
    isPartner?: boolean
    affiliations?: AffiliationItem[]
}

export interface BroadcastFormState {
    title: string
    broadcastType: string
    categoryId: number | null
    startDate: string
    startHour: string
    startMinute: string
    endDate: string
    endHour: string
    endMinute: string
    tags: string
    isVisible: boolean
    isChzzkSupport: boolean
    participants: BroadcastDraftParticipant[]
}

export interface BroadcastDateGroup {
    date: string
    broadcasts: Broadcast[]
}
