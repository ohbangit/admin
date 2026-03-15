import { useState } from 'react'
import { Crown } from 'lucide-react'
import partnerMark from '../assets/mark.png'
import { useAdminToast, useDeleteTournamentMember, useUpsertTournamentMember } from '../hooks'
import type { SlotType, TournamentAdminMember } from '../types'
import { getErrorMessage } from '../utils'
import { AssignDropdown } from './AssignDropdown'
import { cn } from '../lib/cn'

interface MemberRowProps {
    tournamentId: number
    teamId: number
    slot: SlotType
    label: string
    member: TournamentAdminMember | undefined
    isFirst: boolean
    isStaff: boolean
}

export function MemberRow({ tournamentId, teamId, slot, label, member, isFirst, isStaff }: MemberRowProps) {
    const { addToast } = useAdminToast()
    const deleteMember = useDeleteTournamentMember(tournamentId, teamId)
    const upsertMember = useUpsertTournamentMember(tournamentId, teamId)
    const [assignOpen, setAssignOpen] = useState(false)

    async function handleDelete(memberId: number) {
        try {
            await deleteMember.mutateAsync({ memberId })
            addToast({ message: '삭제되었습니다.', variant: 'success' })
        } catch (error) {
            addToast({ message: getErrorMessage(error), variant: 'error' })
        }
    }

    async function handleToggleCaptain() {
        if (member === undefined) return
        try {
            await upsertMember.mutateAsync({
                slot,
                streamerId: member.streamerId ?? undefined,
                name: member.streamerId === null ? member.name : undefined,
                profileUrl: member.profileUrl ?? undefined,
                isCaptain: !member.isCaptain,
            })
            addToast({
                message: member.isCaptain ? '팀장 지정이 해제되었습니다.' : '팀장으로 지정되었습니다.',
                variant: 'success',
            })
        } catch (error) {
            addToast({ message: getErrorMessage(error), variant: 'error' })
        }
    }

    return (
        <tr className={cn('group', !isFirst ? 'border-t border-gray-100 dark:border-[#2e2e38]' : '')}>
            <td className="w-16 py-2 pl-4 pr-2">
                <span
                    className={cn(
                        'inline-block rounded-md px-2 py-0.5 text-[11px] font-bold tracking-wide',
                        isStaff
                            ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-300'
                            : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300',
                    )}
                >
                    {label}
                </span>
            </td>

            <td className="relative py-2 pl-1 pr-2">
                {member !== undefined ? (
                    <div className="flex items-center gap-2">
                        {member.avatarUrl !== null ? (
                            <img src={member.avatarUrl} alt={member.name} className="h-6 w-6 rounded-full object-cover" />
                        ) : (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-[10px] font-bold text-gray-500 dark:bg-[#3a3a44]">
                                {member.name.charAt(0)}
                            </div>
                        )}
                        <span className="text-sm text-gray-900 dark:text-[#efeff1]">{member.name}</span>
                        {member.isPartner && <img src={partnerMark} alt="파트너" className="h-3.5 w-3.5" />}
                        {member.profileUrl !== null && (
                            <a
                                href={member.profileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="프로필 링크"
                                className="text-gray-300 transition hover:text-blue-500 dark:text-[#3a3a44] dark:hover:text-blue-400"
                            >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                    />
                                </svg>
                            </a>
                        )}
                    </div>
                ) : (
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setAssignOpen((prev) => !prev)}
                            className="rounded-md border border-dashed border-gray-300 px-3 py-1 text-xs text-gray-400 transition hover:border-blue-300 hover:text-blue-500 dark:border-[#3a3a44] dark:text-[#848494] dark:hover:border-blue-700 dark:hover:text-blue-400"
                        >
                            + 배정
                        </button>
                        {assignOpen && (
                            <AssignDropdown tournamentId={tournamentId} teamId={teamId} slot={slot} onClose={() => setAssignOpen(false)} />
                        )}
                    </div>
                )}
            </td>

            <td className="w-20 py-2 pr-3 text-right">
                {member !== undefined && (
                    <div className="flex items-center justify-end gap-2">
                        {!isStaff && (
                            <button
                                type="button"
                                onClick={() => {
                                    void handleToggleCaptain()
                                }}
                                disabled={upsertMember.isPending}
                                title={member.isCaptain ? '팀장 해제' : '팀장 지정'}
                                className={cn(
                                    'cursor-pointer rounded p-1 transition disabled:opacity-40',
                                    member.isCaptain
                                        ? 'bg-amber-100 text-amber-500 dark:bg-amber-900/30'
                                        : 'text-gray-300 hover:bg-gray-100 hover:text-amber-500 dark:text-[#3a3a44] dark:hover:bg-[#2e2e38] dark:hover:text-amber-400',
                                )}
                                aria-label={member.isCaptain ? '팀장 해제' : '팀장 지정'}
                            >
                                <Crown className={cn('h-3.5 w-3.5', member.isCaptain ? 'fill-current' : '')} />
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => {
                                void handleDelete(member.id)
                            }}
                            disabled={deleteMember.isPending}
                            title="삭제"
                            className="cursor-pointer text-gray-200 opacity-0 transition group-hover:opacity-100 hover:text-red-400 disabled:opacity-40 dark:text-[#3a3a44] dark:hover:text-red-400"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}
            </td>
        </tr>
    )
}
