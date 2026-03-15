export interface StreamerAffiliation {
    id: number
    name: string
}

export interface StreamerItem {
    id: number
    name: string
    nickname: string | null
    channelId: string | null
    isPartner: boolean
    channelImageUrl?: string
    followerCount: number | null
    youtubeUrl?: string
    fanCafeUrl?: string
    affiliations: StreamerAffiliation[]
}

export interface StreamerListResponse {
    items: StreamerItem[]
    total: number
    page?: number
    size?: number
}

export type StreamerSortType = 'name_asc' | 'name_desc' | 'follower_desc'

export interface StreamerListParams {
    name?: string
    hasChannel?: boolean
    page?: number
    size?: number
    sort?: StreamerSortType
}

export interface RegisterStreamerRequest {
    channelId: string
}

export interface RegisterStreamerResponse {
    id: number
    channelId: string
    name: string
    isPartner: boolean
}

export interface UpdateNicknameRequest {
    nickname: string
}

export interface UpdateNicknameResponse {
    id: number
    nickname: string
}

export interface UpdateYoutubeUrlRequest {
    youtubeUrl: string
}

export interface UpdateFanCafeUrlRequest {
    fanCafeUrl: string
}

export interface UpdateStreamerAffiliationsRequest {
    affiliationIds: number[]
}

export interface UpdateStreamerAffiliationsResponse {
    affiliations: StreamerAffiliation[]
}
