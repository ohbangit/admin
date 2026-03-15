import { useState } from 'react'
import type { F1RaceEvent, F1RaceScheduleContent, F1RaceStatus } from '../types'

interface F1RaceSchedulePanelEditorProps {
    content: Record<string, unknown>
    onSave: (content: F1RaceScheduleContent) => Promise<void>
    isSaving: boolean
}

function parseF1RaceScheduleContent(raw: Record<string, unknown>): F1RaceScheduleContent {
    const rawRaces = Array.isArray(raw.races) ? (raw.races as unknown[]) : []
    return {
        races: rawRaces.map((r: unknown, index: number) => {
            const race = r as Record<string, unknown>
            return {
                id: typeof race.id === 'string' ? race.id : crypto.randomUUID(),
                title: typeof race.title === 'string' ? race.title : '',
                circuit: typeof race.circuit === 'string' ? race.circuit : '',
                scheduledAt: typeof race.scheduledAt === 'string' ? race.scheduledAt : null,
                status: ['SCHEDULED', 'COMPLETED', 'CANCELLED'].includes(race.status as string)
                    ? (race.status as F1RaceStatus)
                    : 'SCHEDULED',
                order: typeof race.order === 'number' ? race.order : index,
            } as F1RaceEvent
        }),
    }
}

const RACE_STATUS_LABELS: Record<F1RaceStatus, string> = {
    SCHEDULED: '예정',
    COMPLETED: '완료',
    CANCELLED: '취소',
}

export function F1RaceSchedulePanelEditor({ content, onSave, isSaving }: F1RaceSchedulePanelEditorProps) {
    const parsed = parseF1RaceScheduleContent(content)
    const [races, setRaces] = useState<F1RaceEvent[]>(parsed.races)

    function handleAddRace() {
        const next: F1RaceEvent = {
            id: crypto.randomUUID(),
            title: `Round ${races.length + 1}`,
            circuit: '',
            scheduledAt: null,
            status: 'SCHEDULED',
            order: races.length,
        }
        setRaces((prev) => [...prev, next])
    }

    function handleRemoveRace(raceId: string) {
        if (!confirm('이 레이스를 삭제할까요?')) return
        setRaces((prev) => prev.filter((r) => r.id !== raceId).map((r, i) => ({ ...r, order: i })))
    }

    function handleUpdateRace(raceId: string, patch: Partial<F1RaceEvent>) {
        setRaces((prev) => prev.map((r) => (r.id === raceId ? { ...r, ...patch } : r)))
    }

    async function handleSave() {
        await onSave({ races })
    }

    return (
        <div className="mt-3 space-y-4 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-[#2e2e38] dark:bg-[#20202a]">
            {races.length > 0 ? (
                <div className="space-y-3">
                    {races.map((race) => (
                        <div
                            key={race.id}
                            className="rounded-xl border border-gray-200 bg-white p-4 dark:border-[#2e2e38] dark:bg-[#1a1a23]"
                        >
                            <div className="mb-3 flex items-center gap-2">
                                <input
                                    type="text"
                                    value={race.title}
                                    onChange={(e) =>
                                        handleUpdateRace(race.id, {
                                            title: e.target.value,
                                        })
                                    }
                                    placeholder="레이스 제목"
                                    className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveRace(race.id)}
                                    className="cursor-pointer shrink-0 text-xs text-gray-400 transition hover:text-red-500 dark:text-[#6b6b7a]"
                                >
                                    레이스 삭제
                                </button>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-3">
                                <input
                                    type="text"
                                    value={race.circuit}
                                    onChange={(e) =>
                                        handleUpdateRace(race.id, {
                                            circuit: e.target.value,
                                        })
                                    }
                                    placeholder="서킷"
                                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                                />
                                <input
                                    type="datetime-local"
                                    value={race.scheduledAt ?? ''}
                                    onChange={(e) =>
                                        handleUpdateRace(race.id, {
                                            scheduledAt: e.target.value.length > 0 ? e.target.value : null,
                                        })
                                    }
                                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                                />
                                <select
                                    value={race.status}
                                    onChange={(e) =>
                                        handleUpdateRace(race.id, {
                                            status: e.target.value as F1RaceStatus,
                                        })
                                    }
                                    className="cursor-pointer rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                                >
                                    {(Object.entries(RACE_STATUS_LABELS) as [F1RaceStatus, string][]).map(([val, label]) => (
                                        <option key={val} value={val}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-xs text-gray-400 dark:text-[#6b6b7a]">등록된 레이스가 없습니다.</p>
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
                    {isSaving ? '저장 중...' : '일정 저장'}
                </button>
            </div>
        </div>
    )
}
