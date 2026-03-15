import { useEffect, useState } from 'react'
import type { MatchFormat, OverwatchMapType } from '../../types/overwatch'
import type { Broadcast } from '../../types'
import type { OverwatchMatchInput, OverwatchSetInput } from '../../types'
import { useOverwatchMatch, useUpsertOverwatchMatch, useDeleteOverwatchMatch, useAdminToast } from '../../hooks'
import { OverwatchSetRow } from './OverwatchSetRow'
import { getErrorMessage } from '../../utils/error'
import { cn } from '../../lib/cn'

const FORMAT_OPTIONS: readonly MatchFormat[] = ['bo3', 'bo5', 'bo7'] as const
const FORMAT_LABEL: Record<MatchFormat, string> = {
    bo3: 'BO3',
    bo5: 'BO5',
    bo7: 'BO7',
}
const FORMAT_SET_COUNT: Record<MatchFormat, number> = {
    bo3: 3,
    bo5: 5,
    bo7: 7,
}

const DEFAULT_MAP_TYPE: OverwatchMapType = '쟁탈'
const DEFAULT_SET_ORDER: readonly OverwatchMapType[] = ['쟁탈', '호위', '혼합', '밀기', '쟁탈', '혼합', '쟁탈'] as const

function buildDefaultSets(format: MatchFormat): OverwatchSetInput[] {
    const count = FORMAT_SET_COUNT[format]
    return Array.from({ length: count }, (_, i) => ({
        setNumber: i + 1,
        mapType: DEFAULT_SET_ORDER[i] ?? DEFAULT_MAP_TYPE,
        mapName: null,
        result: null,
        isPlayed: false,
    }))
}

function matchInfoToInput(info: ReturnType<typeof useOverwatchMatch>['data']): OverwatchMatchInput | null {
    if (info === null || info === undefined) return null
    return {
        format: info.format,
        homeTeam: info.homeTeam,
        awayTeam: info.awayTeam,
        isCompleted: info.isCompleted,
        sets: info.sets.map((s) => ({
            setNumber: s.setNumber,
            mapType: s.mapType,
            mapName: s.mapName,
            result: s.result,
            isPlayed: s.isPlayed,
            roundScore: s.roundScore,
        })),
    }
}

interface OverwatchMatchModalProps {
    broadcast: Broadcast
    onClose: () => void
}

