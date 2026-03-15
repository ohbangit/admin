import { useState } from 'react'
import type { ReactNode } from 'react'
import { useAdminStreamerSearch } from '../hooks'
import type { F1Driver, F1DriversContent, F1DriverRole } from '../types'
import { isValidTier, normalizeTier, parseF1DriversContent } from '../utils/f1TierUtils'
import { DriverAddForm, type SelectedStreamer } from './f1/DriverAddForm'
import { DriverCard } from './f1/DriverCard'

interface F1DriversPanelEditorProps {
    content: Record<string, unknown>
    onSave: (content: F1DriversContent) => Promise<void>
    isSaving: boolean
}

function DriverGroupSection({
    title,
    titleClass,
    dotClass,
    expanded,
    count,
    onToggle,
    children,
}: {
    title: string
    titleClass: string
    dotClass: string
    expanded: boolean
    count: number
    onToggle: () => void
    children: ReactNode
}) {
    return (
        <div>
            <button type="button" onClick={onToggle} className="cursor-pointer mb-2 flex w-full items-center gap-2" aria-expanded={expanded}>
                <span className={`h-2 w-2 rounded-full ${dotClass}`} />
                <p className={`text-xs font-black tracking-widest uppercase ${titleClass}`}>
                    {title} ({count})
                </p>
                <span className={`ml-auto text-xs ${titleClass}`}>{expanded ? '▾' : '▸'}</span>
            </button>
            {expanded && <div className="space-y-3">{children}</div>}
        </div>
    )
}

