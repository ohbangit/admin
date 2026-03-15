export interface AffiliationItem {
    id: number
    name: string
    color?: string | null
}

export const AFFILIATION_COLOR_PALETTE = [
    '#7c3aed',
    '#2563eb',
    '#059669',
    '#d97706',
    '#dc2626',
    '#0891b2',
    '#c026d3',
    '#65a30d',
    '#e11d48',
    '#0d9488',
    '#9333ea',
    '#f59e0b',
] as const

export type AffiliationColor = (typeof AFFILIATION_COLOR_PALETTE)[number]

export function getAffiliationColor(item: AffiliationItem | number): string {
    if (typeof item === 'number') {
        return AFFILIATION_COLOR_PALETTE[item % AFFILIATION_COLOR_PALETTE.length]
    }
    if (item.color != null && item.color.trim().length > 0) {
        return item.color
    }
    return AFFILIATION_COLOR_PALETTE[item.id % AFFILIATION_COLOR_PALETTE.length]
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

export interface UpdateStreamerAffiliationsRequest {
    affiliationIds: number[]
}

export interface UpdateStreamerAffiliationsResponse {
    affiliations: AffiliationItem[]
}
