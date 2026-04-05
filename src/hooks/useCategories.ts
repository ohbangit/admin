import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApiDelete, adminApiGet, adminApiPatch, adminApiPost } from '../lib/apiClient'
import type {
    CategoryItem,
    InsertCrawledCategoriesRequest,
    InsertCrawledCategoriesResponse,
    ListCategoriesResponse,
    CreateCategoryRequest,
    UpdateCategoryRequest,
    RunCategoryCrawlRequest,
    RunCategoryCrawlResponse,
} from '../types'

const CATEGORIES_QUERY_KEY = ['admin-categories'] as const

export function useCategories() {
    return useQuery({
        queryKey: CATEGORIES_QUERY_KEY,
        queryFn: async () => {
            const res = await adminApiGet<ListCategoriesResponse>('/api/admin/categories')
            return res.categories
        },
    })
}

export function useCreateCategory() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (body: CreateCategoryRequest) => adminApiPost<{ id: number }>('/api/admin/categories', body),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY })
        },
    })
}

export function useDeleteCategory() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => adminApiDelete(`/api/admin/categories/${id}`),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY })
        },
    })
}

export function useUpdateCategory() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, body }: { id: number; body: UpdateCategoryRequest }) =>
            adminApiPatch(`/api/admin/categories/${id}`, body),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY })
        },
    })
}

export function useRunCategoryCrawl() {
    return useMutation({
        mutationFn: (body: RunCategoryCrawlRequest) =>
            adminApiPost<RunCategoryCrawlResponse>('/api/admin/category-crawl/run', body),
    })
}

export function useInsertCrawledCategories() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (body: InsertCrawledCategoriesRequest) =>
            adminApiPost<InsertCrawledCategoriesResponse>('/api/admin/category-crawl/insert', body),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY })
        },
    })
}

export type { CategoryItem }
