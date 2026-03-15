import { OverwatchMatchModal } from '../components/overwatch'
import { BroadcastCard } from '../components/BroadcastCard'
import { BroadcastFormModal } from '../components/BroadcastFormModal'
import { DeleteConfirmModal } from '../components/DeleteConfirmModal'
import { useBroadcastSchedule } from '../hooks'
import { cn } from '../lib/cn'
import { formatDisplayDate } from '../utils/broadcastSchedule'

export default function BroadcastSchedulePage() {
    const {
        view,
        setView,
        navigatePrev,
        navigateNext,
        moveToToday,
        isLoading,
        filteredDateGroups,
        totalCount,
        showHiddenOnly,
        setShowHiddenOnly,
        showCreateModal,
        setShowCreateModal,
        editingBroadcast,
        setEditingBroadcast,
        deletingBroadcast,
        setDeletingBroadcast,
        overwatchBroadcast,
        setOverwatchBroadcast,
        refreshSchedule,
    } = useBroadcastSchedule()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-[#efeff1]">일정 관리</h1>
                    <p className="mt-0.5 text-sm text-gray-500 dark:text-[#adadb8]">참여자/주최자/노출 상태까지 함께 관리합니다.</p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowCreateModal(true)}
                    className="cursor-pointer rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white"
                >
                    + 방송 추가
                </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <div className="flex overflow-hidden rounded-xl border border-gray-300 dark:border-[#3a3a44]">
                    {(['weekly', 'monthly'] as const).map((mode) => (
                        <button
                            key={mode}
                            type="button"
                            onClick={() => setView(mode)}
                            className={cn(
                                'cursor-pointer px-4 py-2 text-sm font-medium',
                                view === mode ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 dark:bg-[#1a1a23] dark:text-[#adadb8]',
                            )}
                        >
                            {mode === 'weekly' ? '주간' : '월간'}
                        </button>
                    ))}
                </div>
                <div className="flex overflow-hidden rounded-lg border border-gray-300 dark:border-[#3a3a44]">
                    <button
                        type="button"
                        onClick={navigatePrev}
                        className="cursor-pointer border-r border-gray-300 px-3 py-2 dark:border-[#3a3a44]"
                    >
                        ‹
                    </button>
                    <button
                        type="button"
                        onClick={moveToToday}
                        className="cursor-pointer border-r border-gray-300 px-3 py-2 text-xs dark:border-[#3a3a44]"
                    >
                        오늘
                    </button>
                    <button type="button" onClick={navigateNext} className="cursor-pointer px-3 py-2">
                        ›
                    </button>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 dark:border-[#3a3a44]">
                    <span className="text-xs font-medium text-gray-500 dark:text-[#adadb8]">미노출만 보기</span>
                    <button
                        type="button"
                        onClick={() => setShowHiddenOnly((prev) => !prev)}
                        className={cn(
                            'cursor-pointer flex h-6 w-12 shrink-0 items-center rounded-full px-0.5 transition-colors',
                            showHiddenOnly ? 'justify-end' : 'justify-start',
                            showHiddenOnly ? 'bg-amber-500' : 'bg-gray-300 dark:bg-[#3a3a44]',
                        )}
                        aria-label="미노출 일정만 보기 토글"
                    >
                        <span className="h-5 w-5 rounded-full bg-white shadow" />
                    </button>
                </div>
            </div>

            {isLoading && <div className="py-10 text-center text-sm text-gray-400">불러오는 중…</div>}

            {!isLoading && (
                <div className="space-y-5">
                    {filteredDateGroups.map((group) => (
                        <section key={group.date} data-date={group.date} className="scroll-mt-4 space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-gray-600 dark:text-[#adadb8]">{formatDisplayDate(group.date)}</span>
                                <div className="h-px flex-1 bg-gray-100 dark:bg-[#3a3a44]" />
                                <span className="text-[11px] text-gray-400 dark:text-[#848494]">{group.broadcasts.length}건</span>
                            </div>
                            <div className="space-y-2">
                                {group.broadcasts.map((broadcast) => (
                                    <BroadcastCard
                                        key={broadcast.id}
                                        broadcast={broadcast}
                                        onEdit={setEditingBroadcast}
                                        onDelete={setDeletingBroadcast}
                                        onOverwatchEdit={setOverwatchBroadcast}
                                    />
                                ))}
                            </div>
                        </section>
                    ))}
                    {totalCount === 0 && (
                        <div className="rounded-2xl border border-dashed border-gray-300 py-10 text-center text-sm text-gray-400 dark:border-[#3a3a44] dark:text-[#848494]">
                            {showHiddenOnly ? '미노출 일정이 없습니다.' : '해당 기간 방송이 없습니다.'}
                        </div>
                    )}
                </div>
            )}

            {showCreateModal && (
                <BroadcastFormModal mode="create" onClose={() => setShowCreateModal(false)} onSuccess={refreshSchedule} />
            )}
            {editingBroadcast !== null && (
                <BroadcastFormModal
                    mode="edit"
                    broadcast={editingBroadcast}
                    onClose={() => setEditingBroadcast(null)}
                    onSuccess={refreshSchedule}
                />
            )}
            {deletingBroadcast !== null && (
                <DeleteConfirmModal broadcast={deletingBroadcast} onClose={() => setDeletingBroadcast(null)} onSuccess={refreshSchedule} />
            )}
            {overwatchBroadcast !== null && (
                <OverwatchMatchModal broadcast={overwatchBroadcast} onClose={() => setOverwatchBroadcast(null)} />
            )}
        </div>
    )
}