export function OverwatchMatchModal({ broadcast, onClose }: OverwatchMatchModalProps) {
    const { addToast } = useAdminToast()
    const { data: existingMatch, isLoading } = useOverwatchMatch(broadcast.id)
    const upsertMutation = useUpsertOverwatchMatch(broadcast.id)
    const deleteMutation = useDeleteOverwatchMatch(broadcast.id)

    const [format, setFormat] = useState<MatchFormat>('bo5')
    const [homeTeam, setHomeTeam] = useState('')
    const [awayTeam, setAwayTeam] = useState('')
    const [isCompleted, setIsCompleted] = useState(false)
    const [sets, setSets] = useState<OverwatchSetInput[]>(() => buildDefaultSets('bo5'))
    const [initialized, setInitialized] = useState(false)

    // 기존 데이터로 폼 초기화
    useEffect(() => {
        if (initialized || isLoading) return
        const input = matchInfoToInput(existingMatch)
        if (input !== null) {
            setFormat(input.format)
            setHomeTeam(input.homeTeam)
            setAwayTeam(input.awayTeam)
            setIsCompleted(input.isCompleted)
            setSets(input.sets)
        }
        setInitialized(true)
    }, [existingMatch, isLoading, initialized])

    // 포맷 변경 시 세트 수 조정 (기존 값 최대한 유지)
    function handleFormatChange(newFormat: MatchFormat): void {
        setFormat(newFormat)
        const newCount = FORMAT_SET_COUNT[newFormat]
        setSets((prev) => {
            if (prev.length === newCount) return prev
            if (prev.length > newCount) return prev.slice(0, newCount)
            const extras = buildDefaultSets(newFormat).slice(prev.length)
            return [...prev, ...extras]
        })
    }

    function handleSetChange(index: number, updated: OverwatchSetInput): void {
        setSets((prev) => prev.map((s, i) => (i === index ? updated : s)))
    }

    const isPending = upsertMutation.isPending || deleteMutation.isPending

    async function handleSave(): Promise<void> {
        if (homeTeam.trim().length === 0 || awayTeam.trim().length === 0) {
            addToast({
                message: '홈팀과 어웨이팀 이름을 입력해주세요.',
                variant: 'error',
            })
            return
        }
        try {
            await upsertMutation.mutateAsync({
                format,
                homeTeam: homeTeam.trim(),
                awayTeam: awayTeam.trim(),
                isCompleted,
                sets,
            })
            addToast({ message: '경기 정보가 저장되었습니다.', variant: 'success' })
            onClose()
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    async function handleDelete(): Promise<void> {
        const confirmed = window.confirm('경기 정보를 삭제합니다. 계속하시겠습니까?')
        if (!confirmed) return
        try {
            await deleteMutation.mutateAsync()
            addToast({ message: '경기 정보가 삭제되었습니다.', variant: 'success' })
            onClose()
        } catch (error) {
            const message = getErrorMessage(error)
            if (message !== null) addToast({ message, variant: 'error' })
        }
    }

    // 참여자 이름 목록 (홈/어웨이팀 자동완성 힌트)
    const participantNames = broadcast.participants?.map((p) => p.name) ?? []

    const homeWins = sets.filter((s) => s.result === 'home' && s.isPlayed).length
    const awayWins = sets.filter((s) => s.result === 'away' && s.isPlayed).length

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 dark:bg-black/70"
            onClick={(e) => {
                if (e.target === e.currentTarget && !isPending) onClose()
            }}
        >
            <div className="my-8 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-[#1a1a23]">
                {/* 헤더 */}
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-[#3a3a44]">
                    <div>
                        <h2 className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-[#efeff1]">
                            <span>⚔</span>
                            <span>오버워치 경기 구성</span>
                        </h2>
                        <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-[#848494]">{broadcast.title}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isPending}
                        className="cursor-pointer rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:text-[#848494] dark:hover:bg-[#2a2a34]"
                        aria-label="닫기"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M6.28 5.22a.75.75 0 10-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 10-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                    </button>
                </div>

                {isLoading ? (
                    <div className="py-12 text-center text-sm text-gray-400 dark:text-[#848494]">불러오는 중…</div>
                ) : (
                    <div className="space-y-5 px-6 py-5">
                        {/* 포맷 토글 */}
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-500 dark:text-[#848494]">경기 포맷</p>
                            <div className="flex gap-2">
                                {FORMAT_OPTIONS.map((f) => (
                                    <button
                                        key={f}
                                        type="button"
                                        onClick={() => handleFormatChange(f)}
                                        className={cn(
                                            'cursor-pointer rounded-xl border px-5 py-2 text-sm font-semibold transition',
                                            format === f
                                                ? 'border-blue-500 bg-blue-500 text-white'
                                                : 'border-gray-300 text-gray-600 hover:border-gray-400 dark:border-[#3a3a44] dark:text-[#adadb8]',
                                        )}
                                    >
                                        {FORMAT_LABEL[f]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 홈팀 / 어웨이팀 */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <p className="text-xs font-semibold text-gray-500 dark:text-[#848494]">홈팀</p>
                                <input
                                    type="text"
                                    value={homeTeam}
                                    onChange={(e) => setHomeTeam(e.target.value)}
                                    placeholder="홈팀 이름"
                                    list="home-team-suggestions"
                                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                                />
                                <datalist id="home-team-suggestions">
                                    {participantNames.map((name) => (
                                        <option key={name} value={name} />
                                    ))}
                                </datalist>
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-xs font-semibold text-gray-500 dark:text-[#848494]">어웨이팀</p>
                                <input
                                    type="text"
                                    value={awayTeam}
                                    onChange={(e) => setAwayTeam(e.target.value)}
                                    placeholder="어웨이팀 이름"
                                    list="away-team-suggestions"
                                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                                />
                                <datalist id="away-team-suggestions">
                                    {participantNames.map((name) => (
                                        <option key={name} value={name} />
                                    ))}
                                </datalist>
                            </div>
                        </div>

                        {/* 세트 스코어 현황 */}
                        {(homeTeam.length > 0 || awayTeam.length > 0) && (
                            <div className="flex items-center justify-center gap-4 rounded-xl bg-gray-50 py-3 dark:bg-[#26262e]">
                                <span className="text-sm font-semibold text-gray-800 dark:text-[#efeff1]">
                                    {homeTeam.length > 0 ? homeTeam : '홈팀'}
                                </span>
                                <span className="text-xl font-black tabular-nums text-gray-900 dark:text-[#efeff1]">
                                    {homeWins}
                                    <span className="mx-2 text-gray-400">:</span>
                                    {awayWins}
                                </span>
                                <span className="text-sm font-semibold text-gray-800 dark:text-[#efeff1]">
                                    {awayTeam.length > 0 ? awayTeam : '어웨이팀'}
                                </span>
                            </div>
                        )}

                        {/* 세트 목록 헤더 */}
                        <div className="space-y-2">
                            <div
                                className="grid px-3 text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-[#848494]"
                                style={{
                                    gridTemplateColumns: '2rem 5rem 1fr 6rem 2.5rem',
                                }}
                            >
                                <span className="text-center">SET</span>
                                <span>타입</span>
                                <span>맵명 (라운드점수)</span>
                                <span>결과</span>
                                <span className="text-center">진행</span>
                            </div>
                            <div className="space-y-1.5">
                                {sets.map((set, index) => (
                                    <OverwatchSetRow
                                        key={set.setNumber}
                                        set={set}
                                        homeTeam={homeTeam}
                                        awayTeam={awayTeam}
                                        onChange={(updated) => handleSetChange(index, updated)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* 경기 완료 여부 */}
                        <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 dark:border-[#3a3a44]">
                            <span className="text-sm font-medium text-gray-700 dark:text-[#adadb8]">경기 완료</span>
                            <button
                                type="button"
                                onClick={() => setIsCompleted((prev) => !prev)}
                                className={cn(
                                    'cursor-pointer flex h-6 w-12 shrink-0 items-center rounded-full px-0.5 transition-colors',
                                    isCompleted ? 'justify-end' : 'justify-start',
                                    isCompleted ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-[#3a3a44]',
                                )}
                                aria-label="경기 완료 토글"
                            >
                                <span className="h-5 w-5 rounded-full bg-white shadow" />
                            </button>
                        </div>
                    </div>
                )}

                {/* 푸터 */}
                {!isLoading && (
                    <div className="flex gap-2 border-t border-gray-200 px-6 py-4 dark:border-[#3a3a44]">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isPending}
                            className="cursor-pointer flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-[#3a3a44] dark:text-[#adadb8] dark:hover:bg-[#26262e]"
                        >
                            취소
                        </button>
                        {existingMatch !== null && existingMatch !== undefined && (
                            <button
                                type="button"
                                onClick={() => {
                                    void handleDelete()
                                }}
                                disabled={isPending}
                                className="cursor-pointer rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 disabled:opacity-50 dark:border-red-900/30 dark:hover:bg-red-900/10"
                            >
                                삭제
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => {
                                void handleSave()
                            }}
                            disabled={isPending}
                            className="cursor-pointer flex-1 rounded-xl bg-blue-500 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
                        >
                            {isPending ? '저장 중…' : '저장'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
