/** 발굴 후보 스트리머 */
export interface DiscoveryCandidate {
    channelId: string
    name: string
    isPartner: boolean
    channelImageUrl: string | null
}

/** 발굴 커서 (페이지네이션) */
export interface DiscoveryCursor {
    concurrentUserCount: number
    liveId: number
}

/** 발굴 실행 요청 */
export interface RunDiscoveryRequest {
    size?: number
    cursor?: DiscoveryCursor
}

/** 발굴 실행 응답 */
export interface RunDiscoveryResponse {
    candidates: DiscoveryCandidate[]
    nextCursor: DiscoveryCursor | null
}

/** 후보 등록 요청 */
export interface RegisterCandidatesRequest {
    candidates: DiscoveryCandidate[]
}

/** 후보 등록 응답 */
export interface RegisterCandidatesResponse {
    registeredCount: number
}

/** 제외 채널 */
export interface StreamerExclusion {
    id: string
    channelId: string
    name: string
    createdAt: string
}

/** 제외 목록 응답 */
export interface ListExclusionsResponse {
    items: StreamerExclusion[]
}

/** 제외 추가 요청 (단건) */
export interface CreateExclusionRequest {
    channelId: string
    name: string
}

/** 제외 추가 요청 (다건) */
export interface CreateExclusionsRequest {
    exclusions: CreateExclusionRequest[]
}
