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
    thumbnailUrl?: string | null
}

export interface CrawledCategory {
    categoryId: string
    categoryType: string
    name: string
    thumbnailUrl: string | null
    openLiveCount: number
    concurrentUserCount: number
}

export interface RunCategoryCrawlRequest {
    size?: number
}

export interface RunCategoryCrawlResponse {
    categories: CrawledCategory[]
}

export interface InsertCrawledCategoriesRequest {
    categories: CrawledCategory[]
}

export interface InsertCrawledCategoriesResponse {
    insertedCount: number
}
