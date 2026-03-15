export interface CrawledParticipant {
    channelId: string | null
    name: string
    channelImageUrl: string | null
    isPartner: boolean
    isManaged: boolean
    streamerId: number | null
}

export interface CrawledBroadcast {
    sourceEventId: string
    title: string
    tags: string[]
    broadcastType: string
    startTime: string
    endTime: string | null
    allDay: boolean
    timezone: string
    thumbnailUrl: string | null
    isLive: boolean
    isCollab: boolean
    participants: CrawledParticipant[]
}

export interface CrawlBroadcastsRequest {
    month: string
}

export interface CrawlBroadcastsResponse {
    broadcasts: CrawledBroadcast[]
}

export interface InsertBroadcastsRequest {
    broadcasts: CrawledBroadcast[]
}

export interface InsertBroadcastsResponse {
    insertedCount: number
}
