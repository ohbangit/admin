import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    adminApiGet,
    adminApiPost,
    adminApiPatch,
    adminApiDelete,
} from '../lib/apiClient'
import type {
    CategoryItem,
    ListCategoriesResponse,
    CreateCategoryRequest,
    UpdateCategoryRequest,
    CrawlCategoriesRequest,
    CrawlCategoriesResponse,
    InsertCategoriesRequest,
    InsertCategoriesResponse,
} from '../types'

const CATEGORIES_KEY = ['admin', 'categories'] as const

export function useCategories() {
    return useQuery({
        queryKey: CATEGORIES_KEY,
        queryFn: () =>
            adminApiGet<ListCategoriesResponse>('/api/admin/categories'),
    })
}

export function useCreateCategory() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (body: CreateCategoryRequest) =>
            adminApiPost<CategoryItem>('/api/admin/categories', body),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY })
        },
    })
}

export function useDeleteCategory() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) =>
            adminApiDelete(`/api/admin/categories/${id}`),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY })
        },
    })
}

export function useUpdateCategory() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({
            id,
            body,
        }: {
            id: number
            body: UpdateCategoryRequest
        }) => adminApiPatch<CategoryItem>(`/api/admin/categories/${id}`, body),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY })
        },
    })
}

export function useCrawlCategories() {
    return useMutation<CrawlCategoriesResponse, Error, CrawlCategoriesRequest>({
        mutationFn: (body) =>
            adminApiPost<CrawlCategoriesResponse>(
                '/api/admin/category-crawl/run',
                body,
            ),
    })
}

export function useInsertCategories() {
    const queryClient = useQueryClient()

    return useMutation<
        InsertCategoriesResponse,
        Error,
        InsertCategoriesRequest
    >({
        mutationFn: (body) =>
            adminApiPost<InsertCategoriesResponse>(
                '/api/admin/category-crawl/insert',
                body,
            ),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY })
        },
    })
}
