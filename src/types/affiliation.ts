export interface AffiliationItem {
    id: number
    name: string
    color: string | null
}

export interface ListAffiliationsResponse {
    affiliations: AffiliationItem[]
}

export interface CreateAffiliationRequest {
    name: string
    color?: string | null
}

export interface UpdateAffiliationRequest {
    name: string
    color?: string | null
}
