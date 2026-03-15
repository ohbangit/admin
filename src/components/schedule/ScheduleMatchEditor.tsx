import { TOURNAMENT_OVERWATCH_MAP_ENTRIES } from '../../constants/overwatch'
import type { MatchStatus, ScheduleMatch, TournamentAdminTeam } from '../../types'
import { MATCH_STATUS_LABELS, createDefaultSetMap, getMvpCandidates, inferMapTypeFromMapName, upsertSetMap } from '../../utils/schedulePanelUtils'

interface ScheduleMatchEditorProps {
    groupId: string
    match: ScheduleMatch
    teams: TournamentAdminTeam[]
    isOverwatch: boolean
    onRemoveMatch: (groupId: string, matchId: string) => void
    onUpdateMatch: (groupId: string, matchId: string, patch: Partial<ScheduleMatch>) => void
}

export function ScheduleMatchEditor({ groupId, match, teams, isOverwatch, onRemoveMatch, onUpdateMatch }: ScheduleMatchEditorProps) {
    const mvpCandidates = getMvpCandidates(match, teams)

    return (
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-[#2e2e38] dark:bg-[#20202a]">
            <div className="mb-2 flex items-center gap-2">
                <select
                    value={match.teamAId}
                    onChange={(e) => onUpdateMatch(groupId, match.id, { teamAId: Number(e.target.value) })}
                    className="flex-1 rounded-lg border border-gray-300 px-2 py-1.5 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                >
                    {teams.map((t) => (
                        <option key={t.id} value={t.id}>
                            {t.name}
                        </option>
                    ))}
                </select>
                <span className="shrink-0 text-xs font-bold text-gray-400 dark:text-[#6b6b7a]">VS</span>
                <select
                    value={match.teamBId}
                    onChange={(e) => onUpdateMatch(groupId, match.id, { teamBId: Number(e.target.value) })}
                    className="flex-1 rounded-lg border border-gray-300 px-2 py-1.5 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                >
                    {teams.map((t) => (
                        <option key={t.id} value={t.id}>
                            {t.name}
                        </option>
                    ))}
                </select>
                <button
                    type="button"
                    onClick={() => onRemoveMatch(groupId, match.id)}
                    className="shrink-0 text-gray-300 transition hover:text-red-400 dark:text-[#3a3a44] dark:hover:text-red-500"
                    aria-label="경기 삭제"
                >
                    ✕
                </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <input
                    type="number"
                    min={0}
                    value={match.scoreA ?? ''}
                    onChange={(e) => onUpdateMatch(groupId, match.id, { scoreA: e.target.value.length > 0 ? Number(e.target.value) : null })}
                    placeholder="A 스코어"
                    className="w-20 rounded-lg border border-gray-300 px-2 py-1 text-center text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                />
                <span className="text-xs text-gray-400">:</span>
                <input
                    type="number"
                    min={0}
                    value={match.scoreB ?? ''}
                    onChange={(e) => onUpdateMatch(groupId, match.id, { scoreB: e.target.value.length > 0 ? Number(e.target.value) : null })}
                    placeholder="B 스코어"
                    className="w-20 rounded-lg border border-gray-300 px-2 py-1 text-center text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                />
                <select
                    value={match.status}
                    onChange={(e) => onUpdateMatch(groupId, match.id, { status: e.target.value as MatchStatus })}
                    className="rounded-lg border border-gray-300 px-2 py-1 text-xs dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                >
                    {(Object.entries(MATCH_STATUS_LABELS) as [MatchStatus, string][]).map(([val, label]) => (
                        <option key={val} value={val}>
                            {label}
                        </option>
                    ))}
                </select>

                <div className="mt-2 w-full rounded-lg border border-gray-200 bg-white p-2.5 dark:border-[#2e2e38] dark:bg-[#1b1b24]">
                    <div className="mb-2 flex items-center justify-between">
                        <p className="text-[11px] font-semibold text-gray-500 dark:text-[#8f8fa3]">세트별 설정</p>
                        <span className="rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-500 dark:border-[#333341] dark:bg-[#23232e] dark:text-[#8f8fa3]">
                            {match.mvpPlayerIds.length}세트
                        </span>
                    </div>

                    {match.mvpPlayerIds.length === 0 ? (
                        <p className="rounded-md border border-dashed border-gray-200 bg-gray-50 px-2 py-1.5 text-[11px] text-gray-400 dark:border-[#333341] dark:bg-[#23232e] dark:text-[#6b6b7a]">
                            아직 세트 설정이 없습니다.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {match.mvpPlayerIds.map((playerId, setIndex) => (
                                <SetConfigRow
                                    key={setIndex}
                                    setIndex={setIndex}
                                    playerId={playerId}
                                    match={match}
                                    isOverwatch={isOverwatch}
                                    mvpCandidates={mvpCandidates}
                                    onUpdate={(patch) => onUpdateMatch(groupId, match.id, patch)}
                                />
                            ))}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => {
                            const firstId = mvpCandidates[0]?.id
                            if (firstId === undefined) return
                            onUpdateMatch(groupId, match.id, {
                                mvpPlayerIds: [...match.mvpPlayerIds, firstId],
                                ...(isOverwatch && { setMaps: [...(match.setMaps ?? []), createDefaultSetMap(match.mvpPlayerIds.length + 1)] }),
                            })
                        }}
                        disabled={mvpCandidates.length === 0}
                        className="cursor-pointer mt-2 w-full rounded-md border border-dashed border-blue-300 bg-blue-50/70 px-2 py-1.5 text-[11px] font-semibold text-blue-600 transition hover:border-blue-400 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-blue-800/40 dark:bg-blue-900/10 dark:text-blue-300"
                    >
                        + 세트 설정 추가
                    </button>
                </div>
            </div>
        </div>
    )
}

function SetConfigRow({
    setIndex,
    playerId,
    match,
    isOverwatch,
    mvpCandidates,
    onUpdate,
}: {
    setIndex: number
    playerId: number
    match: ScheduleMatch
    isOverwatch: boolean
    mvpCandidates: Array<{ id: number; name: string; teamName: string }>
    onUpdate: (patch: Partial<ScheduleMatch>) => void
}) {
    return (
        <div className="rounded-md border border-gray-200 bg-gray-50 px-2 py-2 dark:border-[#333341] dark:bg-[#23232e]">
            <div className="mb-1.5 flex items-center justify-between">
                <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600 dark:bg-blue-900/20 dark:text-blue-300">SET {setIndex + 1}</span>
                <button
                    type="button"
                    onClick={() => {
                        const nextSetMaps = match.setMaps?.filter((_, i) => i !== setIndex)
                        onUpdate({
                            mvpPlayerIds: match.mvpPlayerIds.filter((_, i) => i !== setIndex),
                            ...(isOverwatch && { setMaps: nextSetMaps?.map((setMap, i) => ({ ...setMap, setNumber: i + 1 })) ?? [] }),
                        })
                    }}
                    className="cursor-pointer rounded px-1 py-0.5 text-[10px] text-gray-400 transition hover:bg-red-50 hover:text-red-500 dark:text-[#6b6b7a] dark:hover:bg-red-900/20 dark:hover:text-red-400"
                >
                    삭제
                </button>
            </div>

            <div className="flex flex-wrap items-end gap-2">
                {isOverwatch && (
                    <label className="min-w-[230px] flex-1 space-y-1">
                        <span className="block text-[10px] text-gray-400 dark:text-[#6b6b7a]">맵</span>
                        <select
                            value={match.setMaps?.[setIndex]?.mapName ?? ''}
                            onChange={(e) => {
                                const mapName = e.target.value.length > 0 ? e.target.value : null
                                const inferredType = inferMapTypeFromMapName(mapName)
                                onUpdate({
                                    setMaps: upsertSetMap(match, setIndex, {
                                        mapName,
                                        ...(inferredType !== null && { mapType: inferredType }),
                                    }),
                                })
                            }}
                            className="cursor-pointer w-full rounded border border-gray-300 px-2 py-1 text-xs dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                        >
                            <option value="">TBD</option>
                            {TOURNAMENT_OVERWATCH_MAP_ENTRIES.map((entry) => (
                                <option key={entry.mapName} value={entry.mapName}>
                                    {entry.mapName}
                                </option>
                            ))}
                        </select>
                    </label>
                )}

                {isOverwatch && (
                    <label className="min-w-[140px] space-y-1">
                        <span className="block text-[10px] text-gray-400 dark:text-[#6b6b7a]">세트 스코어</span>
                        <div className="flex items-center gap-1.5">
                            <input
                                type="number"
                                min={0}
                                value={match.setMaps?.[setIndex]?.scoreA ?? ''}
                                onChange={(e) => onUpdate({ setMaps: upsertSetMap(match, setIndex, { scoreA: e.target.value.length > 0 ? Number(e.target.value) : null }) })}
                                className="w-14 rounded border border-gray-300 px-2 py-1 text-center text-xs dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                            />
                            <span className="text-xs text-gray-400 dark:text-[#6b6b7a]">:</span>
                            <input
                                type="number"
                                min={0}
                                value={match.setMaps?.[setIndex]?.scoreB ?? ''}
                                onChange={(e) => onUpdate({ setMaps: upsertSetMap(match, setIndex, { scoreB: e.target.value.length > 0 ? Number(e.target.value) : null }) })}
                                className="w-14 rounded border border-gray-300 px-2 py-1 text-center text-xs dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                            />
                        </div>
                    </label>
                )}

                <label className="min-w-[190px] flex-1 space-y-1">
                    <span className="block text-[10px] text-gray-400 dark:text-[#6b6b7a]">세트 MVP</span>
                    <select
                        value={playerId}
                        onChange={(e) => {
                            const newIds = [...match.mvpPlayerIds]
                            newIds[setIndex] = Number(e.target.value)
                            onUpdate({ mvpPlayerIds: newIds })
                        }}
                        className="cursor-pointer w-full rounded border border-gray-300 px-2 py-1 text-xs dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                    >
                        {mvpCandidates.map((player) => (
                            <option key={player.id} value={player.id}>
                                {player.name} ({player.teamName})
                            </option>
                        ))}
                    </select>
                </label>
            </div>
        </div>
    )
}
