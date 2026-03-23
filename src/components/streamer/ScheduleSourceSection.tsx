import { useEffect, useState } from 'react'
import { Check, Rss, Trash2 } from 'lucide-react'
import { cn } from '../../lib/cn'
import { inputClass, selectClass } from '../../constants/styles'
import {
    useAdminToast,
    useCreateScheduleSource,
    useDeleteScheduleSource,
    useScheduleSources,
    useToggleScheduleSourceActive,
    useUpdateScheduleSource,
} from '../../hooks'
import { getErrorMessage } from '../../utils/error'

interface ScheduleSourceSectionProps {
    streamerId: number
    streamerName: string
    channelId: string | null
    onPendingChange?: (pending: boolean) => void
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const

export function ScheduleSourceSection({ streamerId, streamerName, channelId, onPendingChange }: ScheduleSourceSectionProps) {
    void streamerName

    const { addToast } = useAdminToast()
    const { data: sources = [], isLoading: isSourcesLoading } = useScheduleSources(streamerId)
    const createSourceMutation = useCreateScheduleSource()
    const deleteSourceMutation = useDeleteScheduleSource()
    const toggleSourceMutation = useToggleScheduleSourceActive()
    const updateSourceMutation = useUpdateScheduleSource()

    const [isAddingSource, setIsAddingSource] = useState(false)
    const [newSourceIdentifier, setNewSourceIdentifier] = useState('')
    const [newSourceDays, setNewSourceDays] = useState<number[]>([1])
    const [newSourceHour, setNewSourceHour] = useState('6')
    const [editingSourceId, setEditingSourceId] = useState<number | null>(null)
    const [editingSourceIdentifier, setEditingSourceIdentifier] = useState('')
    const [editingSourceDays, setEditingSourceDays] = useState<number[]>([1])
    const [editingSourceHour, setEditingSourceHour] = useState('6')

    const isSourcePending =
        createSourceMutation.isPending || deleteSourceMutation.isPending || toggleSourceMutation.isPending || updateSourceMutation.isPending

    useEffect(() => {
        onPendingChange?.(isSourcePending)
    }, [isSourcePending, onPendingChange])

    useEffect(() => {
        setIsAddingSource(false)
        setNewSourceIdentifier('')
        setNewSourceDays([1])
        setNewSourceHour('6')
        setEditingSourceId(null)
        setEditingSourceIdentifier('')
        setEditingSourceDays([1])
        setEditingSourceHour('6')
    }, [streamerId])

    async function handleCreateSource(): Promise<void> {
        const sourceIdentifier = newSourceIdentifier.trim()
        const crawlHour = Number(newSourceHour)

        if (sourceIdentifier.length === 0) {
            addToast({ message: '식별자를 입력해주세요.', variant: 'error' })
            return
        }

        if (newSourceDays.length === 0) {
            addToast({ message: '요일을 하나 이상 선택해주세요.', variant: 'error' })
            return
        }

        if (!Number.isInteger(crawlHour) || crawlHour < 0 || crawlHour > 23) {
            addToast({ message: '시간을 선택해주세요.', variant: 'error' })
            return
        }

        try {
            await createSourceMutation.mutateAsync({
                streamer_id: streamerId,
                source_type: 'chzzk_community',
                source_identifier: sourceIdentifier,
                crawl_days: [...newSourceDays].sort((a, b) => a - b),
                crawl_hour: crawlHour,
            })
            addToast({ message: '수집 소스를 생성했습니다.', variant: 'success' })
            setIsAddingSource(false)
            setNewSourceIdentifier('')
            setNewSourceDays([1])
            setNewSourceHour('6')
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) {
                addToast({ message, variant: 'error' })
            }
        }
    }

