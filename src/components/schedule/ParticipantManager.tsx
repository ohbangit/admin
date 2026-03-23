import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, Users } from 'lucide-react'
import type { StreamerItem } from '../../types'
import { cn } from '../../lib/cn'
import { inputClass } from '../../constants/styles'
import partnerMark from '../../assets/mark.png'
import type { ParticipantDraft } from './types'

interface ParticipantManagerProps {
    participants: ParticipantDraft[]
    streamers: StreamerItem[]
    onChange: (participants: ParticipantDraft[]) => void
}

export function ParticipantManager({ participants, streamers, onChange }: ParticipantManagerProps) {
    const [participantSearch, setParticipantSearch] = useState('')
    const [isParticipantOpen, setIsParticipantOpen] = useState(false)
    const [linkingIndex, setLinkingIndex] = useState<number | null>(null)
    const participantDropdownRef = useRef<HTMLDivElement | null>(null)
    const linkingRef = useRef<HTMLDivElement | null>(null)

    const streamersById = useMemo(() => new Map(streamers.map((streamer) => [streamer.id, streamer])), [streamers])

    const selectedStreamerIds = useMemo(() => {
        const ids = new Set<number>()
        for (const participant of participants) {
            if (participant.streamerId !== undefined) ids.add(participant.streamerId)
        }
        return ids
    }, [participants])

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

    const linkingSuggestions = useMemo(() => {
        if (linkingIndex === null) return []
        const participant = participants[linkingIndex]
        if (participant === undefined || participant.streamerId !== undefined) return []
        const keyword = participant.name.toLowerCase()
        return streamers
            .filter((s) => s.name.toLowerCase().includes(keyword) || (s.nickname ?? '').toLowerCase().includes(keyword))
            .slice(0, 8)
    }, [linkingIndex, participants, streamers])

    useEffect(() => {
        function handleOutsideClick(event: MouseEvent): void {
            if (participantDropdownRef.current !== null && !participantDropdownRef.current.contains(event.target as Node)) {
                setIsParticipantOpen(false)
            }
            if (linkingRef.current !== null && !linkingRef.current.contains(event.target as Node)) {
                setLinkingIndex(null)
            }
        }

        function handleEscape(event: KeyboardEvent): void {
            if (event.key === 'Escape') {
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
        if (participants.some((participant) => participant.streamerId === streamer.id)) {
            return
        }
        onChange([
            ...participants,
            { name: streamer.name, streamerId: streamer.id, isHost: participants.length === 0 },
        ])
        setParticipantSearch('')
        setIsParticipantOpen(false)
    }

    function addGuestParticipant(name: string): void {
        const trimmed = name.trim()
        if (trimmed.length === 0) return
        onChange([...participants, { name: trimmed, isHost: participants.length === 0 }])
        setParticipantSearch('')
        setIsParticipantOpen(false)
    }

    return (
        <div className="space-y-2 rounded-xl border border-[#3a3a44] bg-[#20202a] p-3">
            <div className="flex items-center justify-between gap-2">
                <h3 className="flex items-center gap-1.5 text-sm font-semibold text-[#efeff1]"><Users className="h-4 w-4" /> 참석자 관리</h3>
                <p className="text-[11px] text-[#848494]">스트리머 검색 또는 직접 추가</p>
            </div>

            <div className="space-y-2">
                {participants.map((participant, index) => (
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
                                                    onChange(
                                                        participants.map((item, itemIndex) =>
                                                            itemIndex === index ? { ...item, name: s.name, streamerId: s.id } : item,
                                                        ),
                                                    )
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
                                    onChange(
                                        participants.map((item, itemIndex) =>
                                            itemIndex === index ? { ...item, isHost: !item.isHost } : item,
                                        ),
                                    )
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
                                    onChange(participants.filter((_, itemIndex) => itemIndex !== index))
                                }}
                                className="cursor-pointer rounded-lg border border-red-500/30 bg-red-500/5 px-2 py-1 text-xs font-semibold text-red-300 transition hover:bg-red-500/15"
                                aria-label={`${participant.name} 삭제`}
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                ))}
                {participants.length === 0 && <p className="py-3 text-center text-xs text-[#848494]">등록된 참석자가 없습니다.</p>}
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
    )
}
