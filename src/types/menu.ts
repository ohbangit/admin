export interface MenuRow {
    id: number
    parent_id: number | null
    label: string
    path: string | null
    icon: string | null
    sort_order: number
    is_visible: boolean
    is_external: boolean
}

export interface CreateMenuRequest {
    parent_id: number | null
    label: string
    path: string | null
    icon: string | null
    sort_order: number
    is_visible: boolean
    is_external: boolean
}

export interface UpdateMenuRequest {
    parent_id?: number | null
    label?: string
    path?: string | null
    icon?: string | null
    sort_order?: number
    is_visible?: boolean
    is_external?: boolean
}

export interface ReorderMenuItem {
    id: number
    parent_id: number | null
    sort_order: number
}

export interface ReorderMenusRequest {
    items: ReorderMenuItem[]
}
