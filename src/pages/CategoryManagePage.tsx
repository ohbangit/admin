import { useMemo, useState } from 'react'
import { Check, Download, FolderOpen, Plus, Search, Trash2, X } from 'lucide-react'
import {
    useAdminToast,
    useCategories,
    useCreateCategory,
    useDeleteCategory,
    useInsertCrawledCategories,
    useRunCategoryCrawl,
} from '../hooks'
import type { CategoryItem, CrawledCategory } from '../types'
import { cn } from '../lib/cn'
import { getErrorMessage } from '../utils/error'
import { panelClass, inputClass } from '../constants/styles'
import { ConfirmModal } from '../components/ConfirmModal'
import { ListLoading, ListError, ListEmpty } from '../components/ListState'

interface CreateCategoryModalProps {
    pending: boolean
    onClose: () => void
    onSubmit: (values: { name: string; thumbnailUrl: string }) => Promise<void>
}

function CreateCategoryModal({ pending, onClose, onSubmit }: CreateCategoryModalProps) {
    const [name, setName] = useState('')
    const [thumbnailUrl, setThumbnailUrl] = useState('')
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(): Promise<void> {
        if (name.trim().length === 0) {
            setError('카테고리명은 필수입니다.')
            return
        }
        setError(null)
        await onSubmit({ name, thumbnailUrl })
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget && !pending) onClose()
            }}
        >
            <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#3a3a44] bg-[#1a1a23] shadow-xl">
                <div className="border-b border-[#3a3a44] px-6 py-4">
                    <h2 className="text-base font-bold text-[#efeff1]">카테고리 추가</h2>
                    <p className="mt-1 text-xs text-[#adadb8]">직접 카테고리를 등록합니다.</p>
                </div>

                <div className="space-y-3 px-6 py-4">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-[#adadb8]">
                            카테고리명 <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={inputClass}
                            placeholder="예: 리그 오브 레전드"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-[#adadb8]">썸네일 URL</label>
                        <input
                            type="text"
                            value={thumbnailUrl}
                            onChange={(e) => setThumbnailUrl(e.target.value)}
                            className={inputClass}
                            placeholder="https://..."
                        />
                    </div>

                    {error !== null && <p className="text-xs text-red-400">{error}</p>}
                </div>

                <div className="flex gap-2 border-t border-[#3a3a44] px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={pending}
                        className="cursor-pointer flex-1 rounded-xl border border-[#3a3a44] py-2.5 text-sm font-medium text-[#adadb8] transition hover:bg-[#26262e] disabled:opacity-50"
                    >
                        취소
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            void handleSubmit()
                        }}
                        disabled={pending}
                        className="cursor-pointer flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                    >
                        {pending ? '추가 중...' : '추가'}
                    </button>
                </div>
            </div>
        </div>
    )
}

interface CrawlModalProps {
    existingNames: Set<string>
    runPending: boolean
    insertPending: boolean
    onClose: () => void
    onRun: (size: number) => Promise<CrawledCategory[]>
    onInsert: (categories: CrawledCategory[]) => Promise<void>
}

