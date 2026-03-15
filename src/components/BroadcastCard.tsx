import { cn } from '../lib/cn'
import type { Broadcast } from '../types'
import { formatTime, readTypeGradientClass } from '../utils/broadcastSchedule'

interface BroadcastCardProps {
    broadcast: Broadcast
    onEdit: (broadcast: Broadcast) => void
    onDelete: (broadcast: Broadcast) => void
    onOverwatchEdit: (broadcast: Broadcast) => void
}

export function BroadcastCard({ broadcast, onEdit, onDelete, onOverwatchEdit }: BroadcastCardProps) {
    const hasRepresentativeStreamer = broadcast.streamerName.trim().length > 0
    const tags = broadcast.tags ?? []
    const typeGradientClass = readTypeGradientClass(broadcast.broadcastType)
    const isVisible = broadcast.isVisible ?? true
    const isOverwatch = broadcast.category?.name.toLowerCase() === 'overwatch'

    return (
        <div
            className={cn(
                'cursor-pointer rounded-xl border border-gray-200 px-4 py-3 transition hover:border-blue-200 dark:border-[#3a3a44] dark:hover:border-blue-900/40',
                typeGradientClass,
            )}
            onClick={() => onEdit(broadcast)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onEdit(broadcast)
                }
            }}
            role="button"
            tabIndex={0}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-[#efeff1]">{broadcast.title}</p>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-[#848494]">
                        {formatTime(broadcast.startTime)}
                        {broadcast.endTime ? ` - ${formatTime(broadcast.endTime)}` : ''}
                        {hasRepresentativeStreamer ? ` · ${broadcast.streamerName}` : ''}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                        {broadcast.isChzzkSupport === true && (
                            <span className="rounded-full border border-emerald-400 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:border-emerald-500 dark:text-emerald-400">
                                치지직 제작지원
                            </span>
                        )}
                        {tags.slice(0, 4).map((tag) => (
                            <span
                                key={tag}
                                className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                    <span
                        className={cn(
                            'inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium',
                            isVisible
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                                : 'bg-gray-100 text-gray-600 dark:bg-[#26262e] dark:text-[#adadb8]',
                        )}
                    >
                        {isVisible ? '노출' : '비노출'}
                    </span>
                    {isOverwatch && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation()
                                onOverwatchEdit(broadcast)
                            }}
                            className="cursor-pointer rounded-md border border-violet-200 bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-600 dark:border-violet-800/40 dark:bg-violet-900/20 dark:text-violet-400"
                        >
                            ⚔ 경기편집
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation()
                            onDelete(broadcast)
                        }}
                        className="cursor-pointer rounded-md border border-red-100 px-2 py-1 text-[11px] text-red-500"
                    >
                        삭제
                    </button>
                </div>
            </div>
            {broadcast.participants !== undefined && broadcast.participants.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                    {broadcast.participants.slice(0, 6).map((participant) => (
                        <span
                            key={participant.name}
                            className="rounded-full bg-gray-50 px-2 py-0.5 text-[11px] text-gray-600 dark:bg-[#26262e] dark:text-[#adadb8]"
                        >
                            {participant.isHost ? '★ ' : ''}
                            {participant.name}
                        </span>
                    ))}
                </div>
            )}
        </div>
    )
}
