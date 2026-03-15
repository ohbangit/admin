import { useState } from 'react'
import type { F1QualifyingContent, F1QualifyingDriver } from '../types'

interface F1QualifyingPanelEditorProps {
    content: Record<string, unknown>
    onSave: (content: F1QualifyingContent) => Promise<void>
    isSaving: boolean
}

function parseQualifyingDriver(raw: unknown, index: number): F1QualifyingDriver {
    const d = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>
    return {
        driverId: typeof d.driverId === 'string' ? d.driverId : crypto.randomUUID(),
        name: typeof d.name === 'string' ? d.name : '',
        avatarUrl: typeof d.avatarUrl === 'string' ? d.avatarUrl : null,
        isPartner: d.isPartner === true,
        position: typeof d.position === 'number' ? d.position : index + 1,
        lapTime: typeof d.lapTime === 'string' ? d.lapTime : null,
        qualified: d.qualified !== false,
    }
}

function parseContent(raw: Record<string, unknown>): F1QualifyingContent {
    const firstArr = Array.isArray(raw.firstDriverResults) ? raw.firstDriverResults : []
    const secondArr = Array.isArray(raw.secondDriverResults) ? raw.secondDriverResults : []
    return {
        description: typeof raw.description === 'string' ? raw.description : '',
        firstDriverResults: firstArr.map(parseQualifyingDriver),
        secondDriverResults: secondArr.map(parseQualifyingDriver),
    }
}

export function F1QualifyingPanelEditor({ content, onSave, isSaving }: F1QualifyingPanelEditorProps) {
    const parsed = parseContent(content)
    const [description, setDescription] = useState(parsed.description)
    const [firstDrivers, setFirstDrivers] = useState<F1QualifyingDriver[]>(parsed.firstDriverResults)
    const [secondDrivers, setSecondDrivers] = useState<F1QualifyingDriver[]>(parsed.secondDriverResults)

    function addDriver(group: 'first' | 'second') {
        const target = group === 'first' ? firstDrivers : secondDrivers
        const setter = group === 'first' ? setFirstDrivers : setSecondDrivers
        const next: F1QualifyingDriver = {
            driverId: crypto.randomUUID(),
            name: '',
            avatarUrl: null,
            isPartner: false,
            position: target.length + 1,
            lapTime: null,
            qualified: true,
        }
        setter((prev) => [...prev, next])
    }

    function removeDriver(group: 'first' | 'second', driverId: string) {
        const setter = group === 'first' ? setFirstDrivers : setSecondDrivers
        setter((prev) => prev.filter((d) => d.driverId !== driverId).map((d, i) => ({ ...d, position: i + 1 })))
    }

    function updateDriver(group: 'first' | 'second', driverId: string, patch: Partial<F1QualifyingDriver>) {
        const setter = group === 'first' ? setFirstDrivers : setSecondDrivers
        setter((prev) => prev.map((d) => (d.driverId === driverId ? { ...d, ...patch } : d)))
    }

    async function handleSave() {
        await onSave({
            description,
            firstDriverResults: firstDrivers,
            secondDriverResults: secondDrivers,
        })
    }

    return (
        <div className="mt-3 space-y-4 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-[#2e2e38] dark:bg-[#20202a]">
            {/* 설명 */}
            <div>
                <label className="mb-1 block text-xs font-semibold text-gray-500 dark:text-[#adadb8]">예선 설명</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="예선 설명 텍스트"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                />
            </div>

            {/* 퍼스트 / 세컨드 두 컬럼 */}
            <div className="grid gap-4 md:grid-cols-2">
                {(
                    [
                        { group: 'first' as const, label: 'First Driver', drivers: firstDrivers },
                        {
                            group: 'second' as const,
                            label: 'Second Driver',
                            drivers: secondDrivers,
                        },
                    ] as const
                ).map(({ group, label, drivers }) => (
                    <div key={group}>
                        <p className="mb-2 text-xs font-bold text-gray-500 dark:text-[#adadb8]">{label}</p>
                        <div className="space-y-2">
                            {drivers.map((driver) => (
                                <div
                                    key={driver.driverId}
                                    className="rounded-xl border border-gray-200 bg-white p-3 dark:border-[#2e2e38] dark:bg-[#1a1a23]"
                                >
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-xs font-semibold text-gray-400 dark:text-[#6b6b7a]">#{driver.position}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeDriver(group, driver.driverId)}
                                            className="cursor-pointer text-xs text-gray-400 hover:text-red-500 dark:text-[#6b6b7a]"
                                        >
                                            삭제
                                        </button>
                                    </div>
                                    <div className="grid gap-1.5">
                                        <input
                                            type="text"
                                            value={driver.name}
                                            onChange={(e) =>
                                                updateDriver(group, driver.driverId, {
                                                    name: e.target.value,
                                                })
                                            }
                                            placeholder="이름"
                                            className="rounded-lg border border-gray-300 px-2 py-1 text-xs dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                                        />
                                        <input
                                            type="text"
                                            value={driver.lapTime ?? ''}
                                            onChange={(e) =>
                                                updateDriver(group, driver.driverId, {
                                                    lapTime: e.target.value.trim().length > 0 ? e.target.value : null,
                                                })
                                            }
                                            placeholder="랩타임 (예: 1:23.456)"
                                            className="rounded-lg border border-gray-300 px-2 py-1 text-xs dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                                        />
                                        <input
                                            type="text"
                                            value={driver.avatarUrl ?? ''}
                                            onChange={(e) =>
                                                updateDriver(group, driver.driverId, {
                                                    avatarUrl: e.target.value.trim().length > 0 ? e.target.value : null,
                                                })
                                            }
                                            placeholder="아바타 URL (선택)"
                                            className="rounded-lg border border-gray-300 px-2 py-1 text-xs dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                                        />
                                        <div className="flex gap-3">
                                            <label className="flex cursor-pointer items-center gap-1.5 text-xs text-gray-600 dark:text-[#adadb8]">
                                                <input
                                                    type="checkbox"
                                                    checked={driver.qualified}
                                                    onChange={(e) =>
                                                        updateDriver(group, driver.driverId, {
                                                            qualified: e.target.checked,
                                                        })
                                                    }
                                                    className="cursor-pointer"
                                                />
                                                예선 통과
                                            </label>
                                            <label className="flex cursor-pointer items-center gap-1.5 text-xs text-gray-600 dark:text-[#adadb8]">
                                                <input
                                                    type="checkbox"
                                                    checked={driver.isPartner}
                                                    onChange={(e) =>
                                                        updateDriver(group, driver.driverId, {
                                                            isPartner: e.target.checked,
                                                        })
                                                    }
                                                    className="cursor-pointer"
                                                />
                                                파트너
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={() => addDriver(group)}
                            className="cursor-pointer mt-2 w-full rounded-xl border border-dashed border-gray-300 py-1.5 text-xs font-medium text-gray-400 hover:border-blue-400 hover:text-blue-500 dark:border-[#3a3a44]"
                        >
                            + 드라이버 추가
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={() => {
                        void handleSave()
                    }}
                    disabled={isSaving}
                    className="cursor-pointer rounded-lg bg-blue-500 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
                >
                    {isSaving ? '저장 중...' : '예선 결과 저장'}
                </button>
            </div>
        </div>
    )
}
