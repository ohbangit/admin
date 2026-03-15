import { useState } from 'react'
import type { F1DriverRaceResult, F1RaceResultContent, F1SingleRaceResult } from '../types'

interface F1RaceResultPanelEditorProps {
    content: Record<string, unknown>
    onSave: (content: F1RaceResultContent) => Promise<void>
    isSaving: boolean
}

function parseF1RaceResultContent(raw: Record<string, unknown>): F1RaceResultContent {
    const rawRaces = Array.isArray(raw.races) ? (raw.races as unknown[]) : []
    return {
        races: rawRaces.map((r: unknown) => {
            const race = r as Record<string, unknown>
            const rawResults = Array.isArray(race.results) ? (race.results as unknown[]) : []
            return {
                id: typeof race.id === 'string' ? race.id : crypto.randomUUID(),
                raceId: typeof race.raceId === 'string' ? race.raceId : '',
                raceTitle: typeof race.raceTitle === 'string' ? race.raceTitle : '',
                results: rawResults.map((dr: unknown) => {
                    const result = dr as Record<string, unknown>
                    return {
                        driverId: typeof result.driverId === 'string' ? result.driverId : '',
                        name: typeof result.name === 'string' ? result.name : '',
                        position: typeof result.position === 'number' ? result.position : null,
                        points: typeof result.points === 'number' ? result.points : null,
                        dnf: result.dnf === true,
                        fastestLap: result.fastestLap === true,
                    } as F1DriverRaceResult
                }),
            } as F1SingleRaceResult
        }),
    }
}

