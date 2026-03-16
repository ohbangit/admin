import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { Check, RefreshCw, X } from 'lucide-react'
import { useAdminToast, useInsertCrawledBroadcasts, useRunBroadcastCrawl } from '../hooks'
import type { CrawledBroadcast, CrawledParticipant } from '../types'
import { cn } from '../lib/cn'
import { getErrorMessage } from '../utils/error'
import { inputClass, panelClass } from '../constants/styles'
import { ListEmpty, ListLoading } from '../components/ListState'

const KOREAN_DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

function getBroadcastTypeBadgeClass(type: string | null): string {
    if (type === '합방') return 'border-purple-500/40 bg-purple-500/15 text-purple-300'
    if (type === '콘텐츠') return 'border-blue-500/40 bg-blue-500/15 text-blue-300'
    if (type === '내전') return 'border-orange-500/40 bg-orange-500/15 text-orange-300'
    return 'border-[#4a4a58] bg-[#2a2a34] text-[#b5b5c0]'
}

function formatBroadcastTime(startTime: string): string {
    const parsed = dayjs(startTime)
    if (!parsed.isValid()) return '-'
    const dayName = KOREAN_DAY_NAMES[parsed.day()]
    return `${parsed.format('MM.DD')} (${dayName}) ${parsed.format('HH:mm')}`
}

function renderParticipantChips(participants: CrawledParticipant[]) {
    if (participants.length === 0) {
        return <span className="text-xs text-[#6f6f7b]">참여자 없음</span>
    }

    const visibleParticipants = participants.slice(0, 5)
    const overflowCount = participants.length - visibleParticipants.length

    return (
        <div className="flex flex-wrap items-center gap-1.5">
            {visibleParticipants.map((participant, index) => (
                <span
                    key={`${participant.name}-${participant.channelId ?? 'none'}-${index}`}
                    className={cn(
                        'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium',
                        participant.isManaged
                            ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200'
                            : 'border-[#4a4a57] bg-[#26262e] text-[#8f8f9b]',
                    )}
                >
                    {participant.name}
                </span>
            ))}
            {overflowCount > 0 && (
                <span className="inline-flex items-center rounded-full border border-[#4a4a57] bg-[#26262e] px-2 py-0.5 text-[11px] font-medium text-[#adadb8]">
                    +{overflowCount}
                </span>
            )}
        </div>
    )
}

