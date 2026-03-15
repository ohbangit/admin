import { useEffect, useMemo, useState } from 'react'
import type { FinalResultContent, StandingEntry } from '../types'
import type { TournamentAdminTeam } from '../types'

interface FinalResultPanelEditorProps {
    content: Record<string, unknown>
    teams: TournamentAdminTeam[]
    onSave: (content: FinalResultContent) => Promise<void>
    isSaving: boolean
}

function parseFinalResultContent(
    raw: Record<string, unknown>,
): FinalResultContent {
    return {
        standings: Array.isArray(raw.standings)
            ? (raw.standings as StandingEntry[])
            : [],
        mvpPlayerId:
            typeof raw.mvpPlayerId === 'number' ? raw.mvpPlayerId : null,
    }
}

export function FinalResultPanelEditor({
    content,
    teams,
    onSave,
    isSaving,
}: FinalResultPanelEditorProps) {
    const parsed = parseFinalResultContent(content)

    // standings를 팀 목록 기반으로 초기화: 기존 데이터 우선
    function buildInitialStandings(): StandingEntry[] {
        if (parsed.standings.length > 0) return parsed.standings
        return teams.map((t, i) => ({
            teamId: t.id,
            rank: i + 1,
            wins: null,
            losses: null,
            points: null,
            note: '',
        }))
    }

    const [standings, setStandings] = useState<StandingEntry[]>(
        buildInitialStandings,
    )
    const [mvpPlayerId, setMvpPlayerId] = useState<number | null>(
        parsed.mvpPlayerId,
    )

    const mvpCandidates = useMemo(() => {
        const standingTeamIds = new Set<number>(standings.map((s) => s.teamId))
        return teams
            .filter((team) => standingTeamIds.has(team.id))
            .flatMap((team) =>
                team.members
                    .filter(
                        (member) =>
                            member.slot !== 'HEAD_COACH' &&
                            member.slot !== 'COACH',
                    )
                    .map((member) => ({
                        id: member.id,
                        name: member.name,
                        teamName: team.name,
                    })),
            )
    }, [standings, teams])

    useEffect(() => {
        if (mvpPlayerId === null) return
        const hasSelectedPlayer = mvpCandidates.some(
            (player) => player.id === mvpPlayerId,
        )
        if (!hasSelectedPlayer) {
            setMvpPlayerId(null)
        }
    }, [mvpCandidates, mvpPlayerId])

    function handleUpdateStanding(
        teamId: number,
        field: keyof Omit<StandingEntry, 'teamId'>,
        value: string,
    ) {
        setStandings((prev) =>
            prev.map((s) => {
                if (s.teamId !== teamId) return s
                if (field === 'note') return { ...s, note: value }
                const parsed = parseInt(value, 10)
                return {
                    ...s,
                    [field]: value.length > 0 && !isNaN(parsed) ? parsed : null,
                }
            }),
        )
    }

    function handleAddTeam(teamId: number) {
        if (standings.some((s) => s.teamId === teamId)) return
        setStandings((prev) => [
            ...prev,
            {
                teamId,
                rank: prev.length + 1,
                wins: null,
                losses: null,
                points: null,
                note: '',
            },
        ])
    }

    function handleRemoveStanding(teamId: number) {
        setStandings((prev) =>
            prev
                .filter((s) => s.teamId !== teamId)
                .map((s, i) => ({ ...s, rank: i + 1 })),
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

    const unaddedTeams = teams.filter(
        (t) => !standings.some((s) => s.teamId === t.id),
    )

    async function handleSave() {
        await onSave({ standings, mvpPlayerId })
    }

    return (
        <div className="mt-3 space-y-4 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-[#2e2e38] dark:bg-[#20202a]">
            <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-[#3a3a44] dark:bg-[#26262e]">
                <p className="mb-2 text-xs font-semibold text-gray-500 dark:text-[#adadb8]">
                    최종 결과 MVP
                </p>
                <select
                    value={mvpPlayerId ?? ''}
                    onChange={(e) => {
                        setMvpPlayerId(
                            e.target.value.length > 0
                                ? Number(e.target.value)
                                : null,
                        )
                    }}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs dark:border-[#3a3a44] dark:bg-[#1f1f27] dark:text-[#efeff1]"
                >
                    <option value="">MVP 미선택</option>
                    {mvpCandidates.map((player) => (
                        <option key={player.id} value={player.id}>
                            {player.name} ({player.teamName})
                        </option>
                    ))}
                </select>
            </div>

            {/* 순위표 */}
            {standings.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-[#2e2e38]">
                                <th className="pb-2 text-left text-gray-500 dark:text-[#adadb8]">
                                    순위
                                </th>
                                <th className="pb-2 text-left text-gray-500 dark:text-[#adadb8]">
                                    팀
                                </th>
                                <th className="pb-2 text-center text-gray-500 dark:text-[#adadb8]">
                                    승
                                </th>
                                <th className="pb-2 text-center text-gray-500 dark:text-[#adadb8]">
                                    패
                                </th>
                                <th className="pb-2 text-center text-gray-500 dark:text-[#adadb8]">
                                    점수
                                </th>
                                <th className="pb-2 text-left text-gray-500 dark:text-[#adadb8]">
                                    메모
                                </th>
                                <th className="pb-2" />
                            </tr>
                        </thead>
                        <tbody className="space-y-1">
                            {standings.map((s, index) => {
                                const team = teams.find(
                                    (t) => t.id === s.teamId,
                                )
                                return (
                                    <tr
                                        key={s.teamId}
                                        className="border-b border-gray-100 dark:border-[#2e2e38]"
                                    >
                                        <td className="py-2 pr-2">
                                            <div className="flex items-center gap-1">
                                                <span className="w-5 text-center font-semibold text-gray-700 dark:text-[#efeff1]">
                                                    {s.rank}
                                                </span>
                                                <div className="flex flex-col gap-0.5">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleMoveUp(index)
                                                        }
                                                        disabled={index === 0}
                                                        className="text-gray-300 leading-none transition hover:text-gray-500 disabled:opacity-20 dark:text-[#3a3a44]"
                                                    >
                                                        ▲
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleMoveDown(
                                                                index,
                                                            )
                                                        }
                                                        disabled={
                                                            index ===
                                                            standings.length - 1
                                                        }
                                                        className="text-gray-300 leading-none transition hover:text-gray-500 disabled:opacity-20 dark:text-[#3a3a44]"
                                                    >
                                                        ▼
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-2 pr-3">
                                            <span className="font-medium text-gray-700 dark:text-[#efeff1]">
                                                {team?.name ?? `팀 ${s.teamId}`}
                                            </span>
                                        </td>
                                        <td className="py-2 px-1">
                                            <input
                                                type="number"
                                                min={0}
                                                value={s.wins ?? ''}
                                                onChange={(e) =>
                                                    handleUpdateStanding(
                                                        s.teamId,
                                                        'wins',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="-"
                                                className="w-12 rounded border border-gray-200 px-1 py-0.5 text-center dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                                            />
                                        </td>
                                        <td className="py-2 px-1">
                                            <input
                                                type="number"
                                                min={0}
                                                value={s.losses ?? ''}
                                                onChange={(e) =>
                                                    handleUpdateStanding(
                                                        s.teamId,
                                                        'losses',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="-"
                                                className="w-12 rounded border border-gray-200 px-1 py-0.5 text-center dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                                            />
                                        </td>
                                        <td className="py-2 px-1">
                                            <input
                                                type="number"
                                                min={0}
                                                value={s.points ?? ''}
                                                onChange={(e) =>
                                                    handleUpdateStanding(
                                                        s.teamId,
                                                        'points',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="-"
                                                className="w-12 rounded border border-gray-200 px-1 py-0.5 text-center dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                                            />
                                        </td>
                                        <td className="py-2 px-1">
                                            <input
                                                type="text"
                                                value={s.note}
                                                onChange={(e) =>
                                                    handleUpdateStanding(
                                                        s.teamId,
                                                        'note',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="메모"
                                                className="w-24 rounded border border-gray-200 px-1 py-0.5 text-xs dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1] dark:placeholder-[#6b6b7a]"
                                            />
                                        </td>
                                        <td className="py-2 pl-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRemoveStanding(
                                                        s.teamId,
                                                    )
                                                }
                                                className="text-gray-300 transition hover:text-red-400 dark:text-[#3a3a44] dark:hover:text-red-500"
                                                aria-label="팀 삭제"
                                            >
                                                ✕
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-center text-xs text-gray-400 dark:text-[#6b6b7a]">
                    순위 데이터가 없습니다.
                </p>
            )}

            {/* 팀 추가 (미등록 팀만 표시) */}
            {unaddedTeams.length > 0 && (
                <div>
                    <p className="mb-1.5 text-xs font-semibold text-gray-500 dark:text-[#adadb8]">
                        팀 추가
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {unaddedTeams.map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => handleAddTeam(t.id)}
                                className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-600 transition hover:border-blue-300 hover:text-blue-600 dark:border-[#3a3a44] dark:text-[#adadb8] dark:hover:border-blue-700 dark:hover:text-blue-400"
                            >
                                + {t.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* 저장 */}
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={() => {
                        void handleSave()
                    }}
                    disabled={isSaving}
                    className="rounded-lg bg-blue-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
                >
                    {isSaving ? '저장 중...' : '최종 결과 저장'}
                </button>
            </div>
        </div>
    )
}