function CrawlModal({ existingNames, runPending, insertPending, onClose, onRun, onInsert }: CrawlModalProps) {
    const [size, setSize] = useState('30')
    const [crawled, setCrawled] = useState<CrawledCategory[]>([])
    const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set())

    const selectableNames = useMemo(() => {
        return crawled
            .filter((item) => !existingNames.has(item.name.trim().toLowerCase()))
            .map((item) => item.name)
    }, [crawled, existingNames])

    const selectedCount = selectedNames.size
    const allSelected = selectableNames.length > 0 && selectedCount === selectableNames.length

    async function handleRun(): Promise<void> {
        const parsed = Number(size)
        const normalized = Number.isFinite(parsed) ? Math.max(1, Math.min(100, Math.floor(parsed))) : 30
        const result = await onRun(normalized)
        setCrawled(result)
        setSelectedNames(new Set(result.filter((item) => !existingNames.has(item.name.trim().toLowerCase())).map((item) => item.name)))
    }

    async function handleInsert(): Promise<void> {
        const selected = crawled.filter((item) => selectedNames.has(item.name))
        if (selected.length === 0) return
        await onInsert(selected)
    }

    function toggleName(name: string): void {
        setSelectedNames((prev) => {
            const next = new Set(prev)
            if (next.has(name)) next.delete(name)
            else next.add(name)
            return next
        })
    }

    function handleToggleAll(): void {
        if (allSelected) {
            setSelectedNames(new Set())
            return
        }
        setSelectedNames(new Set(selectableNames))
    }

    const isStepTwo = crawled.length > 0

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget && !runPending && !insertPending) onClose()
            }}
        >
            <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-[#3a3a44] bg-[#1a1a23] shadow-xl">
                <div className="border-b border-[#3a3a44] px-6 py-4">
                    <h2 className="text-base font-bold text-[#efeff1]">치지직 카테고리 크롤링</h2>
                    <p className="mt-1 text-xs text-[#adadb8]">
                        {isStepTwo ? '2단계: 크롤링 결과를 확인하고 등록할 항목을 선택하세요.' : '1단계: 크롤링 개수를 설정하고 실행하세요.'}
                    </p>
                </div>

                {!isStepTwo && (
                    <div className="space-y-4 px-6 py-5">
                        <div className="max-w-sm space-y-1">
                            <label className="text-xs font-medium text-[#adadb8]">크롤링 개수</label>
                            <input
                                type="number"
                                min={1}
                                max={100}
                                value={size}
                                onChange={(e) => setSize(e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                void handleRun()
                            }}
                            disabled={runPending}
                            className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                        >
                            {runPending && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                            크롤링 실행
                        </button>
                    </div>
                )}

                {isStepTwo && (
                    <div className="px-6 py-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={handleToggleAll}
                                className="cursor-pointer rounded-lg border border-[#3a3a44] px-3 py-1.5 text-xs font-medium text-[#adadb8] transition hover:bg-[#26262e]"
                            >
                                {allSelected ? '전체 해제' : '전체 선택'}
                            </button>
                            <p className="text-xs text-[#adadb8]">총 {crawled.length}개 중 {selectedCount}개 선택됨</p>
                        </div>

                        <div className="max-h-[420px] overflow-auto rounded-xl border border-[#3a3a44]">
                            <div className="grid grid-cols-[96px_88px_minmax(180px,1.7fr)_110px_140px] items-center gap-3 border-b border-[#3a3a44] bg-[#20202a] px-4 py-3 text-center text-xs font-semibold text-[#848494]">
                                <div>선택</div>
                                <div>썸네일</div>
                                <div>카테고리명</div>
                                <div>라이브 수</div>
                                <div>동시 시청자</div>
                            </div>

                            <ul className="divide-y divide-[#3a3a44]">
                                {crawled.map((item) => {
                                    const normalizedName = item.name.trim().toLowerCase()
                                    const alreadyExists = existingNames.has(normalizedName)
                                    const checked = selectedNames.has(item.name)
                                    return (
                                        <li
                                            key={`${item.categoryType}-${item.categoryId}-${item.name}`}
                                            className={cn(
                                                'grid grid-cols-[96px_88px_minmax(180px,1.7fr)_110px_140px] items-center gap-3 px-4 py-3',
                                                alreadyExists && 'bg-emerald-500/5',
                                            )}
                                        >
                                            <div className="flex items-center justify-center">
                                                <label
                                                    className={cn(
                                                        'inline-flex items-center gap-1.5 text-xs',
                                                        alreadyExists ? 'cursor-not-allowed text-emerald-300' : 'cursor-pointer text-[#adadb8]',
                                                    )}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={alreadyExists ? false : checked}
                                                        disabled={alreadyExists}
                                                        onChange={() => toggleName(item.name)}
                                                        className="h-4 w-4 cursor-pointer rounded disabled:cursor-not-allowed"
                                                    />
                                                    {alreadyExists && <span>등록됨</span>}
                                                </label>
                                            </div>

                                            <div className="flex justify-center">
                                                {item.thumbnailUrl !== null ? (
                                                    <img src={item.thumbnailUrl} alt={item.name} className="h-10 w-10 rounded-lg object-cover" />
                                                ) : (
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#3a3a44] bg-[#26262e] text-[#848494]">
                                                        <FolderOpen className="h-4 w-4" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="min-w-0 truncate text-sm text-[#efeff1]">{item.name}</div>
                                            <div className="text-center text-xs text-[#adadb8]">{item.openLiveCount}</div>
                                            <div className="text-center text-xs text-[#adadb8]">{item.concurrentUserCount.toLocaleString('ko-KR')}</div>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    </div>
                )}

                <div className="flex gap-2 border-t border-[#3a3a44] px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={runPending || insertPending}
                        className="cursor-pointer flex-1 rounded-xl border border-[#3a3a44] py-2.5 text-sm font-medium text-[#adadb8] transition hover:bg-[#26262e] disabled:opacity-50"
                    >
                        취소
                    </button>
                    {isStepTwo && (
                        <button
                            type="button"
                            onClick={() => {
                                void handleInsert()
                            }}
                            disabled={insertPending || selectedCount === 0}
                            className="cursor-pointer flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                        >
                            {insertPending ? '등록 중...' : `${selectedCount}개 등록`}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function CategoryManagePage() {
    const { addToast } = useAdminToast()
    const { data: categories = [], isLoading, isError, refetch } = useCategories()
    const createMutation = useCreateCategory()
    const deleteMutation = useDeleteCategory()
    const runCrawlMutation = useRunCategoryCrawl()
    const insertCrawledMutation = useInsertCrawledCategories()

    const [search, setSearch] = useState('')
    const [creating, setCreating] = useState(false)
    const [deletingCategory, setDeletingCategory] = useState<CategoryItem | null>(null)
    const [crawling, setCrawling] = useState(false)

    const normalizedSearch = search.trim().toLowerCase()
    const filteredCategories = useMemo(() => {
        if (normalizedSearch.length === 0) return categories
        return categories.filter((item) => item.name.toLowerCase().includes(normalizedSearch))
    }, [categories, normalizedSearch])

    const existingNames = useMemo(() => {
        return new Set(categories.map((item) => item.name.trim().toLowerCase()))
    }, [categories])

    async function handleCreate(values: { name: string; thumbnailUrl: string }): Promise<void> {
        try {
            await createMutation.mutateAsync({
                name: values.name.trim(),
                thumbnailUrl: values.thumbnailUrl.trim().length > 0 ? values.thumbnailUrl.trim() : null,
            })
            addToast({ message: '카테고리가 추가되었습니다.', variant: 'success' })
            setCreating(false)
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    async function handleDelete(): Promise<void> {
        if (deletingCategory === null) return
        try {
            await deleteMutation.mutateAsync(deletingCategory.id)
            addToast({ message: '카테고리가 삭제되었습니다.', variant: 'success' })
            setDeletingCategory(null)
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    async function handleRunCrawl(size: number): Promise<CrawledCategory[]> {
        try {
            const response = await runCrawlMutation.mutateAsync({ size })
            addToast({ message: `${response.categories.length}개 카테고리를 가져왔습니다.`, variant: 'success' })
            return response.categories
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
            return []
        }
    }

    async function handleInsertCrawled(crawledCategories: CrawledCategory[]): Promise<void> {
        try {
            const response = await insertCrawledMutation.mutateAsync({ categories: crawledCategories })
            addToast({ message: `${response.insertedCount}개 카테고리를 등록했습니다.`, variant: 'success' })
            setCrawling(false)
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    return (
        <>
            <div className="mb-6 flex items-start justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-[#efeff1]">카테고리 관리</h1>
                    <p className="mt-1 text-sm text-[#adadb8]">방송 카테고리를 관리합니다</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setCreating(true)}
                        className="cursor-pointer flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
                    >
                        <Plus className="h-4 w-4" />
                        카테고리 추가
                    </button>
                    <button
                        type="button"
                        onClick={() => setCrawling(true)}
                        className="cursor-pointer flex items-center gap-1.5 rounded-xl border border-[#3a3a44] bg-[#26262e] px-4 py-2 text-sm font-semibold text-[#efeff1] transition hover:bg-[#2d2d36]"
                    >
                        <Download className="h-4 w-4" />
                        치지직 크롤링
                    </button>
                </div>
            </div>

            <div className={panelClass}>
                <div className="border-b border-[#3a3a44] p-4">
                    <div className="relative max-w-sm">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#848494]" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-xl border border-[#3a3a44] bg-[#26262e] py-2 pl-9 pr-3 text-sm text-[#efeff1] outline-none placeholder:text-[#848494] focus:border-blue-500"
                            placeholder="카테고리명 검색"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-[88px_minmax(0,1fr)_96px] items-center gap-3 border-b border-[#3a3a44] px-4 py-3 text-center text-xs font-semibold text-[#848494]">
                    <div>썸네일</div>
                    <div>카테고리명</div>
                    <div>작업</div>
                </div>

                {isLoading && <ListLoading />}

                {isError && <ListError message="카테고리를 불러오는 중 오류가 발생했습니다." onRetry={() => { void refetch() }} />}

                {!isLoading && !isError && filteredCategories.length === 0 && <ListEmpty message="표시할 카테고리가 없습니다." />}

                {!isLoading && !isError && filteredCategories.length > 0 && (
                    <ul className="divide-y divide-[#3a3a44]">
                        {filteredCategories.map((category) => (
                            <li key={category.id} className="grid grid-cols-[88px_minmax(0,1fr)_96px] items-center gap-3 px-4 py-3">
                                <div className="flex justify-center">
                                    {category.thumbnailUrl !== null ? (
                                        <img
                                            src={category.thumbnailUrl}
                                            alt={category.name}
                                            className="h-10 w-10 rounded-lg object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#3a3a44] bg-[#26262e] text-[#848494]">
                                            <FolderOpen className="h-4 w-4" />
                                        </div>
                                    )}
                                </div>

                                <p className="truncate text-sm text-[#efeff1]">{category.name}</p>

                                <div className="flex justify-center">
                                    <button
                                        type="button"
                                        onClick={() => setDeletingCategory(category)}
                                        className="cursor-pointer inline-flex items-center justify-center rounded-lg border border-red-500/35 p-2 text-red-300 transition hover:bg-red-500/10"
                                        aria-label={`${category.name} 삭제`}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {creating && (
                <CreateCategoryModal
                    pending={createMutation.isPending}
                    onClose={() => setCreating(false)}
                    onSubmit={handleCreate}
                />
            )}

            {deletingCategory !== null && (
                <ConfirmModal
                    title="카테고리 삭제"
                    message="카테고리를 삭제하시겠습니까?"
                    itemName={deletingCategory.name}
                    pending={deleteMutation.isPending}
                    onClose={() => setDeletingCategory(null)}
                    onConfirm={() => {
                        void handleDelete()
                    }}
                />
            )}

            {crawling && (
                <CrawlModal
                    existingNames={existingNames}
                    runPending={runCrawlMutation.isPending}
                    insertPending={insertCrawledMutation.isPending}
                    onClose={() => setCrawling(false)}
                    onRun={handleRunCrawl}
                    onInsert={handleInsertCrawled}
                />
            )}

            {(runCrawlMutation.isPending || insertCrawledMutation.isPending) && (
                <div className="fixed bottom-4 right-4 z-40 rounded-lg border border-[#3a3a44] bg-[#1a1a23] px-3 py-2 text-xs text-[#adadb8] shadow-lg">
                    <div className="flex items-center gap-2">
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                        {runCrawlMutation.isPending ? '크롤링 진행 중' : '카테고리 등록 중'}
                    </div>
                </div>
            )}

            {filteredCategories.length > 0 && (
                <div className="mt-3 flex items-center justify-end text-xs text-[#848494]">
                    <span>
                        {search.trim().length > 0 ? (
                            <>
                                <Check className="mr-1 inline h-3.5 w-3.5" />
                                검색 결과 {filteredCategories.length}개
                            </>
                        ) : (
                            <>
                                <X className="mr-1 inline h-3.5 w-3.5" />
                                전체 {categories.length}개
                            </>
                        )}
                    </span>
                </div>
            )}
        </>
    )
}