export default function BroadcastCrawlPage() {
    const { addToast } = useAdminToast()
    const runBroadcastCrawlMutation = useRunBroadcastCrawl()
    const insertCrawledBroadcastsMutation = useInsertCrawledBroadcasts()

    const [month, setMonth] = useState(dayjs().format('YYYY-MM'))
    const [hasRun, setHasRun] = useState(false)
    const [broadcasts, setBroadcasts] = useState<CrawledBroadcast[]>([])
    const [selectedSourceEventIds, setSelectedSourceEventIds] = useState<Set<string>>(new Set())

    const selectedBroadcasts = useMemo(() => {
        if (selectedSourceEventIds.size === 0) return []
        return broadcasts.filter((item) => selectedSourceEventIds.has(item.sourceEventId))
    }, [broadcasts, selectedSourceEventIds])

    const selectedCount = selectedBroadcasts.length
    const allSelected = broadcasts.length > 0 && selectedSourceEventIds.size === broadcasts.length
    const isPending = runBroadcastCrawlMutation.isPending || insertCrawledBroadcastsMutation.isPending

    function toggleBroadcast(sourceEventId: string): void {
        setSelectedSourceEventIds((prev) => {
            const next = new Set(prev)
            if (next.has(sourceEventId)) next.delete(sourceEventId)
            else next.add(sourceEventId)
            return next
        })
    }

    function selectAll(): void {
        setSelectedSourceEventIds(new Set(broadcasts.map((item) => item.sourceEventId)))
    }

    function clearSelection(): void {
        setSelectedSourceEventIds(new Set())
    }

    async function handleRunCrawl(): Promise<void> {
        if (month.trim().length === 0) {
            addToast({ message: '월을 선택해주세요.', variant: 'error' })
            return
        }

        try {
            const response = await runBroadcastCrawlMutation.mutateAsync({ month })
            setBroadcasts(response.broadcasts)
            setSelectedSourceEventIds(new Set(response.broadcasts.map((item) => item.sourceEventId)))
            setHasRun(true)
            addToast({ message: `${response.broadcasts.length}건을 크롤링했습니다.`, variant: 'success' })
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    async function handleInsertSelected(): Promise<void> {
        if (selectedBroadcasts.length === 0) return

        try {
            const response = await insertCrawledBroadcastsMutation.mutateAsync({ broadcasts: selectedBroadcasts })
            addToast({ message: `${response.insertedCount}건을 등록했습니다.`, variant: 'success' })

            const selectedIds = new Set(selectedBroadcasts.map((item) => item.sourceEventId))
            setBroadcasts((prev) => prev.filter((item) => !selectedIds.has(item.sourceEventId)))
            setSelectedSourceEventIds(new Set())
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    return (
        <>
            <div className="mb-6">
                <h1 className="text-xl font-bold text-[#efeff1]">방송 크롤링</h1>
                <p className="mt-1 text-sm text-[#adadb8]">dal.wiki에서 방송 일정을 크롤링합니다</p>
            </div>

            <div className={panelClass}>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#3a3a44] px-4 py-3">
                    <div className="flex items-center gap-2">
                        <input
                            type="month"
                            value={month}
                            onChange={(event) => setMonth(event.target.value)}
                            className={cn(inputClass, 'w-44')}
                        />
                        <button
                            type="button"
                            onClick={() => {
                                void handleRunCrawl()
                            }}
                            disabled={isPending}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                        >
                            <RefreshCw className={cn('h-4 w-4', runBroadcastCrawlMutation.isPending && 'animate-spin')} />
                            크롤링
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-[#848494]">{selectedCount}/{broadcasts.length}건 선택</span>
                        <button
                            type="button"
                            onClick={selectAll}
                            disabled={broadcasts.length === 0 || allSelected || isPending}
                            className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#3a3a44] px-3 py-1.5 text-xs font-medium text-[#adadb8] transition hover:bg-[#26262e] disabled:opacity-50"
                        >
                            <Check className="h-3.5 w-3.5" />
                            전체 선택
                        </button>
                        <button
                            type="button"
                            onClick={clearSelection}
                            disabled={selectedCount === 0 || isPending}
                            className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#3a3a44] px-3 py-1.5 text-xs font-medium text-[#adadb8] transition hover:bg-[#26262e] disabled:opacity-50"
                        >
                            <X className="h-3.5 w-3.5" />
                            전체 해제
                        </button>
                    </div>
                </div>

                {!hasRun && <ListEmpty message="월을 선택하고 크롤링을 시작하세요" className="py-16" />}

                {runBroadcastCrawlMutation.isPending && broadcasts.length === 0 && <ListLoading className="py-16" />}

                {hasRun && broadcasts.length === 0 && !runBroadcastCrawlMutation.isPending && (
                    <ListEmpty message="해당 월에 새로운 방송이 없습니다" className="py-16" />
                )}

                {broadcasts.length > 0 && (
                    <>
                        <div className="grid grid-cols-[36px_130px_minmax(180px,2fr)_82px_minmax(180px,1.5fr)_minmax(120px,1.2fr)] items-center gap-3 border-b border-[#3a3a44] px-4 py-3 text-center text-xs font-semibold text-[#848494]">
                            <div>선택</div>
                            <div>시간</div>
                            <div>제목</div>
                            <div>유형</div>
                            <div>참여자</div>
                            <div>태그</div>
                        </div>

                        <ul className="divide-y divide-[#3a3a44]">
                            {broadcasts.map((item) => (
                                <li
                                    key={item.sourceEventId}
                                    className={cn(
                                        'grid grid-cols-[36px_130px_minmax(180px,2fr)_82px_minmax(180px,1.5fr)_minmax(120px,1.2fr)] items-start gap-3 px-4 py-3 transition',
                                        selectedSourceEventIds.has(item.sourceEventId) ? 'bg-blue-500/5' : 'hover:bg-[#1f1f28]',
                                    )}
                                >
                                    <div className="flex justify-center pt-0.5">
                                        <input
                                            type="checkbox"
                                            checked={selectedSourceEventIds.has(item.sourceEventId)}
                                            onChange={() => toggleBroadcast(item.sourceEventId)}
                                            disabled={isPending}
                                            className="h-4 w-4 cursor-pointer rounded disabled:cursor-not-allowed"
                                        />
                                    </div>

                                    <div className="pt-0.5 text-xs font-medium text-[#adadb8]">{formatBroadcastTime(item.startTime)}</div>

                                    <div className="min-w-0 pt-0.5">
                                        <p className="line-clamp-2 text-sm font-semibold text-[#efeff1]">{item.title}</p>
                                    </div>

                                    <div className="flex justify-center pt-0.5">
                                        <span className={cn('inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold', getBroadcastTypeBadgeClass(item.broadcastType))}>
                                            {item.broadcastType || '기타'}
                                        </span>
                                    </div>

                                    <div>{renderParticipantChips(item.participants)}</div>

                                    <div className="flex flex-wrap gap-1.5">
                                        {item.tags.length === 0 && <span className="text-xs text-[#6f6f7b]">-</span>}
                                        {item.tags.map((tag) => (
                                            <span
                                                key={`${item.sourceEventId}-${tag}`}
                                                className="inline-flex items-center rounded-full border border-[#4a4a57] bg-[#26262e] px-2 py-0.5 text-[11px] text-[#adadb8]"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <div className="flex justify-end border-t border-[#3a3a44] px-4 py-4">
                            <div className="flex flex-col items-end gap-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        void handleInsertSelected()
                                    }}
                                    disabled={selectedCount === 0 || isPending}
                                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                                >
                                    <Check className="h-4 w-4" />
                                    {insertCrawledBroadcastsMutation.isPending ? '등록 중...' : `${selectedCount}건 등록`}
                                </button>
                                <p className="text-xs text-[#848494]">등록된 일정은 비공개 상태로 추가됩니다</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    )
}
