export interface NoticeItem {
    id: number
    title: string
    content: string
    orderIndex: number
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export interface ListNoticesResponse {
    notices: NoticeItem[]
}

export interface CreateNoticeRequest {
    title: string
    content: string
    orderIndex?: number
    isActive?: boolean
}

export interface UpdateNoticeRequest {
    title?: string
    content?: string
    orderIndex?: number
    isActive?: boolean
}
