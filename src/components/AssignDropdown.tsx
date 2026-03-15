import { useEffect, useRef, useState } from 'react'
import {
    useAdminStreamerSearch,
    useAdminToast,
    useUpsertTournamentMember,
} from '../hooks'
import type { SlotType } from '../types'
import { getErrorMessage } from '../utils'
import { cn } from '../lib/cn'

interface AssignDropdownProps {
    tournamentId: number
    teamId: number
    slot: SlotType
    onClose: () => void
}

export function AssignDropdown({
    tournamentId,
    teamId,
    slot,
    onClose,
}: AssignDropdownProps) {
    const { addToast } = useAdminToast()
    const upsertMember = useUpsertTournamentMember(tournamentId, teamId)
    const ref = useRef<HTMLDivElement>(null)

    const [mode, setMode] = useState<'streamer' | 'external'>('streamer')
    const [searchInput, setSearchInput] = useState('')
    const [selectedId, setSelectedId] = useState<number>()
    const [selectedName, setSelectedName] = useState('')
    const [extName, setExtName] = useState('')
    const [extUrl, setExtUrl] = useState('')

    const showSuggestions =
        mode === 'streamer' &&
        searchInput.trim().length > 0 &&
        selectedId === undefined
    const { data: suggestions, isFetching } = useAdminStreamerSearch(
        selectedId === undefined ? searchInput : '',
    )

    useEffect(() => {
        function onOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node))
                onClose()
        }
        document.addEventListener('mousedown', onOutside)
        return () => document.removeEventListener('mousedown', onOutside)
    }, [onClose])

    async function handleSubmit() {
        try {
            if (mode === 'streamer') {
                if (selectedId === undefined) {
                    addToast({
                        message: '스트리머를 선택해주세요.',
                        variant: 'error',
                    })
                    return
                }
                await upsertMember.mutateAsync({ slot, streamerId: selectedId })
            } else {
                if (extName.trim().length === 0) {
                    addToast({
                        message: '이름을 입력해주세요.',
                        variant: 'error',
                    })
                    return
                }
                await upsertMember.mutateAsync({
                    slot,
                    name: extName.trim(),
                    profileUrl:
                        extUrl.trim().length > 0 ? extUrl.trim() : undefined,
                })
            }
            addToast({ message: '배정되었습니다.', variant: 'success' })
            onClose()
        } catch (error) {
            addToast({ message: getErrorMessage(error), variant: 'error' })
        }
    }

    return (
        <div
            ref={ref}
            className="absolute left-0 top-full z-50 mt-1 w-72 rounded-xl border border-gray-200 bg-white p-3 shadow-xl dark:border-[#3a3a44] dark:bg-[#26262e]"
        >
            <div className="mb-3 flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-[#1a1a23]">
                {(['streamer', 'external'] as const).map((m) => (
                    <button
                        key={m}
                        type="button"
                        onClick={() => setMode(m)}
                        className={cn(
                            'flex-1 rounded-md py-1 text-xs font-medium transition',
                            mode === m
                                ? 'bg-white text-gray-900 shadow-sm dark:bg-[#2e2e38] dark:text-[#efeff1]'
                                : 'text-gray-500 dark:text-[#adadb8]',
                        )}
                    >
                        {m === 'streamer' ? '관리 스트리머' : '외부인사'}
                    </button>
                ))}
            </div>

            {mode === 'streamer' ? (
                <div className="relative">
                    <input
                        type="text"
                        value={
                            selectedId !== undefined
                                ? selectedName
                                : searchInput
                        }
                        onChange={(e) => {
                            setSearchInput(e.target.value)
                            setSelectedId(undefined)
                            setSelectedName('')
                        }}
                        readOnly={selectedId !== undefined}
                        autoFocus
                        placeholder="스트리머 검색"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-[#3a3a44] dark:bg-[#1a1a23] dark:text-[#efeff1]"
                    />
                    {selectedId !== undefined && (
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedId(undefined)
                                setSelectedName('')
                                setSearchInput('')
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    )}
                    {showSuggestions && (
                        <div className="absolute z-50 mt-1 max-h-36 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white dark:border-[#3a3a44] dark:bg-[#26262e]">
                            {isFetching && (
                                <p className="px-3 py-2 text-xs text-gray-500">
                                    검색 중...
                                </p>
                            )}
                            {!isFetching &&
                                (suggestions?.length ?? 0) === 0 && (
                                    <p className="px-3 py-2 text-xs text-gray-500">
                                        결과 없음
                                    </p>
                                )}
                            {!isFetching &&
                                suggestions?.map((s) => (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => {
                                            setSelectedId(s.id)
                                            setSelectedName(s.name)
                                            setSearchInput(s.name)
                                        }}
                                        className="w-full px-3 py-2 text-left text-xs text-gray-800 hover:bg-gray-50 dark:text-[#efeff1] dark:hover:bg-[#3a3a44]"
                                    >
                                        {s.name}
                                    </button>
                                ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-2">
                    <input
                        type="text"
                        value={extName}
                        onChange={(e) => setExtName(e.target.value)}
                        autoFocus
                        placeholder="이름"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-[#3a3a44] dark:bg-[#1a1a23] dark:text-[#efeff1]"
                    />
                    <input
                        type="url"
                        value={extUrl}
                        onChange={(e) => setExtUrl(e.target.value)}
                        placeholder="프로필 URL (나무위키 등, 선택)"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-[#3a3a44] dark:bg-[#1a1a23] dark:text-[#efeff1]"
                    />
                </div>
            )}

            <button
                type="button"
                onClick={() => {
                    void handleSubmit()
                }}
                disabled={upsertMember.isPending}
                className="mt-3 w-full rounded-lg bg-blue-500 py-2 text-xs font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
            >
                {upsertMember.isPending ? '배정 중...' : '배정'}
            </button>
        </div>
    )
}
