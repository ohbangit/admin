import { useState } from 'react'
import { useAdminToast, useCategories, useCrawlCategories, useDeleteCategory, useInsertCategories, useUpdateCategory } from '../hooks'
import type { CategoryItem, CrawledCategoryItem, UpdateCategoryRequest } from '../types'
import { getErrorMessage } from '../utils/error'
import { AddCategoryForm, EditCategoryModal } from '../components/category/CategoryForm'
import { CategoryThumbnail } from '../components/category/CategoryThumbnail'
import { DeleteConfirmModal } from '../components/category/DeleteConfirmModal'
import { CrawledCategoryPanel } from '../components/category/CrawledCategoryPanel'

export default function CategoryManagePage() {
    const { data, isLoading, isError } = useCategories()
    const crawlMutation = useCrawlCategories()
    const insertMutation = useInsertCategories()
    const deleteMutation = useDeleteCategory()
    const updateMutation = useUpdateCategory()
    const { addToast } = useAdminToast()
    const [deletingCategory, setDeletingCategory] = useState<CategoryItem | null>(null)
    const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [crawledCategories, setCrawledCategories] = useState<CrawledCategoryItem[]>([])
    const [selectedCrawledIds, setSelectedCrawledIds] = useState<string[]>([])
    const categories = data?.categories ?? []
    const filteredCategories =
        searchQuery.trim().length > 0 ? categories.filter((c) => c.name.toLowerCase().includes(searchQuery.trim().toLowerCase())) : categories
    const allCrawledChecked = crawledCategories.length > 0 && selectedCrawledIds.length === crawledCategories.length

    async function handleDelete(): Promise<void> {
        if (deletingCategory === null) return
        try {
            await deleteMutation.mutateAsync(deletingCategory.id)
            addToast({ message: `'${deletingCategory.name}' 카테고리가 삭제되었습니다.`, variant: 'success' })
            setDeletingCategory(null)
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    async function handleUpdate(payload: UpdateCategoryRequest): Promise<void> {
        if (editingCategory === null) return
        try {
            await updateMutation.mutateAsync({ id: editingCategory.id, body: payload })
            addToast({ message: `'${payload.name}' 카테고리가 수정되었습니다.`, variant: 'success' })
            setEditingCategory(null)
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    async function handleCrawlCategories(): Promise<void> {
        try {
            const result = await crawlMutation.mutateAsync({ size: 50 })
            setCrawledCategories(result.categories)
            setSelectedCrawledIds([])
            addToast({ message: `카테고리 ${result.categories.length}건을 가져왔습니다.`, variant: 'success' })
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    async function handleInsertCategories(): Promise<void> {
        if (selectedCrawledIds.length === 0) return
        try {
            const selected = crawledCategories.filter((category) => selectedCrawledIds.includes(category.categoryId))
            const result = await insertMutation.mutateAsync({ categories: selected })
            const failedCount = Math.max(selected.length - result.insertedCount, 0)
            const insertedSet = new Set(selectedCrawledIds)
            setCrawledCategories((prev) => prev.filter((category) => !insertedSet.has(category.categoryId)))
            setSelectedCrawledIds([])
            addToast({
                message: failedCount === 0 ? `카테고리 ${result.insertedCount}건을 반영했습니다.` : `반영 ${result.insertedCount}건, 실패 ${failedCount}건`,
                variant: failedCount === 0 ? 'success' : 'error',
            })
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    function toggleCrawledSelected(categoryId: string): void {
        setSelectedCrawledIds((prev) => (prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]))
    }

    return (
        <>
            <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-900 dark:text-[#efeff1]">카테고리 관리</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-[#adadb8]">방송에 연결할 게임 및 콘텐츠 카테고리를 관리합니다.</p>
            </div>
            <div className="space-y-4">
                <CrawledCategoryPanel
                    crawledCategories={crawledCategories}
                    selectedCrawledIds={selectedCrawledIds}
                    allCrawledChecked={allCrawledChecked}
                    onCrawl={() => {
                        void handleCrawlCategories()
                    }}
                    onInsert={() => {
                        void handleInsertCategories()
                    }}
                    onToggleSelected={toggleCrawledSelected}
                    onSelectAll={(checked) => setSelectedCrawledIds(checked ? crawledCategories.map((c) => c.categoryId) : [])}
                    onClearSelection={() => setSelectedCrawledIds([])}
                    isCrawling={crawlMutation.isPending}
                    isInserting={insertMutation.isPending}
                />
                <AddCategoryForm onSuccess={() => setSearchQuery('')} />
                <div className="rounded-xl border border-gray-200 dark:border-[#3a3a44]">
                    <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-[#3a3a44]">
                        <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold text-gray-500 dark:text-[#848494]">카테고리 목록</p>
                            {!isLoading && (
                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500 dark:bg-[#26262e] dark:text-[#848494]">
                                    {categories.length}개
                                </span>
                            )}
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="검색"
                            className="rounded-lg border border-gray-300 px-2.5 py-1 text-xs dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1] dark:placeholder-[#848494]"
                        />
                    </div>
                    {isLoading && <div className="flex items-center justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" /></div>}
                    {isError && <div className="py-12 text-center text-sm text-red-500">카테고리를 불러오는 중 오류가 발생했습니다.</div>}
                    {!isLoading && !isError && filteredCategories.length === 0 && (
                        <div className="py-12 text-center text-sm text-gray-400 dark:text-[#848494]">{searchQuery.trim().length > 0 ? '검색 결과가 없습니다.' : '등록된 카테고리가 없습니다.'}</div>
                    )}
                    {!isLoading && !isError && filteredCategories.length > 0 && (
                        <ul className="divide-y divide-gray-100 dark:divide-[#3a3a44]">
                            {filteredCategories.map((category) => (
                                <li key={category.id} className="flex items-center gap-3 px-4 py-3">
                                    <CategoryThumbnail src={category.thumbnailUrl} name={category.name} />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-gray-800 dark:text-[#efeff1]">{category.name}</p>
                                        {category.thumbnailUrl !== null && category.thumbnailUrl.length > 0 && (
                                            <p className="mt-0.5 truncate text-[11px] text-gray-400 dark:text-[#848494]">{category.thumbnailUrl}</p>
                                        )}
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setEditingCategory(category)}
                                            className="cursor-pointer rounded-lg border border-blue-100 px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-50 dark:border-blue-900/30 dark:hover:bg-blue-900/10"
                                        >
                                            수정
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDeletingCategory(category)}
                                            className="cursor-pointer rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/10"
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            {deletingCategory !== null && (
                <DeleteConfirmModal
                    category={deletingCategory}
                    onConfirm={() => {
                        void handleDelete()
                    }}
                    onCancel={() => setDeletingCategory(null)}
                    isPending={deleteMutation.isPending}
                />
            )}
            {editingCategory !== null && (
                <EditCategoryModal
                    category={editingCategory}
                    onConfirm={(payload) => {
                        void handleUpdate(payload)
                    }}
                    onCancel={() => setEditingCategory(null)}
                    isPending={updateMutation.isPending}
                />
            )}
        </>
    )
}