export function F1DriversPanelEditor({ content, onSave, isSaving }: F1DriversPanelEditorProps) {
    const parsed = parseF1DriversContent(content)
    const [drivers, setDrivers] = useState<F1Driver[]>(parsed.participants)
    const [selectedRole, setSelectedRole] = useState<F1DriverRole>('FIRST')
    const [searchInput, setSearchInput] = useState('')
    const [selectedStreamer, setSelectedStreamer] = useState<SelectedStreamer | null>(null)
    const [isFirstExpanded, setIsFirstExpanded] = useState(true)
    const [isSecondExpanded, setIsSecondExpanded] = useState(true)
    const [expandedDriverIds, setExpandedDriverIds] = useState<Record<string, boolean>>({})
    const { data: suggestions, isFetching } = useAdminStreamerSearch(selectedStreamer === null ? searchInput : '')

    function handleAddDriver() {
        if (selectedStreamer === null) return
        if (drivers.some((d) => d.streamerId === selectedStreamer.id)) {
            alert('이미 추가된 스트리머입니다.')
            return
        }

        const next: F1Driver = {
            id: crypto.randomUUID(),
            streamerId: selectedStreamer.id,
            name: selectedStreamer.name,
            nickname: selectedStreamer.nickname,
            avatarUrl: selectedStreamer.channelImageUrl,
            channelUrl: selectedStreamer.channelId !== null ? `https://chzzk.naver.com/live/${selectedStreamer.channelId}` : null,
            isPartner: selectedStreamer.isPartner,
            driverRole: selectedRole,
            tier: null,
            ranking: null,
            participationCount: 0,
            winCount: 0,
            carNumber: null,
            secondGroup: null,
            qualifyingEliminated: false,
            order: drivers.length,
        }

        setDrivers((prev) => [...prev, next])
        setSelectedStreamer(null)
        setSearchInput('')
    }

    function handleRemoveDriver(driverId: string) {
        if (!confirm('이 드라이버를 삭제할까요?')) return
        setDrivers((prev) => prev.filter((d) => d.id !== driverId).map((d, i) => ({ ...d, order: i })))
        setExpandedDriverIds((prev) => {
            const next = { ...prev }
            delete next[driverId]
            return next
        })
    }

    function handleUpdateDriver(driverId: string, patch: Partial<F1Driver>) {
        setDrivers((prev) => prev.map((d) => (d.id === driverId ? { ...d, ...patch } : d)))
    }

    function handleMove(index: number, direction: 'up' | 'down') {
        setDrivers((prev) => {
            const target = direction === 'up' ? index - 1 : index + 1
            if (target < 0 || target >= prev.length) return prev
            const next = [...prev]
            const temp = next[target]
            if (temp === undefined || next[index] === undefined) return prev
            next[target] = { ...next[index], order: target }
            next[index] = { ...temp, order: index }
            return next
        })
    }

    async function handleSave() {
        const invalidTierDriver = drivers.find((d) => !isValidTier(d.tier))
        if (invalidTierDriver !== undefined) {
            alert('티어 형식은 "1성~6성" 또는 "4성+" 형태로 입력해주세요.')
            return
        }

        await onSave({ participants: drivers.map((d) => ({ ...d, tier: d.tier === null ? null : (normalizeTier(d.tier) ?? d.tier.trim()) })) })
    }

    const firstDrivers = drivers.filter((d) => d.driverRole === 'FIRST')
    const secondDrivers = drivers.filter((d) => d.driverRole === 'SECOND')

    return (
        <div className="mt-3 space-y-4 rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-[#2e2e38] dark:bg-[#20202a]">
            <DriverAddForm
                selectedRole={selectedRole}
                searchInput={searchInput}
                selectedStreamer={selectedStreamer}
                isFetching={isFetching}
                suggestions={suggestions}
                onRoleChange={setSelectedRole}
                onSearchInputChange={(value) => {
                    setSearchInput(value)
                    setSelectedStreamer(null)
                }}
                onClearSelectedStreamer={() => {
                    setSelectedStreamer(null)
                    setSearchInput('')
                }}
                onSelectStreamer={(streamer) => {
                    setSelectedStreamer(streamer)
                    setSearchInput(streamer.nickname)
                }}
                onAddDriver={handleAddDriver}
            />

            {drivers.length > 0 ? (
                <div className="space-y-4">
                    <DriverGroupSection
                        title="First Driver"
                        titleClass="text-[#E10600]"
                        dotClass="bg-[#E10600]"
                        expanded={isFirstExpanded}
                        count={firstDrivers.length}
                        onToggle={() => setIsFirstExpanded((prev) => !prev)}
                    >
                        {firstDrivers.map((driver, idx) => {
                            const originalIndex = drivers.findIndex((d) => d.id === driver.id)
                            return (
                                <DriverCard
                                    key={driver.id}
                                    driver={driver}
                                    groupIndex={idx + 1}
                                    originalIndex={originalIndex}
                                    totalDrivers={drivers.length}
                                    isExpanded={expandedDriverIds[driver.id] ?? false}
                                    onToggleExpand={() => setExpandedDriverIds((prev) => ({ ...prev, [driver.id]: !(prev[driver.id] ?? false) }))}
                                    onMoveUp={() => handleMove(originalIndex, 'up')}
                                    onMoveDown={() => handleMove(originalIndex, 'down')}
                                    onRemove={() => handleRemoveDriver(driver.id)}
                                    onUpdate={(patch) => handleUpdateDriver(driver.id, patch)}
                                />
                            )
                        })}
                    </DriverGroupSection>

                    <DriverGroupSection
                        title="Second Driver"
                        titleClass="text-[#6aadcc]"
                        dotClass="bg-[#6aadcc]"
                        expanded={isSecondExpanded}
                        count={secondDrivers.length}
                        onToggle={() => setIsSecondExpanded((prev) => !prev)}
                    >
                        {secondDrivers.map((driver, idx) => {
                            const originalIndex = drivers.findIndex((d) => d.id === driver.id)
                            return (
                                <DriverCard
                                    key={driver.id}
                                    driver={driver}
                                    groupIndex={idx + 1}
                                    originalIndex={originalIndex}
                                    totalDrivers={drivers.length}
                                    isExpanded={expandedDriverIds[driver.id] ?? false}
                                    onToggleExpand={() => setExpandedDriverIds((prev) => ({ ...prev, [driver.id]: !(prev[driver.id] ?? false) }))}
                                    onMoveUp={() => handleMove(originalIndex, 'up')}
                                    onMoveDown={() => handleMove(originalIndex, 'down')}
                                    onRemove={() => handleRemoveDriver(driver.id)}
                                    onUpdate={(patch) => handleUpdateDriver(driver.id, patch)}
                                />
                            )
                        })}
                    </DriverGroupSection>
                </div>
            ) : (
                <p className="text-center text-xs text-gray-400 dark:text-[#6b6b7a]">등록된 드라이버가 없습니다.</p>
            )}

            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={() => {
                        void handleSave()
                    }}
                    disabled={isSaving}
                    className="cursor-pointer w-full rounded-lg bg-blue-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50 sm:w-auto"
                >
                    {isSaving ? '저장 중...' : '드라이버 저장'}
                </button>
            </div>
        </div>
    )
}