export function F1RaceResultPanelEditor({ content, onSave, isSaving }: F1RaceResultPanelEditorProps) {
    const parsed = parseF1RaceResultContent(content)
    const [races, setRaces] = useState<F1SingleRaceResult[]>(parsed.races)

    function handleAddRace() {
        const next: F1SingleRaceResult = {
            id: crypto.randomUUID(),
            raceId: '',
            raceTitle: `Race ${races.length + 1}`,
            results: [],
        }
        setRaces((prev) => [...prev, next])
    }

    function handleRemoveRace(raceId: string) {
        if (!confirm('이 레이스 결과를 삭제할까요?')) return
        setRaces((prev) => prev.filter((r) => r.id !== raceId))
    }

    function handleUpdateRace(id: string, patch: Partial<Pick<F1SingleRaceResult, 'raceId' | 'raceTitle'>>) {
        setRaces((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
    }

    function handleAddResult(raceResultId: string) {
        setRaces((prev) =>
            prev.map((r) => {
                if (r.id !== raceResultId) return r
                const next: F1DriverRaceResult = {
                    driverId: crypto.randomUUID(),
                    name: '',
                    position: null,
                    points: null,
                    dnf: false,
                    fastestLap: false,
                }
                return { ...r, results: [...r.results, next] }
            }),
        )
    }

    function handleRemoveResult(raceResultId: string, driverId: string) {
        setRaces((prev) =>
            prev.map((r) => {
                if (r.id !== raceResultId) return r
                return {
                    ...r,
                    results: r.results.filter((dr) => dr.driverId !== driverId),
                }
            }),
        )
    }

    function handleUpdateResult(raceResultId: string, driverId: string, patch: Partial<F1DriverRaceResult>) {
        setRaces((prev) =>
            prev.map((r) => {
                if (r.id !== raceResultId) return r
                return {
                    ...r,
                    results: r.results.map((dr) => (dr.driverId === driverId ? { ...dr, ...patch } : dr)),
                }
            }),
        )
    }

    async function handleSave() {
        await onSave({ races })
    }

    return (
        <div className="mt-3 space-y-4 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-[#2e2e38] dark:bg-[#20202a]">
            {races.length > 0 ? (
                <div className="space-y-4">
                    {races.map((race) => (
                        <div
                            key={race.id}
                            className="rounded-xl border border-gray-200 bg-white p-4 dark:border-[#2e2e38] dark:bg-[#1a1a23]"
                        >
                            {/* 레이스 헤더 */}
                            <div className="mb-3 flex items-center gap-2">
                                <input
                                    type="text"
                                    value={race.raceTitle}
                                    onChange={(e) =>
                                        handleUpdateRace(race.id, {
                                            raceTitle: e.target.value,
                                        })
                                    }
                                    placeholder="레이스 제목"
                                    className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                                />
                                <input
                                    type="text"
                                    value={race.raceId}
                                    onChange={(e) =>
                                        handleUpdateRace(race.id, {
                                            raceId: e.target.value,
                                        })
                                    }
                                    placeholder="레이스 ID"
                                    className="w-32 rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveRace(race.id)}
                                    className="cursor-pointer shrink-0 text-xs text-gray-400 transition hover:text-red-500 dark:text-[#6b6b7a]"
                                >
                                    레이스 삭제
                                </button>
                            </div>

                            {/* 드라이버 결과 목록 */}
                            {race.results.length > 0 ? (
                                <div className="mb-3 space-y-2">
                                    {race.results.map((result) => (
                                        <div
                                            key={result.driverId}
                                            className="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-[#2e2e38] dark:bg-[#20202a]"
                                        >
                                            <div className="flex flex-wrap items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={result.name}
                                                    onChange={(e) =>
                                                        handleUpdateResult(race.id, result.driverId, {
                                                            name: e.target.value,
                                                        })
                                                    }
                                                    placeholder="이름"
                                                    className="w-28 rounded-lg border border-gray-300 px-2 py-1.5 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                                                />
                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={result.position ?? ''}
                                                    onChange={(e) =>
                                                        handleUpdateResult(race.id, result.driverId, {
                                                            position: e.target.value.length > 0 ? Number(e.target.value) : null,
                                                        })
                                                    }
                                                    placeholder="순위"
                                                    className="w-16 rounded border border-gray-200 px-1 py-0.5 text-center text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                                                />
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={result.points ?? ''}
                                                    onChange={(e) =>
                                                        handleUpdateResult(race.id, result.driverId, {
                                                            points: e.target.value.length > 0 ? Number(e.target.value) : null,
                                                        })
                                                    }
                                                    placeholder="포인트"
                                                    className="w-16 rounded border border-gray-200 px-1 py-0.5 text-center text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                                                />
                                                <label className="flex cursor-pointer items-center gap-1 text-xs text-gray-600 dark:text-[#adadb8]">
                                                    <input
                                                        type="checkbox"
                                                        checked={result.dnf}
                                                        onChange={(e) =>
                                                            handleUpdateResult(race.id, result.driverId, {
                                                                dnf: e.target.checked,
                                                            })
                                                        }
                                                        className="cursor-pointer rounded"
                                                    />
                                                    DNF
                                                </label>
                                                <label className="flex cursor-pointer items-center gap-1 text-xs text-gray-600 dark:text-[#adadb8]">
                                                    <input
                                                        type="checkbox"
                                                        checked={result.fastestLap}
                                                        onChange={(e) =>
                                                            handleUpdateResult(race.id, result.driverId, {
                                                                fastestLap: e.target.checked,
                                                            })
                                                        }
                                                        className="cursor-pointer rounded"
                                                    />
                                                    ⚡ FL
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveResult(race.id, result.driverId)}
                                                    className="cursor-pointer shrink-0 text-gray-300 transition hover:text-red-400 dark:text-[#3a3a44] dark:hover:text-red-500"
                                                    aria-label="결과 삭제"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="mb-3 text-center text-xs text-gray-400 dark:text-[#6b6b7a]">드라이버 결과가 없습니다.</p>
                            )}

                            <button
                                type="button"
                                onClick={() => handleAddResult(race.id)}
                                className="cursor-pointer w-full rounded-lg border border-dashed border-gray-300 py-1.5 text-xs text-gray-400 transition hover:border-blue-400 hover:text-blue-500 dark:border-[#3a3a44] dark:hover:border-blue-700 dark:hover:text-blue-400"
                            >
                                + 드라이버 결과 추가
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-xs text-gray-400 dark:text-[#6b6b7a]">등록된 레이스 결과가 없습니다.</p>
            )}

            <button
                type="button"
                onClick={handleAddRace}
                className="cursor-pointer w-full rounded-xl border border-dashed border-gray-300 py-2 text-xs font-medium text-gray-400 transition hover:border-blue-400 hover:text-blue-500 dark:border-[#3a3a44] dark:hover:border-blue-700 dark:hover:text-blue-400"
            >
                + 레이스 추가
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
                    {isSaving ? '저장 중...' : '레이스 결과 저장'}
                </button>
            </div>
        </div>
    )
}
