import type { StreamerItem } from '../../types'

export interface ParticipantDraft {
    name: string
    streamerId?: number
    isHost: boolean
}

export interface BroadcastFormValues {
    title: string
    startDate: string
    startTime: string
    isUndecidedTime: boolean
    broadcastType: string
    categoryId: string
    tagsInput: string
    isVisible: boolean
    isDrops: boolean
    isChzzkSupport: boolean
    participants: ParticipantDraft[]
}

export interface BroadcastFormModalProps {
    title: string
    submitLabel: string
    initialValues: BroadcastFormValues
    pending: boolean
    categories: { id: number; name: string }[]
    streamers: StreamerItem[]
    onClose: () => void
    onSubmit: (values: BroadcastFormValues) => Promise<void>
}
