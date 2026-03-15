import { useState } from 'react'
import { Crown } from 'lucide-react'
import { useAdminStreamerSearch } from '../hooks'
import type { DraftParticipant, OverwatchRole } from '../types'
import { cn } from '../lib/cn'

const POSITIONS: { role: OverwatchRole; label: string }[] = [
    { role: 'TNK', label: 'TNK' },
    { role: 'DPS', label: 'DPS' },
    { role: 'SPT', label: 'SPT' },
]

const POSITION_ORDER: (OverwatchRole | null)[] = ['TNK', 'DPS', 'SPT', null]

const POSITION_COLORS: Record<OverwatchRole, string> = {
    TNK: 'bg-blue-500 text-white',
    DPS: 'bg-red-500 text-white',
    SPT: 'bg-green-500 text-white',
}

const POSITION_BADGE_INACTIVE: Record<OverwatchRole, string> = {
    TNK: 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-[#2e2e38] dark:text-[#6b6b7a] dark:hover:bg-[#3a3a44]',
    DPS: 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-[#2e2e38] dark:text-[#6b6b7a] dark:hover:bg-[#3a3a44]',
    SPT: 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-[#2e2e38] dark:text-[#6b6b7a] dark:hover:bg-[#3a3a44]',
}

interface ParticipantEditorProps {
    participants: DraftParticipant[]
    onSave: (participants: DraftParticipant[]) => Promise<void>
    isSaving: boolean
}

export function ParticipantEditor({ participants: initialParticipants, onSave, isSaving }: ParticipantEditorProps) {
    const [participants, setParticipants] = useState<DraftParticipant[]>(initialParticipants)
    const [searchInput, setSearchInput] = useState('')
    const [selectedStreamerId, setSelectedStreamerId] = useState<number>()
    const [selectedStreamerName, setSelectedStreamerName] = useState('')
    const [selectedStreamerAvatarUrl, setSelectedStreamerAvatarUrl] = useState<string | null>(null)
    const [selectedStreamerChannelId, setSelectedStreamerChannelId] = useState<string | null>(null)
    const [selectedStreamerIsPartner, setSelectedStreamerIsPartner] = useState(false)

    const showSuggestions = searchInput.trim().length > 0 && selectedStreamerId === undefined
    const { data: suggestions, isFetching } = useAdminStreamerSearch(selectedStreamerId === undefined ? searchInput : '')

    function handleAddParticipant() {
        if (selectedStreamerId === undefined) return
        if (participants.some((p) => p.streamerId === selectedStreamerId)) return
        const next: DraftParticipant = {
            id: crypto.randomUUID(),
            streamerId: selectedStreamerId,
            name: selectedStreamerName,
            channelId: selectedStreamerChannelId,
            teamId: null,
            position: null,
            avatarUrl: selectedStreamerAvatarUrl,
            isPartner: selectedStreamerIsPartner,
            isCaptain: false,
            order: participants.length,
        }
        setParticipants((prev) => [...prev, next])
        setSearchInput('')
        setSelectedStreamerId(undefined)
        setSelectedStreamerName('')
        setSelectedStreamerAvatarUrl(null)
        setSelectedStreamerChannelId(null)
        setSelectedStreamerIsPartner(false)
    }

    function handleRemoveParticipant(id: string) {
        setParticipants((prev) => prev.filter((p) => p.id !== id).map((p, i) => ({ ...p, order: i })))
    }

    function handleUpdatePosition(id: string, role: OverwatchRole) {
        setParticipants((prev) => prev.map((p) => (p.id === id ? { ...p, position: p.position === role ? null : role } : p)))
    }

    function handleToggleCaptain(id: string) {
        setParticipants((prev) =>
            prev.map((participant) =>
                participant.id === id ? { ...participant, isCaptain: !participant.isCaptain } : participant,
            ),
        )
    }

    return (
        <div className="p-4">
            <div className="space-y-4 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-[#2e2e38] dark:bg-[#20202a]">
                <p className="text-xs font-semibold text-gray-500 dark:text-[#adadb8]">참여자 ({participants.length}명)</p>

                {/* 검색 + 추가 */}
                <div className="relative">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={selectedStreamerId !== undefined ? selectedStreamerName : searchInput}
                            onChange={(e) => {
                                setSearchInput(e.target.value)
                                setSelectedStreamerId(undefined)
                                setSelectedStreamerName('')
                                setSelectedStreamerAvatarUrl(null)
                                setSelectedStreamerChannelId(null)
                                setSelectedStreamerIsPartner(false)
                            }}
                            readOnly={selectedStreamerId !== undefined}
                            placeholder="관리 스트리머 검색"
                            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1] dark:placeholder-[#6b6b7a]"
                        />
                        <button
                            type="button"
                            onClick={handleAddParticipant}
                            disabled={selectedStreamerId === undefined}
                            className="rounded-lg bg-blue-500 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-600 disabled:opacity-40"
                        >
                            추가
                        </button>
                    </div>
                    {selectedStreamerId !== undefined && (
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedStreamerId(undefined)
                                setSelectedStreamerName('')
                                setSelectedStreamerAvatarUrl(null)
                                setSelectedStreamerChannelId(null)
                                setSelectedStreamerIsPartner(false)
                                setSearchInput('')
                            }}
                            className="absolute right-16 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
                            aria-label="선택 해제"
                        >
                            ✕
                        </button>
                    )}
                    {showSuggestions && (
                        <div className="absolute z-50 mt-1 max-h-40 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white dark:border-[#3a3a44] dark:bg-[#26262e]">
                            {isFetching && <p className="px-3 py-2 text-xs text-gray-500">검색 중...</p>}
                            {!isFetching && (suggestions?.length ?? 0) === 0 && (
                                <p className="px-3 py-2 text-xs text-gray-500">결과 없음</p>
                            )}
                            {!isFetching &&
                                suggestions?.map((streamer) => (
                                    <button
                                        key={streamer.id}
                                        type="button"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => {
                                            setSelectedStreamerId(streamer.id)
                                            setSelectedStreamerName(streamer.nickname)
                                            setSelectedStreamerAvatarUrl(streamer.channelImageUrl)
                                            setSelectedStreamerChannelId(streamer.channelId)
                                            setSelectedStreamerIsPartner(streamer.isPartner)
                                            setSearchInput(streamer.nickname)
                                        }}
                                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-gray-800 transition hover:bg-gray-50 dark:text-[#efeff1] dark:hover:bg-[#3a3a44]"
                                    >
                                        {streamer.channelImageUrl !== null ? (
                                            <img
                                                src={streamer.channelImageUrl}
                                                alt={streamer.nickname}
                                                className="h-5 w-5 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-5 w-5 rounded-full bg-gray-100 dark:bg-[#3a3a44]" />
                                        )}
                                        <span className="flex-1 truncate">{streamer.nickname}</span>
                                        {streamer.isPartner && <span className="text-[10px] text-amber-500">파트너</span>}
                                    </button>
                                ))}
                        </div>
                    )}
                </div>

                {/* 참여자 목록 - 포지션별 그룹핑 */}
                {participants.length > 0 ? (
                    <div className="space-y-3">
                        {POSITION_ORDER.map((role) => {
                            const members = participants.filter((p) => p.position === role)
                            if (members.length === 0) return null
                            const groupLabel = role ?? '미지정'
                            const badgeClass =
                                role !== null
                                    ? POSITION_COLORS[role]
                                    : 'bg-gray-200 text-gray-500 dark:bg-[#3a3a44] dark:text-[#adadb8]'
                            return (
                                <div key={role ?? 'unassigned'} className="space-y-1.5">
                                    {/* 그룹 헤더 */}
                                    <div className="flex items-center gap-2 px-1">
                                        <span
                                            className={cn(
                                                'rounded px-2 py-0.5 text-[10px] font-bold',
                                                badgeClass,
                                            )}
                                        >
                                            {groupLabel}
                                        </span>
                                        <span className="text-[11px] text-gray-400 dark:text-[#6b6b7a]">
                                            {members.length}명
                                        </span>
                                        <div className="h-px flex-1 bg-gray-100 dark:bg-[#2e2e38]" />
                                    </div>
                                    {/* 그룹 내 참여자 */}
                                    {members.map((p, i) => (
                                        <div
                                            key={p.id}
                                            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-[#2e2e38] dark:bg-[#1a1a23]"
                                        >
                                <span className="w-5 shrink-0 text-center text-xs text-gray-400 dark:text-[#6b6b7a]">{i + 1}</span>
                                            {p.avatarUrl !== null ? (
                                    <img src={p.avatarUrl} alt={p.name} className="h-6 w-6 shrink-0 rounded-full object-cover" />
                                            ) : (
                                                <div className="h-6 w-6 shrink-0 rounded-full bg-gray-100 dark:bg-[#2e2e38]" />
                                            )}
                                <span className="flex-1 truncate text-sm text-gray-700 dark:text-[#efeff1]">{p.name}</span>
                                            {/* 포지션 토글 */}
                                            <div className="flex gap-1">
                                                {POSITIONS.map(({ role: r, label }) => (
                                                    <button
                                                        key={r}
                                                        type="button"
                                                        onClick={() => handleUpdatePosition(p.id, r)}
                                                        className={cn(
                                                            'rounded px-1.5 py-0.5 text-[10px] font-semibold transition',
                                                            p.position === r
                                                                ? POSITION_COLORS[r]
                                                                : POSITION_BADGE_INACTIVE[r],
                                                        )}
                                                    >
                                                        {label}
                                                    </button>
                                                ))}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleToggleCaptain(p.id)}
                                                className={cn(
                                                    'cursor-pointer rounded p-1 transition',
                                                    p.isCaptain
                                                        ? 'bg-amber-100 text-amber-500 dark:bg-amber-900/30'
                                                        : 'text-gray-400 hover:bg-gray-100 hover:text-amber-500 dark:text-[#6b6b7a] dark:hover:bg-[#2e2e38] dark:hover:text-amber-400',
                                                )}
                                                aria-label={`${p.name} 팀장 토글`}
                                                title={p.isCaptain ? '팀장 해제' : '팀장 지정'}
                                            >
                                    <Crown className={cn('h-4 w-4', p.isCaptain ? 'fill-current' : '')} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveParticipant(p.id)}
                                                className="shrink-0 text-gray-300 transition hover:text-red-400 dark:text-[#3a3a44] dark:hover:text-red-500"
                                                aria-label="참여자 삭제"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <p className="text-center text-xs text-gray-400 dark:text-[#6b6b7a]">참여자가 없습니다.</p>
                )}

                {/* 저장 */}
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={() => {
                            const sorted = POSITION_ORDER.flatMap((role) =>
                                participants.filter((p) => p.position === role),
                            ).map((p, i) => ({ ...p, order: i }))
                            void onSave(sorted)
                        }}
                        disabled={isSaving}
                        className="rounded-lg bg-blue-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
                    >
                        {isSaving ? '저장 중...' : '참여자 저장'}
                    </button>
                </div>
            </div>
        </div>
    )
}
