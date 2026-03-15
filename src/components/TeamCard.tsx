import { useState } from 'react'
import {
    useAdminToast,
    useDeleteTournamentTeam,
    useUpdateTournamentTeam,
} from '../hooks'
import type {
    SlotType,
    TournamentAdminMember,
    TournamentAdminTeam,
} from '../types'
import { getErrorMessage } from '../utils'
import { MemberRow } from './MemberRow'
import { cn } from '../lib/cn'

interface TeamCardProps {
    tournamentId: number
    team: TournamentAdminTeam
}

const PLAYER_ROWS: { slot: SlotType; label: string; index: number }[] = [
    { slot: 'TNK', label: 'TNK', index: 0 },
    { slot: 'DPS', label: 'DPS', index: 0 },
    { slot: 'DPS', label: 'DPS', index: 1 },
    { slot: 'SPT', label: 'SPT', index: 0 },
    { slot: 'SPT', label: 'SPT', index: 1 },
]

const HEAD_COACH_ROW: { slot: SlotType; label: string } = {
    slot: 'HEAD_COACH',
    label: '감독',
}

export function TeamCard({ tournamentId, team }: TeamCardProps) {
    const { addToast } = useAdminToast()
    const updateTeam = useUpdateTournamentTeam(tournamentId, team.id)
    const deleteTeam = useDeleteTournamentTeam(tournamentId)

    const [isEditing, setIsEditing] = useState(false)
    const [name, setName] = useState(team.name)
    const [logoUrl, setLogoUrl] = useState(team.logoUrl ?? '')
    const [teamOrder, setTeamOrder] = useState(String(team.teamOrder))

    async function handleUpdateTeam(e: React.FormEvent) {
        e.preventDefault()
        if (name.trim().length === 0) {
            addToast({ message: '팀 이름을 입력해주세요.', variant: 'error' })
            return
        }
        try {
            await updateTeam.mutateAsync({
                name: name.trim(),
                logoUrl: logoUrl.trim().length > 0 ? logoUrl.trim() : undefined,
                teamOrder: Number(teamOrder),
            })
            addToast({ message: '저장되었습니다.', variant: 'success' })
            setIsEditing(false)
        } catch (error) {
            addToast({ message: getErrorMessage(error), variant: 'error' })
        }
    }

    async function handleDeleteTeam() {
        if (!confirm(`'${team.name}' 팀을 삭제할까요?`)) return
        try {
            await deleteTeam.mutateAsync(team.id)
            addToast({ message: '팀이 삭제되었습니다.', variant: 'success' })
        } catch (error) {
            addToast({ message: getErrorMessage(error), variant: 'error' })
        }
    }

    const bySlot = team.members.reduce<Record<string, TournamentAdminMember[]>>(
        (acc, m) => {
            acc[m.slot] = [...(acc[m.slot] ?? []), m]
            return acc
        },
        {},
    )

    const playerCount = ['TNK', 'DPS', 'SPT'].reduce(
        (sum, s) => sum + (bySlot[s]?.length ?? 0),
        0,
    )
    const coachMembers = bySlot.COACH ?? []

    return (
        <div className="overflow-visible rounded-2xl border border-gray-200 bg-white dark:border-[#3a3a44] dark:bg-[#1a1a23]">
            <div className="flex items-center gap-2.5 border-b border-gray-100 px-4 py-3 dark:border-[#2e2e38]">
                {team.logoUrl !== null ? (
                    <img
                        src={team.logoUrl}
                        alt={team.name}
                        className="h-8 w-8 rounded-lg object-cover"
                    />
                ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
                        {team.name.charAt(0)}
                    </div>
                )}

                <p className="min-w-0 flex-1 truncate text-sm font-bold text-gray-900 dark:text-[#efeff1]">
                    {team.name}
                </p>

                <span
                    className={cn(
                        'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold',
                        playerCount >= 5
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                            : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
                    )}
                >
                    {playerCount}/5
                </span>

                <button
                    type="button"
                    onClick={() => setIsEditing((prev) => !prev)}
                    className="shrink-0 rounded-lg border border-gray-200 px-2.5 py-1 text-[11px] font-medium text-gray-500 transition hover:border-blue-200 hover:text-blue-600 dark:border-[#3a3a44] dark:text-[#adadb8] dark:hover:border-blue-700 dark:hover:text-blue-400"
                >
                    편집
                </button>
                <button
                    type="button"
                    onClick={() => {
                        void handleDeleteTeam()
                    }}
                    disabled={deleteTeam.isPending}
                    className="shrink-0 rounded-lg border border-gray-200 px-2.5 py-1 text-[11px] font-medium text-gray-500 transition hover:border-red-200 hover:text-red-500 disabled:opacity-40 dark:border-[#3a3a44] dark:text-[#adadb8] dark:hover:border-red-900/60 dark:hover:text-red-400"
                >
                    삭제
                </button>
            </div>

            {isEditing && (
                <form
                    onSubmit={(e) => {
                        void handleUpdateTeam(e)
                    }}
                    className="flex flex-wrap gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3 dark:border-[#2e2e38] dark:bg-[#111118]"
                >
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="팀 이름"
                        className="min-w-28 flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                    />
                    <input
                        type="url"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        placeholder="로고 URL (선택)"
                        className="min-w-36 flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                    />
                    <input
                        type="number"
                        min={0}
                        value={teamOrder}
                        onChange={(e) => setTeamOrder(e.target.value)}
                        placeholder="순서"
                        className="w-14 rounded-lg border border-gray-300 px-2 py-1.5 text-sm dark:border-[#3a3a44] dark:bg-[#26262e] dark:text-[#efeff1]"
                    />
                    <button
                        type="submit"
                        disabled={updateTeam.isPending}
                        className="rounded-lg bg-blue-500 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
                    >
                        {updateTeam.isPending ? '저장 중...' : '저장'}
                    </button>
                </form>
            )}

            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-2 dark:border-[#2e2e38] dark:bg-[#20202a]">
                <p className="text-[11px] font-semibold tracking-wide text-gray-500 dark:text-[#adadb8]">
                    선수 라인업
                </p>
                <span className="text-[11px] font-medium text-gray-400 dark:text-[#848494]">
                    5인 고정
                </span>
            </div>
            <table className="w-full">
                <tbody>
                    {PLAYER_ROWS.map((row, idx) => (
                        <MemberRow
                            key={`${row.slot}-${row.index}`}
                            tournamentId={tournamentId}
                            teamId={team.id}
                            slot={row.slot}
                            label={row.label}
                            member={bySlot[row.slot]?.[row.index]}
                            isFirst={idx === 0}
                            isStaff={false}
                        />
                    ))}
                </tbody>
            </table>

            <div className="mx-4 border-t border-dashed border-gray-200 dark:border-[#2e2e38]" />
            <div className="flex items-center justify-between border-y border-gray-100 bg-gray-50 px-4 py-2 dark:border-[#2e2e38] dark:bg-[#20202a]">
                <p className="text-[11px] font-semibold tracking-wide text-gray-500 dark:text-[#adadb8]">
                    코치진
                </p>
                <span className="text-[11px] font-medium text-gray-400 dark:text-[#848494]">
                    감독 1명 · 코치 다수
                </span>
            </div>

            <table className="w-full">
                <tbody>
                    <MemberRow
                        key={HEAD_COACH_ROW.slot}
                        tournamentId={tournamentId}
                        teamId={team.id}
                        slot={HEAD_COACH_ROW.slot}
                        label={HEAD_COACH_ROW.label}
                        member={bySlot[HEAD_COACH_ROW.slot]?.[0]}
                        isFirst={true}
                        isStaff={true}
                    />
                    {coachMembers.map((member) => (
                        <MemberRow
                            key={`coach-${member.id}`}
                            tournamentId={tournamentId}
                            teamId={team.id}
                            slot={'COACH'}
                            label={'코치'}
                            member={member}
                            isFirst={false}
                            isStaff={true}
                        />
                    ))}
                    <MemberRow
                        key="coach-add"
                        tournamentId={tournamentId}
                        teamId={team.id}
                        slot={'COACH'}
                        label={'코치'}
                        member={undefined}
                        isFirst={false}
                        isStaff={true}
                    />
                </tbody>
            </table>

            <div className="h-1" />
        </div>
    )
}
