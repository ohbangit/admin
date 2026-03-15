export type BannerType = 'tournament' | 'collab' | 'content' | '내전' | '출시' | '인기'

export interface InternalImageOption {
    label: string
    url: string
}

export interface ManualFormState {
    type: BannerType
    title: string
    description: string
    imageUrl: string
    linkUrl: string
    tournamentSlug: string
    startedAt: string
    endedAt: string
    orderIndex: string
    isActive: boolean
}

export type CreateStep = 'pick' | 'config' | 'manual'
