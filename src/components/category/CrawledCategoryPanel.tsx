import type { CrawledCategoryItem } from '../../types'
import { CategoryThumbnail } from './CategoryThumbnail'

interface CrawledCategoryPanelProps {
    crawledCategories: CrawledCategoryItem[]
    selectedCrawledIds: string[]
    allCrawledChecked: boolean
    onCrawl: () => void
    onInsert: () => void
    onToggleSelected: (categoryId: string) => void
    onSelectAll: (checked: boolean) => void
    onClearSelection: () => void
    isCrawling: boolean
    isInserting: boolean
}

export function CrawledCategoryPanel({
    crawledCategories,
    selectedCrawledIds,
    allCrawledChecked,
    onCrawl,
    onInsert,
    onToggleSelected,
    onSelectAll,
    onClearSelection,
    isCrawling,
    isInserting,
}: CrawledCategoryPanelProps) {
    return (
        <div className="rounded-xl border border-gray-200 p-4 dark:border-[#3a3a44]">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-[#848494]">카테고리 크롤링</p>
                    <p className="mt-1 text-xs text-gray-400 dark:text-[#848494]">CHZZK 라이브 카테고리 API 기준 상위 50개를 조회합니다.</p>
                </div>
                <button
                    type="button"
                    onClick={onCrawl}
                    disabled={isCrawling}
                    className="cursor-pointer rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
                >
                    {isCrawling ? '크롤링 중...' : '크롤링 실행'}
                </button>
            </div>

            {crawledCategories.length > 0 && (
                <>
                    <div className="mt-3 flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onInsert}
                            disabled={selectedCrawledIds.length === 0 || isInserting}
                            className="cursor-pointer rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-40"
                        >
                            {isInserting ? '반영 중...' : `선택 반영 (${selectedCrawledIds.length})`}
                        </button>
                        {selectedCrawledIds.length > 0 && (
                            <button
                                type="button"
                                onClick={onClearSelection}
                                className="cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50 dark:border-[#3a3a44] dark:text-[#adadb8] dark:hover:bg-[#26262e]"
                            >
                                선택 해제
                            </button>
                        )}
                    </div>

                    <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 dark:border-[#3a3a44]">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50 dark:border-[#3a3a44] dark:bg-[#26262e]">
                                    <th className="w-10 px-3 py-2">
                                        <input
                                            type="checkbox"
                                            checked={allCrawledChecked}
                                            onChange={(e) => onSelectAll(e.target.checked)}
                                            className="cursor-pointer"
                                        />
                                    </th>
                                    <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-500 dark:text-[#848494]">카테고리</th>
                                    <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-500 dark:text-[#848494]">라이브/시청자</th>
                                </tr>
                            </thead>
                            <tbody>
                                {crawledCategories.map((category) => (
                                    <tr key={category.categoryId} className="border-b border-gray-200 last:border-0 dark:border-[#3a3a44]">
                                        <td className="px-3 py-2.5">
                                            <input
                                                type="checkbox"
                                                checked={selectedCrawledIds.includes(category.categoryId)}
                                                onChange={() => onToggleSelected(category.categoryId)}
                                                className="cursor-pointer"
                                            />
                                        </td>
                                        <td className="px-3 py-2.5">
                                            <div className="flex items-center gap-2">
                                                <CategoryThumbnail src={category.thumbnailUrl} name={category.name} />
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium text-gray-800 dark:text-[#efeff1]">{category.name}</p>
                                                    <p className="truncate text-[11px] text-gray-400 dark:text-[#848494]">{category.categoryType}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2.5 text-xs text-gray-500 dark:text-[#adadb8]">
                                            {category.openLiveCount} / {category.concurrentUserCount.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    )
}
