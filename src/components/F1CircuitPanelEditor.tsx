import { useState } from 'react'
import type { F1CircuitContent, F1CircuitItem } from '../types'
import { cn } from '../lib/cn'

interface F1CircuitPanelEditorProps {
    content: Record<string, unknown>
    onSave: (content: F1CircuitContent) => Promise<void>
    isSaving: boolean
}

function createEmptyCircuit(order: number): F1CircuitItem {
    return {
        id: crypto.randomUUID(),
        circuitName: '',
        description: '',
        country: null,
        layoutImageUrl: null,
        length: null,
        corners: null,
        lapRecord: null,
        order,
    }
}

function parseSingleLegacy(raw: Record<string, unknown>): F1CircuitItem {
    return {
        id: crypto.randomUUID(),
        circuitName: typeof raw.circuitName === 'string' ? raw.circuitName : '',
        description: typeof raw.description === 'string' ? raw.description : '',
        country: typeof raw.country === 'string' ? raw.country : null,
        layoutImageUrl: typeof raw.layoutImageUrl === 'string' ? raw.layoutImageUrl : null,
        length: typeof raw.length === 'string' ? raw.length : null,
        corners: typeof raw.corners === 'number' ? raw.corners : null,
        lapRecord: typeof raw.lapRecord === 'string' ? raw.lapRecord : null,
        order: 0,
    }
}

function parseContent(raw: Record<string, unknown>): F1CircuitContent {
    if (Array.isArray(raw.circuits)) {
        return {
            circuits: raw.circuits
                .map((item, index) => {
                    const c = typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {}
                    return {
                        id: typeof c.id === 'string' ? c.id : crypto.randomUUID(),
                        circuitName: typeof c.circuitName === 'string' ? c.circuitName : '',
                        description: typeof c.description === 'string' ? c.description : '',
                        country: typeof c.country === 'string' ? c.country : null,
                        layoutImageUrl: typeof c.layoutImageUrl === 'string' ? c.layoutImageUrl : null,
                        length: typeof c.length === 'string' ? c.length : null,
                        corners: typeof c.corners === 'number' ? c.corners : null,
                        lapRecord: typeof c.lapRecord === 'string' ? c.lapRecord : null,
                        order: typeof c.order === 'number' ? c.order : index,
                    } satisfies F1CircuitItem
                })
                .sort((a, b) => a.order - b.order),
        }
    }

    return {
        circuits: [parseSingleLegacy(raw)],
    }
}

