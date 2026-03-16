import { useEffect, useMemo, useRef, useState } from 'react'
import dayjs from 'dayjs'
import { Calendar, ChevronLeft, ChevronRight, Clock, Eye, EyeOff, FolderOpen, Gift, Pencil, Plus, Search, Tag, Trash2, Type, Users, X, Zap } from 'lucide-react'
import {
    useAdminToast,
    useAdminSchedule,
    useCategories,
    useCreateBroadcast,
    useDeleteBroadcast,
    useStreamers,
    useUpdateBroadcast,
} from '../hooks'
import type {
    BroadcastItem,
    BroadcastParticipantInput,
    CreateBroadcastRequest,
    DailyScheduleResponse,
    ScheduleParams,
    ScheduleResponse,
    StreamerItem,

    UpdateBroadcastRequest,
    WeeklyScheduleResponse,
} from '../types'
import { getErrorMessage } from '../utils/error'
import { cn } from '../lib/cn'
import { inputClass, panelClass, selectClass } from '../constants/styles'
import partnerMark from '../assets/mark.png'
import { ConfirmModal } from '../components/ConfirmModal'
import { ListEmpty, ListError, ListLoading } from '../components/ListState'

const KOREAN_DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']
const WEEKDAY_MON_TO_SUN = ['월', '화', '수', '목', '금', '토', '일']
const BROADCAST_TYPE_PRESETS = ['합방', '콘텐츠', '내전'] as const
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'))
const MINUTE_OPTIONS = ['00', '30'] as const

interface ParticipantDraft {
    name: string
    streamerId?: number
    isHost: boolean
}

interface BroadcastFormValues {
    title: string
    startDate: string
    startTime: string
    broadcastType: string
    categoryId: string
    tagsInput: string
    isVisible: boolean
    isDrops: boolean
    isChzzkSupport: boolean
    participants: ParticipantDraft[]
}

interface BroadcastFormModalProps {
    title: string
    submitLabel: string
    initialValues: BroadcastFormValues
    pending: boolean
    categories: { id: number; name: string }[]
    streamers: StreamerItem[]
    onClose: () => void
    onSubmit: (values: BroadcastFormValues) => Promise<void>
}

function getBroadcastTypeBadgeClass(type: string | null): string {
    if (type === '합방') return 'border-purple-500/40 bg-purple-500/15 text-purple-300'
    if (type === '콘텐츠') return 'border-blue-500/40 bg-blue-500/15 text-blue-300'
    if (type === '내전') return 'border-orange-500/40 bg-orange-500/15 text-orange-300'
    return 'border-[#4a4a58] bg-[#2a2a34] text-[#b5b5c0]'
}

function getInitialStartTime(date: dayjs.Dayjs): { date: string; time: string } {
    const currentHour = dayjs().hour()
    return {
        date: date.format('YYYY-MM-DD'),
        time: `${String(currentHour).padStart(2, '0')}:00`,
    }
}

function parseTags(tagsInput: string): string[] {
    return tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
}

function toDateParam(date: dayjs.Dayjs): string {
    return date.format('YYYY-MM-DD')
}

function getWeekStartMonday(date: dayjs.Dayjs): dayjs.Dayjs {
    const day = date.day()
    const diff = day === 0 ? -6 : 1 - day
    return date.add(diff, 'day').startOf('day')
}

function getWeekDatesMonday(date: dayjs.Dayjs): dayjs.Dayjs[] {
    const weekStart = getWeekStartMonday(date)
    return Array.from({ length: 7 }, (_, index) => weekStart.add(index, 'day'))
}

function getDateRangeText(view: 'daily' | 'weekly', selectedDate: dayjs.Dayjs): string {
    if (view === 'daily') {
        const dayName = KOREAN_DAY_NAMES[selectedDate.day()]
        return `${selectedDate.year()}년 ${selectedDate.month() + 1}월 ${selectedDate.date()}일 (${dayName})`
    }
    const weekStart = getWeekStartMonday(selectedDate)
    const weekEnd = weekStart.add(6, 'day')
    return `${weekStart.format('YYYY.M.D')} - ${weekEnd.format('M.D')}`
}

function toCreatePayload(values: BroadcastFormValues): CreateBroadcastRequest {
    const parsed = dayjs(`${values.startDate}T${values.startTime}`)
    const participants: BroadcastParticipantInput[] = values.participants.map((item) => ({
        name: item.name,
        streamerId: item.streamerId,
        isHost: item.isHost,
    }))

    return {
        title: values.title.trim(),
        startTime: parsed.isValid() ? parsed.toISOString() : dayjs().toISOString(),
        broadcastType: values.broadcastType.trim() || undefined,
        categoryId: values.categoryId.length > 0 ? Number(values.categoryId) : undefined,
        tags: parseTags(values.tagsInput),
        isVisible: values.isVisible,
        isDrops: values.isDrops,
        isChzzkSupport: values.isChzzkSupport,
        participants,
    }
}

function toUpdatePayload(values: BroadcastFormValues): UpdateBroadcastRequest {
    const parsed = dayjs(`${values.startDate}T${values.startTime}`)
    const participants: BroadcastParticipantInput[] = values.participants.map((item) => ({
        name: item.name,
        streamerId: item.streamerId,
        isHost: item.isHost,
    }))

    return {
        title: values.title.trim(),
        startTime: parsed.isValid() ? parsed.toISOString() : undefined,
        broadcastType: values.broadcastType.trim() || undefined,
        categoryId: values.categoryId.length > 0 ? Number(values.categoryId) : undefined,
        tags: parseTags(values.tagsInput),
        isVisible: values.isVisible,
        isDrops: values.isDrops,
        isChzzkSupport: values.isChzzkSupport,
        participants,
    }
}

