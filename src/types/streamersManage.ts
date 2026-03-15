import type { FormEvent, ReactNode } from 'react'
import type { StreamerItem } from './streamer'

export type TabType = 'all' | 'missing'
export type StreamerSortType = 'name_asc' | 'name_desc' | 'follower_desc'
export type EditingField = 'channel' | 'nickname' | 'youtube' | 'fanCafe' | 'affiliations' | null

export interface StreamerAvatarProps {
    src?: string | null
    name: string
    size: number
}

export interface InlineEditFormProps {
    value: string
    onChange: (value: string) => void
    onSave: (event: FormEvent) => void
    onCancel: () => void
    placeholder: string
    type?: string
    isPending: boolean
    saveLabel: string
    error: unknown
}

export interface FieldRowProps {
    label: string
    children: ReactNode
}

export interface StreamerDetailModalProps {
    streamer: StreamerItem
    onClose: () => void
}

export interface RegisterModalProps {
    onClose: () => void
}

export interface StreamerRowProps {
    streamer: StreamerItem
    onClick: () => void
    onDeleted: () => void
}

export interface StreamerTableProps {
    streamers: StreamerItem[]
    emptyMessage?: string
    onSelect: (streamer: StreamerItem) => void
    onDeleted: () => void
}

export interface StreamersFilterControlsProps {
    tab: TabType
    search: string
    sort: StreamerSortType
    onTabChange: (tab: TabType) => void
    onSearchChange: (search: string) => void
    onSortChange: (sort: StreamerSortType) => void
}

export interface StreamersPaginationProps {
    page: number
    totalPages: number
    total: number
    onPrev: () => void
    onNext: () => void
}
