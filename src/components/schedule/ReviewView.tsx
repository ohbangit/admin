import { useState } from 'react'
import dayjs from 'dayjs'
import { Check, ImageIcon, MessageSquare, Pencil, Trash2 } from 'lucide-react'
import type { ReviewBroadcastItem } from '../../types'
import { useAdminToast, useApproveReview, useBulkApprove, useReviewQueue } from '../../hooks'
import { getBroadcastTypeBadgeClass, KOREAN_DAY_NAMES } from './utils'
import { cn } from '../../lib/cn'
import { panelClass } from '../../constants/styles'
import { ListEmpty, ListError, ListLoading } from '../ListState'
import { getErrorMessage } from '../../utils/error'

function formatReviewDate(startTime: string | null): string {
    if (startTime === null) return '미정'
    const d = dayjs(startTime)
    if (!d.isValid()) return '미정'
    return `${d.format('MM.DD')} (${KOREAN_DAY_NAMES[d.day()]}) ${d.format('HH:mm')}`
}

function getConfidenceBadgeClass(confidence: number): string {
    if (confidence >= 0.8) return 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
    if (confidence >= 0.5) return 'border-amber-500/40 bg-amber-500/15 text-amber-300'
    return 'border-red-500/40 bg-red-500/15 text-red-300'
}

function getHostName(item: ReviewBroadcastItem): string {
    const host = item.streamers.find((s) => s.isHost)
    return host?.name ?? item.streamers[0]?.name ?? '-'
}

interface ReviewViewProps {
    onEdit: (item: ReviewBroadcastItem) => void
    onDelete: (item: ReviewBroadcastItem) => void
}