function toFormValues(item: BroadcastItem | null, selectedDate: dayjs.Dayjs): BroadcastFormValues {
    if (item === null) {
        const initialStart = getInitialStartTime(selectedDate)
        return {
            title: '',
            startDate: initialStart.date,
            startTime: initialStart.time,
            broadcastType: '',
            categoryId: '',
            tagsInput: '',
            isVisible: true,
            isDrops: false,
            isChzzkSupport: false,
            participants: [],
        }
    }

    const parsed = dayjs(item.startTime)
    const initialStart = getInitialStartTime(selectedDate)

    return {
        title: item.title,
        startDate: parsed.isValid() ? parsed.format('YYYY-MM-DD') : initialStart.date,
        startTime: parsed.isValid() ? parsed.format('HH:mm') : initialStart.time,
        broadcastType: item.broadcastType ?? '',
        categoryId: item.category?.id !== undefined ? String(item.category.id) : '',
        tagsInput: item.tags.join(', '),
        isVisible: item.isVisible,
        isDrops: item.isDrops,
        isChzzkSupport: item.isChzzkSupport,
        participants: item.streamers.map((streamer) => ({
            name: streamer.name,
            streamerId: streamer.streamerId ?? undefined,
            isHost: streamer.isHost,
        })),
    }
}

