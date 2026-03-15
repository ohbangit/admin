import { useState } from 'react'
import { Calculator } from 'lucide-react'
import type { F1StandingEntry, F1StandingsContent, F1RaceResultContent } from '../types'

interface F1StandingsPanelEditorProps {
    content: Record<string, unknown>
    onSave: (content: F1StandingsContent) => Promise<void>
    isSaving: boolean
    raceResultContent?: Record<string, unknown>
}

/** F1 표준 포인트 시스템 (P1~P10) */
const F1_POINTS: Record<number, number> = {
    1: 25,
    2: 18,
    3: 15,
    4: 12,
    5: 10,
    6: 8,
    7: 6,
    8: 4,
    9: 2,
    10: 1,
}

function parseF1StandingsContent(raw: Record<string, unknown>): F1StandingsContent {
    return {
        standings: Array.isArray(raw.standings)
            ? (raw.standings as unknown[]).map((s: unknown, index: number) => {
                  const entry = s as Record<string, unknown>
                  return {
                      driverId: typeof entry.driverId === 'string' ? entry.driverId : crypto.randomUUID(),
                      name: typeof entry.name === 'string' ? entry.name : '',
                      avatarUrl: typeof entry.avatarUrl === 'string' ? entry.avatarUrl : null,
                      rank: typeof entry.rank === 'number' ? entry.rank : index + 1,
                      totalPoints: typeof entry.totalPoints === 'number' ? entry.totalPoints : 0,
                      wins: typeof entry.wins === 'number' ? entry.wins : 0,
                      podiums: typeof entry.podiums === 'number' ? entry.podiums : 0,
                      fastestLaps: typeof entry.fastestLaps === 'number' ? entry.fastestLaps : 0,
                      note: typeof entry.note === 'string' ? entry.note : '',
                  } as F1StandingEntry
              })
            : [],
    }
}

/**
 * F1_RACE_RESULT 콘텐츠에서 챔피언십 순위를 자동 집계한다.
 * - 포지션 포인트: P1(25) ~ P10(1)
 * - 패스티스트랩: +1점 (TOP10 이내 여부 무관 — 스트리밍 대회 기준)
 * - DNF: 0점
 */
function computeStandings(raceRaw: Record<string, unknown>): F1StandingEntry[] {
    const rawContent = raceRaw as unknown as F1RaceResultContent
    const races = Array.isArray(rawContent.races) ? rawContent.races : []

    const map = new Map<
        string,
        {
            name: string
            avatarUrl: string | null
            totalPoints: number
            wins: number
            podiums: number
            fastestLaps: number
        }
    >()

    for (const race of races) {
        if (!Array.isArray(race.results)) continue
        for (const r of race.results) {
            if (typeof r.driverId !== 'string' || typeof r.name !== 'string') continue

            const existing = map.get(r.driverId) ?? {
                name: r.name,
                avatarUrl: null,
                totalPoints: 0,
                wins: 0,
                podiums: 0,
                fastestLaps: 0,
            }

            // 포지션 포인트 (DNF 이면 0)
            if (!r.dnf && typeof r.position === 'number') {
                existing.totalPoints += F1_POINTS[r.position] ?? 0
                if (r.position === 1) existing.wins += 1
                if (r.position <= 3) existing.podiums += 1
            }

            // 패스티스트랩 +1
            if (r.fastestLap === true) {
                existing.totalPoints += 1
                existing.fastestLaps += 1
            }

            map.set(r.driverId, existing)
        }
    }

    // totalPoints 내림차순 → wins → podiums
    const sorted = [...map.entries()].sort(([, a], [, b]) => {
        if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints
        if (b.wins !== a.wins) return b.wins - a.wins
        return b.podiums - a.podiums
    })

    return sorted.map(([driverId, data], i) => ({
        driverId,
        name: data.name,
        avatarUrl: data.avatarUrl,
        rank: i + 1,
        totalPoints: data.totalPoints,
        wins: data.wins,
        podiums: data.podiums,
        fastestLaps: data.fastestLaps,
        note: '',
    }))
}

