export interface CategoryItem {
    id: number
    name: string
    thumbnailUrl: string | null
}

export interface ListCategoriesResponse {
    categories: CategoryItem[]
}

export interface CreateCategoryRequest {
    name: string
    thumbnailUrl?: string
}

export interface UpdateCategoryRequest {
    name: string
    thumbnailUrl?: string | null
}

export interface CrawledCategoryItem {
    categoryId: string
    categoryType: string
    name: string
    thumbnailUrl: string | null
    openLiveCount: number
    concurrentUserCount: number
}

export interface CrawlCategoriesRequest {
    size?: number
}

export interface CrawlCategoriesResponse {
    categories: CrawledCategoryItem[]
}

export interface InsertCategoriesRequest {
    categories: CrawledCategoryItem[]
}

export interface InsertCategoriesResponse {
    insertedCount: number
}