function DailyView({
    data,
    onEdit,
    onDelete,
}: {
    data: DailyScheduleResponse
    onEdit: (item: BroadcastItem) => void
    onDelete: (item: BroadcastItem) => void
}) {
    return (
        <div className={panelClass}>
            <div className="grid grid-cols-[90px_minmax(180px,2fr)_82px_120px_minmax(160px,1.3fr)_140px_80px] items-center gap-3 border-b border-[#3a3a44] px-4 py-3 text-center text-xs font-semibold text-[#848494]">
                <div>시간</div>
                <div>제목</div>
                <div>유형</div>
                <div>카테고리</div>
                <div>참여자</div>
                <div>상태</div>
                <div>작업</div>
            </div>

            {data.items.length === 0 && <ListEmpty message="선택한 날짜에 방송 일정이 없습니다." />}

            {data.items.length > 0 && (
                <ul className="divide-y divide-[#3a3a44]">
                    {data.items
                        .slice()
                        .sort((a, b) => dayjs(a.startTime).valueOf() - dayjs(b.startTime).valueOf())
                        .map((item) => {
                            const visibleStreamers = item.streamers.slice(0, 5)
                            const hiddenCount = Math.max(0, item.streamers.length - 5)

                            return (
                                <li
                                    key={item.id}
                                    className="grid grid-cols-[90px_minmax(180px,2fr)_82px_120px_minmax(160px,1.3fr)_140px_80px] items-center gap-3 px-4 py-3"
                                >
                                    <div className="text-center text-sm tabular-nums text-[#efeff1]">{dayjs(item.startTime).format('HH:mm')}</div>

                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-[#efeff1]">{item.title}</p>
                                    </div>

                                    <div className="flex justify-center">
                                        <span
                                            className={cn(
                                                'rounded-full border px-2 py-0.5 text-[11px] font-semibold',
                                                getBroadcastTypeBadgeClass(item.broadcastType),
                                            )}
                                        >
                                            {item.broadcastType ?? '기타'}
                                        </span>
                                    </div>

                                    <div className="truncate text-center text-xs text-[#adadb8]">{item.category?.name ?? '-'}</div>

                                    <div className="flex items-center justify-center">
                                        {item.streamers.length > 0 ? (
                                            <div className="flex items-center -space-x-2">
                                                {visibleStreamers.map((streamer) => (
                                                    <div
                                                        key={`${item.id}-${streamer.id}`}
                                                        className="relative ring-2 ring-[#1a1a23] rounded-full"
                                                        title={streamer.name}
                                                    >
                                                        {streamer.avatarUrl ? (
                                                            <img
                                                                src={streamer.avatarUrl}
                                                                alt={streamer.name}
                                                                className="h-7 w-7 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2a2a34] text-[10px] font-semibold text-[#b8b8c3]">
                                                                {streamer.name.slice(0, 1)}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                {hiddenCount > 0 && (
                                                    <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-[#2a2a34] text-[10px] font-bold text-[#adadb8] ring-2 ring-[#1a1a23]">
                                                        +{hiddenCount}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-[#848494]">-</span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-center gap-1">
                                        <span
                                            className={cn(
                                                'rounded-full p-1',
                                                item.isVisible ? 'text-emerald-400' : 'text-red-400',
                                            )}
                                            title={item.isVisible ? '공개' : '비공개'}
                                        >
                                            {item.isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                                        </span>
                                        {item.isDrops && (
                                            <span className="rounded-full bg-blue-500/20 p-1 text-blue-300" title="드롭스">
                                                <Gift className="h-3.5 w-3.5" />
                                            </span>
                                        )}
                                        {item.isChzzkSupport && (
                                            <span className="rounded-full bg-orange-500/20 p-1 text-orange-300" title="치지직 후원">
                                                <Zap className="h-3.5 w-3.5" />
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-center gap-1.5">
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
                            )
                        })}
                </ul>
            )}
        </div>
    )
}

function WeeklyView({
    selectedDate,
    data,
    onEdit,
    onDelete,
}: {
    selectedDate: dayjs.Dayjs
    data: WeeklyScheduleResponse
    onEdit: (item: BroadcastItem) => void
    onDelete: (item: BroadcastItem) => void
}) {
    const daysByDate = useMemo(() => {
        const map = new Map<string, BroadcastItem[]>()
        for (const day of data.days) {
            map.set(day.date, day.items)
        }
        return map
    }, [data.days])

    const weekDates = useMemo(() => getWeekDatesMonday(selectedDate), [selectedDate])

    return (
        <div className={cn(panelClass, 'overflow-hidden')}>
            <div className="overflow-x-auto">
                <div className="grid min-w-[980px] grid-cols-7 divide-x divide-[#3a3a44]">
                    {weekDates.map((date, index) => {
                        const key = toDateParam(date)
                        const items = (daysByDate.get(key) ?? []).slice().sort((a, b) => dayjs(a.startTime).valueOf() - dayjs(b.startTime).valueOf())

                        return (
                            <div key={key} className="min-h-[420px] bg-[#1a1a23]">
                                <div className="border-b border-[#3a3a44] bg-[#20202a] px-3 py-2.5">
                                    <p className="text-[11px] text-[#848494]">{WEEKDAY_MON_TO_SUN[index]}</p>
                                    <p className="mt-0.5 text-sm font-semibold text-[#efeff1]">{date.format('M월 D일')}</p>
                                </div>

                                <div className="space-y-2 p-2.5">
                                    {items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="group flex items-start gap-1 rounded-lg border border-[#3a3a44] bg-[#26262e] px-2.5 py-2 transition hover:border-blue-500/40 hover:bg-[#2c2c37]"
                                        >
                                            <button
                                                type="button"
                                                onClick={() => onEdit(item)}
                                                className="min-w-0 flex-1 cursor-pointer text-left"
                                            >
                                                <p className="text-[11px] tabular-nums text-blue-300">{dayjs(item.startTime).format('HH:mm')}</p>
                                                <p className="mt-0.5 truncate text-xs font-medium text-[#efeff1]">{item.title}</p>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => onDelete(item)}
                                                className="shrink-0 cursor-pointer rounded p-0.5 text-[#848494] opacity-0 transition hover:text-red-400 group-hover:opacity-100"
                                                aria-label={`${item.title} 삭제`}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                    {items.length === 0 && <p className="pt-2 text-center text-xs text-[#666674]">일정 없음</p>}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}


function BroadcastFormModal({ title, submitLabel, initialValues, pending, categories, streamers, onClose, onSubmit }: BroadcastFormModalProps) {
    const [values, setValues] = useState<BroadcastFormValues>(initialValues)
    const [participantSearch, setParticipantSearch] = useState('')
    const [isParticipantOpen, setIsParticipantOpen] = useState(false)
    const [categorySearch, setCategorySearch] = useState('')
    const [isCategoryOpen, setIsCategoryOpen] = useState(false)
    const categoryDropdownRef = useRef<HTMLDivElement | null>(null)
    const participantDropdownRef = useRef<HTMLDivElement | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [linkingIndex, setLinkingIndex] = useState<number | null>(null)
    const linkingRef = useRef<HTMLDivElement | null>(null)

    const streamersById = useMemo(() => new Map(streamers.map((streamer) => [streamer.id, streamer])), [streamers])

    const selectedCategory = categories.find((category) => String(category.id) === values.categoryId) ?? null
    const filteredCategories = useMemo(() => {
        const keyword = categorySearch.trim().toLowerCase()
        if (keyword.length === 0) return categories
        return categories.filter((category) => category.name.toLowerCase().includes(keyword))
    }, [categories, categorySearch])

    const selectedStreamerIds = useMemo(() => {
        const ids = new Set<number>()
        for (const participant of values.participants) {
            if (participant.streamerId !== undefined) ids.add(participant.streamerId)
        }
        return ids
    }, [values.participants])

    const filteredParticipantStreamers = useMemo(() => {
        const keyword = participantSearch.trim().toLowerCase()
        const source = keyword.length === 0
            ? streamers
            : streamers.filter((streamer) =>
                streamer.name.toLowerCase().includes(keyword) || (streamer.nickname ?? '').toLowerCase().includes(keyword),
            )
        return source
            .filter((streamer) => !selectedStreamerIds.has(streamer.id))
            .slice(0, 50)
    }, [participantSearch, selectedStreamerIds, streamers])

    const affiliationTagPresets = useMemo(() => {
        const names = new Set<string>()
        for (const participant of values.participants) {
            if (participant.streamerId === undefined) continue
            const streamer = streamersById.get(participant.streamerId)
            if (streamer === undefined) continue
            for (const affiliation of streamer.affiliations) {
                const name = affiliation.name.trim()
                if (name.length > 0) names.add(name)
            }
        }
        return Array.from(names)
    }, [streamersById, values.participants])

    const linkingSuggestions = useMemo(() => {
        if (linkingIndex === null) return []
        const participant = values.participants[linkingIndex]
        if (participant === undefined || participant.streamerId !== undefined) return []
        const keyword = participant.name.toLowerCase()
        return streamers
            .filter((s) => s.name.toLowerCase().includes(keyword) || (s.nickname ?? '').toLowerCase().includes(keyword))
            .slice(0, 8)
    }, [linkingIndex, values.participants, streamers])

    const [hourFromStartTime, minuteFromStartTime] = values.startTime.split(':')
    const selectedHour = HOUR_OPTIONS.includes(hourFromStartTime) ? hourFromStartTime : '00'
    const selectedMinute = minuteFromStartTime === '30' ? '30' : '00'

    useEffect(() => {
        function handleOutsideClick(event: MouseEvent): void {
            if (categoryDropdownRef.current !== null && !categoryDropdownRef.current.contains(event.target as Node)) {
                setIsCategoryOpen(false)
            }
            if (participantDropdownRef.current !== null && !participantDropdownRef.current.contains(event.target as Node)) {
                setIsParticipantOpen(false)
            }
            if (linkingRef.current !== null && !linkingRef.current.contains(event.target as Node)) {
                setLinkingIndex(null)
            }
        }

        function handleEscape(event: KeyboardEvent): void {
            if (event.key === 'Escape') {
                setIsCategoryOpen(false)
                setIsParticipantOpen(false)
                setLinkingIndex(null)
            }
        }

        window.addEventListener('mousedown', handleOutsideClick)
        window.addEventListener('keydown', handleEscape)

        return () => {
            window.removeEventListener('mousedown', handleOutsideClick)
            window.removeEventListener('keydown', handleEscape)
        }
    }, [])

    function addParticipantFromStreamer(streamer: StreamerItem): void {
        setValues((prev) => {
            if (prev.participants.some((participant) => participant.streamerId === streamer.id)) {
                return prev
            }
            return {
                ...prev,
                participants: [
                    ...prev.participants,
                    { name: streamer.name, streamerId: streamer.id, isHost: prev.participants.length === 0 },
                ],
            }
        })
        setParticipantSearch('')
        setIsParticipantOpen(false)
    }

    function addGuestParticipant(name: string): void {
        const trimmed = name.trim()
        if (trimmed.length === 0) return
        setValues((prev) => ({
            ...prev,
            participants: [...prev.participants, { name: trimmed, isHost: prev.participants.length === 0 }],
        }))
        setParticipantSearch('')
        setIsParticipantOpen(false)
    }

    async function handleSubmit(): Promise<void> {
        if (values.title.trim().length === 0) {
            setError('제목은 필수입니다.')
            return
        }
        if (values.startDate.trim().length === 0 || values.startTime.trim().length === 0) {
            setError('시작 날짜와 시간을 확인해 주세요.')
            return
        }
        if (!dayjs(`${values.startDate}T${values.startTime}`).isValid()) {
            setError('시작 시간을 확인해 주세요.')
            return
        }

        setError(null)
        await onSubmit(values)
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={(event) => {
                if (event.target === event.currentTarget && !pending) onClose()
            }}
        >
            <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[#3a3a44] bg-[#1a1a23] shadow-xl">
                <div className="flex items-start justify-between border-b border-[#3a3a44] px-6 py-4">
                    <div>
                        <h2 className="text-base font-bold text-[#efeff1]">{title}</h2>
                        <p className="mt-1 text-xs text-[#adadb8]">방송 일정 정보를 입력합니다.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            role="switch"
                            aria-checked={values.isVisible}
                            onClick={() => setValues((prev) => ({ ...prev, isVisible: !prev.isVisible }))}
                            disabled={pending}
                            className="cursor-pointer inline-flex items-center gap-2 rounded-full border border-[#3a3a44] bg-[#26262e] px-2 py-1 text-xs font-medium text-[#efeff1] disabled:opacity-50"
                        >
                            <span className="text-[#adadb8]">유저 웹 노출</span>
                            <span
                                className={cn(
                                    'relative inline-flex h-5 w-9 items-center rounded-full transition',
                                    values.isVisible ? 'bg-emerald-500/80' : 'bg-[#4b4b57]',
                                )}
                            >
                                <span
                                    className={cn(
                                        'inline-block h-4 w-4 rounded-full bg-white transition',
                                        values.isVisible ? 'translate-x-4' : 'translate-x-0.5',
                                    )}
                                />
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={pending}
                            className="cursor-pointer rounded-lg border border-[#3a3a44] p-1.5 text-[#adadb8] transition hover:bg-[#26262e] disabled:opacity-50"
                            aria-label="닫기"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="max-h-[68vh] space-y-4 overflow-auto px-6 py-4">
                    <div className="space-y-1">
                        <label className="flex items-center gap-1.5 text-xs font-medium text-[#adadb8]">
                            <Type className="h-3.5 w-3.5" /> 제목 <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={values.title}
                            onChange={(event) => setValues((prev) => ({ ...prev, title: event.target.value }))}
                            className={inputClass}
                            placeholder="방송 제목"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-1.5 text-xs font-medium text-[#adadb8]"><Tag className="h-3.5 w-3.5" /> 타입 / 속성</label>
                        <div className="flex flex-wrap gap-1.5">
                            {BROADCAST_TYPE_PRESETS.map((preset) => {
                                const selected = values.broadcastType === preset
                                return (
                                    <button
                                        key={preset}
                                        type="button"
                                        onClick={() => {
                                            setValues((prev) => ({ ...prev, broadcastType: selected ? '' : preset }))
                                        }}
                                        className={cn(
                                            'cursor-pointer rounded-full border px-2.5 py-1 text-xs font-semibold transition',
                                            selected
                                                ? getBroadcastTypeBadgeClass(preset)
                                                : 'border-[#3a3a44] bg-[#26262e] text-[#adadb8] hover:bg-[#32323d]',
                                        )}
                                    >
                                        {preset}
                                    </button>
                                )
                            })}
                            <span className="mx-0.5 self-center text-[#3a3a44]">|</span>
                            <button
                                type="button"
                                onClick={() => setValues((prev) => ({ ...prev, isChzzkSupport: !prev.isChzzkSupport }))}
                                className={cn(
                                    'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition',
                                    values.isChzzkSupport
                                        ? 'border-orange-500/40 bg-orange-500/15 text-orange-300'
                                        : 'border-[#3a3a44] bg-[#26262e] text-[#adadb8] hover:bg-[#32323d]',
                                )}
                            >
                                <Zap className="h-3 w-3" /> 제작지원
                            </button>
                            <button
                                type="button"
                                onClick={() => setValues((prev) => ({ ...prev, isDrops: !prev.isDrops }))}
                                className={cn(
                                    'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition',
                                    values.isDrops
                                        ? 'border-blue-500/40 bg-blue-500/15 text-blue-300'
                                        : 'border-[#3a3a44] bg-[#26262e] text-[#adadb8] hover:bg-[#32323d]',
                                )}
                            >
                                <Gift className="h-3 w-3" /> 드롭스
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="flex items-center gap-1.5 text-xs font-medium text-[#adadb8]">
                            <Clock className="h-3.5 w-3.5" /> 시간 <span className="text-red-400">*</span>
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={values.startDate}
                                onChange={(event) => setValues((prev) => ({ ...prev, startDate: event.target.value }))}
                                className={cn(inputClass, 'w-auto flex-1')}
                            />
                            <select
                                value={selectedHour}
                                onChange={(event) => {
                                    const hour = event.target.value
                                    setValues((prev) => ({ ...prev, startTime: `${hour}:${selectedMinute}` }))
                                }}
                                className={cn(selectClass, 'w-auto')}
                            >
                                {HOUR_OPTIONS.map((hour) => (
                                    <option key={hour} value={hour}>
                                        {hour}시
                                    </option>
                                ))}
                            </select>
                            <span className="text-sm font-bold text-[#848494]">:</span>
                            <select
                                value={selectedMinute}
                                onChange={(event) => {
                                    const minute = event.target.value
                                    setValues((prev) => ({ ...prev, startTime: `${selectedHour}:${minute}` }))
                                }}
                                className={cn(selectClass, 'w-auto')}
                            >
                                {MINUTE_OPTIONS.map((minute) => (
                                    <option key={minute} value={minute}>
                                        {minute}분
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className="space-y-1" ref={categoryDropdownRef}>
                            <label className="flex items-center gap-1.5 text-xs font-medium text-[#adadb8]"><FolderOpen className="h-3.5 w-3.5" /> 게임/카테고리</label>
                            {selectedCategory === null ? (
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#7e7e8c]" />
                                    <input
                                        type="text"
                                        value={categorySearch}
                                        onChange={(event) => {
                                            setCategorySearch(event.target.value)
                                            setIsCategoryOpen(true)
                                        }}
                                        onFocus={() => setIsCategoryOpen(true)}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Escape') {
                                                setIsCategoryOpen(false)
                                            }
                                        }}
                                        className={cn(inputClass, 'pl-9')}
                                        placeholder="카테고리 검색"
                                    />

                                    {isCategoryOpen && (
                                        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-[#3a3a44] bg-[#1f1f28] shadow-xl">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setValues((prev) => ({ ...prev, categoryId: '' }))
                                                    setCategorySearch('')
                                                    setIsCategoryOpen(false)
                                                }}
                                                className="w-full cursor-pointer border-b border-[#32323d] px-3 py-2 text-left text-xs font-medium text-[#c4c4ce] transition hover:bg-[#2a2a34]"
                                            >
                                                없음
                                            </button>
                                            <div className="max-h-48 overflow-auto">
                                                {filteredCategories.length === 0 ? (
                                                    <p className="px-3 py-2 text-xs text-[#848494]">검색 결과가 없습니다.</p>
                                                ) : (
                                                    filteredCategories.map((category) => (
                                                        <button
                                                            key={category.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setValues((prev) => ({ ...prev, categoryId: String(category.id) }))
                                                                setCategorySearch('')
                                                                setIsCategoryOpen(false)
                                                            }}
                                                            className="w-full cursor-pointer px-3 py-2 text-left text-sm text-[#efeff1] transition hover:bg-[#2a2a34]"
                                                        >
                                                            {category.name}
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <div className="inline-flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-2">
                                        <span className="text-sm font-medium text-blue-200">{selectedCategory.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setValues((prev) => ({ ...prev, categoryId: '' }))
                                                setCategorySearch('')
                                            }}
                                            className="cursor-pointer rounded-full p-0.5 text-blue-200 transition hover:bg-blue-500/20"
                                            aria-label="카테고리 선택 해제"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label className="flex items-center gap-1.5 text-xs font-medium text-[#adadb8]"><Tag className="h-3.5 w-3.5" /> 태그</label>
                            <input
                                type="text"
                                value={values.tagsInput}
                                onChange={(event) => setValues((prev) => ({ ...prev, tagsInput: event.target.value }))}
                                className={inputClass}
                                placeholder="예: 인챈트, 허니즈"
                            />
                            <div className="flex flex-wrap gap-1.5">
                                {affiliationTagPresets.map((preset) => {
                                    const currentTags = parseTags(values.tagsInput)
                                    const active = currentTags.includes(preset)
                                    return (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() => {
                                                const nextTags = active
                                                    ? currentTags.filter((tag) => tag !== preset)
                                                    : [...currentTags, preset]
                                                setValues((prev) => ({ ...prev, tagsInput: nextTags.join(', ') }))
                                            }}
                                            className={cn(
                                                'cursor-pointer rounded-full border px-2.5 py-1 text-xs font-semibold transition',
                                                active
                                                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                                                    : 'border-[#3a3a44] bg-[#26262e] text-[#adadb8] hover:bg-[#32323d]',
                                            )}
                                        >
                                            #{preset}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-[#3a3a44]" />

                    <div className="space-y-2 rounded-xl border border-[#3a3a44] bg-[#20202a] p-3">
                        <div className="flex items-center justify-between gap-2">
                            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-[#efeff1]"><Users className="h-4 w-4" /> 참석자 관리</h3>
                            <p className="text-[11px] text-[#848494]">스트리머 검색 또는 직접 추가</p>
                        </div>

                        <div className="space-y-2">
                            {values.participants.map((participant, index) => (
                                <div key={`${participant.name}-${index}`} className="flex items-center justify-between gap-3 rounded-xl border border-[#3a3a44] bg-[#26262e] px-3 py-2">
                                     <div className="relative flex min-w-0 items-center gap-2.5" ref={linkingIndex === index ? linkingRef : undefined}>
                                        {(() => {
                                            const imgUrl = participant.streamerId !== undefined ? streamersById.get(participant.streamerId)?.channelImageUrl : undefined
                                            return imgUrl && imgUrl.trim().length > 0 ? (
                                                <img src={imgUrl} alt={participant.name} className="h-8 w-8 shrink-0 rounded-full border border-[#3a3a44] object-cover" />
                                            ) : (
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#3a3a44] bg-[#20202a] text-xs font-semibold text-[#b8b8c3]">
                                                    {participant.name.slice(0, 1)}
                                                </div>
                                            )
                                        })()}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (participant.streamerId === undefined) {
                                                    setLinkingIndex(linkingIndex === index ? null : index)
                                                }
                                            }}
                                            className={cn(
                                                'flex min-w-0 items-center gap-1.5',
                                                participant.streamerId === undefined
                                                    ? 'cursor-pointer rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-2 py-0.5 transition hover:bg-amber-500/10'
                                                    : '',
                                            )}
                                        >
                                            <span className={cn('truncate text-sm font-medium', participant.streamerId === undefined ? 'text-amber-200' : 'text-[#efeff1]')}>
                                                {participant.name}
                                            </span>
                                            {participant.streamerId !== undefined && streamersById.get(participant.streamerId)?.isPartner && (
                                                <img src={partnerMark} alt="파트너" className="h-4 w-4 shrink-0" />
                                            )}
                                            {participant.streamerId === undefined && (
                                                <span className="shrink-0 text-[10px] text-amber-400">미연결</span>
                                            )}
                                        </button>
                                        {linkingIndex === index && linkingSuggestions.length > 0 && (
                                            <div className="absolute left-0 top-full z-20 mt-1 w-64 overflow-hidden rounded-xl border border-[#3a3a44] bg-[#1f1f28] shadow-xl">
                                                <p className="border-b border-[#32323d] px-3 py-1.5 text-[11px] font-medium text-[#848494]">스트리머 연결</p>
                                                <div className="max-h-48 overflow-auto">
                                                    {linkingSuggestions.map((s) => (
                                                        <button
                                                            key={s.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setValues((prev) => ({
                                                                    ...prev,
                                                                    participants: prev.participants.map((item, itemIndex) =>
                                                                        itemIndex === index ? { ...item, name: s.name, streamerId: s.id } : item,
                                                                    ),
                                                                }))
                                                                setLinkingIndex(null)
                                                            }}
                                                            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left transition hover:bg-[#2a2a34]"
                                                        >
                                                            {s.channelImageUrl && s.channelImageUrl.trim().length > 0 ? (
                                                                <img src={s.channelImageUrl} alt={s.name} className="h-7 w-7 rounded-full border border-[#3a3a44] object-cover" />
                                                            ) : (
                                                                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#3a3a44] bg-[#26262e] text-[11px] font-semibold text-[#b8b8c3]">
                                                                    {s.name.slice(0, 1)}
                                                                </div>
                                                            )}
                                                            <div className="flex min-w-0 items-center gap-1.5">
                                                                <span className="truncate text-sm text-[#efeff1]">{s.name}</span>
                                                                {s.isPartner && <img src={partnerMark} alt="파트너" className="h-4 w-4 shrink-0" />}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {linkingIndex === index && linkingSuggestions.length === 0 && (
                                            <div className="absolute left-0 top-full z-20 mt-1 w-64 overflow-hidden rounded-xl border border-[#3a3a44] bg-[#1f1f28] px-3 py-2 shadow-xl">
                                                <p className="text-xs text-[#848494]">일치하는 스트리머가 없습니다.</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setValues((prev) => ({
                                                    ...prev,
                                                    participants: prev.participants.map((item, itemIndex) =>
                                                        itemIndex === index ? { ...item, isHost: !item.isHost } : item,
                                                    ),
                                                }))
                                            }}
                                            className={cn(
                                                'cursor-pointer rounded-lg border px-2 py-1 text-xs font-semibold transition',
                                                participant.isHost
                                                    ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
                                                    : 'border-[#3a3a44] bg-[#2f2f39] text-[#adadb8] hover:bg-[#3a3a46]',
                                            )}
                                        >
                                            주최
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setValues((prev) => ({
                                                    ...prev,
                                                    participants: prev.participants.filter((_, itemIndex) => itemIndex !== index),
                                                }))
                                            }}
                                            className="cursor-pointer rounded-lg border border-red-500/30 bg-red-500/5 px-2 py-1 text-xs font-semibold text-red-300 transition hover:bg-red-500/15"
                                            aria-label={`${participant.name} 삭제`}
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {values.participants.length === 0 && <p className="py-3 text-center text-xs text-[#848494]">등록된 참석자가 없습니다.</p>}
                        </div>

                        <div className="relative flex gap-2" ref={participantDropdownRef}>
                            <div className="relative flex-1">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#7e7e8c]" />
                                <input
                                    type="text"
                                    value={participantSearch}
                                    onChange={(event) => {
                                        setParticipantSearch(event.target.value)
                                        setIsParticipantOpen(true)
                                    }}
                                    onFocus={() => setIsParticipantOpen(true)}
                                    onKeyDown={(event) => {
                                        if (event.nativeEvent.isComposing) return
                                        if (event.key === 'Escape') {
                                            setIsParticipantOpen(false)
                                            return
                                        }
                                        if (event.key === 'Enter') {
                                            event.preventDefault()
                                            const keyword = participantSearch.trim()
                                            if (keyword.length === 0) return
                                            const exact = filteredParticipantStreamers.find((streamer) => streamer.name.toLowerCase() === keyword.toLowerCase())
                                            if (exact !== undefined) {
                                                addParticipantFromStreamer(exact)
                                                return
                                            }
                                            if (filteredParticipantStreamers.length === 0) {
                                                addGuestParticipant(keyword)
                                            }
                                        }
                                    }}
                                    className={cn(inputClass, 'pl-9')}
                                    placeholder="참석자 이름 또는 스트리머 검색"
                                />
                                {isParticipantOpen && (
                                    <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-[#3a3a44] bg-[#1f1f28] shadow-xl">
                                        <div className="max-h-48 overflow-auto">
                                            {filteredParticipantStreamers.length === 0 ? (
                                                <p className="px-3 py-2 text-xs text-[#848494]">검색 결과가 없습니다. 엔터 또는 추가 버튼으로 게스트를 등록하세요.</p>
                                            ) : (
                                                filteredParticipantStreamers.map((streamer) => (
                                                    <button
                                                        key={streamer.id}
                                                        type="button"
                                                        onClick={() => addParticipantFromStreamer(streamer)}
                                                        className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left transition hover:bg-[#2a2a34]"
                                                    >
                                                        {streamer.channelImageUrl && streamer.channelImageUrl.trim().length > 0 ? (
                                                            <img
                                                                src={streamer.channelImageUrl}
                                                                alt={`${streamer.name} 프로필`}
                                                                className="h-7 w-7 rounded-full border border-[#3a3a44] object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#3a3a44] bg-[#26262e] text-[11px] font-semibold text-[#b8b8c3]">
                                                                {streamer.name.slice(0, 1)}
                                                            </div>
                                                        )}
                                                        <div className="flex min-w-0 items-center gap-1.5">
                                                            <span className="truncate text-sm text-[#efeff1]">{streamer.name}</span>
                                                            {streamer.isPartner && <img src={partnerMark} alt="파트너" className="h-4 w-4 shrink-0" />}
                                                        </div>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    const keyword = participantSearch.trim()
                                    if (keyword.length === 0) return
                                    const exact = filteredParticipantStreamers.find((streamer) => streamer.name.toLowerCase() === keyword.toLowerCase())
                                    if (exact !== undefined) {
                                        addParticipantFromStreamer(exact)
                                        return
                                    }
                                    addGuestParticipant(keyword)
                                }}
                                className="cursor-pointer rounded-xl border border-[#3a3a44] bg-[#26262e] px-3 py-2 text-xs font-semibold text-[#efeff1] transition hover:bg-[#2e2e39]"
                            >
                                추가
                            </button>
                        </div>
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
                        {pending ? '저장 중...' : submitLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function BroadcastSchedulePage() {
    const { addToast } = useAdminToast()

    const [view, setView] = useState<'daily' | 'weekly'>('daily')
    const [selectedDate, setSelectedDate] = useState(dayjs())
    const [hiddenOnly, setHiddenOnly] = useState(false)
    const [creating, setCreating] = useState(false)
    const [editingItem, setEditingItem] = useState<BroadcastItem | null>(null)
    const [deletingItem, setDeletingItem] = useState<BroadcastItem | null>(null)

    const scheduleParams: ScheduleParams = useMemo(
        () => ({
            view,
            date: toDateParam(selectedDate),
        }),
        [view, selectedDate],
    )

    const { data, isLoading, isError } = useAdminSchedule(scheduleParams)
    const { data: categories = [] } = useCategories()
    const { data: streamersData } = useStreamers({ size: 1000 })
    const createMutation = useCreateBroadcast()
    const updateMutation = useUpdateBroadcast()
    const deleteMutation = useDeleteBroadcast()
    const streamers = streamersData?.items ?? []

    const categoryOptions = useMemo(() => categories.map((category) => ({ id: category.id, name: category.name })), [categories])

    function moveDate(direction: 1 | -1): void {
        if (view === 'daily') {
            setSelectedDate((prev) => prev.add(direction, 'day'))
            return
        }
        setSelectedDate((prev) => prev.add(direction, 'week'))
    }

    function handleViewChange(nextView: 'daily' | 'weekly'): void {
        setView(nextView)
    }

    async function handleCreate(values: BroadcastFormValues): Promise<void> {
        try {
            await createMutation.mutateAsync(toCreatePayload(values))
            addToast({ message: '방송 일정이 추가되었습니다.', variant: 'success' })
            setCreating(false)
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    async function handleUpdate(values: BroadcastFormValues): Promise<void> {
        if (editingItem === null) return

        try {
            await updateMutation.mutateAsync({ id: editingItem.id, body: toUpdatePayload(values) })
            addToast({ message: '방송 일정이 수정되었습니다.', variant: 'success' })
            setEditingItem(null)
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    async function handleDelete(): Promise<void> {
        if (deletingItem === null) return
        try {
            await deleteMutation.mutateAsync(deletingItem.id)
            addToast({ message: '방송 일정이 삭제되었습니다.', variant: 'success' })
            setDeletingItem(null)
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    function filterHidden(items: BroadcastItem[]): BroadcastItem[] {
        if (!hiddenOnly) return items
        return items.filter((item) => !item.isVisible)
    }

    function renderContent(schedule: ScheduleResponse | undefined) {
        if (isLoading) return <ListLoading className="py-24" />
        if (isError) return <ListError message="일정을 불러오는 중 오류가 발생했습니다." className="py-24" />
        if (schedule === undefined) return <ListEmpty message="일정 데이터가 없습니다." className="py-24" />

        if (schedule.view === 'daily') {
            const filtered = { ...schedule, items: filterHidden(schedule.items) }
            return <DailyView data={filtered} onEdit={setEditingItem} onDelete={setDeletingItem} />
        }
        if (schedule.view === 'weekly') {
            const filtered = { ...schedule, days: schedule.days.map((day) => ({ ...day, items: filterHidden(day.items) })) }
            return <WeeklyView selectedDate={selectedDate} data={filtered} onEdit={setEditingItem} onDelete={setDeletingItem} />
        }
        return null
    }

    const isFormPending = createMutation.isPending || updateMutation.isPending

    return (
        <>
            <div className="mb-6 flex items-start justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-[#efeff1]">일정 관리</h1>
                    <p className="mt-1 text-sm text-[#adadb8]">방송 일정을 관리합니다</p>
                </div>
                <button
                    type="button"
                    onClick={() => setCreating(true)}
                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                    <Plus className="h-4 w-4" />
                    일정 추가
                </button>
            </div>

            <div className={cn(panelClass, 'mb-4 flex flex-wrap items-center justify-between gap-3 px-4 py-3')}>
                <div className="flex items-center gap-2">
                    <div className="inline-flex rounded-xl border border-[#3a3a44] bg-[#26262e] p-1">
                        <button
                            type="button"
                            onClick={() => handleViewChange('daily')}
                            className={cn(
                                'cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                                view === 'daily' ? 'bg-blue-600 text-white' : 'text-[#adadb8] hover:bg-[#32323d]',
                            )}
                        >
                            일간
                        </button>
                        <button
                            type="button"
                            onClick={() => handleViewChange('weekly')}
                            className={cn(
                                'cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                                view === 'weekly' ? 'bg-blue-600 text-white' : 'text-[#adadb8] hover:bg-[#32323d]',
                            )}
                        >
                            주간
                        </button>

                    </div>

                    <div className="ml-1 flex items-center gap-1.5 text-[#efeff1]">
                        <Calendar className="h-4 w-4 text-[#848494]" />
                        <span className="text-sm font-semibold">{getDateRangeText(view, selectedDate)}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setHiddenOnly((prev) => !prev)}
                        className={cn(
                            'cursor-pointer inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold transition',
                            hiddenOnly
                                ? 'border-red-500/50 bg-red-500/10 text-red-300'
                                : 'border-[#3a3a44] bg-[#26262e] text-[#adadb8] hover:bg-[#2d2d36]',
                        )}
                    >
                        <EyeOff className="h-3.5 w-3.5" />
                        미노출
                    </button>
                    <button
                        type="button"
                        onClick={() => moveDate(-1)}
                        className="cursor-pointer rounded-lg border border-[#3a3a44] bg-[#26262e] p-1.5 text-[#adadb8] transition hover:bg-[#2d2d36]"
                        aria-label="이전"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => moveDate(1)}
                        className="cursor-pointer rounded-lg border border-[#3a3a44] bg-[#26262e] p-1.5 text-[#adadb8] transition hover:bg-[#2d2d36]"
                        aria-label="다음"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedDate(dayjs())}
                        className="cursor-pointer rounded-lg border border-[#3a3a44] bg-[#26262e] px-3 py-1.5 text-xs font-semibold text-[#efeff1] transition hover:bg-[#2d2d36]"
                    >
                        오늘
                    </button>
                </div>
            </div>

            {renderContent(data)}

            {creating && (
                <BroadcastFormModal
                    title="일정 추가"
                    submitLabel="저장"
                    initialValues={toFormValues(null, selectedDate)}
                    pending={isFormPending}
                    categories={categoryOptions}
                    streamers={streamers}
                    onClose={() => setCreating(false)}
                    onSubmit={handleCreate}
                />
            )}

            {editingItem !== null && (
                <BroadcastFormModal
                    title="일정 수정"
                    submitLabel="저장"
                    initialValues={toFormValues(editingItem, selectedDate)}
                    pending={isFormPending}
                    categories={categoryOptions}
                    streamers={streamers}
                    onClose={() => setEditingItem(null)}
                    onSubmit={handleUpdate}
                />
            )}

            {deletingItem !== null && (
                <ConfirmModal
                    title="일정 삭제"
                    message="방송 일정을 삭제하시겠습니까?"
                    itemName={deletingItem.title}
                    pending={deleteMutation.isPending}
                    onClose={() => setDeletingItem(null)}
                    onConfirm={() => {
                        void handleDelete()
                    }}
                />
            )}
        </>
    )
}
