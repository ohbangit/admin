export interface AffiliationItem {
    id: number
    name: string
    color: string | null
    type: 'mcn' | 'agency' | 'crew' | 'esports'
    thumbnailUrl: string | null
}

export interface ListAffiliationsResponse {
    affiliations: AffiliationItem[]
}

export interface CreateAffiliationRequest {
    name: string
    color?: string | null
    type: 'mcn' | 'agency' | 'crew' | 'esports'
    thumbnailUrl?: string | null
}

export interface UpdateAffiliationRequest {
    name: string
    color?: string | null
    type: 'mcn' | 'agency' | 'crew' | 'esports'
    thumbnailUrl?: string | null
}