export function ReviewView({ onEdit, onDelete }: ReviewViewProps) {
    const { addToast } = useAdminToast()
    const { data, isLoading, isError, refetch } = useReviewQueue()
    const approveMutation = useApproveReview()
    const bulkApproveMutation = useBulkApprove()
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

    const items = data?.items ?? []
    const selectedCount = selectedIds.size
    const allSelected = items.length > 0 && selectedIds.size === items.length
    const isPending = approveMutation.isPending || bulkApproveMutation.isPending

    function toggleItem(id: string): void {
        setSelectedIds((prev) => {
            const next = new Set(prev)
            if (next.has(String(id))) next.delete(String(id))
            else next.add(String(id))
            return next
        })
    }

    function selectAll(): void {
        setSelectedIds(new Set(items.map((item) => String(item.id))))
    }

    function clearSelection(): void {
        setSelectedIds(new Set())
    }

    async function handleApprove(item: ReviewBroadcastItem): Promise<void> {
        try {
            await approveMutation.mutateAsync(item.id)
            addToast({ message: '일정을 승인했습니다.', variant: 'success' })
            setSelectedIds((prev) => {
                const next = new Set(prev)
                next.delete(String(item.id))
                return next
            })
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    async function handleBulkApprove(): Promise<void> {
        if (selectedCount === 0) return
        try {
            const result = await bulkApproveMutation.mutateAsync(Array.from(selectedIds))
            addToast({ message: `${result.approvedCount}건을 승인했습니다.`, variant: 'success' })
            setSelectedIds(new Set())
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    if (isLoading) return <ListLoading className="py-16" />
    if (isError) return <ListError message="검수 목록을 불러오는 중 오류가 발생했습니다." className="py-16" onRetry={() => { void refetch() }} />
    if (items.length === 0) return <div className={panelClass}><ListEmpty message="검수 대기 중인 일정이 없습니다." className="py-16" /></div>

    return (
        <div className={panelClass}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#3a3a44] px-4 py-3">
                <div className="flex items-center gap-3">
                    <label className="flex cursor-pointer items-center gap-2 text-xs text-[#adadb8]">
                        <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={() => (allSelected ? clearSelection() : selectAll())}
                            disabled={isPending}
                            className="h-4 w-4 cursor-pointer rounded"
                        />
                        전체
                    </label>
                    <span className="text-xs text-[#848494]">{items.length}건 대기</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => { void handleBulkApprove() }}
                        disabled={selectedCount === 0 || isPending}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                    >
                        <Check className="h-4 w-4" />
                        {bulkApproveMutation.isPending ? '승인 중...' : `선택 승인 (${selectedCount})`}
                    </button>
                </div>
            </div>

            <div className="hidden overflow-x-auto md:block">
                <div className="grid min-w-[850px] grid-cols-[36px_120px_90px_minmax(140px,2fr)_72px_60px_70px_100px] items-center gap-3 border-b border-[#3a3a44] px-4 py-3 text-center text-xs font-semibold text-[#848494]">
                    <div>선택</div>
                    <div>날짜</div>
                    <div>스트리머</div>
                    <div>제목</div>
                    <div>유형</div>
                    <div>신뢰도</div>
                    <div>출처</div>
                    <div>작업</div>
                </div>

                <ul className="divide-y divide-[#3a3a44]">
                    {items.map((item) => (
                        <li
                            key={item.id}
                            className={cn(
                                'grid min-w-[850px] grid-cols-[36px_120px_90px_minmax(140px,2fr)_72px_60px_70px_100px] items-center gap-3 px-4 py-3 transition',
                                selectedIds.has(String(item.id)) ? 'bg-blue-500/5' : 'hover:bg-[#1f1f28]',
                            )}
                        >
                            <div className="flex justify-center">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.has(String(item.id))}
                                    onChange={() => toggleItem(String(item.id))}
                                    disabled={isPending}
                                    className="h-4 w-4 cursor-pointer rounded disabled:cursor-not-allowed"
                                />
                            </div>

                            <div className="text-xs font-medium text-[#adadb8]">
                                {formatReviewDate(item.startTime)}
                            </div>

                            <div className="truncate text-xs font-medium text-[#efeff1]">
                                {getHostName(item)}
                            </div>

                            <div className="min-w-0">
                                <p className="line-clamp-2 text-sm font-medium text-[#efeff1]">{item.title}</p>
                            </div>

                            <div className="flex justify-center">
                                <span className={cn('rounded-full border px-2 py-0.5 text-[11px] font-semibold', getBroadcastTypeBadgeClass(item.broadcastType))}>
                                    {item.broadcastType ?? '기타'}
                                </span>
                            </div>

                            <div className="flex justify-center">
                                {item.extraction ? (
                                    <span className={cn('rounded-full border px-1.5 py-0.5 text-[10px] font-bold', getConfidenceBadgeClass(item.extraction.confidence))}>
                                        {Math.round(item.extraction.confidence * 100)}
                                    </span>
                                ) : (
                                    <span className="text-xs text-[#6f6f7b]">-</span>
                                )}
                            </div>

                            <div className="flex items-center justify-center gap-1">
                                {item.extraction?.sourceImageUrl && (
                                    <a href={item.extraction.sourceImageUrl} target="_blank" rel="noopener noreferrer" className="text-[#848494] transition hover:text-blue-300" title="원본 이미지">
                                        <ImageIcon className="h-3.5 w-3.5" />
                                    </a>
                                )}
                                {item.sourceUrl && (
                                    <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[#848494] transition hover:text-blue-300" title="커뮤니티">
                                        <MessageSquare className="h-3.5 w-3.5" />
                                    </a>
                                )}
                                {!item.extraction?.sourceImageUrl && !item.sourceUrl && (
                                    <span className="text-xs text-[#6f6f7b]">-</span>
                                )}
                            </div>

                            <div className="flex items-center justify-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => { void handleApprove(item) }}
                                    disabled={isPending}
                                    className="cursor-pointer rounded-lg border border-emerald-500/35 p-2 text-emerald-300 transition hover:bg-emerald-500/10 disabled:opacity-50"
                                    aria-label={`${item.title} 승인`}
                                >
                                    <Check className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onEdit(item)}
                                    className="cursor-pointer rounded-lg border border-[#3a3a44] p-2 text-[#adadb8] transition hover:bg-[#26262e]"
                                    aria-label={`${item.title} 수정`}
                                >
                                    <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onDelete(item)}
                                    className="cursor-pointer rounded-lg border border-red-500/35 p-2 text-red-300 transition hover:bg-red-500/10"
                                    aria-label={`${item.title} 삭제`}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="space-y-2 p-3 md:hidden">
                {items.map((item) => (
                    <div key={item.id} className="space-y-2 rounded-xl border border-[#3a3a44] bg-[#26262e] p-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.has(String(item.id))}
                                    onChange={() => toggleItem(String(item.id))}
                                    disabled={isPending}
                                    className="h-4 w-4 cursor-pointer rounded"
                                />
                                <span className={cn('text-sm font-semibold tabular-nums', item.startTime !== null ? 'text-blue-300' : 'text-amber-300')}>
                                    {formatReviewDate(item.startTime)}
                                </span>
                            </div>
                            <span className={cn('rounded-full border px-2 py-0.5 text-[11px] font-semibold', getBroadcastTypeBadgeClass(item.broadcastType))}>
                                {item.broadcastType ?? '기타'}
                            </span>
                        </div>

                        <p className="text-sm font-medium text-[#efeff1]">{item.title}</p>

                        <div className="flex items-center gap-2 text-xs text-[#adadb8]">
                            <span>{getHostName(item)}</span>
                            {item.extraction && (
                                <span className={cn('rounded-full border px-1.5 py-0.5 text-[10px] font-bold', getConfidenceBadgeClass(item.extraction.confidence))}>
                                    {Math.round(item.extraction.confidence * 100)}
                                </span>
                            )}
                            <div className="flex items-center gap-1">
                                {item.extraction?.sourceImageUrl && (
                                    <a href={item.extraction.sourceImageUrl} target="_blank" rel="noopener noreferrer" className="text-[#848494] hover:text-blue-300">
                                        <ImageIcon className="h-3.5 w-3.5" />
                                    </a>
                                )}
                                {item.sourceUrl && (
                                    <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[#848494] hover:text-blue-300">
                                        <MessageSquare className="h-3.5 w-3.5" />
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-1.5 pt-1">
                            <button
                                type="button"
                                onClick={() => { void handleApprove(item) }}
                                disabled={isPending}
                                className="cursor-pointer rounded-lg border border-emerald-500/35 p-2 text-emerald-300 transition hover:bg-emerald-500/10 disabled:opacity-50"
                            >
                                <Check className="h-4 w-4" />
                            </button>
                            <button type="button" onClick={() => onEdit(item)} className="cursor-pointer rounded-lg border border-[#3a3a44] p-2 text-[#adadb8] transition hover:bg-[#32323d]">
                                <Pencil className="h-4 w-4" />
                            </button>
                            <button type="button" onClick={() => onDelete(item)} className="cursor-pointer rounded-lg border border-red-500/35 p-2 text-red-300 transition hover:bg-red-500/10">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
