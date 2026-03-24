import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { Clock, ExternalLink, Gift, ImageIcon, MessageSquare, Tag, Type, X, Zap } from 'lucide-react'
import type { BroadcastFormModalProps, BroadcastFormValues } from './types'
import { BROADCAST_TYPE_PRESETS, HOUR_OPTIONS, MINUTE_OPTIONS, getBroadcastTypeBadgeClass, parseTags } from './utils'
import { cn } from '../../lib/cn'
import { inputClass, selectClass } from '../../constants/styles'
import { ModalOverlay } from '../ModalOverlay'
import { CategorySelector } from './CategorySelector'
import { ParticipantManager } from './ParticipantManager'

export function BroadcastFormModal({ title, submitLabel, initialValues, pending, categories, streamers, sourceInfo, onClose, onSubmit }: BroadcastFormModalProps) {
    const [values, setValues] = useState<BroadcastFormValues>(initialValues)
    const [error, setError] = useState<string | null>(null)

    const streamersById = useMemo(() => new Map(streamers.map((streamer) => [streamer.id, streamer])), [streamers])

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

    const [hourFromStartTime, minuteFromStartTime] = values.startTime.split(':')
    const selectedHour = HOUR_OPTIONS.includes(hourFromStartTime) ? hourFromStartTime : '00'
    const selectedMinute = minuteFromStartTime === '30' ? '30' : '00'

    async function handleSubmit(): Promise<void> {
        if (values.title.trim().length === 0) {
            setError('제목은 필수입니다.')
            return
        }
        if (!values.isUndecidedTime) {
            if (values.startDate.trim().length === 0 || values.startTime.trim().length === 0) {
                setError('시작 날짜와 시간을 확인해 주세요.')
                return
            }
            if (!dayjs(`${values.startDate}T${values.startTime}`).isValid()) {
                setError('시작 시간을 확인해 주세요.')
                return
            }
        }

        setError(null)
        await onSubmit(values)
    }

    return (
        <ModalOverlay size="2xl" disabled={pending} onClose={onClose}>
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
                {(sourceInfo?.sourceImageUrl || sourceInfo?.sourceUrl) && (
                    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#3a3a44] bg-[#1f1f28] px-3.5 py-2.5">
                        <span className="text-xs font-medium text-[#848494]">출처</span>
                        {sourceInfo.sourceImageUrl && (
                            <a href={sourceInfo.sourceImageUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-[#3a3a44] px-2 py-1 text-xs text-[#adadb8] transition hover:border-blue-500/40 hover:text-blue-300">
                                <ImageIcon className="h-3 w-3 shrink-0" />
                                <span className="max-w-[200px] truncate">{sourceInfo.sourceImageUrl}</span>
                                <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-50" />
                            </a>
                        )}
                        {sourceInfo.sourceUrl && (
                            <a href={sourceInfo.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-[#3a3a44] px-2 py-1 text-xs text-[#adadb8] transition hover:border-blue-500/40 hover:text-blue-300">
                                <MessageSquare className="h-3 w-3" />
                                커뮤니티
                                <ExternalLink className="h-2.5 w-2.5 opacity-50" />
                            </a>
                        )}
                    </div>
                )}

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
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 text-xs font-medium text-[#adadb8]">
                            <Clock className="h-3.5 w-3.5" /> 시간
                        </label>
                        <button
                            type="button"
                            onClick={() => setValues((prev) => ({ ...prev, isUndecidedTime: !prev.isUndecidedTime }))}
                            className={cn(
                                'cursor-pointer rounded-full border px-2.5 py-1 text-[11px] font-semibold transition',
                                values.isUndecidedTime
                                    ? 'border-amber-500/40 bg-amber-500/15 text-amber-300'
                                    : 'border-[#3a3a44] bg-[#26262e] text-[#adadb8] hover:bg-[#32323d]',
                            )}
                        >
                            미정
                        </button>
                    </div>
                    {values.isUndecidedTime ? (
                        <div className="flex items-center justify-center rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 py-3 text-xs text-amber-300">
                            시작 시간 미정
                        </div>
                    ) : (
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
                    )}
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <CategorySelector
                        categories={categories}
                        selectedId={values.categoryId}
                        onChange={(categoryId) => {
                            setValues((prev) => ({ ...prev, categoryId }))
                        }}
                    />

                    <div className="space-y-1">
                        <label className="flex items-center gap-1.5 text-xs font-medium text-[#adadb8]"><Tag className="h-3.5 w-3.5" /> 태그</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={values.tagsInput}
                                onChange={(event) => setValues((prev) => ({ ...prev, tagsInput: event.target.value }))}
                                className={cn(inputClass, values.tagsInput.length > 0 ? 'pr-8' : '')}
                                placeholder="예: 인챈트, 허니즈"
                            />
                            {values.tagsInput.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setValues((prev) => ({ ...prev, tagsInput: '' }))}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-0.5 text-[#7e7e8c] transition hover:bg-[#3a3a44] hover:text-[#efeff1]"
                                    aria-label="태그 초기화"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
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

                <ParticipantManager
                    participants={values.participants}
                    streamers={streamers}
                    onChange={(participants) => {
                        setValues((prev) => ({ ...prev, participants }))
                    }}
                />

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
        </ModalOverlay>
    )
}
