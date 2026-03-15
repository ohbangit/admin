export interface AdminBanner {
    id: number
    type: string
    title: string
    description: string | null
    imageUrl: string
    linkUrl: string | null
    tournamentSlug: string | null
    startedAt: string | null
    endedAt: string | null
    orderIndex: number
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export interface CreateBannerPayload {
    type: string
    title: string
    imageUrl: string
    description?: string
    linkUrl?: string
    tournamentSlug?: string
    startedAt?: string
    endedAt?: string
    orderIndex?: number
    isActive?: boolean
}

export type UpdateBannerPayload = Partial<CreateBannerPayload>
