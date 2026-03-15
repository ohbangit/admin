import { cn } from '../lib/cn'
import { RegisterModal, StreamerDetailModal, StreamerTable } from '../components/streamer'
import { useStreamersManage } from '../hooks'
import type { StreamersFilterControlsProps, StreamersPaginationProps } from '../types/streamersManage'

const TAB_OPTIONS = [
    { value: 'all', label: '전체' },
    { value: 'missing', label: '채널 미등록' },
] as const

const SORT_OPTIONS = [
    { value: 'name_asc', label: '닉네임순' },
    { value: 'name_desc', label: '닉네임 역순' },
    { value: 'follower_desc', label: '팔로워순' },
] as const

function StreamersFilterControls({
    tab,
    search,
    sort,
    onTabChange,
    onSearchChange,
    onSortChange,
}: StreamersFilterControlsProps) {
    return (
        <div className="mb-4 flex items-center gap-3">
            <div className="flex rounded-xl border border-gray-300 bg-white p-1 dark:border-[#3a3a44] dark:bg-[#1a1a23]">
                {TAB_OPTIONS.map((tabOption) => (
                    <button
                        key={tabOption.value}
                        onClick={() => onTabChange(tabOption.value)}
                        className={cn(
                            'rounded-lg px-3 py-1.5 text-sm font-medium transition',
                            tab === tabOption.value
                                ? 'bg-blue-500 text-white dark:bg-blue-600'
                                : 'text-gray-600 hover:text-gray-900 dark:text-[#adadb8] dark:hover:text-[#efeff1]',
                        )}
                    >
                        {tabOption.label}
                    </button>
                ))}
            </div>

            {tab === 'all' && (
                <input
                    type="search"
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="닉네임 검색"
                    className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-[#3a3a44] dark:bg-[#1a1a23] dark:text-[#efeff1] dark:placeholder-[#848494] dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
                />
            )}

            <div className="relative">
                <select
                    value={sort}
                    onChange={(event) => onSortChange(event.target.value as StreamersFilterControlsProps['sort'])}
                    className="appearance-none rounded-xl border border-gray-300 bg-white px-4 py-2 pr-9 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-[#3a3a44] dark:bg-[#1a1a23] dark:text-[#efeff1] dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
                >
                    {SORT_OPTIONS.map((sortOption) => (
                        <option key={sortOption.value} value={sortOption.value}>
                            {sortOption.label}
                        </option>
                    ))}
                </select>
                <svg
                    className="pointer-events-none absolute inset-y-0 right-3 my-auto h-4 w-4 text-gray-400 dark:text-[#848494]"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.1 1.02l-4.25 4.5a.75.75 0 01-1.1 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
                </svg>
            </div>
        </div>
    )
}

function StreamersPagination({ page, totalPages, total, onPrev, onNext }: StreamersPaginationProps) {
    return (
        <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-gray-400 dark:text-[#848494]">
                총 {total.toLocaleString()}명 · {page} / {totalPages} 페이지
            </p>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={onPrev}
                    disabled={page <= 1}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-40 dark:border-[#3a3a44] dark:text-[#efeff1] dark:hover:bg-[#26262e]"
                >
                    이전
                </button>
                <button
                    type="button"
                    onClick={onNext}
                    disabled={page >= totalPages}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-40 dark:border-[#3a3a44] dark:text-[#efeff1] dark:hover:bg-[#26262e]"
                >
                    다음
                </button>
            </div>
        </div>
    )
}

export default function StreamersPage() {
    const {
        tab,
        search,
        showRegister,
        selected,
        page,
        sort,
        isLoading,
        isError,
        items,
        total,
        totalPages,
        emptyMessage,
        setSearch,
        setShowRegister,
        setSelected,
        setSort,
        handleTabChange,
        handlePrevPage,
        handleNextPage,
    } = useStreamersManage()

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-[#efeff1]">스트리머 관리</h1>
                    <p className="mt-0.5 text-sm text-gray-500 dark:text-[#adadb8]">스트리머 등록 및 채널 정보를 관리합니다.</p>
                </div>
                <button
                    onClick={() => setShowRegister(true)}
                    className="rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
                >
                    + 스트리머 등록
                </button>
            </div>

            <StreamersFilterControls
                tab={tab}
                search={search}
                sort={sort}
                onTabChange={handleTabChange}
                onSearchChange={setSearch}
                onSortChange={setSort}
            />

            {isLoading && (
                <div className="flex h-32 items-center justify-center">
                    <p className="text-sm text-gray-400 dark:text-[#848494]">불러오는 중…</p>
                </div>
            )}

            {isError && (
                <div className="flex h-32 items-center justify-center rounded-2xl border border-red-100 bg-red-50 dark:border-red-900/20 dark:bg-red-900/10">
                    <p className="text-sm text-red-500 dark:text-red-400">데이터를 불러오지 못했습니다.</p>
                </div>
            )}

            {!isLoading && !isError && (
                <StreamerTable streamers={items} emptyMessage={emptyMessage} onSelect={setSelected} onDeleted={() => setSelected(null)} />
            )}

            {!isLoading && !isError && items.length > 0 && (
                <StreamersPagination page={page} totalPages={totalPages} total={total} onPrev={handlePrevPage} onNext={handleNextPage} />
            )}

            {showRegister && <RegisterModal onClose={() => setShowRegister(false)} />}

            {selected !== null && <StreamerDetailModal streamer={selected} onClose={() => setSelected(null)} />}
        </div>
    )
}
