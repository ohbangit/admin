import { AddTeamCard, TeamCard } from '../index'
import { cn } from '../../lib/cn'
import type { TournamentAdminTeam } from '../../types'

interface RosterSectionProps {
    errorMessage: string
    hoveredTeamId: number | null
    isCollapsed: boolean
    isError: boolean
    isLoading: boolean
    isReorderPending: boolean
    selectedTournamentId: number | null
    sortedTeams: TournamentAdminTeam[]
    draggingTeamId: number | null
    onToggleCollapsed: () => void
    onDragStartTeam: (teamId: number) => void
    onDragEndTeam: () => void
    onDragEnterTeam: (teamId: number) => void
    onDragLeaveTeam: (teamId: number) => void
    onDropTeam: (teamId: number) => void
}

export function RosterSection({
    draggingTeamId,
    errorMessage,
    hoveredTeamId,
    isCollapsed,
    isError,
    isLoading,
    isReorderPending,
    onDragEndTeam,
    onDragEnterTeam,
    onDragLeaveTeam,
    onDragStartTeam,
    onDropTeam,
    onToggleCollapsed,
    selectedTournamentId,
    sortedTeams,
}: RosterSectionProps) {
    return (
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-[#3a3a44] dark:bg-[#1a1a23]">
            <button
                type="button"
                onClick={onToggleCollapsed}
                aria-expanded={!isCollapsed}
                aria-controls="tournament-roster-panel"
                className={cn('flex w-full items-center justify-between px-4 py-3 text-left', isCollapsed ? '' : 'border-b border-gray-100 dark:border-[#2e2e38]')}
            >
                <span>
                    <p className="text-sm font-semibold text-gray-700 dark:text-[#efeff1]">팀 정보</p>
                    <p className="text-xs text-gray-400 dark:text-[#adadb8]">팀 카드 드래그로 노출 순서를 변경할 수 있습니다.</p>
                </span>
                <span className="text-xs text-gray-500 dark:text-[#adadb8]">{isCollapsed ? '펼치기' : '접기'}</span>
            </button>

            <div id="tournament-roster-panel" className={isCollapsed ? 'hidden' : 'block'}>
                <div className="p-4">
                    {isLoading && (
                        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500 dark:border-[#3a3a44] dark:bg-[#1a1a23] dark:text-[#adadb8]">
                            불러오는 중...
                        </div>
                    )}

                    {isError && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-10 text-center text-sm text-red-600 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
                            {errorMessage}
                        </div>
                    )}

                    {!isLoading && !isError && (
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {sortedTeams.map((team) => (
                                <div
                                    key={team.id}
                                    draggable={!isReorderPending}
                                    onDragStart={() => onDragStartTeam(team.id)}
                                    onDragEnd={onDragEndTeam}
                                    onDragOver={(event) => {
                                        event.preventDefault()
                                    }}
                                    onDragEnter={() => onDragEnterTeam(team.id)}
                                    onDragLeave={() => onDragLeaveTeam(team.id)}
                                    onDrop={(event) => {
                                        event.preventDefault()
                                        onDropTeam(team.id)
                                    }}
                                    className={cn(
                                        'rounded-2xl transition',
                                        draggingTeamId === team.id ? 'opacity-60' : '',
                                        hoveredTeamId === team.id && draggingTeamId !== null && draggingTeamId !== team.id
                                            ? 'ring-2 ring-blue-300 ring-offset-2 ring-offset-white dark:ring-blue-700 dark:ring-offset-[#111118]'
                                            : '',
                                    )}
                                >
                                    <TeamCard tournamentId={selectedTournamentId ?? 0} team={team} />
                                </div>
                            ))}
                            <AddTeamCard tournamentId={selectedTournamentId ?? 0} />
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