    async function handleToggleSource(id: number, isActive: boolean): Promise<void> {
        try {
            await toggleSourceMutation.mutateAsync({ id, is_active: !isActive })
            addToast({ message: isActive ? '수집 소스를 비활성화했습니다.' : '수집 소스를 활성화했습니다.', variant: 'success' })
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) {
                addToast({ message, variant: 'error' })
            }
        }
    }

    async function handleDeleteSource(id: number): Promise<void> {
        try {
            await deleteSourceMutation.mutateAsync(id)
            addToast({ message: '수집 소스를 삭제했습니다.', variant: 'success' })
            if (editingSourceId === id) {
                setEditingSourceId(null)
                setEditingSourceIdentifier('')
                setEditingSourceDays([1])
                setEditingSourceHour('6')
            }
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) {
                addToast({ message, variant: 'error' })
            }
        }
    }

    async function handleUpdateSource(): Promise<void> {
        if (editingSourceId === null) {
            return
        }

        const sourceIdentifier = editingSourceIdentifier.trim()
        const crawlHour = Number(editingSourceHour)

        if (sourceIdentifier.length === 0) {
            addToast({ message: '식별자를 입력해주세요.', variant: 'error' })
            return
        }

        if (editingSourceDays.length === 0) {
            addToast({ message: '요일을 하나 이상 선택해주세요.', variant: 'error' })
            return
        }

        if (!Number.isInteger(crawlHour) || crawlHour < 0 || crawlHour > 23) {
            addToast({ message: '시간을 선택해주세요.', variant: 'error' })
            return
        }

        try {
            await updateSourceMutation.mutateAsync({
                id: editingSourceId,
                body: {
                    source_identifier: sourceIdentifier,
                    crawl_days: [...editingSourceDays].sort((a, b) => a - b),
                    crawl_hour: crawlHour,
                },
            })
            addToast({ message: '수집 소스를 수정했습니다.', variant: 'success' })
            setEditingSourceId(null)
            setEditingSourceIdentifier('')
            setEditingSourceDays([1])
            setEditingSourceHour('6')
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) {
                addToast({ message, variant: 'error' })
            }
        }
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-medium text-[#adadb8]">
                    <Rss className="h-3.5 w-3.5" /> 수집 소스
                </label>
                {!isAddingSource && (
                    <button
                        type="button"
                        onClick={() => {
                            setIsAddingSource(true)
                            setNewSourceIdentifier(channelId ?? '')
                            setNewSourceDays([1])
                            setNewSourceHour('6')
                        }}
                        disabled={isSourcePending}
                        className="cursor-pointer inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                    >
                        소스 추가
                    </button>
                )}
            </div>

            {isAddingSource && (
                <div className="space-y-2 rounded-lg border border-[#3a3a44] bg-[#26262e] p-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-blue-500/35 bg-blue-500/15 px-2 py-1 text-xs font-semibold text-blue-300">
                            치지직 커뮤니티
                        </span>
                    </div>
                    <div className="grid gap-2">
                        <input
                            type="text"
                            value={newSourceIdentifier}
                            onChange={(event) => setNewSourceIdentifier(event.target.value)}
                            className={inputClass}
                            placeholder="치지직 채널 ID"
                        />
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-[#adadb8]">요일</label>
                            <div className="flex flex-wrap gap-1.5">
                                {DAY_LABELS.map((label, day) => {
                                    const selected = newSourceDays.includes(day)
                                    return (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => {
                                                setNewSourceDays((prev) =>
                                                    selected ? prev.filter((item) => item !== day) : [...prev, day].sort((a, b) => a - b),
                                                )
                                            }}
                                            className={cn(
                                                'cursor-pointer rounded-full border px-2 py-1 text-xs font-semibold transition',
                                                selected
                                                    ? 'border-blue-500/40 bg-blue-500/15 text-blue-300'
                                                    : 'border-[#3a3a44] bg-[#26262e] text-[#adadb8] hover:bg-[#32323d]',
                                            )}
                                        >
                                            {label}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-[#adadb8]">시간</label>
                            <select value={newSourceHour} onChange={(event) => setNewSourceHour(event.target.value)} className={cn(selectClass, 'w-28')}>
                                {Array.from({ length: 24 }, (_, i) => (
                                    <option key={i} value={i}>
                                        {String(i).padStart(2, '0')}시
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setIsAddingSource(false)
                                setNewSourceIdentifier('')
                                setNewSourceDays([1])
                                setNewSourceHour('6')
                            }}
                            disabled={isSourcePending}
                            className="cursor-pointer rounded-xl border border-[#3a3a44] px-3 py-1.5 text-xs font-medium text-[#adadb8] transition hover:bg-[#2e2e38] disabled:opacity-50"
                        >
                            취소
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                void handleCreateSource()
                            }}
                            disabled={isSourcePending}
                            className="cursor-pointer inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                        >
                            <Check className="h-3.5 w-3.5" /> 저장
                        </button>
                    </div>
                </div>
            )}

            {isSourcesLoading ? (
                <p className="text-xs text-[#848494]">수집 소스 불러오는 중...</p>
            ) : sources.length > 0 ? (
                <div className="space-y-2">
                    {sources.map((source) => {
                        const isEditing = editingSourceId === source.id
                        const sourceScheduleLabel = `${source.crawl_days.map((day) => DAY_LABELS[day]).join('·')} ${String(source.crawl_hour).padStart(2, '0')}시`

                        return (
                            <div key={source.id} className="space-y-2 rounded-lg border border-[#3a3a44] bg-[#26262e] px-3 py-2">
                                <div className="flex items-center gap-2">
                                    <span className="rounded-full border border-blue-500/35 bg-blue-500/15 px-2 py-1 text-[11px] font-semibold text-blue-300">
                                        치지직 커뮤니티
                                    </span>
                                    <span className="min-w-0 flex-1 truncate text-xs text-[#efeff1]" title={source.source_identifier}>
                                        {source.source_identifier}
                                    </span>
                                    <span className="text-[11px] text-[#848494]">{sourceScheduleLabel}</span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            void handleToggleSource(source.id, source.is_active)
                                        }}
                                        disabled={isSourcePending}
                                        className={cn(
                                            'cursor-pointer rounded-full border px-2 py-1 text-[11px] font-semibold transition disabled:opacity-50',
                                            source.is_active
                                                ? 'border-emerald-500/35 bg-emerald-500/15 text-emerald-300'
                                                : 'border-[#3a3a44] bg-[#26262e] text-[#adadb8]',
                                        )}
                                    >
                                        {source.is_active ? '활성' : '비활성'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (isEditing) {
                                                setEditingSourceId(null)
                                                setEditingSourceIdentifier('')
                                                setEditingSourceDays([1])
                                                setEditingSourceHour('6')
                                                return
                                            }
                                            setEditingSourceId(source.id)
                                            setEditingSourceIdentifier(source.source_identifier)
                                            setEditingSourceDays([...source.crawl_days].sort((a, b) => a - b))
                                            setEditingSourceHour(String(source.crawl_hour))
                                        }}
                                        disabled={isSourcePending}
                                        className="cursor-pointer rounded-lg border border-[#3a3a44] px-2 py-1 text-[11px] font-medium text-[#adadb8] transition hover:bg-[#32323d] disabled:opacity-50"
                                    >
                                        {isEditing ? '취소' : '수정'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            void handleDeleteSource(source.id)
                                        }}
                                        disabled={isSourcePending}
                                        className="cursor-pointer rounded-lg border border-red-500/35 p-1.5 text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                                        aria-label="소스 삭제"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>

                                {isEditing && (
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            value={editingSourceIdentifier}
                                            onChange={(event) => setEditingSourceIdentifier(event.target.value)}
                                            className={inputClass}
                                            placeholder="치지직 채널 ID"
                                        />
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-[#adadb8]">요일</label>
                                            <div className="flex flex-wrap gap-1.5">
                                                {DAY_LABELS.map((label, day) => {
                                                    const selected = editingSourceDays.includes(day)
                                                    return (
                                                        <button
                                                            key={day}
                                                            type="button"
                                                            onClick={() => {
                                                                setEditingSourceDays((prev) =>
                                                                    selected
                                                                        ? prev.filter((item) => item !== day)
                                                                        : [...prev, day].sort((a, b) => a - b),
                                                                )
                                                            }}
                                                            className={cn(
                                                                'cursor-pointer rounded-full border px-2 py-1 text-xs font-semibold transition',
                                                                selected
                                                                    ? 'border-blue-500/40 bg-blue-500/15 text-blue-300'
                                                                    : 'border-[#3a3a44] bg-[#26262e] text-[#adadb8] hover:bg-[#32323d]',
                                                            )}
                                                        >
                                                            {label}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-[#adadb8]">시간</label>
                                            <select
                                                value={editingSourceHour}
                                                onChange={(event) => setEditingSourceHour(event.target.value)}
                                                className={cn(selectClass, 'w-28')}
                                            >
                                                {Array.from({ length: 24 }, (_, i) => (
                                                    <option key={i} value={i}>
                                                        {String(i).padStart(2, '0')}시
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    void handleUpdateSource()
                                                }}
                                                disabled={isSourcePending}
                                                className="cursor-pointer inline-flex items-center justify-center gap-1 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                                            >
                                                <Check className="h-3.5 w-3.5" /> 저장
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            ) : (
                <p className="text-xs text-[#848494]">등록된 수집 소스가 없습니다.</p>
            )}
        </div>
    )
}
