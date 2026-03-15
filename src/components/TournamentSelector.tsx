import type { TournamentItem } from '../types'
import { cn } from '../lib/cn'

interface TournamentSelectorProps {
    tournaments: TournamentItem[]
    selectedSlug: string | null
    onSelect: (slug: string) => void
    onAdd: () => void
}

export function TournamentSelector({
    tournaments,
    selectedSlug,
    onSelect,
    onAdd,
}: TournamentSelectorProps) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            {tournaments.map((t) => (
                <button
                    key={t.slug}
                    type="button"
                    onClick={() => onSelect(t.slug)}
                    className={cn(
                        'rounded-xl px-4 py-2 text-sm font-medium transition',
                        selectedSlug === t.slug
                            ? 'bg-blue-500 text-white shadow-sm'
                            : 'border border-gray-200 text-gray-600 hover:border-blue-200 hover:text-blue-600 dark:border-[#3a3a44] dark:text-[#adadb8] dark:hover:border-blue-700 dark:hover:text-blue-400',
                    )}
                >
                    {t.name}
                </button>
            ))}
            <button
                type="button"
                onClick={onAdd}
                className="rounded-xl border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-400 transition hover:border-blue-300 hover:text-blue-500 dark:border-[#3a3a44] dark:text-[#adadb8] dark:hover:border-blue-700 dark:hover:text-blue-400"
            >
                + 대회 추가
            </button>
        </div>
    )
}