export function F1StandingsPanelEditor({ content, onSave, isSaving, raceResultContent }: F1StandingsPanelEditorProps) {
    const parsed = parseF1StandingsContent(content)
    const [standings, setStandings] = useState<F1StandingEntry[]>(parsed.standings)
    const [isComputing, setIsComputing] = useState(false)

    function handleAutoCompute() {
        if (raceResultContent === undefined) return
        if (!confirm('레이스 결과에서 순위를 자동 계산합니다.\n현재 입력된 순위 데이터가 덮어씌워집니다. 계속할까요?')) return

        setIsComputing(true)
        try {
            const computed = computeStandings(raceResultContent)
            setStandings(computed)
        } finally {
            setIsComputing(false)
        }
    }

    function handleAddEntry() {
        setStandings((prev) => [
            ...prev,
            {
                driverId: crypto.randomUUID(),
                name: '',
                avatarUrl: null,
                rank: prev.length + 1,
                totalPoints: 0,
                wins: 0,
                podiums: 0,
                fastestLaps: 0,
                note: '',
            },
        ])
    }

    function handleRemoveStanding(driverId: string) {
        setStandings((prev) => prev.filter((s) => s.driverId !== driverId).map((s, i) => ({ ...s, rank: i + 1 })))
    }

    function handleUpdateStanding(driverId: string, field: keyof Omit<F1StandingEntry, 'driverId' | 'avatarUrl'>, value: string) {
        setStandings((prev) =>
            prev.map((s) => {
                if (s.driverId !== driverId) return s
                if (field === 'note' || field === 'name') return { ...s, [field]: value }
                const parsed = parseInt(value, 10)
                return {
                    ...s,
                    [field]: value.length > 0 && !isNaN(parsed) ? parsed : 0,
                }
            }),
        )
    }

    function handleMoveUp(index: number) {
        if (index === 0) return
        setStandings((prev) => {
            const next = [...prev]
            const temp = next[index - 1]
            if (temp === undefined) return prev
            next[index - 1] = { ...next[index]!, rank: index }
            next[index] = { ...temp, rank: index + 1 }
            return next
        })
    }

    function handleMoveDown(index: number) {
        setStandings((prev) => {
            if (index >= prev.length - 1) return prev
            const next = [...prev]
            const temp = next[index + 1]
            if (temp === undefined) return prev
            next[index + 1] = { ...next[index]!, rank: index + 2 }
            next[index] = { ...temp, rank: index + 1 }
            return next
        })
    }

    async function handleSave() {
        await onSave({ standings })
    }

    return (
        <div className="mt-3 space-y-4 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-[#2e2e38] dark:bg-[#20202a]">
            {/* 자동계산 배너 */}
            {raceResultContent !== undefined && (
                <div className="flex flex-col items-start gap-3 rounded-xl border border-[#F5C842]/20 bg-[#F5C842]/5 px-4 py-3 sm:flex-row sm:items-center">
                    <Calculator className="h-4 w-4 shrink-0 text-[#F5C842]" />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#F5C842]">자동 계산 가능</p>
                        <p className="text-xs text-gray-500 dark:text-[#6b6b7a]">
                            레이스 결과 기반 포인트 집계 — P1(25)~P10(1), 패스티스트랩 +1
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleAutoCompute}
                        disabled={isComputing}
                        className="cursor-pointer w-full rounded-lg bg-[#F5C842] px-3 py-1.5 text-xs font-bold text-black transition hover:bg-[#f0bc30] disabled:opacity-50 sm:w-auto"
                    >
                        {isComputing ? '계산 중...' : '자동 계산'}
                    </button>
                </div>
            )}

            {standings.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-[#2e2e38]">
                                <th className="pb-2 text-left text-gray-500 dark:text-[#adadb8]">순위</th>
                                <th className="pb-2 text-left text-gray-500 dark:text-[#adadb8]">이름</th>
                                <th className="pb-2 text-center text-gray-500 dark:text-[#adadb8]">총 포인트</th>
                                <th className="pb-2 text-center text-gray-500 dark:text-[#adadb8]">우승</th>
                                <th className="pb-2 text-center text-gray-500 dark:text-[#adadb8]">포디움</th>
                                <th className="pb-2 text-center text-gray-500 dark:text-[#adadb8]">FL</th>
                                <th className="pb-2 text-left text-gray-500 dark:text-[#adadb8]">메모</th>
                                <th className="pb-2" />
                            </tr>
                        </thead>
                        <tbody>
                            {standings.map((s, index) => (
                                <tr key={s.driverId} className="border-b border-gray-100 dark:border-[#2e2e38]">
                                    <td className="py-2 pr-2">
                                        <div className="flex items-center gap-1">
                                            <span className="w-5 text-center font-semibold text-gray-700 dark:text-[#efeff1]">
                                                {s.rank}
                                            </span>
                                            <div className="flex flex-col gap-0.5">
                                                <button
                                                    type="button"
                                                    onClick={() => handleMoveUp(index)}
                                                    disabled={index === 0}
                                                    className="cursor-pointer text-gray-300 leading-none transition hover:text-gray-500 disabled:opacity-20 dark:text-[#3a3a44]"
                                                >
                                                    ▲
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleMoveDown(index)}
                                                    disabled={index === standings.length - 1}
                                                    className="cursor-pointer text-gray-300 leading-none transition hover:text-gray-500 disabled:opacity-20 dark:text-[#3a3a44]"
                                                >
                                                    ▼
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-2 pr-2">
                                        <input
                                            type="text"
                                            value={s.name}
                                            onChange={(e) => handleUpdateStanding(s.driverId, 'name', e.target.value)}
                                            placeholder="이름"
                                            className="w-24 rounded border border-gray-200 px-1 py-0.5 text-xs dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1] dark:placeholder-[#6b6b7a]"
                                        />
                                    </td>
                                    <td className="py-2 px-1">
                                        <input
                                            type="number"
                                            min={0}
                                            value={s.totalPoints}
                                            onChange={(e) => handleUpdateStanding(s.driverId, 'totalPoints', e.target.value)}
                                            className="w-14 rounded border border-gray-200 px-1 py-0.5 text-center dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                                        />
                                    </td>
                                    <td className="py-2 px-1">
                                        <input
                                            type="number"
                                            min={0}
                                            value={s.wins}
                                            onChange={(e) => handleUpdateStanding(s.driverId, 'wins', e.target.value)}
                                            className="w-12 rounded border border-gray-200 px-1 py-0.5 text-center dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                                        />
                                    </td>
                                    <td className="py-2 px-1">
                                        <input
                                            type="number"
                                            min={0}
                                            value={s.podiums}
                                            onChange={(e) => handleUpdateStanding(s.driverId, 'podiums', e.target.value)}
                                            className="w-12 rounded border border-gray-200 px-1 py-0.5 text-center dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                                        />
                                    </td>
                                    <td className="py-2 px-1">
                                        <input
                                            type="number"
                                            min={0}
                                            value={s.fastestLaps}
                                            onChange={(e) => handleUpdateStanding(s.driverId, 'fastestLaps', e.target.value)}
                                            className="w-12 rounded border border-gray-200 px-1 py-0.5 text-center dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                                        />
                                    </td>
                                    <td className="py-2 px-1">
                                        <input
                                            type="text"
                                            value={s.note}
                                            onChange={(e) => handleUpdateStanding(s.driverId, 'note', e.target.value)}
                                            placeholder="메모"
                                            className="w-24 rounded border border-gray-200 px-1 py-0.5 text-xs dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1] dark:placeholder-[#6b6b7a]"
                                        />
                                    </td>
                                    <td className="py-2 pl-2">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveStanding(s.driverId)}
                                            className="cursor-pointer text-gray-300 transition hover:text-red-400 dark:text-[#3a3a44] dark:hover:text-red-500"
                                            aria-label="드라이버 삭제"
                                        >
                                            ✕
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-center text-xs text-gray-400 dark:text-[#6b6b7a]">순위 데이터가 없습니다.</p>
            )}

            <button
                type="button"
                onClick={handleAddEntry}
                className="cursor-pointer rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-600 transition hover:border-blue-300 hover:text-blue-600 dark:border-[#3a3a44] dark:text-[#adadb8] dark:hover:border-blue-700 dark:hover:text-blue-400"
            >
                + 드라이버 추가
            </button>

            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={() => {
                        void handleSave()
                    }}
                    disabled={isSaving}
                    className="cursor-pointer rounded-lg bg-blue-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
                >
                    {isSaving ? '저장 중...' : '순위 저장'}
                </button>
            </div>
        </div>
    )
}
