import { Star } from 'lucide-react'
import type { F1Driver } from '../../types'
import { MAX_TIER_STARS, isValidTier, tierStringToValue, tierValueToString } from '../../utils/f1TierUtils'

interface DriverCardProps {
    driver: F1Driver
    groupIndex: number
    originalIndex: number
    totalDrivers: number
    isExpanded: boolean
    onToggleExpand: () => void
    onMoveUp: () => void
    onMoveDown: () => void
    onRemove: () => void
    onUpdate: (patch: Partial<F1Driver>) => void
}

export function DriverCard({
    driver,
    groupIndex,
    originalIndex,
    totalDrivers,
    isExpanded,
    onToggleExpand,
    onMoveUp,
    onMoveDown,
    onRemove,
    onUpdate,
}: DriverCardProps) {
    const tierValue = tierStringToValue(driver.tier)
    const tierInvalid = driver.tier !== null && !isValidTier(driver.tier)

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-[#2e2e38] dark:bg-[#1a1a23]">
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-[#2e2e38] dark:bg-[#20202a]">
                <span className="shrink-0 text-xs font-semibold text-gray-500 dark:text-[#adadb8]">#{groupIndex}</span>

                <button type="button" onClick={onToggleExpand} className="cursor-pointer flex min-w-0 flex-1 items-center gap-2 text-left" aria-expanded={isExpanded}>
                    {driver.avatarUrl !== null ? (
                        <img src={driver.avatarUrl} alt={driver.nickname ?? driver.name} className="h-8 w-8 shrink-0 rounded-full object-cover" />
                    ) : (
                        <div className="h-8 w-8 shrink-0 rounded-full bg-gray-100 dark:bg-[#3a3a44]" />
                    )}

                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-800 dark:text-[#efeff1]">{driver.nickname ?? driver.name}</p>
                        {driver.nickname !== undefined && <p className="truncate text-[11px] text-gray-400 dark:text-[#6b6b7a]">{driver.name}</p>}
                    </div>

                    {driver.isPartner && (
                        <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                            파트너
                        </span>
                    )}

                    <span className="ml-1 shrink-0 text-xs text-gray-400 dark:text-[#adadb8]">{isExpanded ? '▾' : '▸'}</span>
                </button>

                <div className="ml-1 flex items-center gap-1">
                    <button
                        type="button"
                        onClick={onMoveUp}
                        disabled={originalIndex <= 0}
                        className="cursor-pointer rounded-md border border-gray-300 px-1.5 py-0.5 text-[10px] text-gray-500 transition hover:text-gray-700 disabled:opacity-30 dark:border-[#3a3a44] dark:text-[#adadb8]"
                    >
                        ▲
                    </button>
                    <button
                        type="button"
                        onClick={onMoveDown}
                        disabled={originalIndex >= totalDrivers - 1}
                        className="cursor-pointer rounded-md border border-gray-300 px-1.5 py-0.5 text-[10px] text-gray-500 transition hover:text-gray-700 disabled:opacity-30 dark:border-[#3a3a44] dark:text-[#adadb8]"
                    >
                        ▼
                    </button>
                    <button
                        type="button"
                        onClick={onRemove}
                        className="cursor-pointer rounded-md border border-red-200 px-1.5 py-0.5 text-[10px] text-red-500 transition hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-900/20"
                    >
                        삭제
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="flex flex-wrap gap-2">
                    <div className="min-w-[260px] flex-1 rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-[#2e2e38] dark:bg-[#20202a]">
                        <label className="mb-1 block text-[11px] font-medium text-gray-500 dark:text-[#adadb8]">티어</label>
                        <div className="flex items-center gap-1 overflow-x-auto">
                            {Array.from({ length: MAX_TIER_STARS }, (_, i) => i + 1).map((starIndex) => (
                                <HalfStarButton
                                    key={starIndex}
                                    starIndex={starIndex}
                                    value={tierValue}
                                    onSelect={(next) => {
                                        onUpdate({ tier: tierValueToString(next) })
                                    }}
                                />
                            ))}
                            <button
                                type="button"
                                onClick={() => {
                                    onUpdate({ tier: null })
                                }}
                                className="cursor-pointer ml-1 shrink-0 rounded-md border border-gray-300 px-1.5 py-0.5 text-[10px] text-gray-500 transition hover:text-red-500 dark:border-[#3a3a44] dark:text-[#adadb8]"
                            >
                                초기화
                            </button>
                            <span className="ml-1 shrink-0 text-[10px] text-gray-500 dark:text-[#adadb8]">{driver.tier ?? '-'}</span>
                        </div>
                        {tierInvalid && <p className="mt-1 text-[10px] text-red-500">기존 티어 값 형식이 올바르지 않습니다. 별을 눌러 다시 설정해주세요.</p>}
                    </div>

                    <div className="w-[110px] rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-[#2e2e38] dark:bg-[#20202a]">
                        <label className="mb-1 block text-[11px] font-medium text-gray-500 dark:text-[#adadb8]">랭킹</label>
                        <input
                            type="number"
                            min={1}
                            value={driver.ranking ?? ''}
                            onChange={(e) => {
                                onUpdate({ ranking: e.target.value.length > 0 ? Number(e.target.value) : null })
                            }}
                            placeholder="-"
                            className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                        />
                    </div>

                    <div className="w-[110px] rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-[#2e2e38] dark:bg-[#20202a]">
                        <label className="mb-1 block text-[11px] font-medium text-gray-500 dark:text-[#adadb8]">참가</label>
                        <input
                            type="number"
                            min={0}
                            value={driver.participationCount}
                            onChange={(e) => {
                                onUpdate({ participationCount: Number(e.target.value) })
                            }}
                            placeholder="0"
                            className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                        />
                    </div>

                    <div className="w-[110px] rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-[#2e2e38] dark:bg-[#20202a]">
                        <label className="mb-1 block text-[11px] font-medium text-gray-500 dark:text-[#adadb8]">우승</label>
                        <input
                            type="number"
                            min={0}
                            value={driver.winCount}
                            onChange={(e) => {
                                onUpdate({ winCount: Number(e.target.value) })
                            }}
                            placeholder="0"
                            className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                        />
                    </div>

                    {driver.driverRole === 'SECOND' && (
                        <div className="w-[160px] rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-[#2e2e38] dark:bg-[#20202a]">
                            <label className="mb-1 block text-[11px] font-medium text-gray-500 dark:text-[#adadb8]">세컨드 조</label>
                            <div className="flex items-center gap-3 text-xs">
                                <label className="flex cursor-pointer items-center gap-1 text-gray-600 dark:text-[#efeff1]">
                                    <input
                                        type="checkbox"
                                        checked={driver.secondGroup === 'A'}
                                        onChange={(e) => {
                                            onUpdate({ secondGroup: e.target.checked ? 'A' : null })
                                        }}
                                        className="cursor-pointer"
                                    />
                                    A조
                                </label>
                                <label className="flex cursor-pointer items-center gap-1 text-gray-600 dark:text-[#efeff1]">
                                    <input
                                        type="checkbox"
                                        checked={driver.secondGroup === 'B'}
                                        onChange={(e) => {
                                            onUpdate({ secondGroup: e.target.checked ? 'B' : null })
                                        }}
                                        className="cursor-pointer"
                                    />
                                    B조
                                </label>
                            </div>
                        </div>
                    )}

                    <div className="w-[160px] rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-[#2e2e38] dark:bg-[#20202a]">
                        <label className="mb-1 block text-[11px] font-medium text-gray-500 dark:text-[#adadb8]">예선 결과</label>
                        <label className="flex cursor-pointer items-center gap-1 text-xs text-gray-600 dark:text-[#efeff1]">
                            <input
                                type="checkbox"
                                checked={driver.qualifyingEliminated === true}
                                onChange={(e) => {
                                    onUpdate({ qualifyingEliminated: e.target.checked })
                                }}
                                className="cursor-pointer"
                            />
                            예선 탈락
                        </label>
                    </div>
                </div>
            )}
        </div>
    )
}

interface HalfStarButtonProps {
    starIndex: number
    value: number | null
    onSelect: (value: number) => void
}

function HalfStarButton({ starIndex, value, onSelect }: HalfStarButtonProps) {
    const filledPercent = value === null ? 0 : Math.max(0, Math.min(100, (value - (starIndex - 1)) * 100))

    return (
        <div className="relative h-5 w-5 shrink-0">
            <button type="button" onClick={() => onSelect(starIndex - 0.5)} className="cursor-pointer absolute left-0 top-0 z-10 h-full w-1/2" aria-label={`${starIndex}번째 별 반개`} />
            <button type="button" onClick={() => onSelect(starIndex)} className="cursor-pointer absolute right-0 top-0 z-10 h-full w-1/2" aria-label={`${starIndex}번째 별 한개`} />
            <Star className="h-5 w-5 text-gray-300 dark:text-[#3a3a44]" />
            {filledPercent > 0 && (
                <span className="pointer-events-none absolute left-0 top-0 overflow-hidden" style={{ width: `${filledPercent}%` }}>
                    <Star className="h-5 w-5 fill-[#F5C842] text-[#F5C842]" />
                </span>
            )}
        </div>
    )
}
