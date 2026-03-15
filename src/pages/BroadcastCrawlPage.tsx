import { useEffect, useMemo, useRef, useState } from 'react'
import dayjs from 'dayjs'
import partnerMark from '../assets/mark.png'
import {
    useAdminToast,
    useCrawlBroadcasts,
    useInsertBroadcasts,
    useRegisterStreamer,
} from '../hooks'
import type { CrawledBroadcast, CrawledParticipant } from '../types'
import { getErrorMessage } from '../utils/error'
import { cn } from '../lib/cn'
import { DAY_NAMES_SHORT } from '../constants/date'

function formatDateLabel(isoString: string): string {
    const d = new Date(isoString)
    const month = d.getMonth() + 1
    const day = d.getDate()
    const dayName = DAY_NAMES_SHORT[d.getDay()]
    return `${month}월 ${day}일 (${dayName})`
}

function formatTime(isoString: string): string {
    const d = new Date(isoString)
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function formatTimeRange(start: string, end: string | null): string {
    const startStr = formatTime(start)
    if (end === null) return startStr
    return `${startStr} – ${formatTime(end)}`
}

interface RegisterParticipantModalProps {
    participant: CrawledParticipant
    onClose: () => void
    onSuccess: (name: string) => void
}

function RegisterParticipantModal({
    participant,
    onClose,
    onSuccess,
}: RegisterParticipantModalProps) {
    const register = useRegisterStreamer()

    function handleRegister() {
        if (participant.channelId === null) return
        register.mutate(
            { channelId: participant.channelId },
            {
                onSuccess: () => {
                    onSuccess(participant.name)
                },
            },
        )
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 dark:bg-black/70"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose()
            }}
        >
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-[#1a1a23]">
                <div className="border-b border-gray-200 px-6 py-4 dark:border-[#3a3a44]">
                    <h2 className="text-base font-bold text-gray-900 dark:text-[#efeff1]">
                        스트리머 등록
                    </h2>
                    <p className="mt-0.5 text-sm text-gray-500 dark:text-[#adadb8]">
                        크롤링된 채널을 스트리머로 등록합니다.
                    </p>
                </div>

                <div className="px-6 py-4">
                    <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 dark:border-[#3a3a44]">
                        {participant.channelImageUrl !== null ? (
                            <img
                                src={participant.channelImageUrl}
                                alt={participant.name}
                                className="h-12 w-12 rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-base font-semibold text-gray-500 dark:bg-[#26262e] dark:text-[#adadb8]">
                                {participant.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                                <span className="truncate text-sm font-semibold text-gray-900 dark:text-[#efeff1]">
                                    {participant.name}
                                </span>
                                {participant.isPartner && (
                                    <img
                                        src={partnerMark}
                                        alt="파트너"
                                        className="h-4 w-4 shrink-0"
                                    />
                                )}
                            </div>
                            {participant.channelId !== null && (
                                <p className="mt-0.5 font-mono text-xs text-gray-400 dark:text-[#848494]">
                                    {participant.channelId}
                                </p>
                            )}
                        </div>
                    </div>

                    {register.error !== null && (
                        <p className="mt-3 text-xs text-red-500 dark:text-red-400">
                            {getErrorMessage(register.error)}
                        </p>
                    )}
                </div>

                {participant.channelId === null && (
                    <p className="px-6 pb-2 text-xs text-amber-600 dark:text-amber-400">
                        채널 ID를 알 수 없어 자동 등록이 불가합니다. 스트리머
                        관리 페이지에서 직접 등록해주세요.
                    </p>
                )}
                <div className="flex gap-2 border-t border-gray-200 px-6 py-4 dark:border-[#3a3a44]">
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 dark:border-[#3a3a44] dark:text-[#adadb8] dark:hover:bg-[#26262e]"
                    >
                        닫기
                    </button>
                    {participant.channelId !== null && (
                        <button
                            type="button"
                            onClick={handleRegister}
                            disabled={register.isPending}
                            className="cursor-pointer flex-1 rounded-xl bg-blue-500 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-500"
                        >
                            {register.isPending ? '등록 중…' : '스트리머 등록'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

interface ParticipantChipProps {
    participant: CrawledParticipant
    onRegisterClick: (participant: CrawledParticipant) => void
}

function ParticipantChip({
    participant,
    onRegisterClick,
}: ParticipantChipProps) {
    return (
        <button
            type="button"
            title={
                participant.isManaged
                    ? `${participant.name} (등록됨)`
                    : `${participant.name} (미등록) — 클릭하여 등록`
            }
            onClick={(e) => {
                e.stopPropagation()
                if (!participant.isManaged) {
                    onRegisterClick(participant)
                }
            }}
            className={cn(
                'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition',
                participant.isManaged
                    ? 'cursor-default bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                    : 'cursor-pointer bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/30',
            )}
        >
            <span
                className={cn(
                    'inline-block h-1.5 w-1.5 shrink-0 rounded-full',
                    participant.isManaged ? 'bg-emerald-500' : 'bg-amber-400',
                )}
            />
            {participant.channelImageUrl !== null && (
                <img
                    src={participant.channelImageUrl}
                    alt={participant.name}
                    className="h-3.5 w-3.5 rounded-full object-cover"
                />
            )}
            <span>{participant.name}</span>
            {!participant.isManaged && <span className="opacity-60">＋</span>}
        </button>
    )
}

interface BroadcastRowProps {
    broadcast: CrawledBroadcast
    checked: boolean
    onToggle: () => void
    onRegisterParticipant: (participant: CrawledParticipant) => void
}

function BroadcastRow({
    broadcast,
    checked,
    onToggle,
    onRegisterParticipant,
}: BroadcastRowProps) {
    return (
        <tr
            className={cn(
                'border-b border-gray-200 last:border-0 transition dark:border-[#3a3a44]',
                checked
                    ? 'bg-blue-50/50 dark:bg-blue-900/10'
                    : 'hover:bg-gray-50 dark:hover:bg-[#26262e]',
            )}
            onClick={onToggle}
        >
            <td className="w-12 px-4 py-3.5">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                        e.stopPropagation()
                        onToggle()
                    }}
                    className="cursor-pointer"
                />
            </td>

            <td className="px-4 py-3.5">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-[#efeff1]">
                    [{broadcast.broadcastType}] {broadcast.title}
                </p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-[#adadb8]">
                    {formatDateLabel(broadcast.startTime)}{' '}
                    {formatTimeRange(broadcast.startTime, broadcast.endTime)}
                </p>
                {broadcast.tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                        {broadcast.tags.slice(0, 4).map((tag) => (
                            <span
                                key={tag}
                                className="rounded bg-gray-50 px-1 py-0.5 text-[10px] text-gray-400 dark:bg-[#26262e] dark:text-[#848494]"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </td>

            <td className="px-4 py-3.5">
                <div className="flex flex-wrap gap-1.5">
                    {broadcast.participants.map((p) => (
                        <ParticipantChip
                            key={p.name}
                            participant={p}
                            onRegisterClick={onRegisterParticipant}
                        />
                    ))}
                    {broadcast.participants.length === 0 && (
                        <span className="text-xs text-gray-400 dark:text-[#848494]">
                            —
                        </span>
                    )}
                </div>
            </td>
        </tr>
    )
}

function getDefaultMonth(): string {
    return dayjs().format('YYYY-MM')
}

export default function BroadcastCrawlPage() {
    const [targetMonth, setTargetMonth] = useState(getDefaultMonth)
    const [broadcasts, setBroadcasts] = useState<CrawledBroadcast[]>([])
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [registeringParticipant, setRegisteringParticipant] =
        useState<CrawledParticipant | null>(null)

    const { addToast } = useAdminToast()
    const lastErrorRef = useRef<string | null>(null)

    const crawl = useCrawlBroadcasts()
    const insertMutation = useInsertBroadcasts()

    const selectedBroadcasts = useMemo(
        () =>
            broadcasts.filter((broadcast) =>
                selectedIds.includes(broadcast.sourceEventId),
            ),
        [broadcasts, selectedIds],
    )

    const unmanagedInSelected = useMemo(() => {
        const seen = new Set<string>()
        const result: CrawledParticipant[] = []
        selectedBroadcasts.forEach((broadcast) => {
            broadcast.participants.forEach((participant) => {
                if (!participant.isManaged && !seen.has(participant.name)) {
                    seen.add(participant.name)
                    result.push(participant)
                }
            })
        })
        return result
    }, [selectedBroadcasts])

    useEffect(() => {
        const errorMessage =
            getErrorMessage(crawl.error) ??
            getErrorMessage(insertMutation.error)
        if (errorMessage === null || errorMessage === lastErrorRef.current) {
            return
        }
        lastErrorRef.current = errorMessage
        addToast({ message: errorMessage, variant: 'error' })
    }, [addToast, crawl.error, insertMutation.error])

    function toggleSelected(sourceEventId: string) {
        setSelectedIds((prev) =>
            prev.includes(sourceEventId)
                ? prev.filter((id) => id !== sourceEventId)
                : [...prev, sourceEventId],
        )
    }

    const allChecked =
        broadcasts.length > 0 && selectedIds.length === broadcasts.length

    async function handleCrawl(): Promise<void> {
        try {
            const result = await crawl.mutateAsync({
                month: targetMonth,
            })
            setBroadcasts(result.broadcasts)
            setSelectedIds([])
            addToast({
                message: `방송 ${result.broadcasts.length}건을 가져왔습니다.`,
                variant: 'success',
            })
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    async function handleInsert(): Promise<void> {
        if (selectedIds.length === 0) return
        try {
            const result = await insertMutation.mutateAsync({
                broadcasts: selectedBroadcasts,
            })
            const insertedSet = new Set(selectedIds)
            setBroadcasts((prev) =>
                prev.filter(
                    (broadcast) => !insertedSet.has(broadcast.sourceEventId),
                ),
            )
            setSelectedIds([])
            addToast({
                message: `방송 ${result.insertedCount}건이 반영되었습니다.`,
                variant: 'success',
            })
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    function handleParticipantRegistered(name: string) {
        setBroadcasts((prev) =>
            prev.map((broadcast) => ({
                ...broadcast,
                participants: broadcast.participants.map((participant) =>
                    participant.name === name
                        ? { ...participant, isManaged: true }
                        : participant,
                ),
            })),
        )
        setRegisteringParticipant(null)
        addToast({
            message: '스트리머가 등록되었습니다.',
            variant: 'success',
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-[#efeff1]">
                        방송 크롤링
                    </h1>
                    <p className="mt-0.5 text-sm text-gray-500 dark:text-[#adadb8]">
                        dal.wiki agenda 월 페이지를 기준으로 수집 후 즉시
                        반영합니다.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        void handleCrawl()
                    }}
                    disabled={crawl.isPending}
                    className="cursor-pointer rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
                >
                    {crawl.isPending ? '크롤링 중…' : '크롤링 실행'}
                </button>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 dark:border-[#3a3a44] dark:bg-[#1a1a23]">
                <span className="text-xs font-medium text-gray-500 dark:text-[#adadb8]">
                    월
                </span>
                <input
                    type="month"
                    value={targetMonth}
                    onChange={(e) => setTargetMonth(e.target.value)}
                    className="rounded-lg border border-gray-300 px-2 py-1 text-xs dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                />
            </div>

            {unmanagedInSelected.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/40 dark:bg-amber-900/10">
                    <p className="mb-2.5 text-sm font-medium text-amber-800 dark:text-amber-400">
                        선택한 방송에 미등록 스트리머가 있습니다 — 등록 후
                        반영하거나 그대로 반영할 수 있습니다.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {unmanagedInSelected.map((participant) => (
                            <button
                                key={participant.name}
                                type="button"
                                onClick={() =>
                                    setRegisteringParticipant(participant)
                                }
                                className="cursor-pointer flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-2.5 py-1.5 text-xs font-medium text-amber-700 transition hover:bg-amber-50 dark:border-amber-700/50 dark:bg-[#1a1a23] dark:text-amber-400 dark:hover:bg-[#26262e]"
                            >
                                {participant.channelImageUrl !== null && (
                                    <img
                                        src={participant.channelImageUrl}
                                        alt={participant.name}
                                        className="h-4 w-4 rounded-full"
                                    />
                                )}
                                <span>{participant.name}</span>
                                <span className="text-amber-500 dark:text-amber-500">
                                    + 등록
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => {
                        void handleInsert()
                    }}
                    disabled={
                        selectedIds.length === 0 || insertMutation.isPending
                    }
                    className="cursor-pointer rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-40"
                >
                    {insertMutation.isPending
                        ? '반영 중…'
                        : `선택 반영 (${selectedIds.length})`}
                </button>
                {selectedIds.length > 0 && (
                    <button
                        type="button"
                        onClick={() => setSelectedIds([])}
                        className="cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 dark:border-[#3a3a44] dark:text-[#adadb8] dark:hover:bg-[#26262e]"
                    >
                        선택 해제
                    </button>
                )}
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-300 bg-white dark:border-[#3a3a44] dark:bg-[#1a1a23]">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-300 bg-gray-50 dark:border-[#3a3a44] dark:bg-[#26262e]">
                            <th className="w-12 px-4 py-3">
                                <input
                                    type="checkbox"
                                    checked={allChecked}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedIds(
                                                broadcasts.map(
                                                    (broadcast) =>
                                                        broadcast.sourceEventId,
                                                ),
                                            )
                                        } else {
                                            setSelectedIds([])
                                        }
                                    }}
                                    className="cursor-pointer"
                                />
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-[#848494]">
                                방송 정보
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-[#848494]">
                                참여자
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {broadcasts.length === 0 && (
                            <tr>
                                <td
                                    colSpan={3}
                                    className="px-4 py-10 text-center text-sm text-gray-400 dark:text-[#848494]"
                                >
                                    아직 결과가 없습니다. 크롤링 실행을
                                    눌러주세요.
                                </td>
                            </tr>
                        )}
                        {broadcasts.map((broadcast) => (
                            <BroadcastRow
                                key={broadcast.sourceEventId}
                                broadcast={broadcast}
                                checked={selectedIds.includes(
                                    broadcast.sourceEventId,
                                )}
                                onToggle={() =>
                                    toggleSelected(broadcast.sourceEventId)
                                }
                                onRegisterParticipant={
                                    setRegisteringParticipant
                                }
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {broadcasts.length > 0 && (
                <p className="text-xs text-gray-400 dark:text-[#848494]">
                    총 {broadcasts.length}건 · {selectedIds.length}건 선택됨
                </p>
            )}

            {registeringParticipant !== null && (
                <RegisterParticipantModal
                    participant={registeringParticipant}
                    onClose={() => setRegisteringParticipant(null)}
                    onSuccess={handleParticipantRegistered}
                />
            )}
        </div>
    )
}
