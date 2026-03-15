export interface DiscoveryCursor {
    concurrentUserCount: number
    liveId: number
}

export interface DiscoveryCandidate {
    channelId: string
    name: string
    isPartner: boolean
    channelImageUrl: string | null
}

export interface RunDiscoveryRequest {
    size?: number
    cursor?: DiscoveryCursor
}

export interface RegisterDiscoveryCandidatesRequest {
    candidates: DiscoveryCandidate[]
}

export interface StreamerExclusionItem {
    id: string
    channelId: string
    name: string
    reason: string | null
    createdAt: string
}

export interface CreateStreamerExclusionRequest {
    channelId: string
    name: string
    reason?: string
}

export interface CreateStreamerExclusionsRequest {
    exclusions: CreateStreamerExclusionRequest[]
}