export function F1CircuitPanelEditor({ content, onSave, isSaving }: F1CircuitPanelEditorProps) {
    const parsed = parseContent(content)
    const [circuits, setCircuits] = useState<F1CircuitItem[]>(parsed.circuits)
    const [activeId, setActiveId] = useState<string | null>(parsed.circuits[0]?.id ?? null)

    const activeIndex = circuits.findIndex((c) => c.id === activeId)
    const activeCircuit = activeIndex >= 0 ? circuits[activeIndex] : null

    function updateActive(patch: Partial<F1CircuitItem>) {
        if (activeCircuit === null) return
        setCircuits((prev) => prev.map((c) => (c.id === activeCircuit.id ? { ...c, ...patch } : c)))
    }

    function addCircuit() {
        const next = createEmptyCircuit(circuits.length)
        setCircuits((prev) => [...prev, next])
        setActiveId(next.id)
    }

    function removeCircuit(id: string) {
        if (!confirm('이 서킷을 삭제할까요?')) return

        setCircuits((prev) => {
            const next = prev.filter((c) => c.id !== id).map((c, idx) => ({ ...c, order: idx }))
            if (next.length > 0) {
                setActiveId(next[0].id)
            } else {
                setActiveId(null)
            }
            return next
        })
    }

    function moveCircuit(id: string, direction: 'up' | 'down') {
        setCircuits((prev) => {
            const idx = prev.findIndex((c) => c.id === id)
            if (idx === -1) return prev

            const target = direction === 'up' ? idx - 1 : idx + 1
            if (target < 0 || target >= prev.length) return prev

            const next = [...prev]
            const current = next[idx]
            const swap = next[target]
            if (current === undefined || swap === undefined) return prev

            next[idx] = { ...swap, order: idx }
            next[target] = { ...current, order: target }
            return next
        })
    }

    async function handleSave() {
        const normalized = circuits.map((c, idx) => ({ ...c, order: idx }))
        await onSave({ circuits: normalized })
    }

    return (
        <div className="mt-3 space-y-4 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-[#2e2e38] dark:bg-[#20202a]">
            <div className="flex flex-wrap items-center gap-2">
                {circuits.map((c, idx) => (
                    <button
                        key={c.id}
                        type="button"
                        onClick={() => setActiveId(c.id)}
                        className={cn(
                            'cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition',
                            c.id === activeId
                                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300'
                                : 'bg-white text-gray-500 hover:text-gray-700 dark:bg-[#26262e] dark:text-[#adadb8]',
                        )}
                    >
                        {idx + 1}. {c.circuitName || '서킷'}
                    </button>
                ))}

                <button
                    type="button"
                    onClick={addCircuit}
                    className="cursor-pointer rounded-full border border-dashed border-gray-300 px-3 py-1 text-xs text-gray-500 hover:text-blue-600 dark:border-[#3a3a44] dark:text-[#adadb8]"
                >
                    + 서킷 추가
                </button>
            </div>

            {activeCircuit !== null ? (
                <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-[#2e2e38] dark:bg-[#1a1a23]">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-500 dark:text-[#adadb8]">서킷 상세 편집</p>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => moveCircuit(activeCircuit.id, 'up')}
                                disabled={activeIndex <= 0}
                                className="cursor-pointer rounded border border-gray-300 px-2 py-1 text-[10px] text-gray-500 disabled:opacity-30 dark:border-[#3a3a44]"
                            >
                                ▲
                            </button>
                            <button
                                type="button"
                                onClick={() => moveCircuit(activeCircuit.id, 'down')}
                                disabled={activeIndex >= circuits.length - 1}
                                className="cursor-pointer rounded border border-gray-300 px-2 py-1 text-[10px] text-gray-500 disabled:opacity-30 dark:border-[#3a3a44]"
                            >
                                ▼
                            </button>
                            <button
                                type="button"
                                onClick={() => removeCircuit(activeCircuit.id)}
                                className="cursor-pointer rounded border border-red-200 px-2 py-1 text-[10px] text-red-500 dark:border-red-900/40"
                            >
                                삭제
                            </button>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-semibold text-gray-500 dark:text-[#adadb8]">서킷명 *</label>
                            <input
                                type="text"
                                value={activeCircuit.circuitName}
                                onChange={(e) => updateActive({ circuitName: e.target.value })}
                                placeholder="예: 몬차 서킷"
                                className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold text-gray-500 dark:text-[#adadb8]">국가</label>
                            <input
                                type="text"
                                value={activeCircuit.country ?? ''}
                                onChange={(e) =>
                                    updateActive({
                                        country: e.target.value.trim().length > 0 ? e.target.value : null,
                                    })
                                }
                                placeholder="예: 이탈리아"
                                className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold text-gray-500 dark:text-[#adadb8]">서킷 길이</label>
                            <input
                                type="text"
                                value={activeCircuit.length ?? ''}
                                onChange={(e) =>
                                    updateActive({
                                        length: e.target.value.trim().length > 0 ? e.target.value : null,
                                    })
                                }
                                placeholder="예: 5.793km"
                                className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold text-gray-500 dark:text-[#adadb8]">코너 수</label>
                            <input
                                type="number"
                                min={0}
                                value={activeCircuit.corners ?? ''}
                                onChange={(e) =>
                                    updateActive({
                                        corners: e.target.value.length > 0 ? Number(e.target.value) : null,
                                    })
                                }
                                placeholder="예: 11"
                                className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold text-gray-500 dark:text-[#adadb8]">랩 레코드 (선택)</label>
                            <input
                                type="text"
                                value={activeCircuit.lapRecord ?? ''}
                                onChange={(e) =>
                                    updateActive({
                                        lapRecord: e.target.value.trim().length > 0 ? e.target.value : null,
                                    })
                                }
                                placeholder="예: 1:21.046"
                                className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-semibold text-gray-500 dark:text-[#adadb8]">
                                레이아웃 이미지 URL (선택)
                            </label>
                            <input
                                type="text"
                                value={activeCircuit.layoutImageUrl ?? ''}
                                onChange={(e) =>
                                    updateActive({
                                        layoutImageUrl: e.target.value.trim().length > 0 ? e.target.value : null,
                                    })
                                }
                                placeholder="https://..."
                                className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-semibold text-gray-500 dark:text-[#adadb8]">서킷 소개</label>
                            <textarea
                                value={activeCircuit.description}
                                onChange={(e) => updateActive({ description: e.target.value })}
                                rows={4}
                                placeholder="서킷 소개 텍스트"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <p className="text-xs text-gray-500 dark:text-[#adadb8]">서킷을 추가해 주세요.</p>
            )}

            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={() => {
                        void handleSave()
                    }}
                    disabled={isSaving}
                    className="cursor-pointer rounded-lg bg-blue-500 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
                >
                    {isSaving ? '저장 중...' : '서킷 정보 저장'}
                </button>
            </div>
        </div>
    )
}
