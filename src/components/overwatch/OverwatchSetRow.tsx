import type { OverwatchMapType, SetResult } from '../../types/overwatch'
import { OVERWATCH_MAP_TYPE_CONFIG } from '../../utils/overwatchMaps'
import type { OverwatchSetInput } from '../../types'
import { cn } from '../../lib/cn'

const MAP_TYPES: readonly OverwatchMapType[] = ['쟁탈', '혼합', '밀기', '호위'] as const

const MAP_TYPE_BADGE_CLASS: Record<OverwatchMapType, string> = {
    쟁탈: 'bg-violet-500/15 text-violet-400',
    혼합: 'bg-orange-500/15 text-orange-400',
    밀기: 'bg-blue-500/15 text-blue-400',
    호위: 'bg-emerald-500/15 text-emerald-400',
}

interface OverwatchSetRowProps {
    set: OverwatchSetInput
    homeTeam: string
    awayTeam: string
    onChange: (updated: OverwatchSetInput) => void
}

export function OverwatchSetRow({ set, homeTeam, awayTeam, onChange }: OverwatchSetRowProps) {
    const availableMaps = OVERWATCH_MAP_TYPE_CONFIG[set.mapType].maps

    function update<K extends keyof OverwatchSetInput>(key: K, value: OverwatchSetInput[K]): void {
        onChange({ ...set, [key]: value })
    }

    function handleMapTypeChange(newType: OverwatchMapType): void {
        onChange({ ...set, mapType: newType, mapName: null, roundScore: undefined })
    }

    const resultLabel: Record<NonNullable<SetResult>, string> = {
        home: homeTeam.length > 0 ? homeTeam : '홈팀',
        away: awayTeam.length > 0 ? awayTeam : '어웨이팀',
    }

    return (
        <div
            className={cn(
                'grid items-center gap-2 rounded-xl border px-3 py-2',
                set.isPlayed
                    ? 'border-gray-200 bg-white dark:border-[#3a3a44] dark:bg-[#1e1e28]'
                    : 'border-dashed border-gray-200 bg-gray-50/50 opacity-60 dark:border-[#3a3a44] dark:bg-[#1a1a23]',
            )}
            style={{ gridTemplateColumns: '2rem 5rem 1fr 6rem 2.5rem' }}
        >
            {/* 세트 번호 */}
            <span className="text-center text-xs font-bold text-gray-400 dark:text-[#848494]">{set.setNumber}</span>

            {/* 맵 타입 셀렉트 */}
            <div className="relative">
                <select
                    value={set.mapType}
                    onChange={(e) => handleMapTypeChange(e.target.value as OverwatchMapType)}
                    className={cn(
                        'cursor-pointer w-full appearance-none rounded-lg border-0 px-2 py-1 pr-6 text-center text-xs font-semibold',
                        MAP_TYPE_BADGE_CLASS[set.mapType],
                    )}
                >
                    {MAP_TYPES.map((type) => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    ))}
                </select>
                <svg
                    className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-current opacity-60"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.1 1.02l-4.25 4.5a.75.75 0 01-1.1 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
                </svg>
            </div>

            {/* 맵명 셀렉트 + 쟁탈 라운드 점수 */}
            <div className="flex min-w-0 items-center gap-2">
                <div className="relative min-w-0 flex-1">
                    <select
                        value={set.mapName ?? ''}
                        onChange={(e) => update('mapName', e.target.value.length > 0 ? e.target.value : null)}
                        className="w-full appearance-none rounded-lg border border-gray-300 px-2 py-1 pr-7 text-xs dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                    >
                        <option value="">TBD</option>
                        {availableMaps.map((mapName) => (
                            <option key={mapName} value={mapName}>
                                {mapName}
                            </option>
                        ))}
                    </select>
                    <svg
                        className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400 dark:text-[#848494]"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.1 1.02l-4.25 4.5a.75.75 0 01-1.1 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
                    </svg>
                </div>
                {set.mapType === '쟁탈' && (
                    <input
                        type="text"
                        value={set.roundScore ?? ''}
                        onChange={(e) => update('roundScore', e.target.value.length > 0 ? e.target.value : undefined)}
                        placeholder="2:1"
                        maxLength={3}
                        className="w-12 shrink-0 rounded-lg border border-gray-300 px-2 py-1 text-center text-xs dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                        aria-label="라운드 점수"
                    />
                )}
            </div>

            {/* 세트 결과 셀렉트 */}
            <div className="relative">
                <select
                    value={set.result ?? ''}
                    onChange={(e) => {
                        const val = e.target.value
                        update('result', val.length > 0 ? (val as NonNullable<SetResult>) : null)
                    }}
                    className="w-full appearance-none rounded-lg border border-gray-300 px-2 py-1 pr-7 text-xs dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                >
                    <option value="">미정</option>
                    <option value="home">{resultLabel.home}</option>
                    <option value="away">{resultLabel.away}</option>
                </select>
                <svg
                    className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400 dark:text-[#848494]"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.1 1.02l-4.25 4.5a.75.75 0 01-1.1 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
                </svg>
            </div>

            {/* 진행됨 체크박스 */}
            <div className="flex justify-center">
                <input
                    type="checkbox"
                    checked={set.isPlayed}
                    onChange={(e) => update('isPlayed', e.target.checked)}
                    className="h-4 w-4 cursor-pointer accent-blue-500"
                    aria-label={`${set.setNumber}세트 진행됨`}
                />
            </div>
        </div>
    )
}
